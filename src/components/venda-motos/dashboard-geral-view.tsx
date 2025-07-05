
"use client";

import { CombinedSalesChart } from './charts/combined-sales-chart';

export function DashboardGeralView() {
  return (
    <div className="p-4 space-y-4">
      {/* O único componente agora será o gráfico combinado */}
      <CombinedSalesChart />
    </div>
  );
}
