#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-}"
DOMAIN="${2:-}"
SITES_AVAILABLE="${NGINX_SITES_AVAILABLE:-/etc/nginx/sites-available}"
SITES_ENABLED="${NGINX_SITES_ENABLED:-/etc/nginx/sites-enabled}"
UPSTREAM="${BUILDEZ_UPSTREAM:-http://127.0.0.1:3000}"
ACME_ROOT="${BUILDEZ_ACME_ROOT:-/var/lib/buildez/acme}"
LOCK_FILE="${BUILDEZ_NGINX_LOCK:-/var/lock/buildez-nginx.lock}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

if [[ ! "$DOMAIN" =~ ^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$ ]]; then
  echo "Invalid domain: $DOMAIN" >&2
  exit 2
fi
if [[ "$ACTION" == "add" && -z "$CERTBOT_EMAIL" ]]; then
  echo "CERTBOT_EMAIL is required" >&2
  exit 2
fi

AVAILABLE_FILE="$SITES_AVAILABLE/buildez-$DOMAIN.conf"
ENABLED_FILE="$SITES_ENABLED/buildez-$DOMAIN.conf"
BACKUP_FILE=""
HTTP_BACKUP=""
mkdir -p "$SITES_AVAILABLE" "$SITES_ENABLED" "$ACME_ROOT" "$(dirname "$LOCK_FILE")"
exec 9>"$LOCK_FILE"
flock -w 120 9

reload_nginx() {
  nginx -t
  if command -v systemctl >/dev/null 2>&1; then systemctl reload nginx; else nginx -s reload; fi
}

write_http_config() {
  local target="$1"
  cat >"$target" <<EOF
# Managed by BuildEZ. Other Nginx virtual hosts are not modified.
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    location ^~ /.well-known/acme-challenge/ {
        root $ACME_ROOT;
        default_type text/plain;
    }
    location / {
        proxy_pass $UPSTREAM;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
}

write_https_config() {
  local target="$1"
  cat >"$target" <<EOF
# Managed by BuildEZ. Other Nginx virtual hosts are not modified.
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    location ^~ /.well-known/acme-challenge/ { root $ACME_ROOT; }
    location / { return 301 https://\$host\$request_uri; }
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:BuildEZSSL:10m;
    client_max_body_size 32m;
    location / {
        proxy_pass $UPSTREAM;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
}

case "$ACTION" in
  add)
    TEMP_FILE="$(mktemp "$SITES_AVAILABLE/.buildez-domain.XXXXXX")"
    trap 'rm -f "${TEMP_FILE:-}" "${BACKUP_FILE:-}" "${HTTP_BACKUP:-}"' EXIT
    if [[ -f "$AVAILABLE_FILE" ]]; then BACKUP_FILE="$(mktemp)"; cp "$AVAILABLE_FILE" "$BACKUP_FILE"; fi
    write_http_config "$TEMP_FILE"
    chmod 0644 "$TEMP_FILE"
    mv "$TEMP_FILE" "$AVAILABLE_FILE"
    ln -sfn "$AVAILABLE_FILE" "$ENABLED_FILE"
    if ! reload_nginx; then
      rm -f "$ENABLED_FILE" "$AVAILABLE_FILE"
      if [[ -n "$BACKUP_FILE" ]]; then cp "$BACKUP_FILE" "$AVAILABLE_FILE"; ln -sfn "$AVAILABLE_FILE" "$ENABLED_FILE"; fi
      nginx -t || true
      exit 1
    fi
    HTTP_BACKUP="$(mktemp)"
    cp "$AVAILABLE_FILE" "$HTTP_BACKUP"
    certbot certonly --webroot -w "$ACME_ROOT" -d "$DOMAIN" --cert-name "$DOMAIN" --non-interactive --agree-tos --email "$CERTBOT_EMAIL" --keep-until-expiring
    openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -noout -checkend 604800
    TEMP_FILE="$(mktemp "$SITES_AVAILABLE/.buildez-domain.XXXXXX")"
    write_https_config "$TEMP_FILE"
    chmod 0644 "$TEMP_FILE"
    mv "$TEMP_FILE" "$AVAILABLE_FILE"
    if ! reload_nginx; then
      cp "$HTTP_BACKUP" "$AVAILABLE_FILE"
      reload_nginx || true
      exit 1
    fi
    echo "Secure domain provisioned: $DOMAIN"
    ;;
  remove)
    REMOVE_BACKUP=""
    if [[ -f "$AVAILABLE_FILE" ]]; then REMOVE_BACKUP="$(mktemp)"; cp "$AVAILABLE_FILE" "$REMOVE_BACKUP"; fi
    rm -f "$ENABLED_FILE" "$AVAILABLE_FILE"
    if ! reload_nginx; then
      if [[ -n "$REMOVE_BACKUP" ]]; then cp "$REMOVE_BACKUP" "$AVAILABLE_FILE"; ln -sfn "$AVAILABLE_FILE" "$ENABLED_FILE"; fi
      reload_nginx || true
      rm -f "$REMOVE_BACKUP"
      exit 1
    fi
    rm -f "$REMOVE_BACKUP"
    echo "Domain routing removed: $DOMAIN"
    ;;
  *)
    echo "Usage: $0 add|remove example.com" >&2
    exit 2
    ;;
esac
