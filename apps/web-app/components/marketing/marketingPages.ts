export type MarketingPageKey = "pricing" | "changelog" | "blog" | "affiliates" | "privacy" | "terms" | "refunds" | "cookies" | "dpa";

export type MarketingPageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  sections: Array<{ title: string; paragraphs: string[]; bullets?: string[] }>;
  cta?: { label: string; href: string; note: string };
};

const operator = "BuildEzy is a product operated by Appwire LLP, which is its parent company and contracting entity.";

export const marketingPages: Record<MarketingPageKey, MarketingPageContent> = {
  pricing: {
    eyebrow: "Plans & pricing",
    title: "Start simply. Scale when the work grows.",
    intro: "BuildEzy plans are designed for first launches, growing businesses, and teams managing multiple websites. Sign in to see the latest plan limits, billing cycles, taxes, and available upgrades.",
    sections: [
      { title: "Free — ₹0", paragraphs: ["For testing the complete BuildEzy workflow before committing to a paid plan."], bullets: ["1 website and up to 5 pages", "100 AI credits", "1 workspace member", "1 GB storage", "Build with AI on a BuildEzy platform address"] },
      { title: "Starter — ₹499/month", paragraphs: ["For a founder or small team launching a focused business presence. A yearly option is available at ₹4,990 before applicable GST."], bullets: ["Up to 3 websites and 30 pages", "1,000 AI credits", "3 team members", "10 GB storage", "Custom domain, SSL and analytics"] },
      { title: "Professional — ₹1,499/month", paragraphs: ["For growing businesses producing content, capturing leads, and operating several web properties. A yearly option is available at ₹14,990 before applicable GST."], bullets: ["Up to 15 websites and 300 pages", "5,000 AI credits", "10 team members", "100 GB storage", "Forms, blog, custom domains, SSL and analytics"] },
      { title: "Business — ₹9,999/month", paragraphs: ["For established teams that need scale, collaboration, integrations, and priority assistance. A yearly option is available at ₹99,990 before applicable GST."], bullets: ["Up to 30 websites and 600 pages", "15,000 AI credits", "10 team members", "API access, white labelling and priority support"] },
      { title: "Agency — ₹20,999/month", paragraphs: ["For agencies managing a large client portfolio from one operational workspace. A yearly option is available at ₹209,990 before applicable GST."], bullets: ["Up to 100 websites and 2,500 pages", "50,000 AI credits", "25 team members", "Agency workspace, API access, white labelling and priority support"] },
      { title: "Enterprise — custom pricing", paragraphs: ["For organisations requiring negotiated limits, procurement support, dedicated assistance, or a tailored commercial arrangement."], bullets: ["Custom website and page limits", "Flexible AI-credit allocation", "Up to 250 team members in the standard enterprise configuration", "Dedicated support", "Commercial terms agreed with Appwire LLP"] },
      { title: "Taxes, renewals and credits", paragraphs: [operator, "Displayed subscription prices are exclusive of applicable GST unless the checkout expressly states otherwise. The final tax-inclusive amount, billing cycle, renewal terms, and checkout availability are shown before payment.", "Included AI credits refresh according to the active plan cycle. Purchased top-up credits are accounted for separately. Current limits and prices inside the authenticated Plans page are the source of truth if this public summary differs from an account-specific offer."] },
    ],
    cta: { label: "View available plans", href: "/app/plans", note: "Compare current plans and continue securely from your BuildEzy account." },
  },
  changelog: {
    eyebrow: "Product updates",
    title: "The BuildEzy changelog.",
    intro: "A clear record of meaningful improvements across creation, publishing, commerce, insights, security, and account management.",
    sections: [
      { title: "1 September 2026 — BuildEzy identity and public site", paragraphs: ["Updated the BuildEzy identity across the public website, authenticated dashboard, onboarding, builder and account surfaces. Added complete public information pages with a shared header, structured content area and expanded footer."], bullets: ["Correct light- and dark-mode wordmarks", "Responsive marketing header and pricing navigation", "Public pricing, support, policy and programme pages", "Larger footer copy and accessible SVG social icons"] },
      { title: "31 August 2026 — Dashboard workflow", paragraphs: ["Improved the website dashboard so essential publishing and account actions are visible without searching through settings."], bullets: ["View Website beside Manage Pages", "iOS-style Live/Offline control", "Balanced preview and AI-assistant panels", "AI-credit balance with an Add credits action", "Direct Plans and Billing navigation"] },
      { title: "30 August 2026 — Billing and domains", paragraphs: ["Expanded subscription, transaction, invoice and custom-domain foundations."], bullets: ["Plan checkout and confirmation flows", "Transaction history and generated invoices", "Enterprise enquiry path", "Domain verification and SSL provisioning states", "Cloudflare and GoDaddy connection routes"] },
      { title: "29 August 2026 — AI website generation", paragraphs: ["Strengthened generation intent, credit accounting, preview safety and experience acceptance for richer tenant websites."], bullets: ["Improved creative-direction handling", "Safer generated React source", "More reliable preview materialisation", "Clearer credit visibility during AI work", "Published-bundle validation"] },
      { title: "Release availability", paragraphs: ["BuildEzy is continuously delivered. A listed change may roll out gradually or depend on plan, account, region, domain configuration, or browser support. The capabilities visible inside your workspace are the source of truth for your account."] },
    ],
    cta: { label: "Open BuildEzy", href: "/app/dashboard", note: "See the features currently available in your workspace." },
  },
  blog: {
    eyebrow: "BuildEzy journal",
    title: "Practical ideas for building online.",
    intro: "Guidance for turning an idea into a useful website, creating a clear brand experience, publishing confidently, and learning from real visitor behavior.",
    sections: [
      { title: "A practical brief for an AI-built website", paragraphs: ["The strongest generation prompt identifies the business, audience, primary visitor action, required pages, brand character, and proof available. Give the system real constraints and priorities; avoid prescribing every visual detail before the first draft exists."], bullets: ["Name the audience and their decision", "State the one action the homepage must earn", "List facts, offers and proof that cannot be invented", "Describe the desired atmosphere in sensory language", "Call out accessibility or compliance requirements"] },
      { title: "Distinctive design without sacrificing clarity", paragraphs: ["Immersive design works when motion, depth, scale and contrast guide attention. It fails when every section competes for spectacle. Establish one visual idea for the experience, vary the composition between sections, and keep navigation and calls to action predictable."] },
      { title: "The pre-launch website checklist", paragraphs: ["Before publishing, review every viewport, navigation path, form, price, policy link and metadata field. Test the platform address before connecting a custom domain, then confirm DNS and SSL status from the workspace."], bullets: ["Mobile, tablet and desktop layout", "Page titles, descriptions and social preview", "Forms, email destinations and success states", "Pricing, taxes and refund language", "Privacy, terms and cookie disclosures", "404s, redirects, performance and accessibility"] },
      { title: "Read analytics as decisions, not decoration", paragraphs: ["Page views describe activity, not success. Pair traffic with unique visitors, entry pages, device mix, conversion actions and changes over time. Write down the decision each metric could change before adding it to a report."] },
      { title: "From first order to repeat customer", paragraphs: ["A connected commerce flow begins before checkout. Make the offer legible, answer objections near the decision, keep forms short, provide a trustworthy confirmation, and use CRM context to follow up without sending generic noise."] },
      { title: "About the journal", paragraphs: [operator, "These articles provide practical product and website guidance, not legal, tax, financial, or professional advice. Feature availability may differ by plan and change over time; confirm current capabilities in your account."] },
    ],
    cta: { label: "Start building", href: "/app/signup", note: "Put the ideas into practice in one connected workspace." },
  },
  affiliates: {
    eyebrow: "Affiliate programme",
    title: "Recommend BuildEzy responsibly.",
    intro: "The BuildEzy affiliate programme is intended for partners who create useful, honest content and introduce suitable customers to the platform.",
    sections: [
      { title: "Who can apply", paragraphs: ["Creators, educators, agencies, consultants, and communities may be considered. Approval is discretionary and may depend on audience relevance, content quality, and compliance history."] },
      { title: "How referrals work", paragraphs: ["Approved partners receive a trackable referral method. Attribution, qualifying events, commission rates, payment thresholds, and holding periods are provided in the partner terms active at acceptance."] },
      { title: "Required disclosures", paragraphs: ["Affiliates must clearly disclose their commercial relationship with BuildEzy wherever a referral is promoted. Claims must be accurate, current, and based on genuine experience."] },
      { title: "Prohibited promotion", paragraphs: ["Self-referrals, misleading discounts, impersonation, spam, forced clicks, cookie stuffing, trademark bidding without permission, and unlawful or deceptive promotion are prohibited."], bullets: ["Do not promise earnings or outcomes.", "Do not present yourself as Appwire LLP or BuildEzy staff.", "Do not publish private customer or platform information."] },
      { title: "Programme operator", paragraphs: [operator, "Appwire LLP may review, suspend, or end participation where programme terms or applicable law are not followed."] },
    ],
    cta: { label: "Contact support", href: "/faq", note: "Ask about current affiliate availability and application requirements." },
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro: "This policy explains how Appwire LLP collects, uses, shares, retains, and protects personal data when you use BuildEzy websites, accounts, workspaces, support, and paid services.",
    updated: "Last updated: 4 September 2026",
    sections: [
      { title: "Who is responsible", paragraphs: [operator, "Depending on how a customer uses BuildEzy, Appwire LLP may act as the data fiduciary for account and service data and as a processor for personal data a customer places in a BuildEzy website or workspace."] },
      { title: "Data we collect", paragraphs: ["We collect data you provide, data generated through service use, and limited technical data needed to operate and secure the platform."], bullets: ["Identity, account, team, and contact information.", "Subscription, transaction, invoice, and tax information; payment credentials are handled by authorised payment providers.", "Website content, prompts, files, forms, CRM records, support communications, and configuration.", "Device, browser, IP address, authentication, audit, usage, performance, and security events."] },
      { title: "How we use data", paragraphs: ["We use personal data to provide and secure BuildEzy, authenticate users, process purchases, deliver requested AI and publishing functions, support customers, prevent abuse, improve reliability, communicate service information, and comply with law."] },
      { title: "Sharing", paragraphs: ["We may share data with vetted infrastructure, storage, analytics, communications, AI, domain, security, support, and payment providers strictly for service delivery; with workspace administrators according to their permissions; during a lawful corporate transaction; or when required to protect rights, safety, users, or comply with law. We do not sell personal data as a standalone product."] },
      { title: "Retention and security", paragraphs: ["We retain personal data for as long as your account or workspace is active, and afterwards for the period needed to meet contractual and legal duties, resolve disputes, prevent fraud, and maintain necessary records, after which it is deleted or anonymised in line with our retention practices and backup cycles. We use administrative, technical, and organisational safeguards, but no online service can guarantee absolute security."] },
      { title: "Your choices and rights", paragraphs: ["Subject to applicable law, you may request access, correction, erasure, grievance redressal, or withdrawal of consent where processing relies on consent, and you may nominate another individual to exercise your rights in the event of death or incapacity. Workspace-controlled data may need to be addressed first to the relevant customer administrator."] },
      { title: "Grievance Officer", paragraphs: ["In accordance with applicable Indian data protection and information technology law, Appwire LLP has designated a Grievance Officer to address privacy complaints and data-rights requests.", "Grievance Officer — contactable at grievance@getbuildezy.com. We aim to acknowledge grievances promptly and resolve them within the timeframe required by applicable law."] },
      { title: "Marketing communications", paragraphs: ["You may opt out of promotional or marketing emails at any time using the unsubscribe link in those messages or through your account settings. You cannot opt out of transactional or service-related communications, such as billing receipts, security alerts, or OTPs, which are necessary to operate your account."] },
      { title: "International users — EEA, UK, and California", paragraphs: ["Where the EU/UK General Data Protection Regulation applies, Appwire LLP acts as a controller for account and service data and typically as a processor for data you place in a BuildEzy website or workspace; our legal bases include performing our contract with you, our legitimate interests in operating and securing BuildEzy, your consent where requested, and compliance with legal obligations. Data-subject rights include access, rectification, erasure, restriction, portability, and objection, and you may lodge a complaint with your local supervisory authority.", "Where the California Consumer Privacy Act (as amended) applies, we do not sell personal information for money and do not share it for cross-context behavioural advertising. California residents may request to know, delete, or correct their personal information and will not be discriminated against for exercising these rights.", "Requests under this section can be submitted through Help & Support and will be verified before action is taken."] },
      { title: "Children and international processing", paragraphs: ["BuildEzy is not intended for children who cannot lawfully enter a binding service agreement. Data may be processed in locations used by our providers, subject to contractual safeguards and applicable transfer restrictions."] },
      { title: "Changes and contact", paragraphs: ["We may update this policy to reflect service, legal, or operational changes. Material updates will be presented through an appropriate service notice. Privacy requests should be submitted through Help & Support so identity and workspace authority can be verified."] },
    ],
    cta: { label: "Privacy support", href: "/app/help?topic=privacy", note: "Submit a verified privacy or data-rights request." },
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms & Conditions",
    intro: "These Terms govern access to and use of BuildEzy. By creating an account, joining a workspace, purchasing a service, or using BuildEzy, you agree to these Terms on behalf of yourself and any organisation you represent.",
    updated: "Last updated: 4 September 2026",
    sections: [
      { title: "Contracting entity", paragraphs: [operator, "If you use BuildEzy for an organisation, you confirm that you have authority to bind it. You must be legally capable of entering the agreement and provide accurate account information."] },
      { title: "Accounts and workspaces", paragraphs: ["You are responsible for credentials, authorised users, workspace permissions, activity under your account, and promptly notifying us of suspected compromise. Do not share accounts in a way that bypasses plan or security controls."] },
      { title: "Your content", paragraphs: ["You retain ownership of content you lawfully submit. You grant Appwire LLP the limited rights needed to host, process, reproduce, transmit, adapt, and display that content solely to provide, secure, support, and improve the requested BuildEzy services. You are responsible for having all necessary rights and notices."] },
      { title: "Our intellectual property", paragraphs: ["BuildEzy, including its software, design, interfaces, AI systems, templates, documentation, and trademarks, is owned by Appwire LLP or its licensors and protected by applicable intellectual property laws. Subject to these Terms and an active subscription in good standing, we grant you a limited, non-exclusive, non-transferable licence to access and use BuildEzy for your own websites and business purposes.", "You must not copy, modify, reverse engineer, decompile, resell, sublicense, or create derivative works from the BuildEzy platform itself, or use our name, logo, or trademarks without our prior written permission."] },
      { title: "Acceptable use", paragraphs: ["You must not use BuildEzy for unlawful, deceptive, infringing, abusive, dangerous, or security-disruptive activity; interfere with service operation; bypass limits; access another user’s data; distribute malware; facilitate phishing or fraud; or use automated access outside supported interfaces."] },
      { title: "AI features", paragraphs: ["AI output can be incomplete, inaccurate, or unsuitable. You must review output before publishing or relying on it, verify factual and legal claims, and ensure you have rights to submitted inputs and final content. Credits measure platform usage and do not guarantee a particular result."] },
      { title: "Third-party services", paragraphs: ["BuildEzy integrates with or relies on third-party providers, including domain registrars, payment processors, AI model providers, analytics, communications, and hosting infrastructure. Use of these integrations may also be subject to the relevant provider’s own terms and privacy practices, which we encourage you to review.", "Appwire LLP is not responsible for the acts, omissions, availability, or performance of third-party providers, though we select providers we reasonably believe are suitable for delivering BuildEzy."] },
      { title: "Plans, payments, and taxes", paragraphs: ["Prices, limits, billing cycles, renewals, taxes, and included credits are shown before purchase or in your account. You authorise applicable recurring charges until cancellation takes effect. Failed payment may restrict paid features. Top-up credits and subscriptions follow the terms shown at purchase."] },
      { title: "Suspension and termination", paragraphs: ["Appwire LLP may restrict or suspend access to protect the service, investigate abuse or security events, comply with law, address non-payment, or enforce these Terms. You may stop using BuildEzy and cancel eligible renewals through Billing. Provisions that should reasonably survive termination remain effective."] },
      { title: "Indemnification", paragraphs: ["You agree to indemnify and hold harmless Appwire LLP, its officers, employees, and affiliates from claims, damages, losses, and reasonable expenses (including legal fees) arising from your content, your use of BuildEzy in breach of these Terms, your violation of applicable law, or your infringement of a third party’s rights.", "Where practicable, Appwire LLP will give notice of a claim it seeks indemnification for and may participate in its defence at its own expense."] },
      { title: "Service and liability", paragraphs: ["BuildEzy, including AI-generated output, is provided on an “as is” and “as available” basis, subject to availability and the plan purchased, without warranties of any kind, whether express, implied, or statutory, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement, except where such warranties cannot lawfully be excluded.", "To the maximum extent permitted by law, indirect, incidental, special, exemplary, or consequential loss and loss of profits, goodwill, or data are excluded. Nothing in these Terms excludes liability or consumer rights that cannot lawfully be excluded."] },
      { title: "Intellectual property complaints", paragraphs: ["If you believe content hosted on BuildEzy infringes your copyright or other intellectual property rights, submit a notice through Help & Support identifying the work claimed to be infringed, the material you believe is infringing, your contact details, and a good-faith statement that the use is unauthorised.", "We may remove or disable access to reported material, notify the affected customer, and, where appropriate, restrict repeat infringers, without waiving any other right or remedy available to us."] },
      { title: "Governing framework", paragraphs: ["These Terms are governed by the laws of India. Courts with lawful jurisdiction over Appwire LLP will have jurisdiction, subject to any mandatory consumer forum, statutory remedy, or agreed dispute process that applies."] },
      { title: "Changes to these Terms", paragraphs: ["We may update these Terms to reflect changes to BuildEzy, legal requirements, or our operations. Material changes will be notified through the service or your account email in advance of taking effect; continued use of BuildEzy after the effective date constitutes acceptance of the updated Terms."] },
      { title: "General provisions", paragraphs: ["These Terms, together with any order form, plan terms, or referenced policy, form the entire agreement between you and Appwire LLP for BuildEzy and supersede prior discussions on the same subject. If a provision is found unenforceable, the remaining provisions continue in effect, and a failure to enforce a provision is not a waiver of it.", "You may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition, or sale of assets. Neither party is liable for delay or failure caused by events reasonably beyond its control. Notices to you may be sent to your account email or shown within BuildEzy; notices to Appwire LLP should be sent through Help & Support."] },
    ],
    cta: { label: "Terms support", href: "/faq", note: "Ask a question before creating or purchasing an account." },
  },
  refunds: {
    eyebrow: "Legal",
    title: "Cancellations & Refunds",
    intro: "This policy explains how BuildEzy subscription cancellations, renewals, AI-credit purchases, and refund requests are handled by Appwire LLP.",
    updated: "Last updated: 4 September 2026",
    sections: [
      { title: "Cancel a subscription", paragraphs: ["Eligible subscriptions can be cancelled from Billing. Unless the checkout or account states otherwise, cancellation stops the next renewal and paid access continues until the end of the current paid period."] },
      { title: "Free plan and trials", paragraphs: ["The Free plan is provided at no charge and is not eligible for a refund. Where a trial period is offered on a paid plan, it converts automatically to a paid subscription at the price stated at signup unless cancelled before the trial ends."] },
      { title: "Refund eligibility", paragraphs: ["Payments are generally non-refundable once a paid period or digital service has begun, except where a refund is required by applicable law, expressly promised at checkout, caused by a duplicate or incorrect charge, or approved by Appwire LLP after reviewing a verified service failure."] },
      { title: "AI credits and consumed services", paragraphs: ["Used AI credits, completed generations, consumed top-ups, domain or third-party charges, and other irreversibly delivered digital services are normally not refundable. Unused purchased credits may be reviewed only where law or the purchase terms require it."] },
      { title: "Plan changes and proration", paragraphs: ["Upgrading a plan may be charged immediately, with any proration shown at checkout. Downgrading a plan normally takes effect from the next billing cycle and does not generate a partial refund for the period already paid, unless stated otherwise at the time of the change."] },
      { title: "How to request review", paragraphs: ["Submit the transaction reference, account, date, amount, reason, and supporting evidence through Billing support. Do not send complete card details. Requests are evaluated against the purchase record, service usage, provider status, and applicable law."] },
      { title: "Processing", paragraphs: ["Approved refunds are processed within 7–10 business days of approval and returned through the original payment method where practicable. Your bank or payment provider may take additional time to reflect the credit, which is outside BuildEzy’s direct control. Cancellation does not automatically delete website or account data."] },
      { title: "Chargebacks and payment disputes", paragraphs: ["If you raise a chargeback or payment dispute directly with your bank or card network instead of contacting us first, we may suspend the associated account or website while the dispute is investigated. Please contact Billing support before initiating a dispute so we can review and resolve eligible issues directly."] },
      { title: "Statutory rights", paragraphs: [operator, "Nothing in this policy limits a consumer remedy that cannot legally be waived under applicable law."] },
    ],
    cta: { label: "Open billing support", href: "/app/workspace/billing", note: "Review transactions, invoices, subscriptions, and available account actions." },
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookie Policy",
    intro: "This policy explains how Appwire LLP uses cookies and similar local technologies on BuildEzy websites and authenticated services.",
    updated: "Last updated: 1 September 2026",
    sections: [
      { title: "What these technologies do", paragraphs: ["Cookies and local storage can remember a browser, preserve secure sessions, retain preferences, protect forms, measure reliability, and help us understand how BuildEzy is used."] },
      { title: "Essential", paragraphs: ["Essential technologies support authentication, security, fraud prevention, load balancing, account routing, checkout continuity, consent records, and settings needed to deliver the service. Disabling them may prevent BuildEzy from working."] },
      { title: "Preferences and analytics", paragraphs: ["Preference technologies remember choices such as theme. Analytics technologies help identify errors, performance problems, and broad usage patterns. Where consent is required, non-essential technologies are used according to the consent choice presented."] },
      { title: "Third parties", paragraphs: ["Authorised infrastructure, analytics, payment, support, and security providers may set or read technologies when their services are used. Customer-published websites may also use technologies configured by that customer and should provide their own visitor notice."] },
      { title: "Your controls", paragraphs: ["Use the consent control where offered and browser settings to remove or block cookies. Browser controls may not remove server-side records or prevent essential session processing. Withdrawal does not make earlier lawful processing invalid."] },
      { title: "Operator and updates", paragraphs: [operator, "We may update this policy when technologies, providers, or legal requirements change."] },
    ],
    cta: { label: "Privacy Policy", href: "/privacy", note: "Read how associated personal data is handled." },
  },
  dpa: {
    eyebrow: "Legal",
    title: "Data Processing Addendum",
    intro: "This Data Processing Addendum applies when Appwire LLP processes personal data on behalf of a BuildEzy customer under the customer’s service agreement.",
    updated: "Last updated: 1 September 2026",
    sections: [
      { title: "Roles and scope", paragraphs: ["The customer is the data fiduciary, controller, or equivalent responsible party for Customer Personal Data, and Appwire LLP is the processor or data processor to the extent it processes that data to provide BuildEzy. Account, security, billing, and service-operation data may be processed by Appwire LLP for its own lawful purposes as described in the Privacy Policy."] },
      { title: "Documented instructions", paragraphs: ["Appwire LLP processes Customer Personal Data according to the agreement, configured features, customer instructions submitted through supported functions, and applicable law. We will inform the customer where an instruction cannot be followed lawfully, unless prohibited from doing so."] },
      { title: "Confidentiality and security", paragraphs: ["Personnel and contractors with access are subject to appropriate confidentiality duties. Appwire LLP maintains proportionate technical and organisational safeguards designed to protect confidentiality, integrity, availability, access control, and recovery."] },
      { title: "Subprocessors", paragraphs: ["The customer authorises use of subprocessors needed for hosting, storage, delivery, communications, security, support, payments, analytics, and requested AI functions. Appwire LLP remains responsible for imposing appropriate data-protection obligations on subprocessors."] },
      { title: "Assistance", paragraphs: ["Taking into account the nature of processing and available information, Appwire LLP will provide reasonable assistance with verified data-principal requests, security incidents, impact assessments, regulator enquiries, and evidence of compliance where required by applicable law and the agreement."] },
      { title: "Incidents", paragraphs: ["Appwire LLP will notify the customer without undue delay after confirming a personal-data breach affecting Customer Personal Data where notification is required, and will provide available information needed for the customer’s response. Notification is not an admission of fault."] },
      { title: "Deletion, return, and transfers", paragraphs: ["On termination or a supported customer request, Customer Personal Data will be deleted or returned according to product functionality, retention schedules, backups, legal obligations, and the agreement. Cross-border processing is subject to applicable restrictions and appropriate contractual safeguards."] },
      { title: "Order of precedence", paragraphs: [operator, "If this Addendum conflicts with the service agreement on personal-data processing, this Addendum controls for that issue. Mandatory law prevails where it cannot be varied by contract."] },
    ],
    cta: { label: "Data protection support", href: "/app/help?topic=dpa", note: "Request the applicable DPA or submit a verified data-processing enquiry." },
  },
};
