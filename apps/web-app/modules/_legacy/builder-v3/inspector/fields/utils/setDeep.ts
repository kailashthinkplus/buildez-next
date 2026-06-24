export function setDeep(obj: any, path: string, value: any) {
  const parts = path.split(".");
  const last = parts.pop();

  let current = obj;
  for (const p of parts) {
    if (!current[p]) current[p] = {};
    current = current[p];
  }

  current[last!] = value;
}
