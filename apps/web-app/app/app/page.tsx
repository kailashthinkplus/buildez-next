// /apps/web-app/app/app/page.tsx

import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@buildez/db";

export default async function AppEntry() {
  // 1️⃣ Auth check
  const session = await getCurrentSession();
  if (!session) {
    redirect("/app/login");
  }

  // 2️⃣ Load user
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { tenantId: true },
  });

  if (!user) {
    redirect("/app/login");
  }

  // 3️⃣ No tenant → onboarding
  if (!user.tenantId) {
    redirect("/app/onboarding");
  }

  // 4️⃣ Onboarding must be complete
  const onboarding = await prisma.userOnboarding.findUnique({
    where: { userId: session.userId },
    select: { completed: true },
  });

  if (!onboarding?.completed) {
    redirect("/app/onboarding");
  }

  // ✅ GLOBAL DASHBOARD ENTRY POINT
  redirect("/app/dashboard");
}
