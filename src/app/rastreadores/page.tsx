
"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { RastreadoresList } from "@/components/rastreadores/rastreadores-list";
import { Button } from "@/components/ui/button";
import { Upload, Edit3, Trash2 } from "lucide-react"; // Adicionando ícones para editar/excluir
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


// Define a interface para os dados do rastreador, incluindo um ID opcional.
interface RastreadorData {
  id?: string; // ID é opcional, pois não existe ao criar um novo
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

// Interface para o formulário de edição/adição, onde o ID é necessário para edição.
interface EditRastreadorFormData extends RastreadorData {}


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

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToRastreadores((dataFromDB) => {
      if (Array.isArray(dataFromDB)) {
        setRastreadoresData(dataFromDB as RastreadorData[]);
      } else {
        console.warn("Data from subscribeToRastreadores was not an array:", dataFromDB);
        setRastreadoresData([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
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
    setCurrentFormData({ ...rastreador }); // Popula o formulário com dados existentes
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
      if (editingRastreador && editingRastreador.id) {
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
    if (!id) {
      toast({ title: "Erro", description: "ID do rastreador inválido.", variant: "destructive" });
      return;
    }
    try {
      await deleteRastreadorFromDB(id);
      toast({ title: "Sucesso!", description: "Rastreador excluído.", variant: "destructive" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível excluir o rastreador.", variant: "destructive" });
    }
  };


  const parseCSV = (csvText: string): Omit<RastreadorData, 'id'>[] => {
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
    
    const parsedHeaders = parseCsvLine(lines[0]).map(h => normalizeHeader(h));
    const requiredHeaders = ["cnpj", "empresa", "franqueado", "chassi", "placa", "rastreador", "tipo", "moto", "mes", "valor"];
    
    if (parsedHeaders.length !== requiredHeaders.length) {
      throw new Error(
        `CSV inválido: Número incorreto de colunas no cabeçalho. Esperado: ${requiredHeaders.length}, Encontrado: ${parsedHeaders.length}. Cabeçalhos detectados (normalizados): ${parsedHeaders.join(' | ')}`
      );
    }

    for (const reqHeader of requiredHeaders) {
      if (!parsedHeaders.includes(reqHeader)) {
        throw new Error(`CSV inválido: O cabeçalho obrigatório "${reqHeader}" não foi encontrado. Cabeçalhos detectados (normalizados): ${parsedHeaders.join(' | ')}`);
      }
    }

    const rastreadoresArray: Omit<RastreadorData, 'id'>[] = [];
    const headerIndexMap: { [key: string]: number } = {};
    requiredHeaders.forEach(reqHeader => {
      const index = parsedHeaders.indexOf(reqHeader);
      headerIndexMap[reqHeader] = index;
    });

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      if (values.length !== parsedHeaders.length) {
        console.warn(`Linha ${i+1} do CSV ignorada: número de colunas (${values.length}) não corresponde ao cabeçalho (${parsedHeaders.length}). Conteúdo: ${lines[i]}`);
        continue; 
      }
      
      const entry: Partial<RastreadorData> = {};
      requiredHeaders.forEach(reqHeader => {
        const index = headerIndexMap[reqHeader];
        (entry as any)[reqHeader] = values[index] !== undefined ? values[index] : "";
      });
      
      const rastreadorEntry: Omit<RastreadorData, 'id'> = {
        cnpj: entry.cnpj || "", empresa: entry.empresa || "", franqueado: entry.franqueado || "",
        chassi: entry.chassi || "", placa: entry.placa || "", rastreador: entry.rastreador || "",
        tipo: entry.tipo || "", moto: entry.moto || "", mes: entry.mes || "", valor: entry.valor || "",
      };
      rastreadoresArray.push(rastreadorEntry);
    }
    return rastreadoresArray;
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "Erro ao ler arquivo", variant: "destructive", description: "Não foi possível ler o conteúdo do arquivo." });
        return;
      }
      
      try {
        const parsedData = parseCSV(text);
        if (parsedData.length === 0) {
          toast({ title: "Nenhum dado para importar", variant: "destructive", description: "O arquivo CSV estava vazio ou não continha linhas de dados válidas." });
          return;
        }

        for (const rastreadorData of parsedData) {
          await addRastreador(rastreadorData); // addRastreador não retorna ID aqui, mas o onSnapshot atualizará
        }
        
        toast({ title: "Importação Concluída", description: `${parsedData.length} rastreadores importados com sucesso.` });
      } catch (error: any) {
        console.error("Erro ao importar CSV:", error);
        toast({ title: "Erro na Importação", description: error.message || "Não foi possível processar o arquivo.", variant: "destructive" });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
        toast({ title: "Erro ao tentar ler o arquivo.", variant: "destructive" });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  }, [toast]);

  const handleImportClick = () => fileInputRef.current?.click();

  const pageActions = (
    <>
      <Button variant="outline" onClick={handleImportClick}>
        <Upload className="mr-2 h-4 w-4" />
        Importar CSV
      </Button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,text/csv" className="hidden" />
      <Button onClick={handleOpenAddModal}>
        Adicionar Rastreador
      </Button>
    </>
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Gestão de Rastreadores"
        description="Visualize e gerencie os rastreadores da sua frota."
        actions={pageActions}
      />
      <div className="space-y-8">
        <RastreadoresList
          rastreadores={rastreadoresData}
          onEditRastreador={handleOpenEditModal} // Passa a função de abrir modal de edição
          onDeleteRastreador={handleDeleteRastreador} // Passa a função de exclusão
          isLoading={isLoading}
        />
      </div>

      <Dialog open={isFormModalOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseFormModal(); else setIsFormModalOpen(true); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRastreador ? "Editar Rastreador" : "Adicionar Novo Rastreador"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRastreador}>
            <div className="grid gap-4 py-4">
              {/* Campos do formulário reutilizados */}
              {(Object.keys(currentFormData) as Array<keyof Omit<RastreadorData, 'id'>>).map((key) => (
                <div className="grid grid-cols-4 items-center gap-4" key={key}>
                  <Label htmlFor={key} className="text-right capitalize">{key.replace(/_/g, ' ')}</Label>
                  <Input id={key} value={currentFormData[key]} onChange={handleFormInputChange} className="col-span-3" />
                </div>
              ))}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleCloseFormModal}>Cancelar</Button>
              </DialogClose>
              <Button type="submit">{editingRastreador ? "Salvar Alterações" : "Salvar Rastreador"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
