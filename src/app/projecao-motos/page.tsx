"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MotorcycleProjectionChart } from "@/components/charts/motorcycle-projection-chart"
import { PageHeader } from "@/components/shared/page-header"

export default function ProjecaoMotosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Projeção de Crescimento da Base"
          description="Análise e projeção para atingir 1.000 motos até dezembro de 2025"
        />
        
        <MotorcycleProjectionChart />
      </div>
    </DashboardLayout>
  )
}