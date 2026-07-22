import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
export const DOMAIN_SERVER_IP = "206.189.129.113";

export function validDomain(domain: string) {
  return /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain);
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
  const { stdout } = await execFileAsync(command, args, { timeout: 20_000, maxBuffer: 64 * 1024 });
  return { skipped: false, message: stdout.trim() };
}
