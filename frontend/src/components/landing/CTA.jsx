import { Button } from "../ui/button";

function CTA({ onRegisterOpen }) {
  return (
    <section id="contact" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl bg-card border border-border shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="relative px-6 py-16 sm:px-16 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              Create your digital identity today
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of professionals who use LinkIn to share their online
              presence with a single, beautiful link.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={onRegisterOpen}>
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;
