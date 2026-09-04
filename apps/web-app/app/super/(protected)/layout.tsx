import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import SuperShell from "../components/SuperShell";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || !user.isActive || user.role !== "SUPER_ADMIN") redirect("/super/login");
  return <SuperShell admin={{ name: user.name, email: user.email }}>{children}</SuperShell>;
}
