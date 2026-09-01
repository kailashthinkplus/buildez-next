# Production custom domains

BuildEZ uses host-based tenant resolution. Free workspaces publish on `<site-slug>.<platform-domain>`. Paid workspaces may attach verified custom hostnames. Other applications on the droplet keep their existing files and virtual hosts; BuildEZ owns only files named `/etc/nginx/sites-available/buildez-*.conf`.

## One-time droplet setup

1. Back up `/etc/nginx`, then confirm every existing virtual host has an explicit `server_name`. Do not modify the Diagmed or WordPress files.
2. Point the platform apex and wildcard DNS records to the droplet:
   - `A getbuildezy.com -> 206.189.129.113`
   - `A *.getbuildezy.com -> 206.189.129.113`
3. Obtain one wildcard platform certificate with DNS-01. A wildcard cannot be issued through HTTP-01:
   - Install Certbot and the DNS plugin for the authoritative provider.
   - Issue for `getbuildezy.com` and `*.getbuildezy.com` using the DNS plugin and a least-privilege credential.
4. Copy `infrastructure/nginx/buildez-platform.conf.example` to `/etc/nginx/sites-available/buildez-platform.conf`, update the platform domain if necessary, symlink only that file into `sites-enabled`, run `nginx -t`, then reload.
5. Install `apps/web-app/scripts/provision-nginx-domain.sh` at the absolute path named in the sudoers rule. Set it executable and validate `infrastructure/sudoers/buildez-domain-provisioner` with `visudo -cf` before copying it to `/etc/sudoers.d`.
6. Ensure ports 80 and 443 are allowed by the DigitalOcean firewall. HTTP must remain reachable for per-domain ACME validation and redirect to HTTPS.
7. Install `infrastructure/letsencrypt/renewal-hooks/deploy/20-buildez-nginx-reload` as `/etc/letsencrypt/renewal-hooks/deploy/20-buildez-nginx-reload`, owned by root and executable. For an apt installation, enable the packaged timer with `systemctl enable --now certbot.timer`; for a snap installation, use `systemctl enable --now snap.certbot.renew.timer`. Confirm the selected timer with `systemctl list-timers | grep certbot`.
8. Run `certbot renew --dry-run`. Certbot renews the standard PEM-encoded X.509 certificate and rotates its private key before expiry. The deploy hook uses OpenSSL to confirm the renewed certificate has at least seven days remaining and that its public key matches the private key, then runs `nginx -t` and reloads only after every check succeeds.

## Application environment

Set these values in production and restart the application:

```text
PLATFORM_DOMAIN=getbuildezy.com
NEXT_PUBLIC_PLATFORM_DOMAIN=getbuildezy.com
DOMAIN_SERVER_IP=206.189.129.113
NGINX_DOMAIN_PROVISIONING=enabled
NGINX_PROVISION_USE_SUDO=true
NGINX_PROVISION_SCRIPT=/var/www/buildez/apps/web-app/scripts/provision-nginx-domain.sh
BUILDEZ_UPSTREAM=http://127.0.0.1:3000
BUILDEZ_ACME_ROOT=/var/lib/buildez/acme
CERTBOT_EMAIL=operations@example.com
AUTH_SECRET=<strong-random-secret>
```

For Cloudflare account connection, register a public OAuth client with an exact callback URL of `https://<app-host>/api/domains/cloudflare/callback`, request only zone read and DNS write access, and add:

```text
CLOUDFLARE_OAUTH_CLIENT_ID=<client-id>
CLOUDFLARE_OAUTH_CLIENT_SECRET=<client-secret>
CLOUDFLARE_OAUTH_SCOPES=<scope identifiers configured on the OAuth client>
```

For GoDaddy one-click connection, publish and onboard `infrastructure/domain-connect/getbuildezy.com.website.json`, then add:

```text
DOMAIN_CONNECT_PROVIDER_ID=getbuildezy.com
DOMAIN_CONNECT_SERVICE_ID=website
GODADDY_DOMAIN_CONNECT_URL=https://domainconnect.godaddy.com
```

GoDaddy and Cloudflare must approve/onboard the public integration before their production consent screens can modify arbitrary customer accounts.

## Per-domain lifecycle

1. A paid customer adds a hostname. BuildEZ creates a random ownership token but does not touch Nginx.
2. The customer authorizes a supported DNS provider or manually creates the displayed A and TXT records.
3. Verification queries local, Cloudflare, and Google resolvers. At least two must see both records.
4. Only then does the restricted provisioner create `/etc/nginx/sites-available/buildez-<domain>.conf`, test Nginx, request a certificate with Certbot webroot mode, install HTTPS in that same file, test again, and reload.
5. The database marks the hostname verified only after secure provisioning succeeds. Runtime traffic also checks that the tenant still has the custom-domain entitlement.
6. Removing a domain deletes only its BuildEZ-prefixed Nginx file. Existing WordPress and Diagmed virtual hosts are never matched by the provisioner.

Run issuance tests against the ACME staging service before production to avoid certificate rate limits. Monitor certificate expiry, failed verification attempts, Nginx test failures, and provider callback errors.
