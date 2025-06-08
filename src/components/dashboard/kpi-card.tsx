
import { Card, CardContent } from "@/components/ui/card";
import type { Kpi } from "@/lib/types";
import { cn } from "@/lib/utils";

export function KpiCard({ title, value, icon: Icon, description, color, iconBgColor, iconColor, titleClassName, valueClassName, descriptionClassName }: Kpi) {
  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300", iconBgColor ? iconBgColor.replace('bg-', 'border-') : 'border-transparent', 'border-l-4')}>
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className={cn("text-sm text-muted-foreground font-medium", titleClassName, color ? color.replace('text-','text-muted-') : 'text-muted-foreground')}>{title}</p>
          <p className={cn("text-2xl font-bold", valueClassName, color ? color : "text-foreground")}>{value}</p>
          {description && (
            <p className={cn("text-xs text-muted-foreground", descriptionClassName)}>{description}</p>
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
