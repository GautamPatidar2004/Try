import { SquircleIcon } from "./primitives";

const steps = [
  {
    n: "01",
    title: "Properties post opportunities",
    desc: "Hosts and brands list stays, campaigns and product collabs with clear deliverables.",
  },
  {
    n: "02",
    title: "Creators apply in seconds",
    desc: "Browse a curated feed, pitch with your portfolio, and get matched fast.",
  },
  {
    n: "03",
    title: "Match, book and create",
    desc: "Sign the collab agreement, stay or receive product, deliver content everyone owns.",
  },
];

export const EditorialHowItWorks = () => {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-4 block">
            How it works
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight leading-[1.1]">
            Three steps from{" "}
            <em className="text-brand-green not-italic italic">discovery to stay</em>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-3xl border border-border bg-card p-7 hover:border-brand-green/40 transition-colors"
            >
              <SquircleIcon size="lg" className="mb-6 font-serif">
                {s.n}
              </SquircleIcon>
              <h3 className="font-serif text-2xl text-foreground mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
