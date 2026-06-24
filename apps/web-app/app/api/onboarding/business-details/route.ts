import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@buildez/db";

// POST - Save business details
export async function POST(req: Request) {
  console.log("🚀 [business-details] START");

  try {
    const user = await getCurrentUser(req);
    console.log("👤 User:", user?.id);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📥 RAW Body:", body);

    const {
      firstName,
      lastName,
      city,
      country,
      profession,
      website,
      accountType,
      businessName,
      companySize,
      primaryUseCase,
    } = body;

    /* -----------------------------
       VALIDATION 
    ----------------------------- */
    if (!firstName?.trim())
      return NextResponse.json({ error: "First name is required" }, { status: 400 });

    if (!lastName?.trim())
      return NextResponse.json({ error: "Last name is required" }, { status: 400 });

    if (!city?.trim())
      return NextResponse.json({ error: "City is required" }, { status: 400 });

    if (!country?.trim())
      return NextResponse.json({ error: "Country is required" }, { status: 400 });

    if (!profession?.trim())
      return NextResponse.json({ error: "Profession is required" }, { status: 400 });

    const validAccount = ["personal", "business", "agency"];
    if (!validAccount.includes(accountType)) {
      return NextResponse.json({ error: "Invalid accountType" }, { status: 400 });
    }

    /* -----------------------------
       BUSINESS NAME LOGIC
    ----------------------------- */
    let finalBusinessName: string = "";

    if (accountType === "personal") {
      finalBusinessName = `${firstName} ${lastName}`.trim();
    } else {
      if (!businessName?.trim()) {
        return NextResponse.json(
          { error: "Business name is required" },
          { status: 400 }
        );
      }
      finalBusinessName = businessName.trim();
    }

    /* -----------------------------
       ENUM OVERRIDES
    ----------------------------- */
    let finalCompanySize = companySize;
    let finalPrimaryUseCase = primaryUseCase;

    if (accountType === "personal") {
      finalCompanySize = "solo";
      finalPrimaryUseCase = "company_website";
    }

    /* -----------------------------
       SAVE userOnboarding ONLY
    ----------------------------- */
    console.log("💾 Saving onboarding…");

    const updated = await prisma.userOnboarding.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        accountType,
        businessName: finalBusinessName,
        companySize: finalCompanySize,
        primaryUseCase: finalPrimaryUseCase,
        firstName,
        lastName,
        city,
        country,
        profession,
        website,
        completed: false,
      },
      update: {
        accountType,
        businessName: finalBusinessName,
        companySize: finalCompanySize,
        primaryUseCase: finalPrimaryUseCase,
        firstName,
        lastName,
        city,
        country,
        profession,
        website,
        completed: false,
      },
    });

    console.log("✅ Onboarding saved:", updated);

    // 1️⃣ Check if the user already has a tenant
    let existingTenant = await prisma.tenant.findFirst({
      where: { ownerId: user.id },
    });

    // If the user doesn't have a tenant, create one
    if (!existingTenant) {
      console.log("🏢 No tenant found — creating new tenant...");

      // Create a new tenant for the user
      const newTenant = await prisma.tenant.create({
        data: {
          name: finalBusinessName,
          ownerId: user.id, // Set the user as the owner of this tenant
        },
      });

      console.log("🏢 Tenant created:", newTenant.id);

      // Create a default team for the tenant
      const team = await prisma.team.create({
        data: {
          tenantId: newTenant.id,
          name: "Main Team",
          slug: `team-${newTenant.id}`,
        },
      });

      console.log("👥 Team created:", team.id);

      // Add the user as the OWNER of the team
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      console.log("⭐ OWNER teamMember created");
    } else {
      console.log("ℹ️ [business-details] Tenant already exists:", existingTenant.id);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("🔥 [business-details] ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET - Load saved business details
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({}, { status: 200 }); // return empty but valid JSON
    }

    const onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(onboarding || {}, { status: 200 });
  } catch (err) {
    console.error("🔥 GET business-details error:", err);
    return NextResponse.json({}, { status: 200 }); // return empty JSON
  }
}
