export type GoldenReferenceMetadata = Readonly<{
  style: string;
  mood: string;
  focus: string;
  notes: readonly string[];
  referenceImage?: string;
}>;

const references: Readonly<Record<string, GoldenReferenceMetadata>> = Object.freeze({
  "luxury-residential-developer": Object.freeze({ style: "luxury editorial", mood: "premium", focus: "architecture photography", notes: Object.freeze(["Reference image is optional; metadata must never block generation."]) }),
});

export function getGoldenReferenceMetadata(caseId: string): GoldenReferenceMetadata | undefined {
  return references[caseId];
}
