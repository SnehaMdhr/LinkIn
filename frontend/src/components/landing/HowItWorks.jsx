import { UserPlus, Link2, Share2 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "Step 1",
    title: "Create Account",
    description: "Sign up for free in seconds. No credit card required.",
  },
  {
    icon: Link2,
    step: "Step 2",
    title: "Add Links",
    description: "Add your social profiles, portfolio, and important links.",
  },
  {
    icon: Share2,
    step: "Step 3",
    title: "Share Profile",
    description: "Share your single link everywhere. It's that simple.",
  },
];

function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 relative">
          <div className="hidden sm:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-border" />

          {steps.map((step) => (
            <div key={step.title} className="relative text-center">
              <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto mb-4 relative z-10">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <p className="text-xs font-semibold text-primary mb-1">{step.step}</p>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
