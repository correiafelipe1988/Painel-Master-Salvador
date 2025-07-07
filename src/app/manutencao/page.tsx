"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Database, BarChart3 } from "lucide-react";
import { ManutencaoDataTab } from "@/components/manutencao/manutencao-data-tab";
import { ManutencaoGraficosTab } from "@/components/manutencao/manutencao-graficos-tab";
import { ManutencaoData } from "@/lib/types";
import { subscribeToManutencao } from "@/lib/firebase/manutencaoService";

export default function ManutencaoPage() {
  const [activeTab, setActiveTab] = useState("dados");
  const [data, setData] = useState<ManutencaoData[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToManutencao((manutencaoData) => {
      setData(manutencaoData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Manutenção"
        description="Gestão e análise de manutenção da frota"
        icon={Wrench}
        iconContainerClassName="bg-purple-600"
      />
      
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