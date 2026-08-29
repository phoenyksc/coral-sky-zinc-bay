import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getSecurityState, type SecurityState } from "@/lib/security-server";
import { TwoFactorSettings } from "@/components/auth/two-factor-settings";

export const Route = createFileRoute("/admin/security")({ component: AdminSecurityPage });

function AdminSecurityPage() {
  const [state, setState] = useState<SecurityState | null>(null);

  useEffect(() => {
    void getSecurityState().then(setState);
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">The vault</p>
      <h1 className="mt-1 font-display text-4xl">Security</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Two-factor for this administrator login. Text message works for customers and vault staff. Google Authenticator
        is admin-only. Messaging rates may apply.
      </p>
      {state ? <div className="mt-8"><TwoFactorSettings variant="admin" state={state} onChange={setState} /></div> : null}
    </main>
  );
}
