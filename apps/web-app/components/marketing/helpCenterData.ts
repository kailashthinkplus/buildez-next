export type HelpCategoryId = "getting-started" | "billing" | "builder" | "publishing" | "commerce" | "troubleshooting";

export type HelpItem = { q: string; a: string };
export type HelpCategory = { id: HelpCategoryId; label: string; icon: string; items: HelpItem[] };

export const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: "BookOpen",
    items: [
      { q: "What is BuildEzy?", a: "BuildEzy is a connected website operating system — design pages, generate and edit with AI, publish, manage domains, sell products, and track performance from one workspace." },
      { q: "Do I need coding experience?", a: "No. Pages are built visually, and the AI builder can generate a starting layout from a short description. You can still edit HTML/CSS-level details inside the builder if you want more control." },
      { q: "How do I create my first website?", a: "Sign up, choose a plan, then start a new site from the tenant dashboard. Describe what you're building and the AI builder drafts a first version you can immediately edit." },
      { q: "Can I have more than one website?", a: "Yes, up to the website limit on your plan. Each website has its own pages, domain, products, and analytics, and is managed from the same account." },
      { q: "What happens if I never publish a site I create?", a: "It stays saved as a draft in your workspace indefinitely. Nothing is deleted automatically — you can come back and publish whenever it's ready." },
      { q: "What browsers are supported?", a: "The builder and published sites work on current versions of Chrome, Edge, Firefox, and Safari, on desktop and mobile." },
    ],
  },
  {
    id: "billing",
    label: "Billing & Plans",
    icon: "CreditCard",
    items: [
      { q: "What plans does BuildEzy offer?", a: "Free, Starter, Professional, Business, Agency, and a custom Enterprise tier. Each plan sets limits for websites, pages, AI credits, team members, and storage — see the Pricing page for current details." },
      { q: "How do AI credits work?", a: "AI actions like generating pages, images, or edits consume credits. Your plan includes a monthly allowance, and you can top up with additional credit packs at any time from Billing." },
      { q: "Can I upgrade or downgrade my plan?", a: "Yes, from Billing in your workspace. Upgrades apply immediately; downgrades take effect at the end of your current billing period so you don't lose paid access early." },
      { q: "What payment methods are accepted?", a: "Cards and other methods supported by our payment processor, shown at checkout. All prices are exclusive of applicable GST unless stated otherwise." },
      { q: "What happens if my payment fails?", a: "We retry the charge and notify you. If it continues to fail, paid features may be restricted until payment succeeds, but your website and data are not deleted." },
      { q: "Can I cancel anytime?", a: "Yes, from Billing. Cancellation stops the next renewal; access continues until the end of the period you already paid for." },
    ],
  },
  {
    id: "builder",
    label: "Builder & AI",
    icon: "Sparkles",
    items: [
      { q: "How do I write a good prompt for my website?", a: "Describe the business, audience, the one action you want visitors to take, any facts or offers that can't be invented, and the tone you want. The more concrete the brief, the better the first draft." },
      { q: "Can I regenerate or edit a section without rebuilding the whole page?", a: "Yes. You can regenerate individual sections or make targeted edits through the visual editor without discarding the rest of the page." },
      { q: "Is my website automatically mobile-responsive?", a: "Yes. Pages are built to adapt across mobile, tablet, and desktop breakpoints, and you can fine-tune each breakpoint in the builder." },
      { q: "Can I use my own images and logo instead of AI-generated ones?", a: "Yes, upload your own media in the site's asset library and swap it into any section." },
      { q: "What is version history?", a: "The builder keeps checkpoints of your project as you work, so you can review or restore an earlier version of a page if a change doesn't work out." },
      { q: "Can I edit the underlying code directly?", a: "Advanced editing is available inside the builder for users who want section- or component-level control beyond the visual tools." },
    ],
  },
  {
    id: "publishing",
    label: "Publishing & Domains",
    icon: "Globe",
    items: [
      { q: "How do I publish my website?", a: "Use Publish from the site dashboard. Your site goes live instantly on your BuildEzy platform address, or your connected custom domain once verified." },
      { q: "Can I use a custom domain?", a: "Yes, on plans that include custom domains. Connect a domain you own from Site Settings and follow the DNS verification steps; SSL is provisioned automatically once it's verified." },
      { q: "How long does domain verification take?", a: "Usually minutes once your DNS records are set correctly, though DNS propagation can occasionally take longer depending on your registrar." },
      { q: "Can I unpublish a site?", a: "Yes, from the site dashboard. Unpublishing takes it offline immediately without deleting your content — you can republish whenever you're ready." },
      { q: "Will my site show up on Google?", a: "Published pages are crawlable and support standard SEO fields like titles, descriptions, and social previews, which you can edit per page." },
      { q: "What happens to my domain if I downgrade my plan?", a: "If your new plan doesn't include custom domains, your site falls back to its BuildEzy platform address; your domain connection is preserved and can be restored if you upgrade again." },
    ],
  },
  {
    id: "commerce",
    label: "Commerce & Leads",
    icon: "ShoppingBag",
    items: [
      { q: "Can I sell products on my website?", a: "Yes, through ShopEZ — add products, variants, collections, and discounts, and accept orders directly on your published site." },
      { q: "How does lead capture work?", a: "Forms on your site can save submissions as CRM leads, which you can view, tag, and follow up on from your workspace's CRM." },
      { q: "Can I export my leads?", a: "Yes, leads captured through your site's forms can be exported from the CRM for use in other tools." },
      { q: "What CRM and integration options are supported?", a: "Built-in CRM lead capture is available out of the box, with API access for connecting your own tools on eligible plans." },
      { q: "How are orders and payments handled?", a: "ShopEZ orders are processed through your connected payment integration, with order status and history visible in your workspace." },
    ],
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    icon: "AlertCircle",
    items: [
      { q: "My published site isn't showing my latest changes. What do I do?", a: "Confirm you clicked Publish after editing — draft changes don't go live automatically. If it still looks outdated, try a hard refresh or check from a different network, since browsers and CDNs can cache pages briefly." },
      { q: "My custom domain isn't verifying. What's wrong?", a: "Double-check the DNS records match exactly what Site Settings shows, and that no conflicting records exist at your registrar. DNS changes can take time to propagate — if it's been over a few hours, contact support." },
      { q: "I ran out of AI credits mid-task. What happens?", a: "Generation actions requiring credits will pause until you top up or your plan renews. Your existing pages and edits are never lost." },
      { q: "A payment succeeded but my plan didn't update. What should I do?", a: "This is usually a brief processing delay. If your plan hasn't updated after a few minutes, contact billing support with your transaction reference." },
      { q: "Where do I report a bug or abuse?", a: "Use the dedicated Report a Bug or Report Abuse pages linked in the footer — both include a direct form to our team." },
    ],
  },
];
