
"use client";

import { useState, useCallback } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { MotorcycleFilters } from "@/components/motorcycles/motorcycle-filters";
import { MotorcycleList } from "@/components/motorcycles/motorcycle-list";
import type { Motorcycle, MotorcycleStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Upload, Download, Plus } from 'lucide-react';
import { MotorcycleIcon } from '@/components/icons/motorcycle-icon';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddMotorcycleForm } from "@/components/motorcycles/add-motorcycle-form";
import { useToast } from "@/hooks/use-toast";

export type MotorcyclePageFilters = {
  status: MotorcycleStatus | 'all';
  model: string | 'all';
  searchTerm: string;
};

const initialMockMotorcycles: Motorcycle[] = [
  { id: '1', placa: 'MOTO001', model: 'XTZ 150 Crosser', status: 'active', type: 'nova', franqueado: 'Salvador Centro', data_ultima_mov: '2024-07-20', tempo_ocioso_dias: 2, qrCodeUrl: 'LETICIA', valorDiaria: 75.00 },
  { id: '2', placa: 'MOTO002', model: 'CG 160 Titan', status: 'inadimplente', type: 'usada', franqueado: 'Salvador Norte', data_ultima_mov: '2024-07-10', tempo_ocioso_dias: 12, qrCodeUrl: 'https://placehold.co/50x50.png', valorDiaria: 60.50 },
  { id: '3', placa: 'MOTO003', model: 'NMAX 160', status: 'manutencao', type: 'nova', franqueado: 'Salvador Centro', data_ultima_mov: '2024-07-15', tempo_ocioso_dias: 7, qrCodeUrl: 'https://placehold.co/50x50.png', valorDiaria: 80.00 },
  { id: '4', placa: 'MOTO004', model: 'PCX 150', status: 'recolhida', type: 'usada', franqueado: 'Lauro de Freitas', data_ultima_mov: '2024-06-25', tempo_ocioso_dias: 27, qrCodeUrl: 'https://placehold.co/50x50.png', valorDiaria: 70.00 },
  { id: '5', placa: 'MOTO005', model: 'Factor 150', status: 'active', type: 'nova', franqueado: 'Salvador Norte', data_ultima_mov: '2024-07-22', tempo_ocioso_dias: 0, qrCodeUrl: 'https://placehold.co/50x50.png', valorDiaria: 65.00 },
  { id: '6', placa: 'MOTO006', model: 'Biz 125', status: 'relocada', type: 'usada', franqueado: 'Salvador Centro', data_ultima_mov: '2024-07-18', tempo_ocioso_dias: 4, qrCodeUrl: 'https://placehold.co/50x50.png', valorDiaria: 55.00 },
];


export default function MotorcyclesPage() {
  const [filters, setFilters] = useState<MotorcyclePageFilters>({
    status: 'all',
    model: 'all',
    searchTerm: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>(initialMockMotorcycles);
  const { toast } = useToast();

  const handleFilterChange = useCallback((newFilters: MotorcyclePageFilters) => {
    setFilters(newFilters);
  }, []);

  const handleAddMotorcycle = (newMotorcycle: Motorcycle) => {
    setMotorcycles(prevMotorcycles => [newMotorcycle, ...prevMotorcycles]);
    setIsModalOpen(false);
    toast({
      title: "Moto Adicionada!",
      description: `A moto ${newMotorcycle.placa} foi adicionada com sucesso.`,
    });
  };

  const handleUpdateMotorcycleStatus = useCallback((motorcycleId: string, newStatus: MotorcycleStatus) => {
    setMotorcycles(prevMotorcycles =>
      prevMotorcycles.map(moto =>
        moto.id === motorcycleId ? { ...moto, status: newStatus } : moto
      )
    );
    toast({
      title: "Status Atualizado!",
      description: `O status da moto foi atualizado para ${newStatus}.`,
    });
  }, [toast]);

  const handleDeleteMotorcycle = useCallback((motorcycleId: string) => {
    setMotorcycles(prevMotorcycles =>
      prevMotorcycles.filter(moto => moto.id !== motorcycleId)
    );
    toast({
      variant: "destructive",
      title: "Moto Excluída!",
      description: `A moto foi excluída com sucesso.`,
    });
  }, [toast]);


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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Moto
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <AddMotorcycleForm 
            onSubmit={handleAddMotorcycle} 
            onCancel={() => setIsModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
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
      <MotorcycleList 
        filters={filters} 
        motorcycles={motorcycles} 
        onUpdateStatus={handleUpdateMotorcycleStatus}
        onDeleteMotorcycle={handleDeleteMotorcycle}
      />
    </DashboardLayout>
  );
}
