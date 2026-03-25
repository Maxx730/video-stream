# Video Stream Project - Findings

## Overview

**clam-tube.com** is a self-hosted live video streaming platform built on a microservices architecture. It supports RTMP video ingestion, HLS delivery, user authentication, real-time viewer tracking, IRC chat, and a React-based web frontend.

**Domain:** video.clam-tube.com (prod), dev.clam-tube.com (dev)
**Current Branch:** update/message-log (adding a scrolling marquee message banner)

---

## Architecture at a Glance

```
User Browser (HTTPS :443)
        ↓
  Nginx Reverse Proxy (nginx.conf)
        ├── /          → UI Service (React, :3000)
        ├── /stream/   → RTMP/HLS Server (:8080)
        ├── /channels/ → Channels Service (:2276)
        ├── /viewers/  → Viewers Service (:2277)
        ├── /ping/     → Viewers Service (:2277)
        ├── /join/     → Viewers Service (:2277)
        ├── /watch/    → Viewers Service (:2277)
        └── /account/login/ → Auth Service (:2278)

Streamer (OBS/FFmpeg)
        ↓ RTMP (:1935)
  RTMP/Nginx Server → HLS segments → /hls/ directory

IRC Client (:6667 / :6697 TLS)
        ↓
  Ergo IRC Daemon
```

---

## Services

### 1. PostgreSQL (`postgres`)
- Image: `postgres:16-alpine`
- Stores user accounts only
- Schema: `users` table with `id`, `email`, `password_hash`, `created_at`
- Other services connect via internal Docker network

### 2. Auth Service (`video-stream-auth`)
- **Port:** 2278 | **Language:** JavaScript (Node.js 22)
- Handles user registration and login
- Passwords hashed with bcrypt (10 rounds)
- Issues JWT tokens (24h expiry, HS256)
- Endpoints: `POST /register`, `POST /login`, `GET /me`, `GET /verify`
- CORS whitelist: video.clam-tube.com, dev.clam-tube.com, localhost:3000

### 3. Channels Service (`video-stream-channels`)
- **Port:** 2276 | **Language:** TypeScript (Node.js 18)
- Endpoint: `GET /channels`
- Fetches live stream list by querying the RTMP server's `/stat` XML endpoint
- Parses stream names and filters them: channels with "private" in the key require a valid JWT
- Returns `{ key, path }` per live stream

### 4. Viewers Service (`video-stream-viewers`)
- **Port:** 2277 | **Language:** TypeScript (Node.js 18)
- Tracks who is watching, in-memory only (ephemeral)
- Viewer identified by IP, given a random `User-XXXX` display name
- Endpoints: `POST /join`, `POST /watch`, `POST /update`, `GET /viewers`, `GET /ping`, `GET /viewcount/:channel`
- Auto-prunes viewers inactive for more than 5 minutes (checked every 30s)

### 5. RTMP/Streaming Server (`video-stream-rtmp`)
- **Ports:** 1935 (RTMP), 8080 (HTTP)
- Nginx with `nginx-mod-rtmp` on Alpine Linux
- Ingests RTMP streams from broadcasters, outputs HLS
- HLS fragments: 2s duration, 10s playlist length
- HLS files served at `/hls/` with no-cache headers and CORS enabled
- `/stat` endpoint returns XML with active stream stats (consumed by Channels service)

### 6. IRC Service (`video-stream-irc`)
- Image: `ghcr.io/ergochat/ergo:stable`
- **Ports:** 6667 (plaintext), 6697 (TLS)
- Ergo IRCd — a modern IRC server
- Supports message history, user registration
- TLS certs stored in `/ircd/tls/`
- Configured via `ergo/ircd.yaml`

### 7. Log Service (`video-stream-log`)
- **Port:** 2280 | **Language:** TypeScript (Node.js 22)
- Minimal service, currently returns a static `"TEST"` message on `GET /message`
- Appears to be in early development (current branch is `update/message-log`)

### 8. UI (`video-stream-ui`)
- **Port:** 3000 | **Language:** React + TypeScript + Vite
- Two-stage Docker build (node:18 build → `serve` for production)
- See Frontend section below for full details

---

## Frontend (React UI)

### Tech Stack
| Library | Version | Purpose |
|---|---|---|
| React | 19.1 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 7 | Build tool |
| React Router | v7 | Client-side routing |
| Chakra UI | 3.22 | Component library |
| React Player | 3.3 | HLS/MP4 video playback |
| next-themes | - | Dark/light mode |
| js-cookie | - | Cookie management |

### Routes
- `/` — Main viewing interface
- `/login` — Login page
- `/channel/:channelName` — Per-channel view (defined but not actively used)

### Provider Hierarchy
```
Root
  └── AuthProvider        (JWT token state, login/logout)
        └── SettingsProvider  (dark mode, user preferences)
              └── ChannelProvider   (live channel list)
                    └── ViewerProvider   (viewer list, ping loop)
                          └── ServerProvider  (legacy, mostly unused)
                                └── Main / Login
```

### Key Components
- **`Main.tsx`** — Primary layout; manages channel selection, video player, sidebar, and polling
- **`MediaPlayer.tsx`** — Wraps ReactPlayer for HLS stream playback
- **`ChannelList.tsx`** — Table of live streams; clicking switches the active stream
- **`SideContainer.tsx`** — Right sidebar with viewer list and login prompt
- **`ViewCount.tsx`** — Displays viewer count for the current channel
- **`MarqueeMessage.tsx`** *(new in current branch)* — Scrolling announcement banner above channel list
- **`DebugStats.tsx`** — Debug overlay for development

### Data Flow
1. On load: check for JWT cookie (`ctAuth`), fetch channels, join first channel as anonymous viewer
2. Every 30s: refresh channel list and viewer list
3. Every 5s: send ping keepalive to Viewers service
4. On channel switch: call `POST /watch` to update server-side tracking, update video player URL
5. Login: `POST /account/login/` → store JWT in cookie → re-fetch channels (including private ones)

### Video Playback
- Stream URL format: `https://video.clam-tube.com/stream/{channelKey}.m3u8`
- React Player uses HLS.js internally
- Player supports Small / Normal / Large / Huge size modes
- Responsive layout with mobile detection hook

---

## Authentication Flow

```
Login Form
    ↓ POST /account/login/ { email, password }
Auth Service
    ↓ bcrypt.compare → generate JWT (24h)
Frontend
    ↓ store in cookie "ctAuth"
Subsequent requests
    ↓ Authorization: Bearer <token>
Auth Service /verify (called by Channels service for private streams)
```

---

## Deployment

### Docker Compose Startup Order
```
postgres (health check)
  ↓
auth + log (wait for postgres)
  ↓
channels (waits for auth)
  ↓
viewers (waits for channels)
  ↓
rtmp (waits for viewers)
  ↓
ui (waits for rtmp)

irc (independent)
```

### Scripts
- `restart.sh` — Full teardown (`down --rmi all --volumes`) then rebuild and start
- `setup.sh <domain> <email>` — Provisions Let's Encrypt TLS certs via OpenSSL/Nginx

### TLS
- Let's Encrypt certs at `/etc/letsencrypt/live/dev.clam-tube.com/`
- Nginx enforces HTTPS, redirects HTTP → HTTPS
- Min TLS 1.2

---

## Current Branch: `update/message-log`

Three files have changed from main:

| File | Status | Description |
|---|---|---|
| `src/layouts/Main.tsx` | Modified | Integrates the new MarqueeMessage component |
| `src/components/MarqueeMessage.tsx` | New | Scrolling marquee banner component |
| `src/css/MarqueeMessage.css` | New | CSS animation (20s linear loop, pauses on hover) |

The marquee displays above the channel list with a dark background. The message content appears to be hardcoded or passed as a prop. The `video-stream-log` service (port 2280) exists as the backend counterpart — likely intended to serve the marquee message dynamically, though it currently only returns a static `"TEST"` string.

---

## Notable Details & Observations

- **Viewer tracking is IP-based and in-memory** — no persistence across restarts, no login required
- **Private channels** are identified purely by having "private" in the stream key string
- **JWT secret** defaults to `"change-me-in-prod"` — must be overridden in production via env var
- **Roku client** (`video-stream-roku/`) exists as a separate platform app but appears to be a standalone project, not integrated into Docker Compose
- **`video-stream-api/`** directory exists but appears deprecated/unused — not referenced in docker-compose.yml
- **Nginx proxy buffering is disabled** for all video routes — correct for low-latency streaming
- **Firefox compatibility** — nginx proxy buffers set to `8 32k` specifically to support JS modules in Firefox
- **IRC chat** is available but the UI doesn't appear to have a built-in IRC client — users would connect with a separate IRC client
- **HLS latency** is approximately 4–6 seconds given 2s fragments and a 10s playlist window

---

## Technology Summary

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Chakra UI, React Player |
| Reverse Proxy | Nginx |
| Video Ingest | Nginx RTMP Module |
| Video Delivery | HLS (HTTP Live Streaming) |
| Auth | Node.js, Express, JWT, bcrypt |
| Database | PostgreSQL 16 |
| Chat | Ergo IRCd |
| Containerization | Docker + Docker Compose |
| TLS | Let's Encrypt |
