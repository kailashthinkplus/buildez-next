import { buildValidationResult, validationIssue, type BuilderValidationIssue, type BuilderValidationResult } from "./validationResult";

export function validateSerializationSafeValues(value: unknown): BuilderValidationResult {
  const issues: BuilderValidationIssue[] = [];
  visit(value, "$", issues, new WeakSet<object>());
  return buildValidationResult(issues);
}

function visit(
  value: unknown,
  path: string,
  issues: BuilderValidationIssue[],
  seen: WeakSet<object>
): void {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      issues.push(validationIssue("non-finite-number", "Serialized values must not contain NaN or Infinity.", { path }));
    }
    return;
  }

  if (typeof value === "undefined") {
    issues.push(validationIssue("undefined-value", "Serialized values must not contain undefined.", {
      path: readablePath(path),
      nodeId: nodeIdFromPath(path),
    }));
    return;
  }

  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    issues.push(validationIssue("unsupported-serialized-value", "Serialized values must be JSON-safe.", { path }));
    return;
  }

  if (typeof value !== "object") {
    return;
  }

  if (seen.has(value)) {
    issues.push(validationIssue("circular-value", "Serialized values must not contain object cycles.", { path }));
    return;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((entry, index) => visit(entry, `${path}.${index}`, issues, seen));
    seen.delete(value);
    return;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    issues.push(validationIssue("non-plain-object", "Serialized values must be plain objects or arrays.", { path }));
    seen.delete(value);
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    visit(entry, `${path}.${key}`, issues, seen);
  }

  seen.delete(value);
}

function readablePath(path: string): string {
  return path.replace(/^\$\./, "");
}

function nodeIdFromPath(path: string): string | undefined {
  const match = path.match(/^\$\.nodes\.([^.]+)/);
  return match?.[1];
}
