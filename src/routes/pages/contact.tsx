import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProsePage } from "@/components/layout/prose-page";
import { STORE } from "@/lib/store-config";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pages/contact")({ component: Page });

function Page() {
  return (
    <ProsePage kicker="Inbox" title="Contact">
      <p>
        {STORE.email}
        {STORE.origin ? ` · ${STORE.origin}` : ""}
      </p>
      <p>
        Include an order number if you have one — that is the fastest way to pull the {STORE.shippingTool} invoice.
        We read this inbox during California business hours.
      </p>
      <form
        className="mt-6 space-y-4 text-foreground"
        onSubmit={(e) => {
          e.preventDefault();
          toast("Message saved — in production this emails the shop.");
          e.currentTarget.reset();
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="order">Order number</Label>
          <Input id="order" name="order" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="msg">Message</Label>
          <Textarea id="msg" name="msg" required />
        </div>
        <Button type="submit">Send</Button>
      </form>
    </ProsePage>
  );
}
