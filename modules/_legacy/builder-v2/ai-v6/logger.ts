/* ============================================================
   AI-V6 LOGGER (SCOPED)
============================================================ */

const PREFIX = "[AI-V6]";

export function log(...args: any[]) {
  console.log(PREFIX, ...args);
}

export function warn(...args: any[]) {
  console.warn(PREFIX, ...args);
}

export function error(...args: any[]) {
  console.error(PREFIX, ...args);
}

export function group(title: string) {
  console.group(`${PREFIX} ${title}`);
}

export function groupEnd() {
  console.groupEnd();
}
