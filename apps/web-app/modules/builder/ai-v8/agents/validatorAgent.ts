import type { ValidationAgentOutput } from "./types";

const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /bg-\[url\(/i, message: "Uses Tailwind arbitrary background URL." },
  { pattern: /TODO/gi, message: "Contains TODO text." },
  { pattern: /lorem ipsum/gi, message: "Contains lorem ipsum copy." },
  { pattern: /href=["']#["']/gi, message: "Contains non-meaningful href anchors." },
  {
    pattern: /(?:placehold\.co|placeholder\.com|via\.placeholder)/gi,
    message: "Uses a placeholder image service.",
  },
];

function hasNonHydratablePlaceholder(code: string) {
  const withoutImageSrcPlaceholders = code
    .replace(
      /src\s*=\s*["'](?:PLACEHOLDER|placeholder|\/placeholder[^"']*|https?:\/\/(?:[^"']*\.)?(?:placeholder|placehold)[^"']*)["']/gi,
      ""
    )
    .replace(
      /src\s*=\s*\{\s*(?:["'`])?(?:PLACEHOLDER|placeholder|\/placeholder[^"'`}]*|https?:\/\/(?:[^"'`}]*\.)?(?:placeholder|placehold)[^"'`}]*)?(?:["'`])?\s*\}/gi,
      ""
    )
    .replace(
      /url\((?:["']?)(?:PLACEHOLDER|placeholder|\/placeholder[^"')]*|https?:\/\/(?:[^"')]*\.)?(?:placeholder|placehold)[^"')]*)(?:["']?)\)/gi,
      ""
    )
    .replace(
      /data-ai-(?:image|bg)\s*=\s*["'][^"']*(?:PLACEHOLDER|placeholder|placehold)[^"']*["']/gi,
      ""
    );

  return /PLACEHOLDER/gi.test(withoutImageSrcPlaceholders);
}

export function runValidatorAgent({
  code,
  requiredSectionIds,
  allowHydratablePlaceholders = false,
}: {
  code: string;
  requiredSectionIds: string[];
  allowHydratablePlaceholders?: boolean;
}): ValidationAgentOutput {
  const present = new Set<string>();
  const idRegex = /id=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = idRegex.exec(code)) !== null) {
    present.add(match[1]);
  }

  const missingSectionIds = requiredSectionIds.filter((id) => !present.has(id));
  const forbiddenWarnings = FORBIDDEN_PATTERNS
    .filter(({ pattern, message }) => {
      if (
        allowHydratablePlaceholders &&
        message === "Uses a placeholder image service."
      ) {
        return false;
      }

      return pattern.test(code);
    })
    .map(({ message }) => message);

  const hasPlaceholder = allowHydratablePlaceholders
    ? hasNonHydratablePlaceholder(code)
    : /PLACEHOLDER/gi.test(code);

  if (hasPlaceholder) {
    forbiddenWarnings.push("Contains placeholder text or image source.");
  }

  return {
    valid: missingSectionIds.length === 0 && forbiddenWarnings.length === 0,
    missingSectionIds,
    forbiddenWarnings,
  };
}
