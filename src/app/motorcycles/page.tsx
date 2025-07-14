"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { MotorcycleFilters } from "@/components/motorcycles/motorcycle-filters";
import { MotorcycleList } from "@/components/motorcycles/motorcycle-list";
import type { Motorcycle, MotorcycleStatus, MotorcycleType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { MotorcycleIcon } from '@/components/icons/motorcycle-icon';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddMotorcycleForm } from "@/components/motorcycles/add-motorcycle-form";
import { useToast } from "@/hooks/use-toast";
import { parse as dateParseFns, format as dateFormatFns, isValid as dateIsValidFns } from 'date-fns';
import { 
  subscribeToMotorcycles, 
  addMotorcycle, 
  updateMotorcycle, 
  deleteMotorcycle,
  updateMotorcycleStatus as updateStatusInDB,
  deleteAllMotorcycles as deleteAllFromDB,
  updateWeeklyValuesForRentedMotorcycles,
} from '@/lib/firebase/motorcycleService';
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type MotorcyclePageFilters = {
  status: MotorcycleStatus | 'all';
  model: string | 'all';
  searchTerm: string;
};

// Lista de IDs de usuários permitidos para Gestão de Motos
const ALLOWED_USER_IDS = [
  "1dpkLRLH3Sgm5hTkmNJAlfDQgoP2",
  "FOHbVCbMyhadO3tm1rVdknwLVPr1",
  "orbGQ8lbCfb51KuJlD5oSflsLRx1",
  "edsTZ2zG54Ph2ZoNSyFZXoJj74s2",
  "Z0OEHNXsqOMuZ6ZOc9ElNG6mReP2",
  "VL0J7KdhhPUAmcTI0onP2PqZ19T2",
  "9NvNKnLzbJZIrO7p8FlgFJ0IuYL2",
  "HMU3NfIifHZ5oNbyiT3L1QISjVX2",
  "yAi1TQrBVEQVfvIQAZZyP9KB5O12"
];

export default function MotorcyclesPage() {
  const [filters, setFilters] = useState<MotorcyclePageFilters>({
    status: 'all',
    model: 'all',
    searchTerm: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [editingMotorcycle, setEditingMotorcycle] = useState<Motorcycle | null>(null);
  const [isDeleteAllAlertOpen, setIsDeleteAllAlertOpen] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        setMotorcycles(motosFromDB);
      } else {
        console.warn("Data from subscribeToMotorcycles (motorcycles page) was not an array:", motosFromDB);
        setMotorcycles([]); 
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFilterChange = useCallback((newFilters: MotorcyclePageFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSaveMotorcycle = useCallback(async (motorcycleData: Motorcycle) => {
    const { id, ...dataToSave } = motorcycleData;
    try {
      if (editingMotorcycle && id) {
        await updateMotorcycle(id, dataToSave);
        toast({
          title: "Moto Atualizada!",
          description: `A moto ${motorcycleData.placa} foi atualizada com sucesso.`,
        });
      } else {
        await addMotorcycle(dataToSave);
        toast({
          title: "Moto Adicionada!",
          description: `A moto ${motorcycleData.placa} foi adicionada com sucesso.`,
        });
      }
      setIsModalOpen(false);
      setEditingMotorcycle(null);
    } catch (error: any) {
      console.error("Erro ao salvar moto:", error);
      const description = error.message 
        ? `Detalhes: ${error.message}`
        : "Não foi possível salvar a moto no banco de dados. Verifique o console para mais detalhes.";
      toast({
        title: "Erro ao Salvar",
        description,
        variant: "destructive",
      });
    }
  }, [toast, editingMotorcycle]);

  const handleOpenAddModal = useCallback(() => {
    setEditingMotorcycle(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((motorcycle: Motorcycle) => {
    setEditingMotorcycle(motorcycle);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingMotorcycle(null);
  }, []);

  const handleUpdateMotorcycleStatus = useCallback(async (motorcycleId: string, newStatus: MotorcycleStatus) => {
    try {
      await updateStatusInDB(motorcycleId, newStatus);
      toast({
        title: "Status Atualizado!",
        description: `O status da moto foi atualizado para ${newStatus}.`,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      const description = error.message
        ? `Detalhes: ${error.message}`
        : "Não foi possível atualizar o status da moto.";
      toast({
        title: "Erro ao Atualizar Status",
        description,
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDeleteMotorcycle = useCallback(async (motorcycleId: string) => {
    try {
      await deleteMotorcycle(motorcycleId);
      toast({
        variant: "destructive",
        title: "Moto Excluída!",
        description: `A moto foi excluída com sucesso.`,
      });
    } catch (error: any) {
      console.error("Erro ao excluir moto:", error);
      const description = error.message
        ? `Detalhes: ${error.message}`
        : "Não foi possível excluir a moto.";
      toast({
        title: "Erro ao Excluir",
        description,
        variant: "destructive",
      });
    }
  }, [toast]);
  
  const handlePauseIdleCount = useCallback(async (motorcycle: Motorcycle) => {
    try {
      await updateMotorcycle(motorcycle.id, { contagemPausada: !motorcycle.contagemPausada });
      toast({
        title: `Contagem ${motorcycle.contagemPausada ? "Retomada" : "Pausada"}!`,
        description: `A contagem de dias ociosos para a moto ${motorcycle.placa} foi ${motorcycle.contagemPausada ? "retomada" : "pausada"}.`,
      });
    } catch (error: any) {
      console.error("Erro ao pausar contagem:", error);
      toast({
        title: "Erro ao Pausar/Retomar Contagem",
        description: "Não foi possível atualizar a contagem de dias ociosos.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const confirmDeleteAllMotorcycles = useCallback(async () => {
    try {
      await deleteAllFromDB(); 
      toast({
        variant: "destructive",
        title: "Todas as Motos Excluídas!",
        description: "Todas as motocicletas foram removidas do banco de dados.",
      });
    } catch (error: any) {
      console.error("Erro ao excluir todas as motos:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Excluir Tudo",
        description: error.message || "Ocorreu um erro ao tentar excluir todas as motocicletas.",
      });
    } finally {
      setIsDeleteAllAlertOpen(false);
    }
  }, [toast]);

  // === Exportação para CSV (corrigido) ===
  const handleExportCSV = useCallback(() => {
    if (motorcycles.length === 0) {
      toast({
        title: "Nenhuma moto para exportar",
        description: "A lista de motocicletas está vazia.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "id", "placa", "model", "status", "type",
      "franqueado", "data_ultima_mov", "tempo_ocioso_dias",
      "qrCodeUrl", "valorSemanal", "dias_ociosos_congelados"
    ];

    const escapeCsvCell = (cellData: any): string => {
      if (cellData === undefined || cellData === null) {
        return '';
      }
      const stringData = String(cellData);
      if (
        stringData.includes(',') ||
        stringData.includes('\n') ||
        stringData.includes('"')
      ) {
        return `"${stringData.replace(/"/g, '""')}"`;
      }
      return stringData;
    };

    const csvRows = [
      headers.join(','),
      ...motorcycles.map(moto => [
        escapeCsvCell(moto.id),
        escapeCsvCell(moto.placa),
        escapeCsvCell(moto.model),
        escapeCsvCell(moto.status),
        escapeCsvCell(moto.type),
        escapeCsvCell(moto.franqueado),
        escapeCsvCell(moto.data_ultima_mov),
        escapeCsvCell(moto.tempo_ocioso_dias),
        escapeCsvCell(moto.qrCodeUrl),
        escapeCsvCell(moto.valorSemanal),
        escapeCsvCell(moto.dias_ociosos_congelados),
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "motos_export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Exportação Concluída",
        description: "Os dados das motocicletas foram exportados para motos_export.csv.",
      });
    } else {
      toast({
        title: "Exportação Falhou",
        description: "Seu navegador não suporta a funcionalidade de download direto.",
        variant: "destructive",
      });
    }
  }, [motorcycles, toast]);


  const handleUpdateWeeklyValues = useCallback(async () => {
    try {
      await updateWeeklyValuesForRentedMotorcycles();
      toast({
        title: "Valores Atualizados!",
        description: "Os valores semanais das motos alugadas/relocadas foram atualizados com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar valores semanais:", error);
      toast({
        title: "Erro ao Atualizar",
        description: error.message || "Não foi possível atualizar os valores semanais.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const pageActions = (
    <>
      <Button variant="outline" onClick={handleExportCSV}>
        <Download className="mr-2 h-4 w-4" />
        Exportar CSV
      </Button>
      <Button variant="outline" onClick={handleUpdateWeeklyValues}>
        <Edit className="mr-2 h-4 w-4" />
        Atualizar Valores Semanais
      </Button>
      <Button onClick={handleOpenAddModal}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Nova Moto
      </Button>
    </>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !ALLOWED_USER_IDS.includes(user.uid)) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Acesso Restrito"
          description="Você não tem permissão para visualizar esta página."
          icon={ShieldAlert}
          iconContainerClassName="bg-red-600"
        />
        <div className="p-4">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Acesso Negado</AlertTitle>
            <AlertDescription>
              Esta área é restrita e requer permissões especiais. Por favor, entre em contato com o administrador se você acredita que isso é um erro.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Gestão de Motos"
          description="Controle completo da frota"
          icon={MotorcycleIcon}
          iconContainerClassName="bg-primary"
        />
        <div className="flex justify-center items-center h-64">
          <p>Carregando dados das motocicletas...</p>
        </div>
      </DashboardLayout>
    );
  }

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
        onEditMotorcycle={handleOpenEditModal}
        onPauseIdleCount={handlePauseIdleCount}
      />
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        if (!isOpen) handleCloseModal();
        else setIsModalOpen(true);
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <AddMotorcycleForm
            onSubmit={handleSaveMotorcycle}
            onCancel={handleCloseModal}
            initialData={editingMotorcycle}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
