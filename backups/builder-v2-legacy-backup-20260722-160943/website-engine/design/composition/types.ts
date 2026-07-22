export type CompositionPlan = {
  density: "minimal" | "balanced" | "dense";
  rhythm: string[];
  heroTreatment: "image-led" | "split" | "centered";
  sectionAlternation: Array<"light" | "surface" | "dark" | "image">;
  motionPreset: "subtle-reveal" | "editorial-stagger";
};
