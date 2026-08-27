export type WebsiteChatbotConfig = {
  enabled: boolean;
  name: string;
  welcomeMessage: string;
  accentColor: string;
  tone: "helpful" | "professional" | "friendly";
  leadCapture: boolean;
  knowledge: string;
  status: "draft" | "deployed";
};

export type WhatsAppAgentConfig = {
  enabled: boolean;
  phoneNumber: string;
  welcomeMessage: string;
  defaultMessage: string;
  leadCapture: boolean;
  status: "draft" | "deployed";
};

export type AIChannelConfig = {
  websiteChatbot: WebsiteChatbotConfig;
  whatsapp: WhatsAppAgentConfig;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const text = (value: unknown, fallback: string, max = 1000) =>
  typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : fallback;

export function defaultAIChannels(siteName = "your business"): AIChannelConfig {
  return {
    websiteChatbot: {
      enabled: false,
      name: `${siteName} Assistant`,
      welcomeMessage: `Hi! I’m the ${siteName} assistant. What can I help you find today?`,
      accentColor: "#2563eb",
      tone: "helpful",
      leadCapture: true,
      knowledge: "",
      status: "draft",
    },
    whatsapp: {
      enabled: false,
      phoneNumber: "",
      welcomeMessage: `Chat with ${siteName} on WhatsApp`,
      defaultMessage: `Hi ${siteName}, I have a question about your website.`,
      leadCapture: true,
      status: "draft",
    },
  };
}

export function normalizeAIChannels(value: unknown, siteName?: string): AIChannelConfig {
  const defaults = defaultAIChannels(siteName);
  const root = asRecord(value);
  const website = asRecord(root.websiteChatbot);
  const whatsapp = asRecord(root.whatsapp);
  const tone = website.tone;
  return {
    websiteChatbot: {
      ...defaults.websiteChatbot,
      enabled: website.enabled === true,
      name: text(website.name, defaults.websiteChatbot.name, 80),
      welcomeMessage: text(website.welcomeMessage, defaults.websiteChatbot.welcomeMessage, 300),
      accentColor: /^#[0-9a-f]{6}$/i.test(String(website.accentColor || ""))
        ? String(website.accentColor)
        : defaults.websiteChatbot.accentColor,
      tone: tone === "professional" || tone === "friendly" ? tone : "helpful",
      leadCapture: website.leadCapture !== false,
      knowledge: typeof website.knowledge === "string" ? website.knowledge.slice(0, 8000) : "",
      status: website.status === "deployed" ? "deployed" : "draft",
    },
    whatsapp: {
      ...defaults.whatsapp,
      enabled: whatsapp.enabled === true,
      phoneNumber: typeof whatsapp.phoneNumber === "string"
        ? whatsapp.phoneNumber.replace(/\D/g, "").slice(0, 18)
        : "",
      welcomeMessage: text(whatsapp.welcomeMessage, defaults.whatsapp.welcomeMessage, 200),
      defaultMessage: text(whatsapp.defaultMessage, defaults.whatsapp.defaultMessage, 500),
      leadCapture: whatsapp.leadCapture !== false,
      status: whatsapp.status === "deployed" ? "deployed" : "draft",
    },
  };
}
