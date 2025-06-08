import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Kpi } from "@/lib/types";
import { cn } from "@/lib/utils";

export function KpiCard({ title, value, icon: Icon, description, color }: Kpi) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className={cn("h-5 w-5", color ? color : "text-muted-foreground")} />}
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", color ? color : "text-foreground")}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
