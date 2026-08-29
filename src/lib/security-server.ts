import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { uniqueId } from "@/lib/utils";
import { generateTotpSecret, otpauthUrl, verifyTotp } from "@/lib/totp";

export type SecurityState = {
  userId: string;
  email: string;
  isAdmin: boolean;
  canClaimAdmin: boolean;
  smsEnabled: boolean;
  totpEnabled: boolean;
  totpPending: boolean;
  phoneMasked: string | null;
  twoFactorRequired: boolean;
  channels: Array<"sms" | "totp">;
};

type SettingsRow = {
  phone: string;
  sms_enabled: boolean;
  totp_enabled: boolean;
  totp_secret: string;
  totp_pending: boolean;
  last_sms_at: string | null;
};

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return null;
  return `••••${digits.slice(-4)}`;
}

function hashCode(userId: string, code: string) {
  return createHash("sha256").update(`${userId}:${code}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) throw new Error("Enter a valid mobile number.");
  return digits;
}

function normalizeCode(raw: string) {
  const digits = raw.replace(/\s/g, "");
  if (!/^\d{6}$/.test(digits)) throw new Error("Enter the 6-digit code.");
  return digits;
}

async function userEmail(userId: string) {
  try {
    const sql = await getSql();
    const rows = await sql<{ email: string }>`select email from "user" where id = ${userId}`;
    return rows[0]?.email ?? "";
  } catch {
    return "";
  }
}

async function loadState(userId: string): Promise<SecurityState> {
  const sql = await getSql();
  const members = await sql<{ user_id: string }>`select user_id from admin_members`;
  const mine = members.some((m) => m.user_id === userId);
  const email = await userEmail(userId);
  const rows = await sql<SettingsRow>`
    select phone, sms_enabled, totp_enabled, totp_secret, totp_pending, last_sms_at
    from security_settings where user_id = ${userId}
  `;
  const s = rows[0];
  const smsEnabled = Boolean(s?.sms_enabled);
  const totpEnabled = Boolean(s?.totp_enabled);
  const isAdmin = mine || userId === "dev-user";
  const channels: Array<"sms" | "totp"> = [];
  if (smsEnabled) channels.push("sms");
  if (totpEnabled && isAdmin) channels.push("totp");
  return {
    userId,
    email,
    isAdmin,
    canClaimAdmin: members.length === 0,
    smsEnabled,
    totpEnabled,
    totpPending: Boolean(s?.totp_pending),
    phoneMasked: s?.phone ? maskPhone(s.phone) : null,
    twoFactorRequired: channels.length > 0,
    channels,
  };
}

async function ensureSettings(userId: string) {
  const sql = await getSql();
  await sql`insert into security_settings (user_id) values (${userId}) on conflict (user_id) do nothing`;
}

export const getSecurityState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => loadState(context.userId));

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const existing = await sql<{ n: number }>`select count(*)::int as n from admin_members`;
    if ((existing[0]?.n ?? 0) > 0) {
      const mine = await sql<{ user_id: string }>`select user_id from admin_members where user_id = ${context.userId}`;
      if (!mine[0]) throw new Error("An administrator is already set.");
      return loadState(context.userId);
    }
    const email = await userEmail(context.userId);
    await sql`insert into admin_members (user_id, email) values (${context.userId}, ${email})`;
    return loadState(context.userId);
  });

export const sendSmsCode = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { phone?: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSettings(context.userId);
    const rows = await sql<SettingsRow>`
      select phone, sms_enabled, totp_enabled, totp_secret, totp_pending, last_sms_at
      from security_settings where user_id = ${context.userId}
    `;
    const current = rows[0];
    const phone = data.phone ? normalizePhone(data.phone) : current?.phone;
    if (!phone) throw new Error("Add a mobile number first.");
    if (current?.last_sms_at && Date.now() - Date.parse(current.last_sms_at) < 30_000) {
      throw new Error("Wait a moment before requesting another text.");
    }
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const id = uniqueId("sms");
    await sql`update security_sms_codes set consumed = true where user_id = ${context.userId} and consumed = false`;
    await sql`
      insert into security_sms_codes (id, user_id, code_hash, expires_at)
      values (${id}, ${context.userId}, ${hashCode(context.userId, code)}, now() + interval '5 minutes')
    `;
    await sql`
      update security_settings
      set phone = ${phone}, last_sms_at = now(), updated_at = now()
      where user_id = ${context.userId}
    `;
    return {
      phoneMasked: maskPhone(phone),
      demoCode: code,
    };
  });

async function consumeSms(userId: string, code: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string; code_hash: string }>`
    select id, code_hash from security_sms_codes
    where user_id = ${userId} and consumed = false and expires_at > now()
    order by created_at desc limit 1
  `;
  const row = rows[0];
  if (!row || !safeEqual(row.code_hash, hashCode(userId, code))) throw new Error("That code is not valid.");
  await sql`update security_sms_codes set consumed = true where id = ${row.id}`;
}

export const enableSms = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code: string }) => data)
  .handler(async ({ context, data }) => {
    await consumeSms(context.userId, normalizeCode(data.code));
    const sql = await getSql();
    await sql`update security_settings set sms_enabled = true, updated_at = now() where user_id = ${context.userId}`;
    return loadState(context.userId);
  });

export const disableSms = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<SettingsRow>`select phone, sms_enabled, totp_enabled, totp_secret, totp_pending, last_sms_at from security_settings where user_id = ${context.userId}`;
    if (rows[0]?.sms_enabled) await consumeSms(context.userId, normalizeCode(data.code));
    await sql`update security_settings set sms_enabled = false, updated_at = now() where user_id = ${context.userId}`;
    return loadState(context.userId);
  });

export const beginTotpSetup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const state = await loadState(context.userId);
    if (!state.isAdmin) throw new Error("Google Authenticator is for administrators.");
    await ensureSettings(context.userId);
    const secret = generateTotpSecret();
    const sql = await getSql();
    await sql`
      update security_settings
      set totp_secret = ${secret}, totp_pending = true, totp_enabled = false, updated_at = now()
      where user_id = ${context.userId}
    `;
    const otpauth = otpauthUrl(secret, state.email);
    return {
      secret,
      otpauth,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`,
    };
  });

export const confirmTotp = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code: string }) => data)
  .handler(async ({ context, data }) => {
    const state = await loadState(context.userId);
    if (!state.isAdmin) throw new Error("Google Authenticator is for administrators.");
    const sql = await getSql();
    const rows = await sql<SettingsRow>`select phone, sms_enabled, totp_enabled, totp_secret, totp_pending, last_sms_at from security_settings where user_id = ${context.userId}`;
    const secret = rows[0]?.totp_secret;
    if (!secret) throw new Error("Start authenticator setup first.");
    if (!verifyTotp(secret, normalizeCode(data.code))) throw new Error("That authenticator code is not valid.");
    await sql`update security_settings set totp_enabled = true, totp_pending = false, updated_at = now() where user_id = ${context.userId}`;
    return loadState(context.userId);
  });

export const disableTotp = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { code: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<SettingsRow>`select phone, sms_enabled, totp_enabled, totp_secret, totp_pending, last_sms_at from security_settings where user_id = ${context.userId}`;
    const secret = rows[0]?.totp_secret;
    if (secret && !verifyTotp(secret, normalizeCode(data.code))) throw new Error("That authenticator code is not valid.");
    await sql`
      update security_settings
      set totp_enabled = false, totp_pending = false, totp_secret = '', updated_at = now()
      where user_id = ${context.userId}
    `;
    return loadState(context.userId);
  });

export const verifyTwoFactor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { channel: "sms" | "totp"; code: string }) => data)
  .handler(async ({ context, data }) => {
    const state = await loadState(context.userId);
    const code = normalizeCode(data.code);
    if (data.channel === "sms") {
      if (!state.smsEnabled) throw new Error("Text message verification is not on.");
      await consumeSms(context.userId, code);
    } else {
      if (!state.isAdmin || !state.totpEnabled) throw new Error("Authenticator is not on for this account.");
      const sql = await getSql();
      const rows = await sql<SettingsRow>`select totp_secret from security_settings where user_id = ${context.userId}`;
      if (!verifyTotp(rows[0]?.totp_secret ?? "", code)) throw new Error("That authenticator code is not valid.");
    }
    return { ok: true as const, userId: context.userId };
  });
