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

      {/* KPIs de Manutenção */}
      <div className="mt-6">
        {data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 pb-2">
                <h3 className="text-sm font-medium text-gray-600">Total de Manutenções</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="text-2xl font-bold text-gray-900">{data.length}</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 pb-2">
                <h3 className="text-sm font-medium text-gray-600">Valor Total</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="text-2xl font-bold text-gray-900">
                  R$ {data.reduce((sum, item) => sum + item.valor_total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 pb-2">
                <h3 className="text-sm font-medium text-gray-600">Valor Médio</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="text-2xl font-bold text-gray-900">
                  R$ {(data.reduce((sum, item) => sum + item.valor_total, 0) / data.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 pb-2">
                <h3 className="text-sm font-medium text-gray-600">Clientes Únicos</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(data.map(item => item.nome_cliente)).size}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 pb-2">
                <h3 className="text-sm font-medium text-gray-600">Total de Manutenções</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="text-2xl font-bold text-gray-900">0</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 pb-2">
                <h3 className="text-sm font-medium text-gray-600">Valor Total</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="text-2xl font-bold text-gray-900">R$ 0,00</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 pb-2">
                <h3 className="text-sm font-medium text-gray-600">Valor Médio</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="text-2xl font-bold text-gray-900">R$ 0,00</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 pb-2">
                <h3 className="text-sm font-medium text-gray-600">Clientes Únicos</h3>
              </div>
              <div className="px-4 pb-4">
                <div className="text-2xl font-bold text-gray-900">0</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs com diferentes visões */}
      <div className="mt-8">
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
      </div>
    </DashboardLayout>
  );
}