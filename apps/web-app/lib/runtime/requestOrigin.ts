/*
 * Self-hosted `next start` builds `req.url` / `req.nextUrl` from the private
 * loopback address this process is bound to (127.0.0.1:PORT) rather than the
 * public Host header — Next's deliberate default against host-header
 * injection. That's the right base for an internal same-process fetch (which
 * must stay on plain HTTP loopback anyway, since Nginx terminates TLS), but
 * it is wrong for any URL handed back to the browser: those redirects came
 * out as `https://localhost:3100/...`, which the browser can't reach.
 *
 * publicRedirectUrl() rebuilds the origin from the forwarded Host header (or
 * NEXT_PUBLIC_APP_URL as a last-resort fallback) for anything sent to the
 * client. internalFetchUrl() targets the loopback listener directly for
 * server-to-server calls within the same process.
 */

export function publicOrigin(req: Request): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || "https://getbuildezy.com";
}

export function publicRedirectUrl(req: Request, pathAndQuery: string): URL {
  return new URL(pathAndQuery, publicOrigin(req));
}

export function internalOrigin(): string {
  return `http://127.0.0.1:${process.env.PORT || "3100"}`;
}

export function internalFetchUrl(pathAndQuery: string): string {
  return `${internalOrigin()}${pathAndQuery}`;
}
