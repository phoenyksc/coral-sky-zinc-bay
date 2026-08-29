import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Mail } from "lucide-react";
import { REFERRAL, shareUrl, useReferralStore } from "@/lib/referral-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReferAFriend({
  email,
  firstName,
  showIntro = true,
}: {
  email: string;
  firstName: string;
  showIntro?: boolean;
}) {
  const ensureAccount = useReferralStore((s) => s.ensureAccount);
  const inviteFriend = useReferralStore((s) => s.inviteFriend);
  const accounts = useReferralStore((s) => s.accounts);
  const rewards = useReferralStore((s) => s.rewards);
  const [friendEmail, setFriendEmail] = useState("");

  useEffect(() => {
    ensureAccount(email, firstName);
  }, [email, firstName, ensureAccount]);

  const key = email.trim().toLowerCase();
  const account = accounts.find((a) => a.email === key);
  const unused = rewards.filter((r) => r.email === key && !r.used);

  if (!account) return null;

  const url = shareUrl(account.code, account.email);
  const qualified = account.qualifiedEmails.length;
  const remaining = Math.max(0, REFERRAL.fiveCount - qualified);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch {
      toast.error("Could not copy — select the link instead.");
    }
  }

  function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    const res = inviteFriend(email, friendEmail);
    toast[res.ok ? "success" : "error"](res.message);
    if (res.ok) setFriendEmail("");
  }

  return (
    <section className={showIntro ? "mt-12 rounded-2xl bg-card px-6 py-8 sm:px-8" : "mt-10 rounded-2xl bg-card px-6 py-8 sm:px-8"}>
      {showIntro ? (
        <>
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Refer a friend</p>
          <h2 className="mt-2 font-display text-3xl">Share the vault. Keep a thank-you.</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            When a friend completes a purchase over ${REFERRAL.minPurchase}, we email you {REFERRAL.firstPercent}% off
            your next order. Refer {REFERRAL.fiveCount} friends who each spend over ${REFERRAL.minPurchase} — we email
            you {REFERRAL.fivePercent}% off your next order.
          </p>
        </>
      ) : null}

      <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input readOnly value={url} aria-label="Your referral link" />
        <Button type="button" variant="outline" onClick={() => void copyLink()}>
          <Copy className="size-4" />
          Copy link
        </Button>
      </div>

      <form onSubmit={sendInvite} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="space-y-1">
          <Label htmlFor="friend-email" className="sr-only">
            Friend’s email
          </Label>
          <Input
            id="friend-email"
            type="email"
            required
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            placeholder="Friend’s email"
            autoComplete="off"
          />
        </div>
        <Button type="submit">
          <Mail className="size-4" />
          Email invite
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <p>
          <span className="text-foreground tabular-nums">{qualified}</span> of {REFERRAL.fiveCount} qualifying
          friends
        </p>
        {remaining > 0 ? (
          <p>
            {remaining} more for {REFERRAL.fivePercent}% off
          </p>
        ) : (
          <p>Twenty percent thank-you earned</p>
        )}
      </div>

      {unused.length ? (
        <ul className="mt-5 space-y-2 border-t border-border pt-5">
          {unused.map((r) => (
            <li key={r.code} className="text-sm">
              <span className="font-medium tracking-wide text-foreground">{r.code}</span>
              <span className="text-muted-foreground">
                {" "}
                — {r.percent}% off your next order, emailed to {email}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
