// /Users/kailash/buildez/apps/web-app/modules/builder/runtime/resolveRuntimeContext.ts

import { prisma } from "@buildez/db";
import { 
  DesignTokens, 
  isValidDesignTokens 
} from "@/modules/builder/runtime/designTokens/designTokens.types";
import { generateDefaultDesignTokens } from "@/modules/builder/runtime/designTokens/generateDefaultDesignTokens";

/* ============================================================
   RUNTIME CONTEXT RESOLVER (AUTHORITATIVE)
   
   Resolves site and design tokens based on hostname:
   - Custom domains (e.g., example.com → site)
   - Subdomains (e.g., mysite.buildez.app → site)
   - Design token hydration with validation
   - Automatic fallback to defaults if tokens missing/invalid
   
   READ-ONLY: No mutations, no AI generation
============================================================ */

/* --------------------------------------------
   TYPES
-------------------------------------------- */

interface Site {
  id: string;
  slug: string;
  designTokens?: any;
  layout?: any;
  // ... other Prisma fields
}

interface RuntimeContext {
  site: Site;
  designTokens: DesignTokens;
  mode: "custom-domain" | "subdomain";
}

/* --------------------------------------------
   DESIGN TOKEN MIGRATION
   Converts old token format to new format
-------------------------------------------- */

function migrateDesignTokens(oldTokens: any): DesignTokens | null {
  // If already in new format, return as-is
  if (isValidDesignTokens(oldTokens)) {
    return oldTokens;
  }

  // Check if it's old format
  if (
    oldTokens?.spacing?.sectionY !== undefined ||
    oldTokens?.spacing?.containerX !== undefined
  ) {
    console.warn("[RUNTIME] Migrating old design tokens to new format");

    const defaults = generateDefaultDesignTokens();

    return {
      ...defaults,
      colors: {
        ...defaults.colors,
        ...oldTokens.colors,
      },
      typography: {
        ...defaults.typography,
        fontFamily: oldTokens.typography?.fontFamily || defaults.typography.fontFamily,
        // Migrate old structure to new
        heading: oldTokens.typography?.heading,
        body: oldTokens.typography?.body,
      },
      spacing: {
        // Convert old format to new format
        ...defaults.spacing,
        "24": oldTokens.spacing?.sectionY || defaults.spacing["24"],
        "6": oldTokens.spacing?.containerX || defaults.spacing["6"],
        "4": oldTokens.spacing?.blockGap || defaults.spacing["4"],
      },
      radius: {
        ...defaults.radius,
        md: oldTokens.spacing?.radius || defaults.radius.md,
      },
      shadows: defaults.shadows,
      buttons: oldTokens.buttons,
    };
  }

  // Invalid format
  console.warn("[RUNTIME] Invalid design tokens, returning null");
  return null;
}

/* --------------------------------------------
   EXTRACT DESIGN TOKENS (SAFE)
-------------------------------------------- */

function extractDesignTokens(site: Site): DesignTokens {
  const rawTokens = site.designTokens;

  // Case 1: No tokens → use defaults
  if (!rawTokens) {
    console.log("[RUNTIME] No design tokens found, using defaults");
    return generateDefaultDesignTokens();
  }

  // Case 2: Valid new format → use as-is
  if (isValidDesignTokens(rawTokens)) {
    console.log("[RUNTIME] Valid design tokens found (new format)");
    return rawTokens;
  }

  // Case 3: Old format → migrate
  const migrated = migrateDesignTokens(rawTokens);
  if (migrated) {
    console.log("[RUNTIME] Design tokens migrated from old format");
    return migrated;
  }

  // Case 4: Invalid → use defaults
  console.warn("[RUNTIME] Invalid design tokens, using defaults", {
    siteId: site.id,
    tokenKeys: Object.keys(rawTokens || {}),
  });
  return generateDefaultDesignTokens();
}

/* --------------------------------------------
   MAIN RESOLVER
-------------------------------------------- */

export async function resolveRuntimeContext(
  hostname: string
): Promise<RuntimeContext | null> {
  // Strip port (localhost:3000, etc.)
  const cleanHost = hostname.split(":")[0];

  console.log("[RUNTIME] resolveRuntimeContext start", {
    hostname,
    cleanHost,
  });

  /* --------------------------------------------
     1) Custom domain (primary)
  -------------------------------------------- */
  const domain = await prisma.domain.findUnique({
    where: { hostname: cleanHost },
    include: {
      site: {
        include: {
          layout: true,
        },
      },
    },
  });

  if (domain?.site) {
    console.log("[RUNTIME] resolved via custom domain", {
      siteId: domain.site.id,
      slug: domain.site.slug,
    });

    return {
      site: domain.site,
      designTokens: extractDesignTokens(domain.site),
      mode: "custom-domain" as const,
    };
  }

  /* --------------------------------------------
     2) Subdomain (*.buildez.app)
  -------------------------------------------- */
  const rootDomain = process.env.ROOT_DOMAIN || "buildez.app";

  if (cleanHost.endsWith(`.${rootDomain}`)) {
    const slug = cleanHost.replace(`.${rootDomain}`, "");

    const site = await prisma.site.findUnique({
      where: { slug },
      include: {
        layout: true,
      },
    });

    if (site) {
      console.log("[RUNTIME] resolved via subdomain", {
        siteId: site.id,
        slug: site.slug,
      });

      return {
        site,
        designTokens: extractDesignTokens(site),
        mode: "subdomain" as const,
      };
    }
  }

  /* --------------------------------------------
     3) Not found
  -------------------------------------------- */
  console.warn("[RUNTIME] site not resolved", {
    cleanHost,
  });

  return null;
}

/* --------------------------------------------
   UTILITY: Get design tokens only
-------------------------------------------- */

export async function getDesignTokensForSite(
  siteId: string
): Promise<DesignTokens> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { designTokens: true },
  });

  if (!site) {
    console.warn(`[RUNTIME] Site not found: ${siteId}`);
    return generateDefaultDesignTokens();
  }

  return extractDesignTokens(site as any);
}

/* --------------------------------------------
   UTILITY: Validate site has valid tokens
-------------------------------------------- */

export async function validateSiteDesignTokens(
  siteId: string
): Promise<{
  valid: boolean;
  hasTokens: boolean;
  isOldFormat: boolean;
  errors: string[];
}> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { designTokens: true },
  });

  if (!site) {
    return {
      valid: false,
      hasTokens: false,
      isOldFormat: false,
      errors: ["Site not found"],
    };
  }

  const rawTokens = (site as any).designTokens;

  if (!rawTokens) {
    return {
      valid: false,
      hasTokens: false,
      isOldFormat: false,
      errors: ["No design tokens found"],
    };
  }

  const isOldFormat = !!(
    rawTokens.spacing?.sectionY !== undefined ||
    rawTokens.spacing?.containerX !== undefined
  );

  const isValid = isValidDesignTokens(rawTokens);

  return {
    valid: isValid,
    hasTokens: true,
    isOldFormat,
    errors: isValid ? [] : ["Invalid design token structure"],
  };
}
