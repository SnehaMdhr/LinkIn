import { Card, CardContent } from "./ui/card";

function StatisticsCard({ linkCount }) {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-primary">{linkCount}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {linkCount === 1 ? "Link" : "Links"} Added
        </p>
      </CardContent>
    </Card>
  );
}

export default StatisticsCard;