#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-}"
DOMAIN="${2:-}"
SERVER_IP="206.189.129.113"
SITES_AVAILABLE="${NGINX_SITES_AVAILABLE:-/etc/nginx/sites-available}"
SITES_ENABLED="${NGINX_SITES_ENABLED:-/etc/nginx/sites-enabled}"
UPSTREAM="${BUILDEZ_UPSTREAM:-http://127.0.0.1:3000}"

if [[ ! "$DOMAIN" =~ ^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$ ]]; then
  echo "Invalid domain: $DOMAIN" >&2
  exit 2
fi

AVAILABLE_FILE="$SITES_AVAILABLE/buildez-$DOMAIN.conf"
ENABLED_FILE="$SITES_ENABLED/buildez-$DOMAIN.conf"

reload_nginx() {
  nginx -t
  if command -v systemctl >/dev/null 2>&1; then
    systemctl reload nginx
  else
    nginx -s reload
  fi
}

case "$ACTION" in
  add)
    mkdir -p "$SITES_AVAILABLE" "$SITES_ENABLED"
    TEMP_FILE="$(mktemp "$SITES_AVAILABLE/.buildez-domain.XXXXXX")"
    trap 'rm -f "$TEMP_FILE"' EXIT
    printf '%s\n' \
      '# Managed by BuildEZ. Changes will be overwritten.' \
      'server {' \
      '    listen 80;' \
      "    server_name $DOMAIN;" \
      '' \
      '    client_max_body_size 32m;' \
      '    location / {' \
      "        proxy_pass $UPSTREAM;" \
      '        proxy_http_version 1.1;' \
      '        proxy_set_header Host $host;' \
      '        proxy_set_header X-Real-IP $remote_addr;' \
      '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
      '        proxy_set_header X-Forwarded-Proto $scheme;' \
      '        proxy_set_header Upgrade $http_upgrade;' \
      '        proxy_set_header Connection "upgrade";' \
      '    }' \
      '}' > "$TEMP_FILE"
    chmod 0644 "$TEMP_FILE"
    mv "$TEMP_FILE" "$AVAILABLE_FILE"
    ln -sfn "$AVAILABLE_FILE" "$ENABLED_FILE"
    if ! reload_nginx; then
      rm -f "$ENABLED_FILE" "$AVAILABLE_FILE"
      nginx -t || true
      exit 1
    fi
    echo "Provisioned $DOMAIN on $SERVER_IP"
    ;;
  remove)
    rm -f "$ENABLED_FILE" "$AVAILABLE_FILE"
    reload_nginx
    echo "Removed $DOMAIN"
    ;;
  *)
    echo "Usage: $0 add|remove example.com" >&2
    exit 2
    ;;
esac
