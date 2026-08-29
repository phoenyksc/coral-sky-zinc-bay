const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function block(len: number) {
  let out = "";
  for (let i = 0; i < len; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)];
  return out;
}

/** House SKU in the same shape as Amazon/3DSellers custom labels. */
export function generateSku() {
  return `SB-${block(4)}-${block(4)}`;
}
