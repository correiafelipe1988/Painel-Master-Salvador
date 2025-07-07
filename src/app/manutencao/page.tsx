"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Database, BarChart3, FileText, Download } from "lucide-react";
import { ManutencaoDataTab } from "@/components/manutencao/manutencao-data-tab";
import { ManutencaoGraficosTab } from "@/components/manutencao/manutencao-graficos-tab";
import { ManutencaoData } from "@/lib/types";
import { subscribeToManutencao } from "@/lib/firebase/manutencaoService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { addManutencao, importManutencaoBatch, deleteAllManutencao } from "@/lib/firebase/manutencaoService";

export default function ManutencaoPage() {
  const [activeTab, setActiveTab] = useState("dados");
  const [data, setData] = useState<ManutencaoData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToManutencao((manutencaoData) => {
      setData(manutencaoData);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... copiar lógica de importação do ManutencaoDataTab ...
  };

  const handleExportCSV = () => {
    // ... copiar lógica de exportação do ManutencaoDataTab ...
  };

  const handleClear = async () => {
    // ... copiar lógica de limpeza do ManutencaoDataTab ...
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Manutenção"
        description="Gestão e análise de manutenção da frota"
        icon={Wrench}
        iconContainerClassName="bg-purple-600"
      />
      <div className="flex flex-wrap gap-2 mb-4 justify-end">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          {isUploading ? "Processando..." : "Importar Dados"}
        </Button>
        <Input
          id="csvFile"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          ref={fileInputRef}
          disabled={isUploading}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar
        </Button>
        <Button
          variant="outline"
          onClick={handleClear}
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          Limpar
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dados" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dados
          </TabsTrigger>
          <TabsTrigger value="graficos" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Gráficos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dados" className="space-y-6">
          <ManutencaoDataTab />
        </TabsContent>
        
        <TabsContent value="graficos" className="space-y-6">
          <ManutencaoGraficosTab data={data} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}