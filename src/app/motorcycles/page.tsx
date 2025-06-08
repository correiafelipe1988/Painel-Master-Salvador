"use client";

import { useState } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { MotorcycleFilters } from "@/components/motorcycles/motorcycle-filters";
import { MotorcycleList } from "@/components/motorcycles/motorcycle-list";
import type { MotorcycleStatus } from '@/lib/types';

export default function MotorcyclesPage() {
  const [filters, setFilters] = useState<{ status: MotorcycleStatus | 'all'; idleTime: number }>({
    status: 'all',
    idleTime: 0,
  });

  const handleFilterChange = (newFilters: { status: MotorcycleStatus | 'all'; idleTime: number }) => {
    setFilters(newFilters);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Gerenciamento de Motocicletas" description="Visualize, filtre e gerencie sua frota de motocicletas." />
      <MotorcycleFilters onFilterChange={handleFilterChange} initialFilters={filters} />
      <MotorcycleList filters={filters} />
    </DashboardLayout>
  );
}
