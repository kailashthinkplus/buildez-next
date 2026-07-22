export type IndustryRolePolicy = Readonly<{ businessFamily: string; prefer: readonly string[]; allow: readonly string[]; discourage: readonly string[]; forbid: readonly string[] }>;

export const IndustryRolePolicies: readonly IndustryRolePolicy[] = Object.freeze([
  { businessFamily:"real_estate", prefer:["hero","carousel","galleryLightbox","faq","leadForm","timeline"], allow:["cta","smartFooter"], discourage:["logoCloud"], forbid:[] },
  { businessFamily:"healthcare", prefer:["hero","leadForm","faq","timeline"], allow:["cta","smartFooter"], discourage:["carousel","galleryLightbox","logoCloud"], forbid:[] },
  { businessFamily:"technology_saas", prefer:["hero","carousel","faq","cta"], allow:["leadForm","smartFooter","logoCloud"], discourage:["galleryLightbox","timeline"], forbid:[] },
  { businessFamily:"hospitality", prefer:["hero","carousel","galleryLightbox","cta"], allow:["leadForm","faq","timeline","smartFooter"], discourage:["logoCloud"], forbid:[] },
  { businessFamily:"automotive", prefer:["hero","leadForm","timeline","faq"], allow:["carousel","galleryLightbox","cta","smartFooter"], discourage:["logoCloud"], forbid:[] },
  { businessFamily:"unknown", prefer:["hero","cta"], allow:["carousel","galleryLightbox","faq","leadForm","timeline","smartFooter"], discourage:["logoCloud","floatingWhatsApp"], forbid:[] },
]);

export function policyFor(family?: string) { return IndustryRolePolicies.find((policy) => policy.businessFamily === family) ?? IndustryRolePolicies.at(-1)!; }
