import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import {
  Link2,
  QrCode,
  BarChart3,
  Palette,
  LayoutDashboard,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "One Link",
    description: "Consolidate all your important links into a single, shareable profile URL.",
  },
  {
    icon: QrCode,
    title: "QR Code",
    description: "Generate a custom QR code for your profile to share offline and in print.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track views, clicks, and engagement with built-in analytics dashboards.",
  },
  {
    icon: Palette,
    title: "Beautiful Profiles",
    description: "Customize your profile with themes, colors, and layouts that match your brand.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin Dashboard",
    description: "Manage your links, profile, and settings from an intuitive dashboard.",
  },
  {
    icon: Shield,
    title: "Secure Authentication",
    description: "Your account is protected with secure authentication and data encryption.",
  },
];

function Features() {
  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features to help you share your online presence with the world.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
