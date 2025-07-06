"use client"

import { CombinedIdleChart } from "@/components/charts/combined-idle-chart"
import { CriticalPercentageChart } from "@/components/charts/critical-percentage-chart"

interface IdleTimeData {
  franqueado: string
  totalMotorcycles: number
  averageIdleDays: number
  motorcyclesAbove7Days: number
  percentualCriticas: number
}

interface IdleChartsViewProps {
  data: IdleTimeData[]
}

export function IdleChartsView({ data }: IdleChartsViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1">
        <CombinedIdleChart data={data} />
      </div>
      <div className="grid gap-6 md:grid-cols-1">
        <CriticalPercentageChart data={data} />
      </div>
    </div>
  )
}