import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uniqueId } from "@/lib/utils";
import type { Order } from "@/lib/types";

export const REFERRAL = {
  minPurchase: 50,
  firstPercent: 10,
  fivePercent: 20,
  fiveCount: 5,
} as const;

export type ReferralReward = {
  code: string;
  percent: 10 | 20;
  email: string;
  earnedAt: string;
  used: boolean;
  reason: "first-friend" | "five-friends";
};

export type ReferralAccount = {
  email: string;
  firstName: string;
  code: string;
  qualifiedEmails: string[];
  invitedEmails: string[];
};

export type ReferralNote = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  code?: string;
};

interface ReferralState {
  pendingRef: string;
  pendingVia: string;
  lastEmail: string;
  accounts: ReferralAccount[];
  rewards: ReferralReward[];
  mailbox: ReferralNote[];
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setPendingRef: (code: string, via?: string) => void;
  ensureAccount: (email: string, firstName: string) => ReferralAccount;
  inviteFriend: (fromEmail: string, friendEmail: string) => { ok: boolean; message: string };
  onOrderPlaced: (order: Order) => { credited: boolean; percent?: 10 | 20 };
}

function norm(email: string) {
  return email.trim().toLowerCase();
}

function codeFromEmail(email: string) {
  let h = 2166136261;
  for (const ch of norm(email)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return `SOL${(h >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`;
}

function rewardCode(percent: 10 | 20) {
  return `FRIEND${percent}-${uniqueId("r").slice(-6).toUpperCase()}`;
}

export function shareUrl(code: string, email?: string) {
  if (typeof window === "undefined") {
    return email ? `/?ref=${code}&via=${encodeURIComponent(email)}` : `/?ref=${code}`;
  }
  const url = new URL("/", window.location.origin);
  url.searchParams.set("ref", code);
  if (email) url.searchParams.set("via", email);
  return url.toString();
}

export const useReferralStore = create<ReferralState>()(
  persist(
    (set, get) => ({
      pendingRef: "",
      pendingVia: "",
      lastEmail: "",
      accounts: [],
      rewards: [],
      mailbox: [],
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setPendingRef: (code, via) => {
        const next = code.trim().toUpperCase();
        if (!next) return;
        set({ pendingRef: next, pendingVia: via ? norm(via) : get().pendingVia });
      },
      ensureAccount: (email, firstName) => {
        const key = norm(email);
        const existing = get().accounts.find((a) => a.email === key);
        if (existing) {
          if (get().lastEmail !== key || (firstName && existing.firstName !== firstName)) {
            set({
              lastEmail: key,
              accounts: firstName && existing.firstName !== firstName
                ? get().accounts.map((a) => (a.email === key ? { ...a, firstName } : a))
                : get().accounts,
            });
          }
          return get().accounts.find((a) => a.email === key)!;
        }
        const account: ReferralAccount = {
          email: key,
          firstName: firstName.trim() || "Friend",
          code: codeFromEmail(key),
          qualifiedEmails: [],
          invitedEmails: [],
        };
        set({ accounts: [...get().accounts, account], lastEmail: key });
        return account;
      },
      inviteFriend: (fromEmail, friendEmail) => {
        const friend = norm(friendEmail);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friend)) {
          return { ok: false, message: "Enter a valid email." };
        }
        const account = get().ensureAccount(fromEmail, "");
        if (friend === account.email) {
          return { ok: false, message: "Invite someone else — this one is yours." };
        }
        if (account.invitedEmails.includes(friend)) {
          return { ok: false, message: "You already sent that invitation." };
        }
        const url = shareUrl(account.code, account.email);
        const subject = `${account.firstName} thought you’d love Sol Beautiful`;
        const body = [
          `I shop at Sol Beautiful — a family vault of fragrance, makeup, and skincare.`,
          ``,
          `Use my link. If you place an order over $50, I receive a thank-you toward my next purchase.`,
          ``,
          url,
        ].join("\n");
        set({
          accounts: get().accounts.map((a) =>
            a.email === account.email ? { ...a, invitedEmails: [...a.invitedEmails, friend] } : a,
          ),
          mailbox: [
            {
              id: uniqueId("mail"),
              to: friend,
              subject,
              body,
              sentAt: new Date().toISOString(),
            },
            ...get().mailbox,
          ],
        });
        if (typeof window !== "undefined") {
          window.location.href = `mailto:${encodeURIComponent(friend)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
        return { ok: true, message: "Invitation opened in your mail." };
      },
      onOrderPlaced: (order) => {
        get().ensureAccount(order.email, order.address.firstName);
        const key = norm(order.email);
        const used = order.discountCode?.trim().toUpperCase();
        if (used) {
          set({
            rewards: get().rewards.map((r) =>
              r.code === used && r.email === key && !r.used ? { ...r, used: true } : r,
            ),
          });
        }

        const ref = (order.referredBy || get().pendingRef).trim().toUpperCase();
        if (!ref) return { credited: false };
        if (get().pendingVia) get().ensureAccount(get().pendingVia, "Friend");
        const referrer = get().accounts.find((a) => a.code === ref);
        if (!referrer || referrer.email === key) {
          set({ pendingRef: "", pendingVia: "" });
          return { credited: false };
        }
        if (order.subtotal <= REFERRAL.minPurchase) return { credited: false };
        if (referrer.qualifiedEmails.includes(key)) {
          set({ pendingRef: "", pendingVia: "" });
          return { credited: false };
        }

        const qualified = [...referrer.qualifiedEmails, key];
        const now = new Date().toISOString();
        const nextRewards = [...get().rewards];
        const nextMail = [...get().mailbox];
        let percent: 10 | 20 | undefined;

        if (qualified.length === 1) {
          percent = REFERRAL.firstPercent;
          const code = rewardCode(10);
          nextRewards.push({
            code,
            percent: 10,
            email: referrer.email,
            earnedAt: now,
            used: false,
            reason: "first-friend",
          });
          nextMail.unshift({
            id: uniqueId("mail"),
            to: referrer.email,
            subject: "Your Sol Beautiful 10% thank-you",
            body: `${referrer.firstName}, a friend just completed an order over $50. Use ${code} on your next purchase for 10% off.`,
            sentAt: now,
            code,
          });
        }
        if (qualified.length === REFERRAL.fiveCount) {
          percent = REFERRAL.fivePercent;
          const code = rewardCode(20);
          nextRewards.push({
            code,
            percent: 20,
            email: referrer.email,
            earnedAt: now,
            used: false,
            reason: "five-friends",
          });
          nextMail.unshift({
            id: uniqueId("mail"),
            to: referrer.email,
            subject: "Your Sol Beautiful 20% thank-you",
            body: `${referrer.firstName}, five friends have each placed an order over $50. Use ${code} on your next order for 20% off.`,
            sentAt: now,
            code,
          });
        }

        set({
          pendingRef: "",
          pendingVia: "",
          accounts: get().accounts.map((a) =>
            a.email === referrer.email ? { ...a, qualifiedEmails: qualified } : a,
          ),
          rewards: nextRewards,
          mailbox: nextMail,
        });
        return { credited: true, percent };
      },
    }),
    {
      name: "sol-beautiful-referrals-v1",
      partialize: (s) => ({
        pendingRef: s.pendingRef,
        pendingVia: s.pendingVia,
        lastEmail: s.lastEmail,
        accounts: s.accounts,
        rewards: s.rewards,
        mailbox: s.mailbox,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

export function lookupPromo(code: string) {
  const key = code.trim().toUpperCase();
  const reward = useReferralStore.getState().rewards.find((r) => r.code === key && !r.used);
  if (reward) {
    return { label: `${reward.percent}% off your next order`, type: "percent" as const, value: reward.percent };
  }
  return undefined;
}

export function unusedRewardsFor(email: string) {
  const key = norm(email);
  return useReferralStore.getState().rewards.filter((r) => r.email === key && !r.used);
}
