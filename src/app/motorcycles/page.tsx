
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddMotorcycleForm } from "@/components/motorcycles/add-motorcycle-form";
import { useToast } from "@/hooks/use-toast";

export type MotorcyclePageFilters = {
  status: MotorcycleStatus | 'all';
  model: string | 'all';
  searchTerm: string;
};

const initialMockMotorcycles: Motorcycle[] = [
  { id: '1', placa: 'MOTO001', model: 'XTZ 150 Crosser', status: 'active', type: 'nova', franqueado: 'Salvador Centro', data_ultima_mov: '2024-07-20', tempo_ocioso_dias: 2, qrCodeUrl: 'LETICIA', valorDiaria: 75.00 },
  { id: '2', placa: 'MOTO002', model: 'CG 160 Titan', status: 'inadimplente', type: 'usada', franqueado: 'Salvador Norte', data_ultima_mov: '2024-07-10', tempo_ocioso_dias: 12, qrCodeUrl: 'PEDRO ALMEIDA', valorDiaria: 60.50 },
  { id: '3', placa: 'MOTO003', model: 'NMAX 160', status: 'manutencao', type: 'nova', franqueado: 'Salvador Centro', data_ultima_mov: '2024-07-15', tempo_ocioso_dias: 7, qrCodeUrl: 'FATIMA SILVA', valorDiaria: 80.00 },
  { id: '4', placa: 'MOTO004', model: 'PCX 150', status: 'recolhida', type: 'usada', franqueado: 'Lauro de Freitas', data_ultima_mov: '2024-06-25', tempo_ocioso_dias: 27, qrCodeUrl: 'CLIENTE VIP 001', valorDiaria: 70.00 },
  { id: '5', placa: 'MOTO005', model: 'Factor 150', status: 'active', type: 'nova', franqueado: 'Salvador Norte', data_ultima_mov: '2024-07-22', tempo_ocioso_dias: 0, qrCodeUrl: 'JOANA LIMA', valorDiaria: 65.00 },
  { id: '6', placa: 'MOTO006', model: 'Biz 125', status: 'relocada', type: 'usada', franqueado: 'Salvador Centro', data_ultima_mov: '2024-07-18', tempo_ocioso_dias: 4, qrCodeUrl: 'MOTO ROTA 7', valorDiaria: 55.00 },
];


export default function MotorcyclesPage() {
  const [filters, setFilters] = useState<MotorcyclePageFilters>({
    status: 'all',
    model: 'all',
    searchTerm: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>(initialMockMotorcycles);
  const [editingMotorcycle, setEditingMotorcycle] = useState<Motorcycle | null>(null);
  const [isDeleteAllAlertOpen, setIsDeleteAllAlertOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMotorcycles(prevMotos =>
      prevMotos.map(moto =>
        moto.status === undefined ? { ...moto, status: 'alugada' as MotorcycleStatus } : moto
      )
    );
  }, []); // Roda uma vez após a montagem inicial

  const handleFilterChange = useCallback((newFilters: MotorcyclePageFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSaveMotorcycle = useCallback((motorcycleData: Motorcycle) => {
    if (editingMotorcycle) {
      setMotorcycles(prevMotorcycles =>
        prevMotorcycles.map(moto =>
          moto.id === motorcycleData.id ? motorcycleData : moto
        )
      );
      toast({
        title: "Moto Atualizada!",
        description: `A moto ${motorcycleData.placa} foi atualizada com sucesso.`,
      });
    } else {
      setMotorcycles(prevMotorcycles => [{ ...motorcycleData, id: `moto-${Date.now()}-${Math.random().toString(36).substring(7)}` }, ...prevMotorcycles]);
      toast({
        title: "Moto Adicionada!",
        description: `A moto ${motorcycleData.placa} foi adicionada com sucesso.`,
      });
    }
    setIsModalOpen(false);
    setEditingMotorcycle(null);
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

  const confirmDeleteAllMotorcycles = useCallback(() => {
    setMotorcycles([]);
    toast({
      variant: "destructive",
      title: "Todas as Motos Excluídas!",
      description: "A lista de motocicletas foi limpa.",
    });
    setIsDeleteAllAlertOpen(false);
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

  const parseCSV = (csvText: string): Motorcycle[] => {
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
        const index = headers.indexOf(name); 
        if (index !== -1) return index;
      }
      return -1;
    };

    const possiblePlacaNames = ['placa', 'codigo'];
    const placaIndex = findHeaderIndex(possiblePlacaNames);

    if (placaIndex === -1) {
      throw new Error("CSV inválido: Coluna 'placa' ou 'codigo' não encontrada. Cabeçalhos detectados (normalizados): " + headers.join(' | '));
    }
  
    const motorcyclesArray: Motorcycle[] = [];
    const allowedStatus: MotorcycleStatus[] = ['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada'];
    const allowedType: MotorcycleType[] = ['nova', 'usada'];
  
    const modelIndex = findHeaderIndex(['model', 'modelo']);
    const statusIndex = findHeaderIndex(['status']);
    const typeIndex = findHeaderIndex(['type', 'tipomoto', 'tipo moto', 'tipo']);
    const franqueadoIndex = findHeaderIndex(['franqueado', 'filial']);
    const dataUltimaMovIndex = findHeaderIndex(['data_ultima_mov', 'data ultima movimentacao', 'última movimentação']);
    const tempoOciosoDiasIndex = findHeaderIndex(['tempo_ocioso_dias', 'tempo ocioso dias', 'dias parado']);
    const qrCodeUrlIndex = findHeaderIndex(['qrcodeurl', 'cs']);
    const valorDiariaIndex = findHeaderIndex(['valordiaria', 'valor diaria', 'valor diária']);
  
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      
      const placa = placaIndex !== -1 ? values[placaIndex] : undefined;
      if (!placa) continue; 
  
      const statusRaw = statusIndex !== -1 ? values[statusIndex] : undefined;
      const statusValue = statusRaw ? normalizeHeader(statusRaw) as MotorcycleStatus : undefined;

      const typeRaw = typeIndex !== -1 ? values[typeIndex] : undefined;
      const typeValue = typeRaw ? normalizeHeader(typeRaw) as MotorcycleType : undefined;
  
      const moto: Motorcycle = {
        id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`, 
        placa: placa,
        model: modelIndex !== -1 && values[modelIndex] ? values[modelIndex] : undefined,
        status: statusValue && allowedStatus.includes(statusValue) ? statusValue : undefined,
        type: typeValue && allowedType.includes(typeValue) ? typeValue : undefined,
        franqueado: franqueadoIndex !== -1 && values[franqueadoIndex] ? values[franqueadoIndex] : undefined,
        data_ultima_mov: dataUltimaMovIndex !== -1 && values[dataUltimaMovIndex] ? values[dataUltimaMovIndex] : undefined, 
        tempo_ocioso_dias: tempoOciosoDiasIndex !== -1 && values[tempoOciosoDiasIndex] ? parseInt(values[tempoOciosoDiasIndex], 10) || undefined : undefined,
        qrCodeUrl: qrCodeUrlIndex !== -1 && values[qrCodeUrlIndex] ? values[qrCodeUrlIndex] : undefined, 
        valorDiaria: valorDiariaIndex !== -1 && values[valorDiariaIndex] ? parseFloat(values[valorDiariaIndex].replace(',', '.')) || undefined : undefined,
      };
      motorcyclesArray.push(moto);
    }
    return motorcyclesArray;
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) {
          toast({ title: "Erro ao ler arquivo", description: "Não foi possível ler o conteúdo do arquivo.", variant: "destructive" });
          return;
        }
        try {
          const importedMotorcycles = parseCSV(text);
          if (importedMotorcycles.length > 0) {
            setMotorcycles(prev => [...prev, ...importedMotorcycles].map(moto => moto.status === undefined ? { ...moto, status: 'alugada' as MotorcycleStatus } : moto )); 
            toast({ title: "Importação Concluída", description: `${importedMotorcycles.length} motocicletas foram importadas.` });
          } else {
            toast({ title: "Nenhuma moto para importar", description: "O arquivo CSV estava vazio ou não continha dados válidos para 'placa' ou 'codigo'.", variant: "destructive" });
          }
        } catch (error: any) {
          console.error("Erro ao importar CSV:", error);
          toast({ title: "Erro ao importar CSV", description: error.message || "Formato de CSV inválido.", variant: "destructive" });
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
      <AlertDialog open={isDeleteAllAlertOpen} onOpenChange={setIsDeleteAllAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" onClick={() => setIsDeleteAllAlertOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Todos
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as
              motocicletas da lista.
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
    

    

    

