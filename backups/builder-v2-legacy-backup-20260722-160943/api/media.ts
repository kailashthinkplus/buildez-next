import { api } from "./client";

export const mediaApi = {

  async list(siteId: string) {

    return api(`/api/builder-v2/assets?siteId=${siteId}`);

  },

  async uploadInit(body: any) {

    return api("/api/uploads/image/init", {

      method: "POST",

      body: JSON.stringify(body),

    });

  },

  async uploadComplete(body: any) {

    return api("/api/builder-v2/assets", {

      method: "POST",

      body: JSON.stringify(body),

    });

  },

  async generateAI(body: any) {

    return api("/api/ai-v8/generate-images", {

      method: "POST",

      body: JSON.stringify(body),

    });

  },

};