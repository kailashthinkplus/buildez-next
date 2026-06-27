import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDir = path.join(process.cwd(), "public", "theme-previews");
const demoImageDir = path.join(outputDir, "demo-images");
const sourceImagePath = path.join(outputDir, "source", "generated-demo-sheet.png");
const width = 960;
const height = 540;

const themes = [
  {
    id: "buildez-default",
    name: "BuildEZ Default",
    category: "Business Starter",
    layout: "business",
    sourceCell: { row: 1, col: 2 },
    colors: {
      background: "#f8fafc",
      surface: "#ffffff",
      surfaceAlt: "#eef2f7",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      primary: "#2563eb",
      accent: "#f97316",
      border: "#dbe3ef",
    },
    headline: "A clear home base for your growing team",
    subhead: "Strategy calls, service pages, and proof sections are ready to shape.",
    metrics: ["18 pages", "4 services", "92% trust"],
    labels: ["Consulting", "Operations", "Client wins"],
    font: "Inter",
  },
  {
    id: "modern-saas",
    name: "Modern SaaS",
    category: "SaaS Dashboard",
    layout: "saas",
    sourceCell: { row: 0, col: 0 },
    colors: {
      background: "#edf7ff",
      surface: "#ffffff",
      surfaceAlt: "#dff4ff",
      textPrimary: "#081f36",
      textSecondary: "#46627a",
      primary: "#0284c7",
      accent: "#10b981",
      border: "#bfd9ec",
    },
    headline: "Ship analytics your customers understand",
    subhead: "Usage trends, activation reports, and revenue cards are already staged.",
    metrics: ["42k events", "+18% MRR", "7 cohorts"],
    labels: ["Pipeline", "Retention", "Segments"],
    font: "Inter",
  },
  {
    id: "premium-studio",
    name: "Premium Studio",
    category: "Portfolio Studio",
    layout: "studio",
    sourceCell: { row: 0, col: 1 },
    colors: {
      background: "#f6f0e8",
      surface: "#fffdf9",
      surfaceAlt: "#e8dccd",
      textPrimary: "#201812",
      textSecondary: "#6f5f51",
      primary: "#5c3b25",
      accent: "#c0945a",
      border: "#dacbb9",
    },
    headline: "Quiet rooms, crafted details",
    subhead: "A refined gallery, service story, and inquiry path for premium creative work.",
    metrics: ["24 projects", "3 rooms", "Private consults"],
    labels: ["Residential", "Objects", "Studio notes"],
    font: "Georgia",
  },
  {
    id: "local-business",
    name: "Local Business",
    category: "Local Storefront",
    layout: "local",
    sourceCell: { row: 0, col: 2 },
    colors: {
      background: "#fff7ed",
      surface: "#ffffff",
      surfaceAlt: "#f3ead6",
      textPrimary: "#243326",
      textSecondary: "#66715f",
      primary: "#2f7d4b",
      accent: "#d97706",
      border: "#ead8bd",
    },
    headline: "Fresh arrivals, friendly visits",
    subhead: "Hours, offers, reviews, and booking blocks for neighborhood businesses.",
    metrics: ["Open 8-6", "4.9 rating", "Same day"],
    labels: ["Seasonal picks", "Workshops", "Local delivery"],
    font: "Nunito",
  },
  {
    id: "bold-launch",
    name: "Bold Launch",
    category: "Launch Campaign",
    layout: "launch",
    sourceCell: { row: 1, col: 0 },
    colors: {
      background: "#080b18",
      surface: "#11162a",
      surfaceAlt: "#1e2140",
      textPrimary: "#f8fafc",
      textSecondary: "#c9d2e4",
      primary: "#ff3f81",
      accent: "#7dd3fc",
      border: "#343a62",
    },
    headline: "The drop goes live in 48 hours",
    subhead: "Countdown proof, waitlist sections, and punchy offer blocks built for momentum.",
    metrics: ["48 hrs", "12k waitlist", "3 bonuses"],
    labels: ["Reveal", "Perks", "Register"],
    font: "Poppins",
  },
  {
    id: "editorial-minimal",
    name: "Editorial Minimal",
    category: "Editorial Publication",
    layout: "editorial",
    sourceCell: { row: 1, col: 1 },
    colors: {
      background: "#f4f4f2",
      surface: "#ffffff",
      surfaceAlt: "#e6e6e2",
      textPrimary: "#111111",
      textSecondary: "#595959",
      primary: "#111111",
      accent: "#a33b20",
      border: "#cfcfca",
    },
    headline: "Issue 04: Structure and silence",
    subhead: "A magazine-style lead story, article rail, notes, and subscriber module.",
    metrics: ["8 essays", "3 features", "Monthly"],
    labels: ["Essay", "Interview", "Archive"],
    font: "Georgia",
  },
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lines(text, maxLength) {
  const words = text.split(" ");
  const result = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      result.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) result.push(current);
  return result;
}

function textBlock(text, x, y, options = {}) {
  const {
    size = 24,
    lineHeight = 32,
    fill = "#111111",
    weight = 400,
    family = "Inter",
    maxLength = 44,
    maxLines = 3,
  } = options;

  return lines(text, maxLength)
    .slice(0, maxLines)
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" fill="${fill}" font-family="${family}, Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}">${escapeXml(line)}</text>`
    )
    .join("\n");
}

function imageTag(theme, x, y, w, h, radius = 20) {
  return `
  <clipPath id="clip-${theme.id}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}"/>
  </clipPath>
  <image href="data:image/jpeg;base64,${theme.imageBase64}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-${theme.id})"/>`;
}

function header(theme, logoX = 70, y = 58, dark = false) {
  const c = theme.colors;
  const muted = dark ? "#ffffff" : c.textSecondary;
  return `
  <circle cx="${logoX}" cy="${y}" r="11" fill="${c.primary}"/>
  <rect x="${logoX + 26}" y="${y - 7}" width="118" height="12" rx="6" fill="${dark ? "#ffffff" : c.textPrimary}" opacity="${dark ? 0.82 : 0.9}"/>
  <rect x="640" y="${y - 6}" width="44" height="10" rx="5" fill="${muted}" opacity="0.42"/>
  <rect x="708" y="${y - 6}" width="52" height="10" rx="5" fill="${muted}" opacity="0.38"/>
  <rect x="786" y="${y - 15}" width="92" height="30" rx="15" fill="${c.primary}"/>`;
}

function metricCards(theme, x, y, dark = false) {
  const c = theme.colors;
  return theme.metrics
    .map((metric, index) => {
      const cardX = x + index * 160;
      return `
      <rect x="${cardX}" y="${y}" width="136" height="72" rx="18" fill="${dark ? "rgba(255,255,255,0.11)" : c.surface}" stroke="${dark ? "rgba(255,255,255,0.16)" : c.border}"/>
      <text x="${cardX + 18}" y="${y + 32}" fill="${dark ? c.textPrimary : c.textPrimary}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800">${escapeXml(metric)}</text>
      <text x="${cardX + 18}" y="${y + 55}" fill="${dark ? c.textSecondary : c.textSecondary}" font-family="Inter, Arial, sans-serif" font-size="12">${escapeXml(theme.labels[index])}</text>`;
    })
    .join("\n");
}

function saas(theme) {
  const c = theme.colors;
  return `
  <rect width="${width}" height="${height}" fill="${c.background}"/>
  <rect x="40" y="34" width="880" height="472" rx="28" fill="${c.surface}" stroke="${c.border}"/>
  <rect x="40" y="34" width="92" height="472" rx="28" fill="${c.surfaceAlt}"/>
  ${header(theme)}
  ${imageTag(theme, 352, 118, 500, 270, 24)}
  <text x="164" y="148" fill="${c.primary}" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="800">${escapeXml(theme.category)}</text>
  ${textBlock(theme.headline, 164, 202, { size: 42, lineHeight: 46, fill: c.textPrimary, weight: 850, family: theme.font, maxLength: 24, maxLines: 3 })}
  ${textBlock(theme.subhead, 164, 352, { size: 18, lineHeight: 26, fill: c.textSecondary, family: "Inter", maxLength: 34, maxLines: 2 })}
  <rect x="164" y="420" width="130" height="38" rx="13" fill="${c.primary}"/>
  <text x="194" y="445" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="800">Start trial</text>
  ${metricCards(theme, 356, 414)}`;
}

function studio(theme) {
  const c = theme.colors;
  return `
  <rect width="${width}" height="${height}" fill="${c.background}"/>
  <rect x="52" y="40" width="856" height="460" rx="8" fill="${c.surface}" stroke="${c.border}"/>
  ${header(theme, 86, 70)}
  ${imageTag(theme, 84, 118, 470, 304, 4)}
  <rect x="584" y="118" width="270" height="304" rx="4" fill="${c.surfaceAlt}"/>
  <text x="612" y="154" fill="${c.accent}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="800">${escapeXml(theme.category)}</text>
  ${textBlock(theme.headline, 612, 210, { size: 36, lineHeight: 40, fill: c.textPrimary, weight: 600, family: theme.font, maxLength: 18, maxLines: 3 })}
  ${textBlock(theme.subhead, 612, 344, { size: 15, lineHeight: 22, fill: c.textSecondary, family: "Inter", maxLength: 28, maxLines: 3 })}
  <rect x="84" y="448" width="220" height="1" fill="${c.primary}"/>
  ${theme.labels.map((label, i) => `<text x="${340 + i * 140}" y="454" fill="${c.textSecondary}" font-family="Inter, Arial, sans-serif" font-size="13">${escapeXml(label)}</text>`).join("\n")}`;
}

function local(theme) {
  const c = theme.colors;
  return `
  <rect width="${width}" height="${height}" fill="${c.background}"/>
  <rect x="38" y="34" width="884" height="472" rx="30" fill="${c.surface}" stroke="${c.border}"/>
  ${imageTag(theme, 38, 34, 884, 230, 30)}
  <rect x="38" y="34" width="884" height="230" rx="30" fill="rgba(36,51,38,0.22)"/>
  ${header(theme, 76, 70, true)}
  <rect x="76" y="142" width="430" height="104" rx="18" fill="rgba(255,255,255,0.88)"/>
  <text x="100" y="179" fill="${c.primary}" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="800">${escapeXml(theme.category)}</text>
  ${textBlock(theme.headline, 100, 212, { size: 27, lineHeight: 31, fill: c.textPrimary, weight: 850, family: theme.font, maxLength: 30, maxLines: 2 })}
  ${metricCards(theme, 76, 300)}
  <rect x="76" y="410" width="780" height="54" rx="18" fill="${c.surfaceAlt}"/>
  ${theme.labels.map((label, i) => `<text x="${116 + i * 238}" y="443" fill="${i === 0 ? c.primary : c.textPrimary}" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700">${escapeXml(label)}</text>`).join("\n")}`;
}

function launch(theme) {
  const c = theme.colors;
  return `
  <rect width="${width}" height="${height}" fill="${c.background}"/>
  ${imageTag(theme, 0, 0, 960, 540, 0)}
  <rect width="${width}" height="${height}" fill="rgba(8,11,24,0.52)"/>
  ${header(theme, 70, 62, true)}
  <text x="70" y="152" fill="${c.accent}" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="900">${escapeXml(theme.category)}</text>
  ${textBlock(theme.headline, 70, 230, { size: 58, lineHeight: 62, fill: c.textPrimary, weight: 900, family: theme.font, maxLength: 22, maxLines: 2 })}
  ${textBlock(theme.subhead, 72, 354, { size: 19, lineHeight: 28, fill: c.textSecondary, family: "Inter", maxLength: 46, maxLines: 2 })}
  <rect x="72" y="424" width="148" height="44" rx="22" fill="${c.primary}"/>
  <text x="108" y="452" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="900">Join list</text>
  ${metricCards(theme, 452, 404, true)}`;
}

function editorial(theme) {
  const c = theme.colors;
  return `
  <rect width="${width}" height="${height}" fill="${c.background}"/>
  <rect x="54" y="38" width="852" height="464" rx="4" fill="${c.surface}" stroke="${c.border}"/>
  <text x="82" y="90" fill="${c.textPrimary}" font-family="${theme.font}, Georgia, serif" font-size="31" font-weight="700">FIELD NOTES</text>
  <rect x="690" y="73" width="128" height="1" fill="${c.textPrimary}"/>
  <text x="834" y="79" fill="${c.textSecondary}" font-family="Inter, Arial, sans-serif" font-size="12">VOL. 04</text>
  <rect x="82" y="120" width="796" height="1" fill="${c.border}"/>
  ${imageTag(theme, 82, 152, 470, 265, 2)}
  <text x="594" y="158" fill="${c.accent}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="800">${escapeXml(theme.category)}</text>
  ${textBlock(theme.headline, 594, 214, { size: 38, lineHeight: 42, fill: c.textPrimary, weight: 500, family: theme.font, maxLength: 18, maxLines: 3 })}
  ${textBlock(theme.subhead, 594, 348, { size: 15, lineHeight: 23, fill: c.textSecondary, family: "Inter", maxLength: 30, maxLines: 3 })}
  ${theme.labels.map((label, i) => `<text x="${82 + i * 165}" y="466" fill="${c.textPrimary}" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700">${escapeXml(label)}</text>`).join("\n")}`;
}

function business(theme) {
  const c = theme.colors;
  return `
  <rect width="${width}" height="${height}" fill="${c.background}"/>
  <rect x="48" y="38" width="864" height="464" rx="24" fill="${c.surface}" stroke="${c.border}"/>
  ${header(theme, 84, 72)}
  <text x="84" y="152" fill="${c.primary}" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="800">${escapeXml(theme.category)}</text>
  ${textBlock(theme.headline, 84, 210, { size: 44, lineHeight: 49, fill: c.textPrimary, weight: 850, family: theme.font, maxLength: 24, maxLines: 3 })}
  ${textBlock(theme.subhead, 84, 360, { size: 18, lineHeight: 26, fill: c.textSecondary, family: "Inter", maxLength: 38, maxLines: 2 })}
  ${imageTag(theme, 540, 130, 310, 206, 22)}
  <rect x="540" y="362" width="310" height="84" rx="20" fill="${c.surfaceAlt}" stroke="${c.border}"/>
  ${theme.metrics.map((metric, i) => `<text x="${570 + i * 96}" y="406" fill="${c.textPrimary}" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="900">${escapeXml(metric)}</text>`).join("\n")}
  <rect x="84" y="426" width="142" height="42" rx="14" fill="${c.primary}"/>
  <text x="116" y="453" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="900">Explore</text>`;
}

function previewSvg(theme) {
  const renderers = {
    business,
    editorial,
    launch,
    local,
    saas,
    studio,
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${renderers[theme.layout](theme)}
</svg>`;
}

async function cropDemoImages() {
  const source = sharp(sourceImagePath);
  const metadata = await source.metadata();
  const cellWidth = Math.floor((metadata.width ?? 1792) / 3);
  const cellHeight = Math.floor((metadata.height ?? 1024) / 2);

  const imageMap = new Map();

  for (const theme of themes) {
    const left = theme.sourceCell.col * cellWidth;
    const top = theme.sourceCell.row * cellHeight;
    const cropWidth =
      theme.sourceCell.col === 2 ? (metadata.width ?? 1792) - left : cellWidth;
    const cropHeight =
      theme.sourceCell.row === 1 ? (metadata.height ?? 1024) - top : cellHeight;
    const demoPath = path.join(demoImageDir, `${theme.id}.jpg`);
    const buffer = await sharp(sourceImagePath)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize(1200, 760, { fit: "cover" })
      .jpeg({ quality: 88 })
      .toBuffer();

    await fs.writeFile(demoPath, buffer);
    imageMap.set(theme.id, buffer.toString("base64"));
  }

  return imageMap;
}

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(demoImageDir, { recursive: true });

const imageMap = await cropDemoImages();

for (const theme of themes) {
  const svg = previewSvg({
    ...theme,
    imageBase64: imageMap.get(theme.id),
  });
  await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, `${theme.id}.png`));
}

console.log(`Generated ${themes.length} unique theme previews in ${outputDir}`);
