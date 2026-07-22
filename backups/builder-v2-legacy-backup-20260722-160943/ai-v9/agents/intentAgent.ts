import type { V9Workflow } from "./types";

export function runV9IntentAgent(workflow: V9Workflow) {
  const brandContext = workflow.brandContext || {};
  const text = [
    workflow.prompt,
    workflow.pageTitle,
    workflow.siteName || "",
    brandContext.companyName,
    brandContext.industry,
    brandContext.useCase,
    brandContext.audience,
    brandContext.offer,
    workflow.research?.title,
    workflow.research?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const industry =
    /clinic|doctor|medical|health|hospital|dental|care/.test(text)
      ? "healthcare"
      : /restaurant|food|cafe|dining|chef/.test(text)
        ? "restaurant"
        : /real estate|property|villa|apartment|home|builder/.test(text)
          ? "real-estate"
          : /saas|software|platform|dashboard|app/.test(text)
            ? "saas"
            : /school|college|academy|course|education/.test(text)
              ? "education"
              : /shop|store|ecommerce|retail|product|checkout/.test(text)
                ? "ecommerce"
                : /law|legal|attorney|advocate/.test(text)
                  ? "legal"
                  : /finance|accounting|wealth|insurance|bank/.test(text)
                    ? "finance"
                    : /fitness|gym|yoga|wellness/.test(text)
                      ? "fitness"
                      : /travel|tour|tourism|hotel|stay/.test(text)
                        ? "travel"
                        : /portfolio|creator|artist|designer|photographer/.test(text)
                          ? "portfolio"
                          : "service-business";

  const goal =
    /book|appointment|schedule|reserve/.test(text)
      ? "appointment-booking"
      : /buy|shop|product|checkout/.test(text)
        ? "sales"
        : "lead-generation";

  const audience =
    industry === "healthcare"
      ? "patients and families looking for trusted care and simple appointment booking"
      : industry === "restaurant"
        ? "local diners deciding where to book or order"
        : industry === "real-estate"
          ? "buyers comparing properties and booking site visits"
          : industry === "saas"
            ? "teams comparing software value, proof, pricing, and a low-friction demo path"
            : industry === "ecommerce"
              ? "shoppers comparing product quality, trust, offers, and purchase paths"
              : industry === "education"
                ? "students or parents comparing outcomes, curriculum, and enrollment steps"
                : industry === "portfolio"
                  ? "clients, collaborators, or employers evaluating work quality and fit"
                  : "qualified prospects comparing credibility, services, and next steps";

  const imageStyle =
    industry === "healthcare"
      ? "professional healthcare photography, clean clinic interiors, doctors with patients, natural daylight, trustworthy and calm"
      : industry === "restaurant"
        ? "premium restaurant photography, warm ambient lighting, plated dishes, inviting dining room"
        : industry === "real-estate"
          ? "architectural photography, premium interiors, golden hour exterior, spacious modern property"
          : industry === "saas"
            ? "premium technology photography, product-led workspaces, clean interface moments, natural light"
            : industry === "ecommerce"
              ? "premium product photography, realistic lifestyle usage, studio-quality lighting, clean composition"
              : industry === "education"
                ? "modern learning photography, engaged students, bright natural light, credible academic environment"
                : industry === "portfolio"
                  ? "editorial creative portfolio photography, studio details, polished project presentation"
                  : "professional business photography, modern workspace, natural light, polished brand atmosphere";

  return { industry, goal, audience, imageStyle };
}
