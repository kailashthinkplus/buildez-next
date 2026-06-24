export function assertValidBlueprint(json: any) {
  if (!json || typeof json !== "object") {
    throw new Error("Blueprint is not an object");
  }

  if (json.type !== "page") {
    throw new Error("Root node must be type 'page'");
  }

  if (!Array.isArray(json.children) || json.children.length === 0) {
    throw new Error("Page must contain sections");
  }
}
