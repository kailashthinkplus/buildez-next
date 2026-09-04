import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
export const DOMAIN_SERVER_IP = process.env.DOMAIN_SERVER_IP || "206.189.129.113";

export function validDomain(domain: string) {
  if (domain.length > 253 || domain.endsWith(".")) return false;
  const labels = domain.split(".");
  return labels.length >= 2
    && /^[a-z]{2,63}$/.test(labels.at(-1) || "")
    && labels.every((label) => label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label));
}

export async function provisionNginxDomain(action: "add" | "remove", domain: string) {
  if (!validDomain(domain)) throw new Error("Invalid domain");
  if (process.env.NODE_ENV !== "production" || process.env.NGINX_DOMAIN_PROVISIONING === "disabled") {
    return { skipped: true, message: "Nginx provisioning is active only in production" };
  }
  const script = process.env.NGINX_PROVISION_SCRIPT || path.join(process.cwd(), "scripts", "provision-nginx-domain.sh");
  const useSudo = process.env.NGINX_PROVISION_USE_SUDO === "true";
  const command = useSudo ? "sudo" : script;
  const args = useSudo ? ["-n", script, action, domain] : [action, domain];
  const { stdout } = await execFileAsync(command, args, { timeout: 180_000, maxBuffer: 256 * 1024 });
  return { skipped: false, message: stdout.trim() };
}

/** The bare apex for a `www.` domain (e.g. "www.example.com" -> "example.com"), or null if not a www domain. */
export function apexDomainFor(domain: string): string | null {
  if (!domain.startsWith("www.")) return null;
  const apex = domain.slice(4);
  return validDomain(apex) ? apex : null;
}

/**
 * Best-effort: provisions (or removes) an nginx redirect from the bare apex
 * of a `www.` domain to the www domain itself, with its own Let's Encrypt
 * cert, so visitors who type the apex land on the site instead of our
 * platform's default nginx block. Never throws — a failure here (e.g. the
 * apex's DNS isn't pointed at us) must not affect the www domain, which is
 * already fully provisioned by the time this runs.
 */
export async function provisionApexRedirect(action: "add" | "remove", domain: string) {
  const apex = apexDomainFor(domain);
  if (!apex) return { skipped: true as const, message: "Not a www domain" };
  if (process.env.NODE_ENV !== "production" || process.env.NGINX_DOMAIN_PROVISIONING === "disabled") {
    return { skipped: true as const, message: "Nginx provisioning is active only in production" };
  }
  const script = process.env.NGINX_PROVISION_SCRIPT || path.join(process.cwd(), "scripts", "provision-nginx-domain.sh");
  const useSudo = process.env.NGINX_PROVISION_USE_SUDO === "true";
  const command = useSudo ? "sudo" : script;
  const scriptAction = action === "add" ? "add-apex-redirect" : "remove-apex-redirect";
  const args = action === "add" ? [scriptAction, apex, domain] : [scriptAction, apex];
  const finalArgs = useSudo ? ["-n", script, ...args] : args;
  try {
    const { stdout } = await execFileAsync(command, finalArgs, { timeout: 180_000, maxBuffer: 256 * 1024 });
    return { skipped: false as const, ok: true as const, apex, message: stdout.trim() };
  } catch (error) {
    console.error(`[apex redirect] ${action} failed for`, apex, error);
    return { skipped: false as const, ok: false as const, apex, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
