export type BuilderValidationSeverity = "error" | "warning";

export type BuilderValidationIssue = Readonly<{
  code: string;
  message: string;
  severity: BuilderValidationSeverity;
  nodeId?: string;
  path?: string;
}>;

export type BuilderValidationResult = Readonly<{
  valid: boolean;
  issues: BuilderValidationIssue[];
}>;

export type BuilderValidationSuccess<T> = Readonly<{
  ok: true;
  value: T;
  warnings: BuilderValidationIssue[];
}>;

export type BuilderValidationFailure = Readonly<{
  ok: false;
  errors: BuilderValidationIssue[];
  warnings: BuilderValidationIssue[];
}>;

export type BuilderOperationResult<T> =
  | BuilderValidationSuccess<T>
  | BuilderValidationFailure;

export function validationIssue(
  code: string,
  message: string,
  options: {
    severity?: BuilderValidationSeverity;
    nodeId?: string;
    path?: string;
  } = {}
): BuilderValidationIssue {
  return Object.freeze({
    code,
    message,
    severity: options.severity ?? "error",
    nodeId: options.nodeId,
    path: options.path,
  });
}

export function buildValidationResult(issues: BuilderValidationIssue[]): BuilderValidationResult {
  return Object.freeze({
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  });
}

export function operationSuccess<T>(
  value: T,
  warnings: BuilderValidationIssue[] = []
): BuilderValidationSuccess<T> {
  return Object.freeze({
    ok: true,
    value,
    warnings,
  });
}

export function operationFailure(
  issues: BuilderValidationIssue[]
): BuilderValidationFailure {
  return Object.freeze({
    ok: false,
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning"),
  });
}
