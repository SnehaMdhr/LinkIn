import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  QrCode,
  BarChart3,
  Globe,
  Share2,
} from "lucide-react";

function Hero({ onRegisterOpen }) {
  return (
    <section id="home" className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
              One Link.
              <br />
              <span className="text-primary">Every Platform.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Create one beautiful profile that contains all of your important
              online links. Share it anywhere.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={onRegisterOpen}>
                Get Started
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl" />
            <Card className="relative border-border/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Sarah Chen</p>
                    <p className="text-xs text-muted-foreground">@sarahchen</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {["GitHub", "Portfolio", "LinkedIn", "Blog"].map((link) => (
                    <div
                      key={link}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{link}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <QrCode className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">QR Code</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Analytics</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Share2 className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Share</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
