"use client";

import { useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { RastreadoresList } from "@/components/rastreadores/rastreadores-list";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addRastreador } from "@/lib/firebase/rastreadorService";

// Define a interface para garantir a tipagem correta dos dados.
interface RastreadorData {
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

  /**
   * Analisa o texto de um arquivo CSV.
   * A função foi corrigida para usar uma abordagem robusta e sem erros de sintaxe.
   */
  const parseCSV = (text: string): Omit<RastreadorData, 'id'>[] => {
    // CORREÇÃO: Usa replace para normalizar quebras de linha e depois split
    const lines = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error("CSV inválido: O arquivo precisa conter um cabeçalho e pelo menos uma linha de dados.");
    }
    
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const requiredHeaders = ["cnpj", "empresa", "franqueado", "chassi", "placa", "rastreador", "tipo", "moto", "mes", "valor"];
    
    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        throw new Error(`CSV inválido: O cabeçalho obrigatório "${header}" não foi encontrado.`);
      }
    }

    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const entry: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        entry[header] = values[index] || "";
      });
      return entry as Omit<RastreadorData, 'id'>;
    });
  };

  /**
   * Lida com a seleção do arquivo, lendo seu conteúdo e o processando.
   */
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "Erro ao ler arquivo", variant: "destructive" });
        return;
      }
      
      try {
        const parsedData = parseCSV(text);
        if (parsedData.length === 0) {
          toast({ title: "Arquivo CSV vazio", variant: "destructive" });
          return;
        }

        for (const rastreadorData of parsedData) {
          await addRastreador(rastreadorData);
        }
        
        toast({
          title: "Importação Concluída",
          description: `${parsedData.length} rastreadores importados com sucesso.`,
        });
      } catch (error: any) {
        console.error("Erro ao importar CSV:", error);
        toast({
          title: "Erro na Importação",
          description: error.message || "Não foi possível processar o arquivo. Verifique o formato.",
          variant: "destructive",
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    
    reader.onerror = () => {
        toast({ title: "Erro ao tentar ler o arquivo.", variant: "destructive" });
    };
    
    reader.readAsText(file);
  }, [toast]);

  // Simula um clique no input de arquivo oculto.
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Define os botões a serem exibidos no cabeçalho.
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
        className="hidden" 
      />
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
        <RastreadoresList />
      </div>
    </DashboardLayout>
  );
}
