
"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Bike } from "lucide-react";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import type { Motorcycle, MotorcycleStatus } from '@/lib/types';
import { cn } from "@/lib/utils";

interface FranchiseeFleetStatus {
  franqueadoName: string;
  counts: {
    alugada: number;
    active: number; // Disponível
    manutencao: number;
    relocada: number;
    // Removido: recolhida e inadimplente
  };
  totalGeral: number;
  percentLocadas: number;
  percentManutencao: number;
  percentDisponivel: number;
}

export default function FranqueadosPage() {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [processedData, setProcessedData] = useState<FranchiseeFleetStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        const updatedMotorcycles = motosFromDB.map(moto =>
          moto.status === undefined ? { ...moto, status: 'alugada' as MotorcycleStatus } : moto
        );
        setAllMotorcycles(updatedMotorcycles);
      } else {
        console.warn("Data from subscribeToMotorcycles (franqueados page) was not an array:", motosFromDB);
        setAllMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) {
      setProcessedData([]);
      return;
    }

    const franchiseeStats: Record<string, {
      counts: { [K in Exclude<MotorcycleStatus, 'recolhida' | 'inadimplente'>]: number } & { indefinido: number }; // Exclui recolhida e inadimplente
      totalGeral: number;
    }> = {};

    allMotorcycles.forEach(moto => {
      const frNameTrimmed = moto.franqueado?.trim();

      if (!frNameTrimmed || frNameTrimmed === "Não Especificado" || frNameTrimmed === "") {
        return; 
      }
      
      const frName = frNameTrimmed;

      if (!franchiseeStats[frName]) {
        franchiseeStats[frName] = {
          counts: {
            active: 0,
            alugada: 0,
            manutencao: 0,
            relocada: 0,
            indefinido: 0,
            // Não inicializa recolhida e inadimplente
          },
          totalGeral: 0,
        };
      }

      const status = moto.status;
      // Somente contabiliza os status relevantes para a nova tabela
      if (status && (status === 'active' || status === 'alugada' || status === 'manutencao' || status === 'relocada')) {
        franchiseeStats[frName].counts[status]++;
      } else if (status && (status === 'recolhida' || status === 'inadimplente')) {
        // Status removidos da exibição direta, mas ainda contam para o total geral
      } else {
        franchiseeStats[frName].counts.indefinido++;
        console.warn(`Motorcycle ${moto.placa} has unexpected or irrelevant status: ${status} for franchisee ${frName}`);
      }
      franchiseeStats[frName].totalGeral++; // Total geral considera todas as motos do franqueado, independente do status visível
    });

    const dataForTable: FranchiseeFleetStatus[] = Object.entries(franchiseeStats).map(([name, stats]) => {
      const totalLocadasCount = stats.counts.alugada + stats.counts.relocada;
      const percentLocadas = stats.totalGeral > 0 ? (totalLocadasCount / stats.totalGeral) * 100 : 0;
      const percentManutencao = stats.totalGeral > 0 ? (stats.counts.manutencao / stats.totalGeral) * 100 : 0;
      const percentDisponivel = stats.totalGeral > 0 ? (stats.counts.active / stats.totalGeral) * 100 : 0;
      
      return {
        franqueadoName: name,
        counts: {
          alugada: stats.counts.alugada,
          active: stats.counts.active,
          manutencao: stats.counts.manutencao,
          relocada: stats.counts.relocada,
        },
        totalGeral: stats.totalGeral,
        percentLocadas,
        percentManutencao,
        percentDisponivel,
      };
    }).sort((a, b) => b.totalGeral - a.totalGeral); 

    setProcessedData(dataForTable);

  }, [allMotorcycles, isLoading]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Análise de Franqueados"
        description="Performance e distribuição da frota por franqueado."
        icon={Users}
        iconContainerClassName="bg-primary"
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Bike className="h-6 w-6 text-primary" />
            Status da Frota por Franqueado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg min-h-[300px] bg-muted/50">
              <Users className="h-24 w-24 text-muted-foreground mb-4 animate-pulse" />
              <p className="text-muted-foreground text-center">
                Carregando dados dos franqueados...
              </p>
            </div>
          ) : processedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg min-h-[300px] bg-muted/50">
              <Users className="h-24 w-24 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhum dado de franqueado válido encontrado.
                <br />
                Verifique se há motocicletas cadastradas com informações de franqueado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Franqueado</TableHead>
                    <TableHead className="text-right">Alugada</TableHead>
                    <TableHead className="text-right">Disponível</TableHead>
                    <TableHead className="text-right">Manutenção</TableHead>
                    <TableHead className="text-right">Relocada</TableHead>
                    <TableHead className="text-right font-semibold">Total Geral</TableHead>
                    <TableHead className="text-right">
                      <div className="text-xs text-muted-foreground">Meta 91%</div>
                      <div>Locadas</div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="text-xs text-muted-foreground">Meta &lt; 5%</div>
                      <div>Manutenção</div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="text-xs text-muted-foreground">Meta &gt; 4,5%</div>
                      <div>% Disponível</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.map((item) => (
                    <TableRow key={item.franqueadoName}>
                      <TableCell className="text-left font-medium">{item.franqueadoName}</TableCell>
                      <TableCell className="text-right">{item.counts.alugada}</TableCell>
                      <TableCell className="text-right">{item.counts.active}</TableCell>
                      <TableCell className="text-right">{item.counts.manutencao}</TableCell>
                      <TableCell className="text-right">{item.counts.relocada}</TableCell>
                      <TableCell className="text-right font-bold">{item.totalGeral}</TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          item.percentLocadas >= 91
                            ? "bg-green-100 text-green-700"
                            : item.percentLocadas >= 85
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {item.percentLocadas.toFixed(1)}%
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          item.percentManutencao > 5
                            ? "bg-red-100 text-red-700"
                            : item.percentManutencao >= 3
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        )}
                      >
                        {item.percentManutencao.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">{item.percentDisponivel.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
