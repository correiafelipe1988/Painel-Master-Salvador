
"use client";

import { useState, useCallback, useRef } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { MotorcycleFilters } from "@/components/motorcycles/motorcycle-filters";
import { MotorcycleList } from "@/components/motorcycles/motorcycle-list";
import type { Motorcycle, MotorcycleStatus, MotorcycleType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Upload, Download, PlusCircle } from 'lucide-react';
import { MotorcycleIcon } from '@/components/icons/motorcycle-icon';
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      description: `O status da moto foi atualizado.`,
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
    const lines = csvText.trim().split('\n').map(line => line.trim()).filter(line => line);
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
        } else if (char === ',' && !inQuotes) {
          result.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      result.push(currentField.trim()); 
      return result;
    };
    
    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
    const placaIndex = headers.indexOf('placa');
    
    if (placaIndex === -1) {
      throw new Error("CSV inválido: Coluna 'placa' não encontrada. Cabeçalhos: " + headers.join(', '));
    }
  
    const motorcyclesArray: Motorcycle[] = [];
    const allowedStatus: MotorcycleStatus[] = ['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada'];
    const allowedType: MotorcycleType[] = ['nova', 'usada'];
  
    const modelIndex = headers.indexOf('model');
    const statusIndex = headers.indexOf('status');
    const typeIndex = headers.indexOf('type');
    const franqueadoIndex = headers.indexOf('franqueado');
    const dataUltimaMovIndex = headers.indexOf('data_ultima_mov');
    const tempoOciosoDiasIndex = headers.indexOf('tempo_ocioso_dias');
    const qrCodeUrlIndex = headers.indexOf('qrcodeurl'); 
    const valorDiariaIndex = headers.indexOf('valordiaria');
  
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      
      const placa = values[placaIndex];
      if (!placa) continue; 
  
      const statusValue = statusIndex !== -1 ? values[statusIndex]?.toLowerCase() as MotorcycleStatus : undefined;
      const typeValue = typeIndex !== -1 ? values[typeIndex]?.toLowerCase() as MotorcycleType : undefined;
  
      const moto: Motorcycle = {
        id: `imported-${Date.now()}-${Math.random().toString(36).substring(7)}`, 
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
            setMotorcycles(prev => [...prev, ...importedMotorcycles]);
            toast({ title: "Importação Concluída", description: `${importedMotorcycles.length} motocicletas foram importadas.` });
          } else {
            toast({ title: "Nenhuma moto para importar", description: "O arquivo CSV estava vazio ou não continha dados válidos para 'placa'.", variant: "destructive" });
          }
        } catch (error: any) {
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
