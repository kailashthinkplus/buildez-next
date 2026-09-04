export type SupportArticle = {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  keywords: string[];
};

export const SUPPORT_ARTICLES: SupportArticle[] = [
  { id: "start", title: "Get started with BuildEZ", category: "Getting started", summary: "Create a website, add pages and publish your first version.", body: "Choose a website from the workspace, use Pages to create or organize content, open a page in the builder, then publish after reviewing the desktop and mobile preview.", keywords: ["start", "website", "create", "publish"] },
  { id: "pages", title: "Manage pages and the front page", category: "Pages", summary: "Create, duplicate, preview, publish and choose the home page.", body: "Use Pages for individual page actions or select multiple rows for bulk publishing and trash. Choose the website front page and custom 404 page in Site Settings under Page routing.", keywords: ["page", "home", "front", "404", "bulk", "preview"] },
  { id: "builder-ai", title: "Use AI inside the builder", category: "Builder", summary: "Ask the page-aware assistant to improve content and layout.", body: "Open a page in the builder and select AI Insights. Suggestions are grounded in the active page audit. Review every proposed change before applying or publishing it.", keywords: ["builder", "ai", "edit", "insight", "recommendation"] },
  { id: "seo-geo", title: "Improve SEO, GEO and page scoring", category: "Growth", summary: "Understand AI page scores and search or answer-engine opportunities.", body: "AI Page Score audits metadata, headings, structured data, answer-ready content, accessibility, conversion and quality. Open AI Insights for prioritized findings and PageSpeed for live performance data.", keywords: ["seo", "geo", "score", "ranking", "search", "pagespeed"] },
  { id: "domains", title: "Connect a domain", category: "Publishing", summary: "Point a custom domain to a published BuildEZ website.", body: "Open Site Settings and the domain area, add the domain, then copy the displayed DNS records to your domain provider. DNS verification can take time after records are changed.", keywords: ["domain", "dns", "connect", "publish", "ssl"] },
  { id: "analytics", title: "Analytics and conversion tracking", category: "Growth", summary: "Track page views, visitors, sources and conversions.", body: "Published pages record website activity automatically. Optional Google Analytics, Tag Manager and Meta Pixel identifiers can be added under Site Settings in Analytics.", keywords: ["analytics", "traffic", "visitor", "conversion", "pixel", "gtm"] },
  { id: "agents", title: "Run specialist AI agents", category: "AI Agents", summary: "Use website, business intelligence and marketing specialists.", body: "The AI Agents module includes SEO, GEO, speed, accessibility, conversion, quality, business intelligence and marketing agents. Run a specialist for focused recommendations grounded in the latest site audit.", keywords: ["agent", "business", "marketing", "specialist", "audit"] },
  { id: "chatbots", title: "Deploy website chat and WhatsApp", category: "AI Agents", summary: "Generate, customize and deploy customer-facing assistants.", body: "Open AI Agents, generate an intelligent channel setup, review the messages and business number, enable a channel, then choose Save and deploy. Enabled widgets appear on published website pages.", keywords: ["chatbot", "chat", "whatsapp", "deploy", "assistant"] },
  { id: "store", title: "Set up ShopEZ", category: "Commerce", summary: "Manage products, orders, customers, payments and storefront publishing.", body: "Use ShopEZ to add active products, configure currency, tax, shipping and payments, then enable Publish storefront in store settings after testing the buying flow.", keywords: ["store", "shopez", "product", "order", "payment", "shipping"] },
  { id: "privacy", title: "Privacy, cookies and safe publishing", category: "Settings", summary: "Configure consent messaging and policy links.", body: "Use Site Settings to enable the cookie banner, customize its message, and add privacy and terms URLs. Confirm forms and tracking match the consent rules for your audience and region.", keywords: ["privacy", "cookie", "terms", "consent", "legal"] },
];

export function searchSupportArticles(query: string, limit = 5) {
  const words = query.toLowerCase().split(/\W+/).filter((word) => word.length > 2);
  if (!words.length) return SUPPORT_ARTICLES.slice(0, limit);
  return SUPPORT_ARTICLES.map((article) => {
    const title = article.title.toLowerCase();
    const haystack = `${title} ${article.category} ${article.summary} ${article.body} ${article.keywords.join(" ")}`.toLowerCase();
    const score = words.reduce((total, word) => total + (title.includes(word) ? 5 : haystack.includes(word) ? 1 : 0), 0);
    return { article, score };
  }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((entry) => entry.article);
}
