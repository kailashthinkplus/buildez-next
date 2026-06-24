// /Users/kailash/buildez/apps/web-app/modules/builder/ai-v8/lib/htmlValidator.ts

export interface HTMLValidation {
  valid: boolean;
  warnings?: string[];
}

export function validateHTML(html: string): HTMLValidation {
  const warnings: string[] = [];

  if (!html.includes("<nav") && !html.includes("<header")) {
    warnings.push("Missing navigation");
  }

  if (!html.includes("<footer")) {
    warnings.push("Missing footer");
  }

  if (html.includes("PLACEHOLDER")) {
    warnings.push("Some images not replaced");
  }

  if (!html.includes("sm:") && !html.includes("md:")) {
    warnings.push("No responsive classes");
  }

  if (!html.includes("<h1")) {
    warnings.push("Missing h1");
  }

  return {
    valid: warnings.length === 0,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
