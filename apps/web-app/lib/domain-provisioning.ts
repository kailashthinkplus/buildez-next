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
