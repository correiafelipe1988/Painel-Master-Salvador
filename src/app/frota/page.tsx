"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Package, Users, DollarSign, Clock, TrendingUp, Bike } from "lucide-react";
import type { Motorcycle } from "@/lib/types";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { FleetOverviewCards } from "@/components/frota/fleet-overview-cards";
import { ModelAnalysisTable } from "@/components/frota/model-analysis-table";
import { FranchiseeDistributionChart } from "@/components/frota/franchisee-distribution-chart";
import { ModelPerformanceChart } from "@/components/frota/model-performance-chart";
import { AverageRentalTime } from "@/components/frota/average-rental-time";

export default function FrotaPage() {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        setAllMotorcycles(motosFromDB);
      } else {
        console.warn("Data from subscribeToMotorcycles (frota page) was not an array:", motosFromDB);
        setAllMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Processar dados únicos por placa
  const uniqueMotorcycles = useMemo(() => {
    if (!Array.isArray(allMotorcycles)) return [];
    
    const uniqueByPlaca: { [placa: string]: Motorcycle } = {};
    
    allMotorcycles.forEach(moto => {
      if (!moto.placa) return;
      
      const existing = uniqueByPlaca[moto.placa];
      if (!existing || 
          (moto.data_ultima_mov && existing.data_ultima_mov && 
           new Date(moto.data_ultima_mov) > new Date(existing.data_ultima_mov))) {
        uniqueByPlaca[moto.placa] = moto;
      }
    });
    
    return Object.values(uniqueByPlaca);
  }, [allMotorcycles]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader 
          title="Análise da Frota" 
          description="Gestão completa de modelos, performance e manutenção" 
          icon={Package}
          iconContainerClassName="bg-blue-600"
        />
        <div className="flex justify-center items-center h-96">
          <p>Carregando dados da frota...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Análise da Frota"
        description="Gestão completa de modelos, performance e manutenção da frota"
        icon={Package}
        iconContainerClassName="bg-blue-600"
      />

      {/* KPIs da Frota */}
      <div className="mt-6">
        <FleetOverviewCards motorcycles={uniqueMotorcycles} isLoading={isLoading} />
      </div>

      {/* Tabs com diferentes análises */}
      <div className="mt-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="models">Modelos</TabsTrigger>
            <TabsTrigger value="distribution">Distribuição</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="rental-time">Tempo Médio Locação</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Resumo por Modelo */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bike className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">Modelos na Frota</CardTitle>
                      <CardDescription>Distribuição por modelo de motocicleta</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ModelAnalysisTable motorcycles={uniqueMotorcycles} compact={true} />
                </CardContent>
              </Card>

              {/* Status da Frota */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">Status da Frota</CardTitle>
                      <CardDescription>Distribuição por status operacional</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { status: 'alugada', label: 'Alugadas', color: 'bg-blue-100 text-blue-700' },
                      { status: 'active', label: 'Disponíveis', color: 'bg-green-100 text-green-700' },
                      { status: 'relocada', label: 'Relocadas', color: 'bg-gray-100 text-gray-700' },
                      { status: 'manutencao', label: 'Manutenção', color: 'bg-purple-100 text-purple-700' },
                      { status: 'recolhida', label: 'Recolhidas', color: 'bg-orange-100 text-orange-700' }
                    ].map(({ status, label, color }) => {
                      const count = uniqueMotorcycles.filter(m => m.status === status).length;
                      const percentage = uniqueMotorcycles.length > 0 ? (count / uniqueMotorcycles.length * 100).toFixed(1) : '0';
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{label}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={color}>{count} motos</Badge>
                            <span className="text-xs text-gray-500">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bike className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="font-headline">Análise Detalhada por Modelo</CardTitle>
                    <CardDescription>Performance, quantidade e distribuição por modelo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ModelAnalysisTable motorcycles={uniqueMotorcycles} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  <div>
                    <CardTitle className="font-headline">Distribuição por Franqueado</CardTitle>
                    <CardDescription>Modelos de motos por franqueado</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FranchiseeDistributionChart motorcycles={uniqueMotorcycles} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle className="font-headline">Performance Financeira por Modelo</CardTitle>
                    <CardDescription>Ticket médio, receita e ocupação por modelo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ModelPerformanceChart motorcycles={uniqueMotorcycles} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rental-time" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="font-headline">Tempo Médio de Locação</CardTitle>
                    <CardDescription>Análise do tempo médio de locação por modelo e período</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AverageRentalTime motorcycles={uniqueMotorcycles} />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  );
}