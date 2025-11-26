#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <domain> <email> [site_root=/var/www/<domain>/html]" >&2
  exit 1
fi

DOMAIN="$1"
EMAIL="$2"
SITE_ROOT="${3:-/var/www/${DOMAIN}/html}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_SRC_CONF="${SCRIPT_DIR}/nginx.conf"
LE_OPTIONS="/etc/letsencrypt/options-ssl-nginx.conf"
LE_DHPARAM="/etc/letsencrypt/ssl-dhparams.pem"
LE_CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
LE_KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"

sudo apt update
sudo apt install -y nginx snapd openssl

sudo mkdir -p /etc/letsencrypt

if [ ! -f "$LE_OPTIONS" ]; then
  sudo tee "$LE_OPTIONS" >/dev/null <<'EOF'
# Managed by setup.sh fallback
ssl_session_cache shared:le_nginx_SSL:10m;
ssl_session_timeout 1440m;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
EOF
fi

if [ ! -f "$LE_DHPARAM" ]; then
  echo "Generating Diffie-Hellman parameters (this may take a while)..."
  sudo openssl dhparam -out "$LE_DHPARAM" 2048
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

if [ ! -f "$LE_CERT" ] || [ ! -f "$LE_KEY" ]; then
  echo "Warning: SSL certificate for ${DOMAIN} was not found. Skipping custom nginx.conf copy."
  echo "Ensure DNS points to this server and rerun certbot when ready."
  sudo systemctl reload nginx
  exit 0
fi

if [ -f "$NGINX_SRC_CONF" ]; then
  sudo cp "$NGINX_SRC_CONF" /etc/nginx/nginx.conf
  sudo nginx -t
  sudo systemctl reload nginx
else
  echo "Warning: ${NGINX_SRC_CONF} not found; skipping nginx.conf copy" >&2
  sudo systemctl reload nginx
fi

echo "NGINX + SSL ready for ${DOMAIN}. Remember to point DNS A/AAAA records to this server."
