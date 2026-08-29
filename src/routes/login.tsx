import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";
import { accountFlags, setAccountFlags } from "@/lib/account-flags";
import { useCartStore } from "@/lib/cart-store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = typeof search.redirect === "string" ? search.redirect : undefined;
    return redirect ? { redirect } : {};
  },
  component: LoginPage,
});

function safePath(redirect?: string) {
  if (!redirect) return null;
  if (!redirect.startsWith("/") || redirect.startsWith("//") || redirect.startsWith("/login")) return null;
  return redirect;
}

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const lines = useCartStore((s) => s.lines);
  const applyCode = useCartStore((s) => s.applyCode);
  const dest = safePath(redirect) ?? (lines.length > 0 ? "/checkout" : "/account");
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"create" | "signin">("create");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    void navigate({ href: dest });
  }, [user?.id, isPending, dest, navigate]);

  async function finish(isNew: boolean) {
    setAccountFlags({ signedIn: true, firstPurchaseUsed: isNew ? false : accountFlags.firstPurchaseUsed });
    try {
      await authClient.getSession();
    } catch {
      /* session store will recover */
    }
    const res = applyCode("FIRST10");
    if (res.ok && isNew) toast.success("10% off your first purchase is waiting at checkout.");
    await navigate({ href: dest });
  }

  async function onCreate(e?: { preventDefault(): void }) {
    e?.preventDefault();
    if (!emailAndPasswordEnabled) return;
    setBusy(true);
    const { error } = await authClient.signUp.email({
      name: name.trim() || email.split("@")[0],
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message ?? "Could not create the account.");
      return;
    }
    toast.success("Welcome to the vault.");
    await finish(true);
  }

  async function onSignIn(e?: { preventDefault(): void }) {
    e?.preventDefault();
    if (!emailAndPasswordEnabled) return;
    setBusy(true);
    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message ?? "Could not sign in.");
      return;
    }
    await finish(false);
  }

  return (
    <main className="mx-auto grid max-w-xl px-4 py-16 sm:px-6">
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">The vault</p>
      <h1 className="mt-2 font-display text-5xl">{mode === "create" ? "Create an account" : "Welcome back"}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Open an account and take 10% off your first purchase. Save a card and an address after checkout, refer
        friends from one place, manage a return, and watch a parcel leave the USA.
      </p>

      <div className="mt-8 flex gap-2">
        <Button type="button" variant={mode === "create" ? "default" : "outline"} onClick={() => setMode("create")}>
          Create account
        </Button>
        <Button type="button" variant={mode === "signin" ? "default" : "outline"} onClick={() => setMode("signin")}>
          Sign in
        </Button>
      </div>

      {authEnabled && emailAndPasswordEnabled ? (
        <form
          method="post"
          action="/login"
          onSubmit={mode === "create" ? onCreate : onSignIn}
          className="mt-8 space-y-4"
        >
          {mode === "create" ? (
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          ) : null}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "create" ? "new-password" : "current-password"}
            />
          </div>
          <Button type="button" size="lg" className="w-full" disabled={busy} data-testid="login-submit" onClick={(e) => void (mode === "create" ? onCreate(e) : onSignIn(e))}>
            {busy ? "Please wait…" : mode === "create" ? "Create account · 10% off first purchase" : "Sign in"}
          </Button>
        </form>
      ) : null}

      {authEnabled ? (
        <div className="mt-8 space-y-3">
          <p className="text-center text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Or continue with</p>
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void signIn(p.providerId, { callbackURL: dest, errorCallbackURL: "/login" })}
            >
              Continue with {p.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">Sign-in is disabled.</p>
      )}
    </main>
  );
}
