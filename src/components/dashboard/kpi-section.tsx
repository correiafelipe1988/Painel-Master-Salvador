import type { Kpi } from "@/lib/types";
import { KpiCard } from "./kpi-card";
import { TrendingUp, Bike, Users, Wrench, Clock, CheckCircle } from "lucide-react";

const kpiData: Kpi[] = [
  {
    title: "Avg Delinquency % (Month)",
    value: "12.5%",
    icon: TrendingUp,
    description: "+2.1% from last month",
    color: "text-destructive",
  },
  {
    title: "Recovered Today",
    value: "15",
    icon: Bike,
    description: "Updated moments ago",
    color: "text-primary",
  },
  {
    title: "Avg. Relocation Time",
    value: "3.2 Days",
    icon: Clock,
    description: "Based on last 50 relocations",
  },
  {
    title: "Idle >7 Days",
    value: "8",
    icon: Users, // Using Users as a placeholder, could be a more specific icon
    description: "Needs attention",
    color: "text-accent",
  },
  {
    title: "Available for Rent",
    value: "42",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "In Maintenance",
    value: "5",
    icon: Wrench,
  },
];

export function KpiSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-6">
      {kpiData.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
