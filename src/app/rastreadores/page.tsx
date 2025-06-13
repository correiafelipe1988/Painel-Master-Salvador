
"use client";

import { useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { RastreadoresList } from "@/components/rastreadores/rastreadores-list";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addRastreador } from "@/lib/firebase/rastreadorService";
import { normalizeHeader } from "@/lib/utils"; // Importar normalizeHeader

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
   * A função foi corrigida para usar uma abordagem robusta.
   */
  const parseCSV = (csvText: string): Omit<RastreadorData, 'id'>[] => {
    let cleanedCsvText = csvText;
    // Handle BOM
    if (cleanedCsvText.charCodeAt(0) === 0xFEFF) {
      cleanedCsvText = cleanedCsvText.substring(1);
    }

    const lines = cleanedCsvText.trim().split(/\r\n|\r|\n/).map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      throw new Error("CSV inválido: Necessita de cabeçalho e pelo menos uma linha de dados.");
    }

    // Robust CSV line parser (semicolon as delimiter)
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let currentField = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && i + 1 < line.length && line[i+1] === '"') { // Handle "" inside quotes
            currentField += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ';' && !inQuotes) { // Use semicolon as delimiter
          result.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      result.push(currentField.trim()); // Add the last field
      return result;
    };

    const parsedHeaders = parseCsvLine(lines[0]).map(h => normalizeHeader(h)); // Normalize headers from CSV

    const requiredHeaders = ["cnpj", "empresa", "franqueado", "chassi", "placa", "rastreador", "tipo", "moto", "mes", "valor"];
    // requiredHeaders are already normalized (lowercase, no accents)

    for (const reqHeader of requiredHeaders) {
      if (!parsedHeaders.includes(reqHeader)) {
        throw new Error(`CSV inválido: O cabeçalho obrigatório "${reqHeader}" não foi encontrado. Cabeçalhos detectados (normalizados): ${parsedHeaders.join(' | ')}`);
      }
    }

    const rastreadoresArray: Omit<RastreadorData, 'id'>[] = [];

    // Create a map of required header (normalized) to its index in the parsed CSV headers
    const headerIndexMap: { [key: string]: number } = {};
    requiredHeaders.forEach(reqHeader => {
      const index = parsedHeaders.indexOf(reqHeader);
      if (index !== -1) {
        headerIndexMap[reqHeader] = index;
      }
    });

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const entry: Partial<RastreadorData> = {}; // Use Partial for type safety

      requiredHeaders.forEach(reqHeader => {
        const index = headerIndexMap[reqHeader];
        if (index !== undefined && index < values.length) {
          (entry as any)[reqHeader] = values[index];
        } else {
          (entry as any)[reqHeader] = ""; // Default to empty string if header is missing or value not present
        }
      });
      
      // Ensure all fields of RastreadorData are present, even if empty, before casting
      const rastreadorEntry: Omit<RastreadorData, 'id'> = {
        cnpj: entry.cnpj || "",
        empresa: entry.empresa || "",
        franqueado: entry.franqueado || "",
        chassi: entry.chassi || "",
        placa: entry.placa || "",
        rastreador: entry.rastreador || "",
        tipo: entry.tipo || "",
        moto: entry.moto || "",
        mes: entry.mes || "",
        valor: entry.valor || "",
      };
      rastreadoresArray.push(rastreadorEntry);
    }
    return rastreadoresArray;
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
          toast({ title: "Arquivo CSV vazio ou sem dados válidos", variant: "destructive" });
          return;
        }

        // Usar um loop for...of para processar em lote pode ser mais eficiente, 
        // mas para manter a simplicidade com addRastreador individual:
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
          description: error.message || "Não foi possível processar o arquivo. Verifique o formato e os cabeçalhos.",
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
        accept=".csv,text/csv" // Aceitar text/csv para maior compatibilidade
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
        {/*
          RastreadoresList geralmente recebe os dados e funções de manipulação.
          Por enquanto, a importação é feita diretamente na página.
          Considerar refatorar para que RastreadoresList gerencie o estado se necessário.
        */}
        <RastreadoresList rastreadores={[]} onAddRastreador={async (data) => { await addRastreador(data);}} onDeleteRastreador={async (id) => { console.log("delete", id)}} onEditRastreador={(data) => console.log("edit", data)} />
      </div>
    </DashboardLayout>
  );
}
