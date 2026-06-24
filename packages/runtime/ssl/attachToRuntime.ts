import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/* ----------------------------------------
   Attach cert to runtime (Nginx)
---------------------------------------- */
export async function attachCertToRuntime(domain: string) {
  const confPath = `/etc/nginx/sites-enabled/${domain}.conf`;

  // 1. Ensure config exists
  try {
    await fs.access(confPath);
  } catch {
    throw new Error(`Nginx config missing for ${domain}`);
  }

  // 2. Validate nginx config
  await execAsync("nginx -t");

  // 3. Hot reload (zero downtime)
  await execAsync("nginx -s reload");

  console.log(`[NGINX] SSL attached for ${domain}`);
}
