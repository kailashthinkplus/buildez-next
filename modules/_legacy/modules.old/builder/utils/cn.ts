// apps/web-app/modules/builder/utils/cn.ts

/**
 * BuildEZ V3 — cn()
 * 
 * Safe className merge utility.
 * Avoids undefined/null/false and trims whitespace.
 * 
 * Always use this for merging classes everywhere in the builder.
 */
export function cn(...classes: any[]): string {
  return classes
    .flatMap((cls) => {
      if (!cls) return [];
      if (typeof cls === "string") return cls;
      if (typeof cls === "object") {
        return Object.entries(cls)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .join(" ")
    .trim();
}
