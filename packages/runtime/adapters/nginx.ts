import { RuntimeAdapter } from "../types";
import { attachCertToRuntime } from "../ssl/attachToRuntime";

export const nginxAdapter: RuntimeAdapter = {
  async attachCertificate(domain) {
    await attachCertToRuntime(domain);
  },

  async detachCertificate(domain) {
    // optional later
  },

  async attachRender(siteId, version) {
    // nginx already serves latest snapshot
  },
};