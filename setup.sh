#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ $# -lt 2 ]; then
  echo "Usage: $0 <domain> <email> [site_root=/var/www/<domain>/html]" >&2
  exit 1
fi

DOMAIN="$1"
EMAIL="$2"
SITE_ROOT="${3:-/var/www/${DOMAIN}/html}"

sudo apt update
sudo apt install -y nginx snapd

NGINX_SRC_CONF="${SCRIPT_DIR}/nginx.conf"
if [ -f "$NGINX_SRC_CONF" ]; then
  sudo cp "$NGINX_SRC_CONF" /etc/nginx/nginx.conf
else
  echo "Warning: ${NGINX_SRC_CONF} not found; skipping nginx.conf copy" >&2
fi

sudo mkdir -p "$SITE_ROOT"
sudo chown -R $USER:$USER "$SITE_ROOT"

cat <<'EOF' > "${SITE_ROOT}/index.html"
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Welcome</title></head>
<body><h1>NGINX is up for ${DOMAIN}</h1></body>
</html>
EOF

SERVER_BLOCK="/etc/nginx/sites-available/${DOMAIN}"
sudo tee "$SERVER_BLOCK" >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    root ${SITE_ROOT};
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

sudo ln -sf "$SERVER_BLOCK" "/etc/nginx/sites-enabled/${DOMAIN}"
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

sudo snap install core && sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

sudo certbot --nginx \
  --non-interactive \
  --agree-tos \
  --redirect \
  -m "$EMAIL" \
  -d "$DOMAIN"

sudo systemctl reload nginx
echo "NGINX + SSL ready for ${DOMAIN}. Remember to point DNS A/AAAA records to this server."
