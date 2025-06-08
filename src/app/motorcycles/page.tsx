
"use client";

import { useState } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { MotorcycleFilters } from "@/components/motorcycles/motorcycle-filters";
import { MotorcycleList } from "@/components/motorcycles/motorcycle-list";
import type { MotorcycleStatus, MotorcycleType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Upload, Download, Plus } from 'lucide-react';
import { MotorcycleIcon } from '@/components/icons/motorcycle-icon';

export type MotorcyclePageFilters = {
  status: MotorcycleStatus | 'all';
  model: string | 'all';
  searchTerm: string;
};

export default function MotorcyclesPage() {
  const [filters, setFilters] = useState<MotorcyclePageFilters>({
    status: 'all',
    model: 'all',
    searchTerm: '',
  });

  const handleFilterChange = (newFilters: MotorcyclePageFilters) => {
    setFilters(newFilters);
  };

  const pageActions = (
    <>
      <Button variant="outline">
        <Upload className="mr-2 h-4 w-4" />
        Importar CSV
      </Button>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Exportar CSV
      </Button>
      <Button className="bg-green-600 hover:bg-green-700 text-white">
        <Plus className="mr-2 h-4 w-4" />
        Nova Moto
      </Button>
    </>
  );

  return (
    <DashboardLayout>
      <PageHeader 
        title="Gestão de Motos" 
        description="Controle completo da frota"
        icon={MotorcycleIcon}
        iconContainerClassName="bg-primary"
        actions={pageActions}
      />
      <MotorcycleFilters onFilterChange={handleFilterChange} initialFilters={filters} />
      <MotorcycleList filters={filters} />
    </DashboardLayout>
  );
}
