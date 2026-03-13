import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export function Competition() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Competition</h1>
        <p className="text-muted-foreground">Leaderboard & trading competitions</p>
      </div>
      <Card className="border-border">
        <CardContent className="flex flex-col items-center py-16 space-y-3">
          <Trophy className="h-12 w-12 text-muted-foreground" />
          <h3 className="font-display font-bold text-lg">Coming Soon</h3>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            Trading competitions and leaderboards are being prepared. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
