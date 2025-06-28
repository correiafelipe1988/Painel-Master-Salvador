
"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { RastreadoresList } from "@/components/rastreadores/rastreadores-list";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  addRastreador, 
  subscribeToRastreadores,
  deleteRastreador as deleteRastreadorFromDB,
  updateRastreador as updateRastreadorInDB,
} from "@/lib/firebase/rastreadorService";
import { normalizeHeader } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RastreadorFilters, RastreadorFiltersState } from "@/components/rastreadores/rastreador-filters";

interface RastreadorData {
  id?: string;
  cnpj: string;
  empresa: string;
  franqueado: string;
  chassi: string;
  placa: string;
  rastreador: string;
  tipo: string;
  moto: string;
  mes: string;
  valor: string;
}

export default function RastreadoresPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rastreadoresData, setRastreadoresData] = useState<RastreadorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRastreador, setEditingRastreador] = useState<RastreadorData | null>(null);
  const [currentFormData, setCurrentFormData] = useState<Omit<RastreadorData, 'id'>>({
    cnpj: "", empresa: "", franqueado: "", chassi: "", placa: "",
    rastreador: "", tipo: "", moto: "", mes: "", valor: "",
  });

  const [filters, setFilters] = useState<RastreadorFiltersState>({
    searchTerm: '',
    status: 'all',
    franqueado: 'all',
  });

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToRastreadores((dataFromDB) => {
      setRastreadoresData(Array.isArray(dataFromDB) ? (dataFromDB as RastreadorData[]) : []);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const franqueadosUnicos = useMemo(() => {
    const franqueadoSet = new Set(rastreadoresData.map(r => r.franqueado).filter(Boolean));
    return Array.from(franqueadoSet);
  }, [rastreadoresData]);

  const filteredRastreadores = useMemo(() => {
    return rastreadoresData.filter(r => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const searchMatch = !filters.searchTerm ||
        r.placa?.toLowerCase().includes(searchTermLower) ||
        r.rastreador?.toLowerCase().includes(searchTermLower) ||
        r.chassi?.toLowerCase().includes(searchTermLower);
      
      const statusMatch = filters.status === 'all' || r.tipo?.toLowerCase() === filters.status;
      const franqueadoMatch = filters.franqueado === 'all' || r.franqueado === filters.franqueado;

      return searchMatch && statusMatch && franqueadoMatch;
    });
  }, [rastreadoresData, filters]);

  const handleFilterChange = useCallback((newFilters: RastreadorFiltersState) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ searchTerm: '', status: 'all', franqueado: 'all' });
  }, []);

  const handleOpenAddModal = () => {
    setEditingRastreador(null);
    setCurrentFormData({
      cnpj: "", empresa: "", franqueado: "", chassi: "", placa: "",
      rastreador: "", tipo: "", moto: "", mes: "", valor: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (rastreador: RastreadorData) => {
    setEditingRastreador(rastreador);
    setCurrentFormData({ ...rastreador });
    setIsFormModalOpen(true);
  };
  
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingRastreador(null);
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCurrentFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveRastreador = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingRastreador?.id) {
        await updateRastreadorInDB(editingRastreador.id, currentFormData);
        toast({ title: "Sucesso!", description: "Rastreador atualizado." });
      } else {
        await addRastreador(currentFormData);
        toast({ title: "Sucesso!", description: "Rastreador adicionado." });
      }
      handleCloseFormModal();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível salvar o rastreador.", variant: "destructive" });
    }
  };

  const handleDeleteRastreador = async (id: string) => {
    if (!id) return;
    try {
      await deleteRastreadorFromDB(id);
      toast({ title: "Sucesso!", description: "Rastreador excluído.", variant: "destructive" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível excluir o rastreador.", variant: "destructive" });
    }
  };

  const parseCSV = (csvText: string): Omit<RastreadorData, 'id'>[] => {
    let cleanedCsvText = csvText.charCodeAt(0) === 0xFEFF ? csvText.substring(1) : csvText;
    const lines = cleanedCsvText.trim().split().map(line => line.trim()).filter(line => line);

    if (lines.length < 2) throw new Error("CSV inválido: Necessita de cabeçalho e pelo menos uma linha de dados.");

    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let currentField = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          result.push(currentField.trim());
          currentField = '';
        } else currentField += char;
      }
      result.push(currentField.trim());
      return result;
    };
    
    const headers = parseCsvLine(lines[0]).map(h => normalizeHeader(h));
    const requiredHeaders = ["cnpj", "empresa", "franqueado", "chassi", "placa", "rastreador", "tipo", "moto", "mes", "valor"];
    
    for (const reqHeader of requiredHeaders) {
      if (!headers.includes(reqHeader)) {
        throw new Error(`CSV inválido: O cabeçalho obrigatório "${reqHeader}" não foi encontrado. Cabeçalhos detectados: ${headers.join(' | ')}`);
      }
    }

    const headerIndexMap = requiredHeaders.reduce((acc, reqHeader) => {
      acc[reqHeader] = headers.indexOf(reqHeader);
      return acc;
    }, {} as { [key: string]: number });

    return lines.slice(1).map((line, i) => {
      const values = parseCsvLine(line);
      if (values.length !== headers.length) {
        console.warn(`Linha ${i+2} do CSV ignorada: número de colunas não corresponde ao cabeçalho.`);
        return null;
      }
      
      const rastreadorEntry: Omit<RastreadorData, 'id'> = {
        cnpj: values[headerIndexMap["cnpj"]] || "",
        empresa: values[headerIndexMap["empresa"]] || "",
        franqueado: values[headerIndexMap["franqueado"]] || "",
        chassi: values[headerIndexMap["chassi"]] || "",
        placa: values[headerIndexMap["placa"]] || "",
        rastreador: values[headerIndexMap["rastreador"]] || "",
        tipo: values[headerIndexMap["tipo"]] || "",
        moto: values[headerIndexMap["moto"]] || "",
        mes: values[headerIndexMap["mes"]] || "",
        valor: values[headerIndexMap["valor"]] || "",
      };
      return rastreadorEntry;
    }).filter((r): r is Omit<RastreadorData, 'id'> => r !== null);
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "Erro", description: "Não foi possível ler o arquivo.", variant: "destructive" });
        return;
      }
      
      try {
        const parsedData = parseCSV(text);
        if (parsedData.length === 0) {
          toast({ title: "Aviso", description: "Nenhum dado válido para importar.", variant: "destructive" });
          return;
        }

        for (const data of parsedData) {
            await addRastreador(data);
        }
        
        toast({ title: "Sucesso!", description: `${parsedData.length} rastreadores importados.` });
      } catch (error: any) {
        toast({ title: "Erro na Importação", description: error.message, variant: "destructive" });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
        toast({ title: "Erro", description: "Falha ao ler o arquivo.", variant: "destructive" });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file, 'UTF-8');
  }, [toast]);

  const handleImportClick = () => fileInputRef.current?.click();

  const pageActions = (
    <>
      <Button variant="outline" onClick={handleImportClick}>
        <Upload className="mr-2 h-4 w-4" /> Importar CSV
      </Button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" hidden />
      <Button onClick={handleOpenAddModal}>Adicionar Rastreador</Button>
      {(filters.searchTerm || filters.status !== 'all' || filters.franqueado !== 'all') && (
        <Button variant="ghost" onClick={handleClearFilters}>
          <X className="mr-2 h-4 w-4" /> Limpar Filtros
        </Button>
      )}
    </>
  );

  return (
    <DashboardLayout>
      <PageHeader title="Gestão de Rastreadores" description="Visualize e gerencie os rastreadores." actions={pageActions} />
      <RastreadorFilters 
        onFilterChange={handleFilterChange}
        initialFilters={filters}
        franqueados={franqueadosUnicos}
      />
      <RastreadoresList
        rastreadores={filteredRastreadores}
        onEditRastreador={handleOpenEditModal}
        onDeleteRastreador={handleDeleteRastreador}
        isLoading={isLoading}
      />
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingRastreador ? "Editar" : "Adicionar"} Rastreador</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveRastreador} className="space-y-4">
            {Object.keys(currentFormData).map((key) => (
              <div key={key} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={key} className="text-right capitalize">{key}</Label>
                <Input id={key} value={(currentFormData as any)[key]} onChange={handleFormInputChange} className="col-span-3" />
              </div>
            ))}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
