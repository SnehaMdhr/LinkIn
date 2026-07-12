import { Card, CardContent } from "../ui/card";

const stats = [
  { value: "10K+", label: "Users" },
  { value: "50K+", label: "Links" },
  { value: "1M+", label: "Profile Views" },
  { value: "200K+", label: "QR Scans" },
];

function Stats() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6 text-center">
                <p className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
