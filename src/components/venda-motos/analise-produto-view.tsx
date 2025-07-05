
"use client";

import { SalesByModelTable } from './sales-by-model-table';
import { ProductKpiCard } from './product-kpi-card';

export function AnaliseProdutoView() {
  return (
    <div className="p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <ProductKpiCard />
            <SalesByModelTable />
        </div>
    </div>
  );
}
