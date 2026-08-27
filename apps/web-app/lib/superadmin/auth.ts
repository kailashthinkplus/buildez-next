import { getCurrentUser } from "@/lib/auth/session";

export class SuperAdminError extends Error {
  status: number;

  constructor(message = "Super admin access required", status = 403) {
    super(message);
    this.name = "SuperAdminError";
    this.status = status;
  }
}

export async function requireSuperAdmin(req?: Request) {
  const user = await getCurrentUser(req);

  if (!user) throw new SuperAdminError("Authentication required", 401);
  if (!user.isActive || user.role !== "SUPER_ADMIN") throw new SuperAdminError();

  return user;
}

export function superAdminErrorResponse(error: unknown) {
  const status = error instanceof SuperAdminError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Unexpected server error";
  return Response.json({ error: message }, { status });
}
