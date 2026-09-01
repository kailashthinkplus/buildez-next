import { NextRequest } from "next/server";

import { prisma } from "@buildez/db";
import { getUser } from "@/lib/auth/getUser";

export async function POST(req: NextRequest) {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const company = String(body.company || "").trim();
  const message = String(body.message || "").trim();
  const websites = Math.max(1, Number.parseInt(String(body.websites || "1"), 10) || 1);

  if (!name || !email || !company || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json(
      { error: "Name, work email and company are required." },
      { status: 400 },
    );
  }

  const site = await prisma.site.findFirst({
    where: { tenantId: auth.tenant.id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const details = `${company} requested Enterprise pricing for approximately ${websites} websites.${message ? ` ${message}` : ""}`;

  const result = await prisma.$transaction(async (tx) => {
    const lead = site
      ? await tx.crmLead.create({
          data: {
            siteId: site.id,
            name,
            email,
            phone: phone || null,
            company,
            message: details,
            source: "enterprise-plan",
            status: "NEW",
            temperature: "HOT",
            score: 90,
            consent: true,
            tags: ["enterprise", "plan-enquiry"],
            customData: {
              tenantId: auth.tenant.id,
              userId: auth.user.id,
              websites,
              requestedPlan: "ENTERPRISE",
            },
          },
        })
      : null;

    await tx.systemNotification.create({
      data: {
        type: "ENTERPRISE_PLAN_ENQUIRY",
        title: "Enterprise plan enquiry",
        message: `${name} (${email}) from ${company}: ${details}`,
        entityType: lead ? "CrmLead" : "Tenant",
        entityId: lead?.id || auth.tenant.id,
      },
    });

    return lead;
  });

  return Response.json({ ok: true, inquiryId: result?.id || null }, { status: 201 });
}
