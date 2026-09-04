import type { InsightCategory, InsightReport, WebVitalMetric } from "./types";

type LighthouseAudit = {
  numericValue?: number;
  displayValue?: string;
};

type PageSpeedPayload = {
  lighthouseResult?: {
    categories?: Record<string, { score?: number }>;
    audits?: Record<string, LighthouseAudit>;
  };
  loadingExperience?: {
    metrics?: Record<
      string,
      { percentile?: number; category?: "FAST" | "AVERAGE" | "SLOW" }
    >;
  };
};

function metricRating(
  category: "FAST" | "AVERAGE" | "SLOW" | undefined,
): "good" | "needs-improvement" | "poor" {
  if (category === "FAST") return "good";
  if (category === "SLOW") return "poor";
  return "needs-improvement";
}

function auditSeconds(
  id: WebVitalMetric["id"],
  label: string,
  audit: LighthouseAudit | undefined,
  description: string,
): WebVitalMetric {
  const milliseconds = audit?.numericValue ?? 0;
  const seconds = milliseconds / 1000;
  const poor =
    id === "lcp" ? 4 : id === "fcp" ? 3 : id === "speed-index" ? 5.8 : 0.6;
  const good =
    id === "lcp" ? 2.5 : id === "fcp" ? 1.8 : id === "speed-index" ? 3.4 : 0.2;
  return {
    id,
    label,
    value: seconds,
    displayValue: audit?.displayValue || `${seconds.toFixed(1)} s`,
    rating:
      seconds <= good
        ? "good"
        : seconds >= poor
          ? "poor"
          : "needs-improvement",
    description,
    source: "pagespeed",
  };
}

function replaceCategory(
  categories: InsightCategory[],
  id: InsightCategory["id"],
  score: number | undefined,
) {
  if (score === undefined) return categories;
  return categories.map((category) =>
    category.id === id
      ? { ...category, score: Math.round(score * 100) }
      : category,
  );
}

function validPublicUrl(value: string) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("PageSpeed requires an http or https URL");
  }
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    throw new Error("PageSpeed can only test a publicly available URL");
  }
  return parsed.toString();
}

export async function runPageSpeed(
  report: InsightReport,
  url: string,
  strategy: "mobile" | "desktop",
): Promise<InsightReport> {
  const target = validPublicUrl(url);
  const endpoint = new URL(
    "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed",
  );
  endpoint.searchParams.set("url", target);
  endpoint.searchParams.set("strategy", strategy);
  for (const category of [
    "performance",
    "accessibility",
    "seo",
    "best-practices",
  ]) {
    endpoint.searchParams.append("category", category);
  }
  if (process.env.GOOGLE_PAGESPEED_API_KEY) {
    endpoint.searchParams.set("key", process.env.GOOGLE_PAGESPEED_API_KEY);
  }

  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(45_000),
    cache: "no-store",
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      message.includes("API key")
        ? "Live PageSpeed is not configured yet"
        : "Google PageSpeed could not complete this test",
    );
  }
  const payload = (await response.json()) as PageSpeedPayload;
  const lighthouse = payload.lighthouseResult;
  const audits = lighthouse?.audits ?? {};
  let categories = report.categories;
  categories = replaceCategory(
    categories,
    "performance",
    lighthouse?.categories?.performance?.score,
  );
  categories = replaceCategory(
    categories,
    "accessibility",
    lighthouse?.categories?.accessibility?.score,
  );
  categories = replaceCategory(
    categories,
    "seo",
    lighthouse?.categories?.seo?.score,
  );
  categories = replaceCategory(
    categories,
    "best-practices",
    lighthouse?.categories?.["best-practices"]?.score,
  );

  const fieldMetrics = payload.loadingExperience?.metrics ?? {};
  const inpField = fieldMetrics.INTERACTION_TO_NEXT_PAINT;
  const clsField = fieldMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE;
  const vitals: WebVitalMetric[] = [
    auditSeconds(
      "lcp",
      "Largest Contentful Paint",
      audits["largest-contentful-paint"],
      "How quickly the main content becomes visible",
    ),
    {
      id: "inp",
      label: "Interaction to Next Paint",
      value: inpField?.percentile ?? report.vitals.find((item) => item.id === "inp")?.value ?? 0,
      displayValue: inpField?.percentile
        ? `${inpField.percentile} ms`
        : report.vitals.find((item) => item.id === "inp")?.displayValue ?? "No field data",
      rating: inpField
        ? metricRating(inpField.category)
        : report.vitals.find((item) => item.id === "inp")?.rating ?? "needs-improvement",
      description: inpField
        ? "Real-user responsiveness from the Chrome UX Report"
        : "Modeled responsiveness; this URL has no public field data yet",
      source: "pagespeed",
    },
    {
      id: "cls",
      label: "Cumulative Layout Shift",
      value: clsField?.percentile
        ? clsField.percentile / 100
        : audits["cumulative-layout-shift"]?.numericValue ?? 0,
      displayValue: clsField?.percentile
        ? (clsField.percentile / 100).toFixed(2)
        : audits["cumulative-layout-shift"]?.displayValue ?? "0",
      rating: clsField
        ? metricRating(clsField.category)
        : (audits["cumulative-layout-shift"]?.numericValue ?? 0) <= 0.1
          ? "good"
          : "needs-improvement",
      description: "How visually stable the layout remains while loading",
      source: "pagespeed",
    },
    auditSeconds(
      "fcp",
      "First Contentful Paint",
      audits["first-contentful-paint"],
      "When the first visible content appears",
    ),
    {
      id: "tbt",
      label: "Total Blocking Time",
      value: audits["total-blocking-time"]?.numericValue ?? 0,
      displayValue: audits["total-blocking-time"]?.displayValue ?? "0 ms",
      rating:
        (audits["total-blocking-time"]?.numericValue ?? 0) <= 200
          ? "good"
          : (audits["total-blocking-time"]?.numericValue ?? 0) >= 600
            ? "poor"
            : "needs-improvement",
      description: "Main-thread time that may delay input",
      source: "pagespeed",
    },
    auditSeconds(
      "speed-index",
      "Speed Index",
      audits["speed-index"],
      "How quickly visible page content fills in",
    ),
  ];
  const score = Math.round(
    categories.reduce((sum, category) => sum + category.score, 0) /
      Math.max(categories.length, 1),
  );

  return {
    ...report,
    generatedAt: new Date().toISOString(),
    source: "pagespeed",
    score,
    summary: `Live ${strategy} PageSpeed results are combined with BuildEZ source, GEO and conversion checks.`,
    categories,
    vitals,
  };
}

