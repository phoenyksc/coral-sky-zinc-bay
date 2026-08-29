import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret() {
  return base32Encode(randomBytes(20));
}

function base32Encode(bytes: Buffer) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALPH[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPH[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(secret: string) {
  const clean = secret.toUpperCase().replace(/=+$/g, "").replace(/[\s-]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPH.indexOf(ch);
    if (idx < 0) throw new Error("Invalid authenticator secret.");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function totpCode(secret: string, at = Date.now()) {
  const counter = Math.floor(at / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac("sha1", base32Decode(secret)).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin =
    ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return String(bin % 1_000_000).padStart(6, "0");
}

export function verifyTotp(secret: string, code: string) {
  const digits = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(digits)) return false;
  const now = Date.now();
  const guess = Buffer.from(digits);
  for (const delta of [-1, 0, 1]) {
    const expected = Buffer.from(totpCode(secret, now + delta * 30_000));
    if (expected.length === guess.length && timingSafeEqual(expected, guess)) return true;
  }
  return false;
}

export function otpauthUrl(secret: string, email: string) {
  const label = encodeURIComponent(`Sol Beautiful:${email || "admin"}`);
  const issuer = encodeURIComponent("Sol Beautiful");
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}
