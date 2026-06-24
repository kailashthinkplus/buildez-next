export function nginxSiteConfig(domain: string) {
  return `
server {
  listen 443 ssl http2;
  server_name ${domain};

  ssl_certificate     /var/lib/buildez/ssl/${domain}/fullchain.pem;
  ssl_certificate_key /var/lib/buildez/ssl/${domain}/privkey.pem;

  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 1d;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers off;

  location / {
    proxy_pass http://buildez_runtime;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
  }
}
`;
}
