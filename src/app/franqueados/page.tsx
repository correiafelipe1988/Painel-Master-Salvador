
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
    recolhida: number;
    inadimplente: number;
  };
  totalGeral: number;
}

export default function FranqueadosPage() {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [processedData, setProcessedData] = useState<FranchiseeFleetStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        // Ensure status defaults to 'alugada' if undefined, consistent with other pages
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
      counts: { [K in MotorcycleStatus]: number } & { indefinido: number }; // Added 'indefinido' for safety
      totalGeral: number;
    }> = {};

    allMotorcycles.forEach(moto => {
      const frName = moto.franqueado?.trim() || "Não Especificado";
      if (!franchiseeStats[frName]) {
        franchiseeStats[frName] = {
          counts: {
            active: 0,
            alugada: 0,
            inadimplente: 0,
            manutencao: 0,
            recolhida: 0,
            relocada: 0,
            indefinido: 0, // for unexpected or null statuses
          },
          totalGeral: 0,
        };
      }

      const status = moto.status;
      if (status && franchiseeStats[frName].counts[status] !== undefined) {
        franchiseeStats[frName].counts[status]++;
      } else {
        // Fallback for unexpected or null status, though motorcycleService should prevent this
        franchiseeStats[frName].counts.indefinido++;
        console.warn(`Motorcycle ${moto.placa} has unexpected status: ${status}`);
      }
      franchiseeStats[frName].totalGeral++;
    });

    const dataForTable: FranchiseeFleetStatus[] = Object.entries(franchiseeStats).map(([name, stats]) => ({
      franqueadoName: name,
      counts: {
        alugada: stats.counts.alugada,
        active: stats.counts.active,
        manutencao: stats.counts.manutencao,
        relocada: stats.counts.relocada,
        recolhida: stats.counts.recolhida,
        inadimplente: stats.counts.inadimplente,
      },
      totalGeral: stats.totalGeral,
    })).sort((a, b) => b.totalGeral - a.totalGeral); // Sort by total, descending

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
                Nenhum dado de franqueado encontrado.
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
                    <TableHead className="text-right">Recolhida</TableHead>
                    <TableHead className="text-right">Inadimplente</TableHead>
                    <TableHead className="text-right font-semibold">Total Geral</TableHead>
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
                      <TableCell className="text-right">{item.counts.recolhida}</TableCell>
                      <TableCell className="text-right">{item.counts.inadimplente}</TableCell>
                      <TableCell className="text-right font-bold">{item.totalGeral}</TableCell>
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
