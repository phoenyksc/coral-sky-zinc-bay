import { useState } from "react";
import { toast } from "sonner";
import { sendSmsCode, verifyTwoFactor, type SecurityState } from "@/lib/security-server";
import { markTwoFactorUnlocked } from "@/lib/security-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TwoFactorChallenge({
  state,
  onVerified,
}: {
  state: SecurityState;
  onVerified: () => void;
}) {
  const [channel, setChannel] = useState<"sms" | "totp">(state.channels.includes("totp") ? "totp" : "sms");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function sendText() {
    setBusy(true);
    try {
      const res = await sendSmsCode({ data: {} });
      setDemoCode(res.demoCode);
      setSent(true);
      toast("A verification text is on the way.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the text.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    try {
      const res = await verifyTwoFactor({ data: { channel, code } });
      markTwoFactorUnlocked(res.userId);
      onVerified();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That code did not match.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Two-factor</p>
      <h1 className="mt-2 font-display text-4xl">Confirm it’s you</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        This account uses two-factor authentication. Text message rates may apply.
      </p>

      {state.channels.length > 1 ? (
        <div className="mt-6 flex gap-2">
          {state.channels.includes("totp") ? (
            <Button type="button" variant={channel === "totp" ? "default" : "outline"} onClick={() => setChannel("totp")}>
              Google Authenticator
            </Button>
          ) : null}
          {state.channels.includes("sms") ? (
            <Button type="button" variant={channel === "sms" ? "default" : "outline"} onClick={() => setChannel("sms")}>
              Text message
            </Button>
          ) : null}
        </div>
      ) : null}

      {channel === "sms" ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            We’ll text a 6-digit code to {state.phoneMasked ?? "your mobile"}. Messaging rates may apply.
          </p>
          <Button type="button" variant="outline" disabled={busy} onClick={() => void sendText()}>
            {sent ? "Resend text" : "Send text"}
          </Button>
          {demoCode ? (
            <p className="rounded-md bg-card px-3 py-2 text-sm">
              Message preview (carrier not connected yet): <span className="font-medium tabular-nums">{demoCode}</span>
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">Open Google Authenticator and enter the 6-digit code for Sol Beautiful.</p>
      )}

      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Label htmlFor="otp">6-digit code</Label>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
          {busy ? "Checking…" : "Verify"}
        </Button>
      </form>
    </div>
  );
}
