// id.ts
export function generateId(): string {
  // TODO (RFC-004 ID generation)
  return "id_" + Math.random().toString(36).slice(2);
}
