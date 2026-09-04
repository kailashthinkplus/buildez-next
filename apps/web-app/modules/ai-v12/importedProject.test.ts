import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeImportedProject,
  discoverImportedPages,
  extractImportedTheme,
} from "./importedProject";

const files = [
  { path: "package.json", content: '{"dependencies":{"next":"15.0.0"}}' },
  { path: "src/app/page.tsx", content: "export default function Home(){return <SiteHeader/>}" },
  { path: "src/app/products/[handle]/page.tsx", content: "export default function ProductDetail(){return <ProductCard/>}" },
  { path: "src/components/Footer.tsx", content: "export function Footer(){return <footer/>}" },
  { path: "src/components/Cart.tsx", content: "export const CartProvider = () => null; function addToCart(){}" },
  { path: "src/styles.css", content: "body{background:#f7f0e5;color:#241a16;font-family:'Cormorant Garamond';}.button{background:#8f5b43;border-radius:18px}" },
];

test("discovers file-system pages and dynamic product routes", () => {
  assert.deepEqual(
    discoverImportedPages(files, "2026-01-01T00:00:00.000Z").map((page) => page.route),
    ["/", "/products/:handle"],
  );
});

test("recognizes shared regions, product feeds, cart and framework", () => {
  const analysis = analyzeImportedProject(files);
  assert.equal(analysis.framework, "next");
  assert.equal(analysis.commerce.detected, true);
  assert.ok(analysis.sharedRegions.footer.includes("src/components/Footer.tsx"));
  assert.ok(analysis.commerce.cart.includes("src/components/Cart.tsx"));
});

test("extracts imported colors, typography and radius into canonical theme tokens", () => {
  const theme = extractImportedTheme(files);
  assert.equal(theme.colors.background, "#f7f0e5");
  assert.equal(theme.colors.textPrimary, "#241a16");
  assert.equal(theme.typography.headingFont, "Cormorant Garamond");
  assert.equal(theme.radius.button, 18);
});
