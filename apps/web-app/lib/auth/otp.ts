import { createHash, randomInt } from "node:crypto";

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOtp(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
