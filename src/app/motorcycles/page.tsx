
"use client";

import { useState, useCallback } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { MotorcycleFilters } from "@/components/motorcycles/motorcycle-filters";
import { MotorcycleList } from "@/components/motorcycles/motorcycle-list";
import type { MotorcycleStatus } from '@/lib/types';
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

  const handleFilterChange = useCallback((newFilters: MotorcyclePageFilters) => {
    setFilters(newFilters);
  }, []); // setFilters de useState é estável, então o array de dependências vazio está ok.

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
      <Button> {/* Usará a cor primária do tema por padrão */}
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
