
"use client";

import { useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { RastreadoresList } from "@/components/rastreadores/rastreadores-list";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addRastreador } from "@/lib/firebase/rastreadorService";

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

  const parseCSV = (csvText: string): Omit<RastreadorData, 'id'>[] => {
    let cleanedCsvText = csvText;
    if (cleanedCsvText.charCodeAt(0) === 0xFEFF) { // Remove BOM, if present
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
    
    const normalizeHeader = (header: string) => header.toLowerCase().trim().replace(/\s+/g, ' ');
    const headers = parseCsvLine(lines[0]).map(normalizeHeader);
    
    const requiredHeaders = ["cnpj", "empresa", "franqueado", "chassi", "placa", "rastreador", "tipo", "moto", "mes", "valor"];
    const headerMap: { [key in keyof RastreadorData]?: number } = {};
    
    requiredHeaders.forEach(reqHeader => {
      const index = headers.indexOf(normalizeHeader(reqHeader));
      if (index === -1) {
        throw new Error(`CSV inválido: O cabeçalho obrigatório "${reqHeader}" não foi encontrado. Cabeçalhos detectados: ${headers.join(', ')}`);
      }
      headerMap[reqHeader as keyof RastreadorData] = index;
    });

    const rastreadoresArray: Omit<RastreadorData, 'id'>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const entry: Partial<RastreadorData> = {};

      // Check if any required field is missing data in this row by checking its index
      let skipRow = false;
      for (const reqHeader of requiredHeaders) {
          const reqHeaderKey = reqHeader as keyof RastreadorData;
          if (headerMap[reqHeaderKey] === undefined || values[headerMap[reqHeaderKey]!] === undefined || values[headerMap[reqHeaderKey]!].trim() === '') {
              // Only consider a row problematic if a *required* header's value is truly empty.
              // For now, let's assume all fields are somewhat expected. If 'cnpj' is critical, check specifically.
              if (reqHeaderKey === 'cnpj' && (values[headerMap[reqHeaderKey]!] === undefined || values[headerMap[reqHeaderKey]!].trim() === '')) {
                console.warn(`Linha ${i+1} do CSV ignorada por falta de CNPJ.`);
                skipRow = true;
                break;
              }
          }
      }
      if (skipRow) continue;


      (Object.keys(headerMap) as Array<keyof RastreadorData>).forEach(key => {
        const index = headerMap[key];
        if (index !== undefined && index < values.length) {
          entry[key] = values[index];
        } else {
          entry[key] = ""; // Default to empty string if column is missing for this row
        }
      });
      rastreadoresArray.push(entry as Omit<RastreadorData, 'id'>);
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
        toast({ title: "Erro ao ler arquivo", description: "Não foi possível ler o conteúdo do arquivo.", variant: "destructive" });
        return;
      }
      
      try {
        const parsedData = parseCSV(text);
        if (parsedData.length === 0) {
          toast({ title: "Nenhum dado para importar", description: "O arquivo CSV estava vazio ou não continha dados válidos.", variant: "destructive" });
          return;
        }

        for (const rastreadorData of parsedData) {
          // Ensure all fields are present, even if empty, before sending to Firestore
          const completeData: RastreadorData = {
            cnpj: rastreadorData.cnpj || "",
            empresa: rastreadorData.empresa || "",
            franqueado: rastreadorData.franqueado || "",
            chassi: rastreadorData.chassi || "",
            placa: rastreadorData.placa || "",
            rastreador: rastreadorData.rastreador || "",
            tipo: rastreadorData.tipo || "",
            moto: rastreadorData.moto || "",
            mes: rastreadorData.mes || "",
            valor: rastreadorData.valor || "",
          };
          await addRastreador(completeData);
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
         if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
    };
    
    reader.readAsText(file);
  }, [toast]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

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
