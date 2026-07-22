export type WebsiteRendererMode = "builder" | "preview" | "published";

export type RendererContract = {
  mode: WebsiteRendererMode;
  isolated: boolean;
  sharedPipeline: boolean;
};
