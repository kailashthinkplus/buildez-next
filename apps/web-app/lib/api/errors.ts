// /apps/web-app/lib/api/errors.ts

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/* ============================================================
   1. AUTH ERRORS
============================================================ */
export class AuthError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401, "AUTH_ERROR");
  }
}

/* ============================================================
   2. PERMISSION ERRORS
============================================================ */
export class PermissionError extends ApiError {
  constructor(message = "Access denied") {
    super(message, 403, "PERMISSION_DENIED");
  }
}

/* ============================================================
   3. PLAN LIMIT ERRORS
============================================================ */
export class PlanError extends ApiError {
  constructor(message = "Plan limit reached") {
    super(message, 402, "PLAN_LIMIT");
  }
}

/* ============================================================
   4. VALIDATION ERRORS
============================================================ */
export class ValidationError extends ApiError {
  constructor(message = "Invalid input") {
    super(message, 422, "VALIDATION_ERROR");
  }
}

/* ============================================================
   5. NOT FOUND
============================================================ */
export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}

/* ============================================================
   6. SERVER ERROR
============================================================ */
export class ServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(message, 500, "SERVER_ERROR");
  }
}

/* ============================================================
   HELPERS
============================================================ */

export function throwIf(condition: boolean, error: ApiError) {
  if (condition) throw error;
}
