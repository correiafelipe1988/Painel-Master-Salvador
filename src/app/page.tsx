import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { RecoveryVolumeChart } from "@/components/charts/recovery-volume-chart";
import { RentalVolumeChart } from "@/components/charts/rental-volume-chart";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Visão Geral do Painel" description="Métricas chave e indicadores de desempenho para MotoSight." />
      <KpiSection />
      <Separator className="my-8" />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <RecoveryVolumeChart />
        <RentalVolumeChart />
      </div>
    </DashboardLayout>
  );
}
