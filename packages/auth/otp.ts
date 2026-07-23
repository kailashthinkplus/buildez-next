import { createHmac, timingSafeEqual } from "node:crypto";

function decodeBase32(value: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = value.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const character of normalized) {
    const index = alphabet.indexOf(character);
    if (index < 0) return Buffer.alloc(0);
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }
  return Buffer.from(bytes);
}

function totpAt(secret: string, counter: number): string {
  const key = decodeBase32(secret);
  if (!key.length) return "";
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const value = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return value.toString().padStart(6, "0");
}

export function verifyTOTP(secret: string, code: string, now = Date.now()): boolean {
  if (!secret || !/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(now / 30_000);
  const supplied = Buffer.from(code);
  return [-1, 0, 1].some((window) => {
    const expected = Buffer.from(totpAt(secret, counter + window));
    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
  });
}
