import { Card, CardContent } from "../ui/card";
import {
  LayoutDashboard,
  Users,
  Globe,
  QrCode,
} from "lucide-react";

const mockups = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    content: (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-foreground">Welcome back, Sarah</p>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Pro</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-md bg-muted/50">
            <p className="text-[10px] text-muted-foreground">Total Views</p>
            <p className="text-sm font-bold text-foreground">1,234</p>
          </div>
          <div className="p-2 rounded-md bg-muted/50">
            <p className="text-[10px] text-muted-foreground">Total Clicks</p>
            <p className="text-sm font-bold text-foreground">567</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {["GitHub", "Portfolio", "LinkedIn"].map((l) => (
            <div key={l} className="flex items-center justify-between p-1.5 rounded bg-muted/30">
              <span className="text-[10px] text-foreground">{l}</span>
              <span className="text-[10px] text-muted-foreground">23 clicks</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Admin Dashboard",
    icon: Users,
    content: (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground">User Management</p>
        <div className="space-y-1.5">
          {["alice", "bob", "charlie"].map((u) => (
            <div key={u} className="flex items-center gap-2 p-1.5 rounded bg-muted/30">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[8px] font-bold text-primary">{u[0].toUpperCase()}</span>
              </div>
              <span className="text-[10px] text-foreground flex-1">{u}</span>
              <span className="text-[10px] text-muted-foreground">Active</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Public Profile",
    icon: Globe,
    content: (
      <div className="space-y-3">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-1">
            <span className="text-[10px] font-bold text-primary">S</span>
          </div>
          <p className="text-[10px] font-semibold text-foreground">Sarah Chen</p>
          <p className="text-[8px] text-muted-foreground">@sarahchen</p>
        </div>
        <div className="space-y-1">
          {["GitHub", "Portfolio", "LinkedIn"].map((l) => (
            <div key={l} className="p-1.5 rounded bg-muted/30 text-center">
              <span className="text-[10px] text-foreground">{l}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "QR Generator",
    icon: QrCode,
    content: (
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 bg-foreground rounded-lg flex items-center justify-center">
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-[1px] ${
                  [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i)
                    ? "bg-background"
                    : Math.random() > 0.5
                    ? "bg-background"
                    : "bg-foreground"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold text-foreground">Scan me</p>
          <p className="text-[8px] text-muted-foreground">linkin.com/sarahchen</p>
        </div>
      </div>
    ),
  },
];

function DashboardShowcase() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Powerful dashboard
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Manage your profile, track analytics, and generate QR codes — all from one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockups.map((mockup) => (
            <Card key={mockup.label} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                </div>
                <div className="flex-1 flex items-center justify-center gap-1.5">
                  <mockup.icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">{mockup.label}</span>
                </div>
              </div>
              <CardContent className="p-4">
                {mockup.content}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DashboardShowcase;
