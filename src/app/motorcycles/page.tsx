
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { MotorcycleFilters } from "@/components/motorcycles/motorcycle-filters";
import { MotorcycleList } from "@/components/motorcycles/motorcycle-list";
import type { Motorcycle, MotorcycleStatus, MotorcycleType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Upload, Download, PlusCircle, Edit, Trash2 } from 'lucide-react';
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
  importMotorcyclesBatch,
  deleteAllMotorcycles as deleteAllFromDB,
} from '@/lib/firebase/motorcycleService';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [editingMotorcycle, setEditingMotorcycle] = useState<Motorcycle | null>(null);
  const [isDeleteAllAlertOpen, setIsDeleteAllAlertOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        description: description,
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
        description: description,
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
        description: description,
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
      "qrCodeUrl", "valorDiaria"
    ];

    const csvRows = [
      headers.join(','),
      ...motorcycles.map(moto => {
        const escapeCsvCell = (cellData: any): string => {
          if (cellData === undefined || cellData === null) {
            return '';
          }
          const stringData = String(cellData);
          if (stringData.includes(',') || stringData.includes('\n') || stringData.includes('"')) {
            return `"${stringData.replace(/"/g, '""')}"`;
          }
          return stringData;
        };

        return [
          escapeCsvCell(moto.id),
          escapeCsvCell(moto.placa),
          escapeCsvCell(moto.model),
          escapeCsvCell(moto.status),
          escapeCsvCell(moto.type),
          escapeCsvCell(moto.franqueado),
          escapeCsvCell(moto.data_ultima_mov),
          escapeCsvCell(moto.tempo_ocioso_dias),
          escapeCsvCell(moto.qrCodeUrl),
          escapeCsvCell(moto.valorDiaria),
        ].join(',');
      })
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

  const parseCSV = (csvText: string): Omit<Motorcycle, 'id'>[] => {
    let cleanedCsvText = csvText;
    if (cleanedCsvText.charCodeAt(0) === 0xFEFF) { 
      cleanedCsvText = cleanedCsvText.substring(1);
    }

    const lines = cleanedCsvText.trim().split(/\r\n|\r|\n/).map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      throw new Error("CSV inválido: Necessita de cabeçalho e pelo menos uma linha de dados.");
    }

    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let currentField = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && i + 1 < line.length && line[i+1] === '"') {
            currentField += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ';' && !inQuotes) { 
          result.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      result.push(currentField.trim());
      return result;
    };
    
    const normalizeHeader = (header: string) => header.toLowerCase().trim().replace(/\s+/g, ' ');
    const headers = parseCsvLine(lines[0]).map(normalizeHeader);

    const findHeaderIndex = (possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.indexOf(normalizeHeader(name));
        if (index !== -1) return index;
      }
      return -1;
    };

    const possiblePlacaNames = ['placa', 'codigo'];
    const placaIndex = findHeaderIndex(possiblePlacaNames);

    if (placaIndex === -1) {
      throw new Error("CSV inválido: Coluna 'placa' ou 'codigo' não encontrada. Cabeçalhos detectados (normalizados): " + headers.join(' | '));
    }

    const motorcyclesArray: Omit<Motorcycle, 'id'>[] = [];
    const allowedStatus: MotorcycleStatus[] = ['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada'];
    const allowedType: MotorcycleType[] = ['nova', 'usada'];

    const modelIndex = findHeaderIndex(['model', 'modelo']);
    const statusIndex = findHeaderIndex(['status']);
    const typeIndex = findHeaderIndex(['type', 'tipomoto', 'tipo moto', 'tipo']);
    const franqueadoIndex = findHeaderIndex(['franqueado', 'filial']);
    const dataUltimaMovIndex = findHeaderIndex(['data_ultima_mov', 'data ultima movimentacao', 'última movimentacao', 'ultima movimentacao', 'última movimentação']);
    const tempoOciosoDiasIndex = findHeaderIndex(['tempo_ocioso_dias', 'tempo ocioso dias', 'dias parado']);
    const qrCodeUrlIndex = findHeaderIndex(['qrcodeurl', 'cs']);
    const valorDiariaIndex = findHeaderIndex(['valordiaria', 'valor diaria', 'valor diária']);


    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);

      const placa = placaIndex !== -1 ? values[placaIndex] : undefined;
      if (!placa) continue;

      const statusRaw = statusIndex !== -1 ? values[statusIndex] : undefined;
      let statusValue = statusRaw ? normalizeHeader(statusRaw) as MotorcycleStatus : undefined;
      if (statusValue && !allowedStatus.includes(statusValue)) statusValue = undefined; 
      if (statusValue === undefined) statusValue = 'alugada';

      const typeRaw = typeIndex !== -1 ? values[typeIndex] : undefined;
      let typeValue = typeRaw ? normalizeHeader(typeRaw) as MotorcycleType : undefined;
      if (typeValue && !allowedType.includes(typeValue)) typeValue = undefined;
      
      const rawDateStr = dataUltimaMovIndex !== -1 && values[dataUltimaMovIndex] ? values[dataUltimaMovIndex].trim() : undefined;
      let formattedDateStr: string | undefined = undefined;

      if (rawDateStr && rawDateStr !== '') {
        let dateObj = dateParseFns(rawDateStr, 'dd/MM/yyyy', new Date());
        if (dateIsValidFns(dateObj)) {
          formattedDateStr = dateFormatFns(dateObj, 'yyyy-MM-dd');
        } else {
          dateObj = dateParseFns(rawDateStr, 'yyyy-MM-dd', new Date());
          if (dateIsValidFns(dateObj)) {
            formattedDateStr = dateFormatFns(dateObj, 'yyyy-MM-dd');
          } else {
            console.error(`[CSV Import Erro Data] Falha ao parsear a data: "${rawDateStr}" do CSV. Formatos tentados: 'dd/MM/yyyy', 'yyyy-MM-dd'. A data não será importada para esta linha.`);
            formattedDateStr = undefined; 
          }
        }
      } else if (rawDateStr === '') {
         formattedDateStr = undefined;
      }
      
      const moto: Omit<Motorcycle, 'id'> = {
        placa: placa,
        model: modelIndex !== -1 && values[modelIndex] ? values[modelIndex] : undefined,
        status: statusValue, 
        type: typeValue,
        franqueado: franqueadoIndex !== -1 && values[franqueadoIndex] ? values[franqueadoIndex] : undefined,
        data_ultima_mov: formattedDateStr,
        tempo_ocioso_dias: tempoOciosoDiasIndex !== -1 && values[tempoOciosoDiasIndex] ? parseInt(values[tempoOciosoDiasIndex], 10) || undefined : undefined,
        qrCodeUrl: qrCodeUrlIndex !== -1 && values[qrCodeUrlIndex] ? values[qrCodeUrlIndex] : undefined,
        valorDiaria: valorDiariaIndex !== -1 && values[valorDiariaIndex] ? parseFloat(values[valorDiariaIndex].replace(',', '.')) || undefined : undefined,
      };
      motorcyclesArray.push(moto);
    }
    return motorcyclesArray;
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        if (!text) {
          toast({ title: "Erro ao ler arquivo", description: "Não foi possível ler o conteúdo do arquivo.", variant: "destructive" });
          return;
        }
        try {
          const importedMotorcyclesData = parseCSV(text);
          if (importedMotorcyclesData.length > 0) {
            await importMotorcyclesBatch(importedMotorcyclesData);
            toast({ title: "Importação Concluída", description: `${importedMotorcyclesData.length} motocicletas foram importadas para o banco de dados.` });
          } else {
            toast({ title: "Nenhuma moto para importar", description: "O arquivo CSV estava vazio ou não continha dados válidos para 'placa' ou 'codigo'.", variant: "destructive" });
          }
        } catch (error: any) {
          console.error("Erro ao importar CSV:", error);
          toast({ title: "Erro ao importar CSV", description: error.message || "Formato de CSV inválido ou erro ao salvar no banco.", variant: "destructive" });
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };
      reader.onerror = () => {
          toast({ title: "Erro ao ler arquivo", description: "Ocorreu um erro ao tentar ler o arquivo.", variant: "destructive" });
           if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
      };
      reader.readAsText(file);
    }
  }, [toast]); 

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);


  const pageActions = (
    <>
      <Button variant="outline" onClick={handleImportClick}>
        <Upload className="mr-2 h-4 w-4" />
        Importar CSV
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        style={{ display: 'none' }}
      />
      <Button variant="outline" onClick={handleExportCSV}>
        <Download className="mr-2 h-4 w-4" />
        Exportar CSV
      </Button>
      <Button onClick={handleOpenAddModal}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Nova Moto
      </Button>
      {/* 
      <AlertDialog open={isDeleteAllAlertOpen} onOpenChange={setIsDeleteAllAlertOpen}>
         <Button variant="destructive" onClick={() => setIsDeleteAllAlertOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Todos
          </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as
              motocicletas do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteAllAlertOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAllMotorcycles}>
              Sim, excluir todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      */}
    </>
  );

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

    