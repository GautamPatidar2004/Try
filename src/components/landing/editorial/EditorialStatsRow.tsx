const stats = [
  { value: "700+", label: "Creators matched" },
  { value: "$250K", label: "Collab value distributed" },
  { value: "20+", label: "Properties listed" },
  { value: "144", label: "Countries" },
];

export const EditorialStatsRow = () => {
  return (
    <section className="bg-muted/40 py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="font-serif text-5xl md:text-6xl text-foreground mb-2 tracking-tight">
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
