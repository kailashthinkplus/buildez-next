import { RuntimeAdapter } from "../types";
import { cloudflare } from "../providers/cloudflare";

export const edgeAdapter: RuntimeAdapter = {
  async attachCertificate(domain) {
    await cloudflare.attachCertificate(domain);
  },

  async detachCertificate(domain) {
    await cloudflare.removeCertificate(domain);
  },

  async attachRender(siteId, version) {
    await cloudflare.purgeSite(siteId);
  },
};