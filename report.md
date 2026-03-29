# Viewer Tracking System — Bug Report

## Overview

The viewer tracking system is designed to count active viewers per channel using IP-based identity. Viewers join via a POST request, send periodic pings every 30 seconds to stay alive, and are pruned after 5 minutes of inactivity. On the surface, the architecture is sound — but there are two bugs that together cause the system to fail entirely in production, and one secondary bug that causes a broken UI state.

---

## Bug 1 (Critical): `X-Real-IP` Header Not Set on Viewer API Routes

**File:** `nginx.conf`, lines 54–59

**The problem:**

The viewers service (`video-stream-viewers/src/index.ts`) identifies every viewer by IP address. It reads the IP using the following logic:

```typescript
const getRequestIp = (req: Request): string => {
    const realIp = req.headers['x-real-ip'];
    const ip = (Array.isArray(realIp) ? realIp[0] : realIp) || req.ip || '';
    return cleanIp(ip);
}
```

It first checks for an `X-Real-IP` header, and only falls back to `req.ip` if that header is absent. In production, all requests go through the Nginx reverse proxy on the host. When Nginx forwards a request to `http://localhost:2277`, the Express app sees `req.ip` as the Nginx process IP (`127.0.0.1`) — not the real client IP.

Looking at the Nginx config, `proxy_set_header X-Real-IP $remote_addr` **is** set for the frontend (`/`) and the stream (`/stream/`) routes, but it is **missing** from every viewer API route:

```nginx
# These routes are missing proxy_set_header X-Real-IP $remote_addr:
location /viewers/ { proxy_pass http://localhost:2277/viewers/; }
location /ping/    { proxy_pass http://localhost:2277/ping/;    }
location /watch/   { proxy_pass http://localhost:2277/watch/;   }
location /join/    { proxy_pass http://localhost:2277/join/;    }
```

**The consequence:**

Every single viewer is identified as `127.0.0.1`. The `POST /join` handler guards against duplicate IPs:

```typescript
const isAlreadyViewer = viewers.some(v => v.ip === viewerIp);
if (viewerIp && !isAlreadyViewer) {
    viewers.push({ ... });
}
```

The first user to load the page creates the one `127.0.0.1` entry. Every subsequent user attempts to join with the same IP, fails the duplicate check silently, and is never added. The viewer count is permanently stuck at 1.

**The fix:**

Add `proxy_set_header X-Real-IP $remote_addr;` to all four viewer API routes in `nginx.conf`:

```nginx
location /viewers/ {
    proxy_pass http://localhost:2277/viewers/;
    proxy_set_header X-Real-IP $remote_addr;
}
location /ping/ {
    proxy_pass http://localhost:2277/ping/;
    proxy_set_header X-Real-IP $remote_addr;
}
location /watch/ {
    proxy_pass http://localhost:2277/watch/;
    proxy_set_header X-Real-IP $remote_addr;
}
location /join/ {
    proxy_pass http://localhost:2277/join/;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## Bug 2 (Secondary): Failed Join Leaves UI Stuck on Loading Screen

**File:** `video-stream-ui/src/layouts/Main.tsx`, lines 38–46

**The problem:**

The `setup()` function calls `join()` and returns early if it fails, but never calls `setLoading(false)`:

```typescript
const setup = async (auth: AuthInfo) => {
    const channels = await getChannels(...) as Channel[];
    if (channels.length > 0) {
        const firstChannel: Channel = channels[0];
        const joined = await join(firstChannel.key);
        if (!joined) {
            return;  // <-- setLoading(false) is never called
        }
        // ...
    }
    // ...
    setLoading(false);  // This is never reached on join failure
};
```

Because Bug 1 causes the join to silently return `{ success: true }` even when the viewer wasn't actually added, this path is never triggered in the current broken state. However, if the viewers service is down or returns an error, the user sees the loading spinner permanently with no way to recover.

**The fix:**

Ensure `setLoading(false)` is always called, even on failure:

```typescript
if (!joined) {
    setLoading(false);
    return;
}
```

---

## Summary Table

| # | Severity | Location | Issue | Effect |
|---|----------|----------|-------|--------|
| 1 | Critical | `nginx.conf:54-59` | `X-Real-IP` header not forwarded to viewer routes | All users share IP `127.0.0.1`; count permanently stuck at 1 |
| 2 | Secondary | `Main.tsx:41-43` | Early return on join failure skips `setLoading(false)` | UI stuck on loading spinner if join fails |

---

## How the System Should Work (When Fixed)

```
Client (real IP: 203.0.113.42)
  → HTTPS request to video.clam-tube.com/join/
  → Nginx adds X-Real-IP: 203.0.113.42
  → Viewers service reads header, stores { ip: "203.0.113.42", ... }
  → Subsequent users get different IPs, all added successfully
  → Ping every 30s keeps entries alive
  → Prune runs every 30s, removes viewers inactive > 5 minutes
  → UI polls via ping and displays accurate count
```

---

## Other Observations (Not Bugs, But Worth Noting)

- **In-memory state:** Viewer data is stored in a plain array and is lost on service restart. This is fine for a lightweight setup but means counts reset on any deploy or crash.
- **No disconnect signal:** When a user closes the browser, they linger in the viewer list for up to 5 minutes until the prune cycle removes them. This is expected behavior given the polling model.
- **Ping-only keep-alive:** The 30-second ping interval in the UI gives comfortable headroom against the 5-minute prune timeout (10 missed pings before removal).
