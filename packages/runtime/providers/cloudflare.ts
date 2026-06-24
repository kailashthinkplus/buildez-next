import fetch from "node-fetch";

const API = "https://api.cloudflare.com/client/v4";

export const cloudflare = {
  async attachCertificate(domain: string) {
    // Option A: Cloudflare Managed SSL (recommended)
    // Option B: Upload custom cert (advanced)

    await fetch(`${API}/zones/${process.env.CF_ZONE_ID}/custom_certificates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "sni_custom",
        hosts: [domain],
      }),
    });
  },

  async removeCertificate(domain: string) {
    // optional
  },

  async purgeSite(siteId: string) {
    await fetch(`${API}/zones/${process.env.CF_ZONE_ID}/purge_cache`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ purge_everything: true }),
    });
  },
};
