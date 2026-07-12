import { Card, CardContent } from "../ui/card";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Freelance Designer",
    content:
      "LinkIn replaced all my old link tools. My clients love how clean and professional my profile looks.",
  },
  {
    name: "Maya Patel",
    role: "Software Engineer",
    content:
      "I finally have one link I can put everywhere. The analytics alone make it worth it.",
  },
  {
    name: "Jordan Kim",
    role: "Content Creator",
    content:
      "Setting up my profile took less than 5 minutes. The QR code feature is a game changer for my merch.",
  },
];

function Testimonials() {
  return (
    <section id="about" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Loved by professionals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about LinkIn.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
