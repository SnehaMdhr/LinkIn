const logos = [
  { name: "GitHub", width: "w-20" },
  { name: "Vercel", width: "w-16" },
  { name: "Stripe", width: "w-16" },
  { name: "Notion", width: "w-20" },
  { name: "Figma", width: "w-14" },
  { name: "Slack", width: "w-16" },
];

function TrustedBy() {
  return (
    <section className="py-12 sm:py-16 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-sm text-muted-foreground mb-8">
          Trusted by professionals worldwide
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-40">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className={`${logo.width} h-8 flex items-center justify-center`}
            >
              <span className="text-lg font-bold text-muted-foreground tracking-tight">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustedBy;
