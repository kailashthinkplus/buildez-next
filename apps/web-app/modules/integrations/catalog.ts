export type AppPlan = "Free" | "Premium";

export type IntegrationConfigField = {
  key: string;
  label: string;
  placeholder: string;
  pattern: RegExp;
  helpText: string;
};

export type PublicConfigField = Omit<IntegrationConfigField, "pattern">;

export type MarketplaceApp = {
  name: string;
  slug: string;
  category: string;
  description: string;
  plan: AppPlan;
  featured?: boolean;
  /** Apps with `functional: true` have a real, working integration that gets installed via
   * SiteIntegration and is rendered on the published site. Everything else is "coming soon". */
  functional: boolean;
  configFields?: IntegrationConfigField[];
};

export const MARKETPLACE_APPS: MarketplaceApp[] = [
  {
    name: "Google Analytics", slug: "googleanalytics", category: "Analytics",
    description: "Understand visitors, conversions, and your best-performing pages.",
    plan: "Free", featured: true, functional: true,
    configFields: [{
      key: "measurementId", label: "Measurement ID", placeholder: "G-XXXXXXXXXX",
      pattern: /^G-[A-Z0-9]{6,12}$/i,
      helpText: "Find this under Admin → Data Streams in Google Analytics. It starts with G-.",
    }],
  },
  { name: "Meta Pixel", slug: "meta", category: "Marketing", description: "Measure Meta ad performance and build remarketing audiences.", plan: "Free", functional: true,
    configFields: [{
      key: "pixelId", label: "Pixel ID", placeholder: "123456789012345",
      pattern: /^[0-9]{10,20}$/,
      helpText: "A 10-20 digit number from Meta Events Manager.",
    }],
  },
  { name: "Hotjar", slug: "hotjar", category: "Analytics", description: "See heatmaps, recordings, and visitor feedback in one place.", plan: "Premium", functional: true,
    configFields: [{
      key: "siteId", label: "Hotjar Site ID", placeholder: "1234567",
      pattern: /^[0-9]{5,10}$/,
      helpText: "Find this in Hotjar under Settings → Sites & Organizations.",
    }],
  },
  { name: "Microsoft Clarity", slug: "microsoftclarity", category: "Analytics", description: "Free session recordings and heatmaps from Microsoft.", plan: "Free", functional: true,
    configFields: [{
      key: "projectId", label: "Project ID", placeholder: "abcdefghij",
      pattern: /^[a-z0-9]{6,20}$/i,
      helpText: "Find this in Clarity under Settings → Setup.",
    }],
  },
  { name: "Mailchimp", slug: "mailchimp", category: "Marketing", description: "Grow email lists and automate campaigns from your forms.", plan: "Free", featured: true, functional: false },
  { name: "HubSpot", slug: "hubspot", category: "Marketing", description: "Send leads to your CRM and trigger sales workflows.", plan: "Premium", functional: false },
  { name: "Klaviyo", slug: "klaviyo", category: "Marketing", description: "Create personalized email and SMS journeys for customers.", plan: "Premium", functional: false },
  { name: "Brevo", slug: "brevo", category: "Marketing", description: "Sync contacts and power email, SMS, and WhatsApp campaigns.", plan: "Free", functional: false },
  { name: "Stripe", slug: "stripe", category: "Payments", description: "Accept secure card payments and subscriptions worldwide.", plan: "Premium", featured: true, functional: false },
  { name: "Razorpay", slug: "razorpay", category: "Payments", description: "Collect payments with cards, UPI, wallets, and netbanking.", plan: "Premium", functional: false },
  { name: "PayPal", slug: "paypal", category: "Payments", description: "Add trusted PayPal checkout to your BuildEZ website.", plan: "Free", functional: false },
  { name: "Shopify", slug: "shopify", category: "Commerce", description: "Showcase Shopify products and send shoppers to checkout.", plan: "Premium", functional: false },
  { name: "WooCommerce", slug: "woocommerce", category: "Commerce", description: "Connect products, orders, and customer data from WooCommerce.", plan: "Premium", functional: false },
  { name: "Calendly", slug: "calendly", category: "Bookings", description: "Let visitors book meetings without leaving your site.", plan: "Free", featured: true, functional: false },
  { name: "Google Calendar", slug: "googlecalendar", category: "Bookings", description: "Display availability and add bookings to your calendar.", plan: "Free", functional: false },
  { name: "Zoom", slug: "zoom", category: "Bookings", description: "Create meeting links automatically for scheduled sessions.", plan: "Premium", functional: false },
  { name: "WhatsApp", slug: "whatsapp", category: "Communication", description: "Turn website visits into WhatsApp conversations instantly.", plan: "Free", featured: true, functional: false },
  { name: "Intercom", slug: "intercom", category: "Communication", description: "Add customer messaging, help desk, and support automation.", plan: "Premium", functional: false },
  { name: "Slack", slug: "slack", category: "Communication", description: "Send form submissions and site alerts to your team channels.", plan: "Free", functional: false },
  { name: "Crisp", slug: "crisp", category: "Communication", description: "Chat with visitors and manage support from a shared inbox.", plan: "Free", functional: false },
  { name: "Typeform", slug: "typeform", category: "Forms", description: "Embed conversational forms, surveys, and quizzes.", plan: "Free", functional: false },
  { name: "Google Forms", slug: "googleforms", category: "Forms", description: "Embed existing Google Forms with responsive sizing.", plan: "Free", functional: false },
  { name: "Zapier", slug: "zapier", category: "Automation", description: "Connect BuildEZ leads to thousands of apps and workflows.", plan: "Premium", featured: true, functional: false },
  { name: "Make", slug: "make", category: "Automation", description: "Build visual automations across your favorite business tools.", plan: "Premium", functional: false },
  { name: "Notion", slug: "notion", category: "Content", description: "Publish Notion content and sync databases to your site.", plan: "Premium", functional: false },
  { name: "Airtable", slug: "airtable", category: "Content", description: "Turn Airtable records into dynamic website content.", plan: "Premium", functional: false },
  { name: "YouTube", slug: "youtube", category: "Media", description: "Embed responsive videos, playlists, and live streams.", plan: "Free", functional: false },
  { name: "Vimeo", slug: "vimeo", category: "Media", description: "Show beautiful, ad-free video embeds with player controls.", plan: "Free", functional: false },
  { name: "Instagram", slug: "instagram", category: "Social", description: "Bring posts and reels from Instagram into your website.", plan: "Premium", functional: false },
  { name: "LinkedIn", slug: "linkedin", category: "Social", description: "Add company updates and conversion tracking to your site.", plan: "Free", functional: true,
    configFields: [{
      key: "partnerId", label: "Insight Tag Partner ID", placeholder: "1234567",
      pattern: /^[0-9]{4,10}$/,
      helpText: "Find this in LinkedIn Campaign Manager under Account Assets → Insight Tag.",
    }],
  },
];

export const MARKETPLACE_CATEGORIES = ["All", ...Array.from(new Set(MARKETPLACE_APPS.map((app) => app.category)))];

export function getMarketplaceApp(slug: string): MarketplaceApp | undefined {
  return MARKETPLACE_APPS.find((app) => app.slug === slug);
}

export function validateIntegrationConfig(
  slug: string,
  rawConfig: unknown,
): { ok: true; config: Record<string, string> } | { ok: false; error: string } {
  const app = getMarketplaceApp(slug);
  if (!app) return { ok: false, error: "Unknown app" };
  if (!app.functional || !app.configFields?.length) {
    return { ok: false, error: `${app.name} is coming soon and can't be connected yet` };
  }
  const record = rawConfig && typeof rawConfig === "object" && !Array.isArray(rawConfig) ? rawConfig as Record<string, unknown> : {};
  const config: Record<string, string> = {};
  for (const field of app.configFields) {
    const raw = record[field.key];
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!field.pattern.test(value)) {
      return { ok: false, error: `${field.label} looks invalid. ${field.helpText}` };
    }
    config[field.key] = value;
  }
  return { ok: true, config };
}
