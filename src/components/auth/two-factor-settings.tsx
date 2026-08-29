import { useState } from "react";
import { toast } from "sonner";
import {
  beginTotpSetup,
  confirmTotp,
  disableSms,
  disableTotp,
  enableSms,
  sendSmsCode,
  type SecurityState,
} from "@/lib/security-server";
import { markTwoFactorUnlocked } from "@/lib/security-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TwoFactorSettings({
  state,
  onChange,
  variant,
}: {
  state: SecurityState;
  onChange: (next: SecurityState) => void;
  variant: "customer" | "admin";
}) {
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [totp, setTotp] = useState<{ secret: string; qrUrl: string; otpauth: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    try {
      const res = await sendSmsCode({ data: { phone: phone || undefined } });
      setDemoCode(res.demoCode);
      toast("A verification text is on the way. Messaging rates may apply.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the text.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display text-2xl">Text message</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          After you sign in, we’ll text a 6-digit code. Messaging rates may apply.
        </p>
        {state.smsEnabled ? (
          <p className="mt-3 text-sm">On for {state.phoneMasked}.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1">
              <Label htmlFor="phone">Mobile number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 010-0100" />
            </div>
            <Button type="button" className="self-end" variant="outline" disabled={busy} onClick={() => void send()}>
              Send code
            </Button>
          </div>
        )}
        {demoCode ? (
          <p className="mt-3 rounded-md bg-background px-3 py-2 text-sm">
            Message preview: <span className="font-medium tabular-nums">{demoCode}</span>
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="sms-code">6-digit code</Label>
            <Input
              id="sms-code"
              inputMode="numeric"
              maxLength={6}
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </div>
          {state.smsEnabled ? (
            <Button
              type="button"
              variant="outline"
              disabled={busy || smsCode.length !== 6}
              onClick={() => {
                setBusy(true);
                void disableSms({ data: { code: smsCode } })
                  .then((next) => {
                    onChange(next);
                    setSmsCode("");
                    toast("Text message verification is off.");
                  })
                  .catch((err: Error) => toast.error(err.message))
                  .finally(() => setBusy(false));
              }}
            >
              Turn off
            </Button>
          ) : (
            <Button
              type="button"
              disabled={busy || smsCode.length !== 6}
              onClick={() => {
                setBusy(true);
                void enableSms({ data: { code: smsCode } })
                  .then((next) => {
                    onChange(next);
                    markTwoFactorUnlocked(next.userId);
                    setSmsCode("");
                    toast("Text message verification is on.");
                  })
                  .catch((err: Error) => toast.error(err.message))
                  .finally(() => setBusy(false));
              }}
            >
              Turn on
            </Button>
          )}
        </div>
      </section>

      {variant === "admin" ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-2xl">Google Authenticator</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Administrators can pair a third-party authenticator app. This option is not shown to customers.
          </p>
          {state.totpEnabled && !totp ? (
            <p className="mt-3 text-sm">Authenticator is on for this vault login.</p>
          ) : null}
          {totp ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
              <img src={totp.qrUrl} alt="Authenticator QR code" width={200} height={200} className="rounded-md bg-white p-2" />
              <div>
                <p className="text-sm text-muted-foreground">Scan with Google Authenticator, or enter this key:</p>
                <p className="mt-2 font-mono text-sm tracking-widest break-all">{totp.secret}</p>
                <a href={totp.otpauth} className="mt-2 inline-block text-sm underline">
                  Open in authenticator
                </a>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              className="mt-4"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void beginTotpSetup()
                  .then(setTotp)
                  .catch((err: Error) => toast.error(err.message))
                  .finally(() => setBusy(false));
              }}
            >
              {state.totpEnabled ? "Re-pair authenticator" : "Pair Google Authenticator"}
            </Button>
          )}
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="totp-code">Authenticator code</Label>
              <Input
                id="totp-code"
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            {totp || !state.totpEnabled ? (
              <Button
                type="button"
                disabled={busy || totpCode.length !== 6}
                onClick={() => {
                  setBusy(true);
                  void confirmTotp({ data: { code: totpCode } })
                    .then((next) => {
                      onChange(next);
                      markTwoFactorUnlocked(next.userId);
                      setTotp(null);
                      setTotpCode("");
                      toast("Google Authenticator is on.");
                    })
                    .catch((err: Error) => toast.error(err.message))
                    .finally(() => setBusy(false));
                }}
              >
                Confirm
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={busy || totpCode.length !== 6}
                onClick={() => {
                  setBusy(true);
                  void disableTotp({ data: { code: totpCode } })
                    .then((next) => {
                      onChange(next);
                      setTotpCode("");
                      toast("Authenticator is off.");
                    })
                    .catch((err: Error) => toast.error(err.message))
                    .finally(() => setBusy(false));
                }}
              >
                Turn off
              </Button>
            )}
          </div>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">Google Authenticator is reserved for vault administrators.</p>
      )}
    </div>
  );
}
