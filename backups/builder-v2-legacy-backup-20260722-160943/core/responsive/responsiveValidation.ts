import { RESPONSIVE_DEVICES } from "./responsiveBreakpoints";
import { isResponsiveValue } from "./responsiveValue";

export type ResponsiveValidationIssue = Readonly<{
  code: string;
  message: string;
  path?: string;
}>;

export function validateResponsiveValue(value: unknown, path = "value"): ResponsiveValidationIssue[] {
  if (!isResponsiveValue(value)) return [];

  const issues: ResponsiveValidationIssue[] = [];
  const allowed = new Set(["base", ...RESPONSIVE_DEVICES]);

  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (!allowed.has(key)) {
      issues.push({
        code: "unsupported-responsive-device",
        message: `Unsupported responsive key "${key}".`,
        path: `${path}.${key}`,
      });
    }
  }

  return issues;
}
