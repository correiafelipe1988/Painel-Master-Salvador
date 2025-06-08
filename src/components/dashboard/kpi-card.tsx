import { Card, CardContent } from "@/components/ui/card";
import type { Kpi } from "@/lib/types";
import { cn } from "@/lib/utils";

export function KpiCard({ title, value, icon: Icon, description, color, iconBgColor, iconColor }: Kpi) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={cn("text-2xl font-bold", color ? color : "text-foreground")}>{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-lg", iconBgColor ? iconBgColor : "bg-muted")}>
            <Icon className={cn("h-6 w-6", iconColor ? iconColor : "text-muted-foreground")} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
