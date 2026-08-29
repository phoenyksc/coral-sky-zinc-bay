import { createFileRoute, Link } from "@tanstack/react-router";
import { StoryCollage } from "@/components/layout/story-collage";
import { STORE } from "@/lib/store-config";

export const Route = createFileRoute("/pages/about")({ component: AboutPage });

function AboutPage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6">
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Our story</p>
        <h1 className="mt-2 max-w-3xl font-display text-5xl md:text-6xl">
          A family vault. Forty years of beauty.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          From first color to a signature scent worn for decades — we have always believed beauty belongs to every age.
        </p>
        <StoryCollage className="mt-10 aspect-4/5 sm:aspect-16/10" />
      </section>

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {STORE.name} is a family-run vault, and has been for more than forty years. It began the way the best
          shops do: looking after the people we loved, then looking after the people who found us. We are still
          that vault — a family at the table, a long memory for what is good, and a simple promise that you will
          be spoken to like a person.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Beauty is not a season. We have watched daughters borrow a lipstick and mothers return for the cream
          that still feels like themselves. From a first blush to a fragrance someone has worn for half a life,
          we curate with that whole span in mind — designer color, honest skincare, and rare fragrances that are
          getting harder to find.
        </p>
        <h2 className="mt-12 font-display text-3xl text-foreground">A customer, not a ticket</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We are customer-first because we are still small enough to be. A question gets a real answer. A rare
          bottle is described as it is. If something is not right, you will hear from us — clearly, promptly, and
          without a script. Service, to us, is the conversation around the piece: careful communication before it
          leaves, and care after it arrives.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          High-touch is not a department. It is how a family stays in business for forty years — by remembering
          names, by telling the truth about a shade, and by making the next order easier than the last.
        </p>
        <h2 className="mt-12 font-display text-3xl text-foreground">What we put on the shelf</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Premier curation is not a slogan. It is forty years of taste. We look for quality, authenticity, and
          the kind of formula that earns a place on a vanity. That is why a discontinued fragrance is still here,
          and why a new-in-box foundation is the shade we said it was. Designer makeup, considered skincare, and
          rare scent — chosen with affection, never in a hurry.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We ship from the USA.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 rounded-2xl bg-card px-6 py-10 sm:grid-cols-3 sm:px-10">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Service</p>
            <p className="mt-2 font-display text-2xl">Spoken to like a person</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Real answers, no script. If it is not right, we make it right.
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Communication</p>
            <p className="mt-2 font-display text-2xl">Clear before it leaves</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              What you see is what we send. Questions are welcome, and they are answered.
            </p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Curation</p>
            <p className="mt-2 font-display text-2xl">Quality, and the rare</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Authentic designer beauty and hard-to-find fragrance, chosen with a collector’s eye.
            </p>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Read the vault policies:{" "}
          <Link to="/pages/authenticity" className="text-foreground underline">
            authenticity
          </Link>
          ,{" "}
          <Link to="/pages/shipping" className="text-foreground underline">
            shipping
          </Link>
          ,{" "}
          <Link to="/pages/payment" className="text-foreground underline">
            payment
          </Link>
          , and{" "}
          <Link to="/pages/returns" className="text-foreground underline">
            returns
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
