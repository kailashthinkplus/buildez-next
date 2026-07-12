export type CmsFieldType = "text" | "richText" | "number" | "boolean" | "date" | "image" | "url" | "email" | "reference";
export type CmsField = { id: string; name: string; key: string; type: CmsFieldType; required?: boolean; multiple?: boolean };

export const CMS_FIELD_TYPES: CmsFieldType[] = ["text", "richText", "number", "boolean", "date", "image", "url", "email", "reference"];

const f = (name: string, type: CmsFieldType = "text", required = false): CmsField => ({
  id: crypto.randomUUID(), name, key: name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""), type, required,
});

export function industryCollections(industry = "general") {
  const value = industry.toLowerCase();
  if (/real.?estate|property|construction/.test(value)) return [{ name: "Projects", slug: "projects", description: "Properties and real-estate developments", icon: "building", fields: [f("Name", "text", true), f("Location"), f("Price", "number"), f("Cover image", "image"), f("Description", "richText"), f("Featured", "boolean")] }];
  if (/hospital|clinic|health|medical/.test(value)) return [
    { name: "Branches", slug: "branches", description: "Hospital and clinic locations", icon: "hospital", fields: [f("Name", "text", true), f("Address"), f("Phone"), f("Map URL", "url"), f("Image", "image")] },
    { name: "Doctors", slug: "doctors", description: "Doctors and specialists", icon: "stethoscope", fields: [f("Name", "text", true), f("Speciality"), f("Experience", "number"), f("Photo", "image"), f("Biography", "richText"), f("Appointment URL", "url")] },
  ];
  if (/restaurant|cafe|food/.test(value)) return [{ name: "Menu Items", slug: "menu-items", description: "Food and drink menu", icon: "utensils", fields: [f("Name", "text", true), f("Category"), f("Price", "number"), f("Image", "image"), f("Description", "richText"), f("Available", "boolean")] }];
  if (/school|education|college|course/.test(value)) return [{ name: "Courses", slug: "courses", description: "Courses and programs", icon: "graduation-cap", fields: [f("Title", "text", true), f("Duration"), f("Fee", "number"), f("Image", "image"), f("Description", "richText"), f("Apply URL", "url")] }];
  return [{ name: "Content", slug: "content", description: "Reusable structured website content", icon: "database", fields: [f("Title", "text", true), f("Summary", "richText"), f("Image", "image"), f("Published date", "date")] }];
}

export function validFields(value: unknown): value is CmsField[] {
  return Array.isArray(value) && value.length > 0 && value.every((field) => field && typeof field.key === "string" && typeof field.name === "string" && CMS_FIELD_TYPES.includes(field.type));
}
