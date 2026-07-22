type Context = Record<string, unknown>;

function text(context: Context, key: string) {
  return typeof context[key] === "string" ? String(context[key]).trim() : "";
}

const systems = {
  "warm-editorial": {
    name: "Warm architectural editorial",
    palette: ["porcelain #FAFAF8", "warm stone #F4F1ED", "deep olive #2C3523", "sage #5C6651", "terracotta #C05A3A", "espresso #2C221B"],
    type: "Cormorant Garamond-style high-contrast editorial serif for display; Outfit-style geometric sans for navigation, labels, body, and controls",
    composition: "cardless asymmetric grids, oversized editorial headlines, thin rules, generous negative space, image crops that alternate scale, and one restrained terracotta action",
  },
  cinematic: {
    name: "Cinematic image-led journey",
    palette: ["chalk #F7F4EE", "ink #18201C", "forest #26372C", "clay #A94F35", "sand #D8CCB8"],
    type: "Instrument Serif-style expressive display face; Manrope-style clean sans for supporting copy",
    composition: "full-bleed opening image, layered but readable copy, dramatic scale changes, scroll-led visual chapters, quiet information bands, and minimal controls",
  },
  contemporary: {
    name: "Contemporary architectural clarity",
    palette: ["paper #F8F7F3", "graphite #20231F", "moss #46533F", "oxide #B45438", "line #D8D5CE"],
    type: "Newsreader-style refined serif for display; Inter-style neutral sans for body and UI",
    composition: "precise modular grids, bold negative space, sharp image windows, numbered evidence, minimal borders, and almost no decorative cards",
  },
} as const;

export type V11CreativeBrief = ReturnType<typeof createV11CreativeBrief>;

export function createV11CreativeBrief(context: Context, prompt: string) {
  const signal = `${text(context, "designIntent")} ${prompt}`.toLowerCase();
  const key = signal.includes("cinematic") || signal.includes("immersive")
    ? "cinematic"
    : signal.includes("contemporary") || signal.includes("structured")
      ? "contemporary"
      : "warm-editorial";
  const system = systems[key];
  const industry = text(context, "industry") || "professional services";
  const conversion = text(context, "offer") || text(context, "useCase") || "start a focused conversation";
  return {
    id: key,
    ...system,
    industry,
    conversion,
    imageDirection: `Use believable, place-specific editorial photography for ${industry}: one commanding hero, one tactile/detail image, one human or lived-experience image, and project/service images with varied crops. Never repeat one image as filler.`,
    qualityRules: [
      "Prefer composed sections over collections of rounded cards.",
      "Use at most two corner-radius sizes and reserve pills for compact actions or filters.",
      "Every section must introduce a new spatial rhythm; alternate image-led, typographic, evidence, and conversion moments.",
      "Use one display serif and one supporting sans consistently; labels are small, tracked, and purposeful.",
      "Do not invent awards, testimonials, project names, dates, addresses, statistics, or regulatory claims.",
    ],
  };
}
