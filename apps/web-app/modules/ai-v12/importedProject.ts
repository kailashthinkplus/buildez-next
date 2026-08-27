import path from "node:path";

import type { BuilderThemeTokens } from "@/modules/builder-v2/theme/theme.types";
import {
  defaultThemeTokens,
  normalizeThemeTokens,
} from "@/modules/builder-v2/theme/defaultTheme";

export type ImportedSourceFile = { path: string; content: string };

export type ImportedPage = {
  id: string;
  name: string;
  slug: string;
  route: string;
  sourceFile: string;
  componentName: string;
  title: string;
  description: string;
  status: "draft";
  order: number;
  includeInNavigation: boolean;
  isHomepage: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ImportedProjectAnalysis = {
  version: 1;
  framework: string;
  pages: ImportedPage[];
  sharedRegions: {
    header: string[];
    footer: string[];
  };
  feeds: {
    products: string[];
    blog: string[];
    instagram: string[];
  };
  commerce: {
    detected: boolean;
    cart: string[];
    account: string[];
    productDetail: string[];
  };
  theme: BuilderThemeTokens;
};

const PAGE_EXTENSIONS = /\.(?:tsx|jsx|ts|js)$/i;
const CSS_EXTENSIONS = /\.(?:css|scss|sass|less)$/i;

function slugPart(value: string) {
  return value
    .replace(/\[(?:\.\.\.)?([^\]]+)\]/g, ":$1")
    .replace(/^\(([^)]+)\)$/, "")
    .replace(/[^a-zA-Z0-9:_-]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function titlePart(slug: string) {
  if (!slug) return "Home";
  return slug
    .replace(/^:/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function routeFromSource(sourcePath: string) {
  const normalized = sourcePath.replaceAll("\\", "/");
  const appMatch = normalized.match(/(?:^|\/)(?:src\/)?app\/(.+?)\/page\.(?:tsx|jsx|ts|js)$/i);
  if (appMatch) {
    const segments = appMatch[1].split("/").map(slugPart).filter(Boolean);
    return `/${segments.join("/")}`.replace(/\/index$/i, "") || "/";
  }
  if (/(?:^|\/)(?:src\/)?app\/page\.(?:tsx|jsx|ts|js)$/i.test(normalized)) return "/";
  const pagesMatch = normalized.match(/(?:^|\/)(?:src\/)?pages\/(.+?)\.(?:tsx|jsx|ts|js)$/i);
  if (pagesMatch) {
    const segments = pagesMatch[1].split("/").map(slugPart).filter(Boolean);
    return `/${segments.join("/")}`.replace(/\/index$/i, "") || "/";
  }
  return null;
}

function discoverRouterRoutes(files: readonly ImportedSourceFile[]) {
  const routes: Array<{ route: string; sourceFile: string }> = [];
  const routePattern = /(?:path\s*=\s*|path\s*:\s*)["'`]([^"'`]+)["'`]/g;
  for (const file of files) {
    if (!PAGE_EXTENSIONS.test(file.path)) continue;
    let match: RegExpExecArray | null;
    while ((match = routePattern.exec(file.content))) {
      if (!match[1].startsWith("/") || match[1] === "*") continue;
      routes.push({ route: match[1], sourceFile: file.path });
    }
  }
  return routes;
}

function componentName(sourceFile: string, route: string) {
  const base = path.posix.basename(sourceFile).replace(PAGE_EXTENSIONS, "");
  const candidate = base.toLowerCase() === "page" || base.toLowerCase() === "index"
    ? route.split("/").filter(Boolean).at(-1) || "Home"
    : base;
  return `${titlePart(candidate).replace(/\s+/g, "")}Page`;
}

export function discoverImportedPages(
  files: readonly ImportedSourceFile[],
  now = new Date().toISOString(),
): ImportedPage[] {
  const discovered = files
    .filter((file) => PAGE_EXTENSIONS.test(file.path))
    .flatMap((file) => {
      const route = routeFromSource(file.path);
      return route ? [{ route, sourceFile: file.path }] : [];
    });
  discovered.push(...discoverRouterRoutes(files));
  if (!discovered.some((page) => page.route === "/")) {
    const entry = files.find((file) => /(?:^|\/)(?:App|Home|main|index)\.(?:tsx|jsx)$/i.test(file.path));
    if (entry) discovered.unshift({ route: "/", sourceFile: entry.path });
  }

  const unique = [...new Map(discovered.map((page) => [page.route, page])).values()]
    .sort((left, right) => left.route === "/" ? -1 : right.route === "/" ? 1 : left.route.localeCompare(right.route));
  return unique.map((page, order) => {
    const slug = page.route === "/" ? "home" : page.route.replace(/^\//, "");
    const title = titlePart(slug.split("/").at(-1) || "home");
    return {
      id: `imported-${slug.replace(/[^a-z0-9]+/gi, "-")}`,
      name: title,
      slug,
      route: page.route,
      sourceFile: page.sourceFile,
      componentName: componentName(page.sourceFile, page.route),
      title,
      description: `Imported ${title} page`,
      status: "draft",
      order,
      includeInNavigation: !page.route.includes(":") && !/checkout|cart|account/i.test(page.route),
      isHomepage: page.route === "/",
      createdAt: now,
      updatedAt: now,
    };
  });
}

function mostFrequent<T>(values: readonly T[], fallback: T) {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback;
}

function luminance(hex: string) {
  const value = hex.replace("#", "");
  const expanded = value.length === 3 ? value.split("").map((part) => part + part).join("") : value.slice(0, 6);
  const channels = [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16) / 255);
  return channels.reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

export function extractImportedTheme(files: readonly ImportedSourceFile[]) {
  const css = files.filter((file) => CSS_EXTENSIONS.test(file.path) || PAGE_EXTENSIONS.test(file.path))
    .map((file) => file.content).join("\n");
  const colors = [...css.matchAll(/#[0-9a-f]{3,8}\b/gi)].map((match) => match[0].toLowerCase());
  const light = colors.filter((color) => luminance(color) > 0.72);
  const dark = colors.filter((color) => luminance(color) < 0.28);
  const chromatic = colors.filter((color) => {
    const value = color.slice(1, 7);
    if (value.length < 6) return true;
    const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
    return Math.max(...channels) - Math.min(...channels) > 35;
  });
  const fonts = [...css.matchAll(/font-family\s*:\s*([^;}\n]+)/gi)]
    .map((match) => match[1].split(",")[0].replace(/["']/g, "").trim())
    .filter(Boolean);
  const radii = [...css.matchAll(/border-radius\s*:\s*(\d+(?:\.\d+)?)px/gi)]
    .map((match) => Number(match[1])).filter(Number.isFinite);
  const primary = mostFrequent(chromatic, defaultThemeTokens.colors.primary);
  const background = mostFrequent(light, defaultThemeTokens.colors.background);
  const textPrimary = mostFrequent(dark, defaultThemeTokens.colors.textPrimary);
  return normalizeThemeTokens({
    colors: {
      background,
      surface: background,
      surfaceAlt: light.find((color) => color !== background) || defaultThemeTokens.colors.surfaceAlt,
      textPrimary,
      textSecondary: dark.find((color) => color !== textPrimary) || defaultThemeTokens.colors.textSecondary,
      primary,
      primaryContrast: luminance(primary) > 0.6 ? "#111111" : "#ffffff",
      accent: chromatic.find((color) => color !== primary) || defaultThemeTokens.colors.accent,
      border: mostFrequent(colors.filter((color) => luminance(color) > 0.5 && luminance(color) < 0.9), defaultThemeTokens.colors.border),
    },
    typography: {
      headingFont: fonts[0] || defaultThemeTokens.typography.headingFont,
      bodyFont: fonts[1] || fonts[0] || defaultThemeTokens.typography.bodyFont,
    },
    radius: {
      button: mostFrequent(radii, defaultThemeTokens.radius.button),
      card: mostFrequent(radii.filter((value) => value >= 4), defaultThemeTokens.radius.card),
      media: mostFrequent(radii.filter((value) => value >= 8), defaultThemeTokens.radius.media),
    },
  });
}

function matchingPaths(files: readonly ImportedSourceFile[], pattern: RegExp) {
  return files.filter((file) => pattern.test(`${file.path}\n${file.content}`)).map((file) => file.path).slice(0, 30);
}

export function analyzeImportedProject(files: readonly ImportedSourceFile[]): ImportedProjectAnalysis {
  const packageFile = files.find((file) => file.path === "package.json")?.content || "";
  const framework = /"next"\s*:/.test(packageFile)
    ? "next"
    : /"@remix-run\//.test(packageFile)
      ? "remix"
      : /"vite"\s*:/.test(packageFile)
        ? "vite"
        : "react";
  const products = matchingPaths(files, /\b(ProductGrid|ProductCard|product-feed|products?\.map|collection)\b/i);
  const cart = matchingPaths(files, /\b(CartProvider|CartContext|addToCart|shopping.?cart|cart.?drawer)\b/i);
  const account = matchingPaths(files, /\b(Login|SignIn|Account|CustomerAuth|user.?menu)\b/i);
  const productDetail = matchingPaths(files, /\b(ProductDetail|product.?page|useParams[\s\S]+product|products?\/:)\b/i);
  return {
    version: 1,
    framework,
    pages: discoverImportedPages(files),
    sharedRegions: {
      header: matchingPaths(files, /\b(Header|Navbar|Navigation|SiteHeader)\b/i),
      footer: matchingPaths(files, /\b(Footer|SiteFooter)\b/i),
    },
    feeds: {
      products,
      blog: matchingPaths(files, /\b(Blog|Journal|Article|PostCard|posts?\.map)\b/i),
      instagram: matchingPaths(files, /\b(Instagram|InstaFeed|social.?feed)\b/i),
    },
    commerce: {
      detected: Boolean(products.length || cart.length || productDetail.length),
      cart,
      account,
      productDetail,
    },
    theme: extractImportedTheme(files),
  };
}
