
"use client";

import { FranchiseeRankList } from './franchisee-rank-list';
import { FranchiseeKpiCard } from './franchisee-kpi-card';

export function AnaliseFranqueadoView() {
  return (
    <div className="p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <FranchiseeRankList />
        </div>
        <div className="lg:col-span-3">
            <FranchiseeKpiCard />
        </div>
      </div>
    </div>
  );
}
