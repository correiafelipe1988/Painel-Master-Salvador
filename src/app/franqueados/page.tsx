"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Bike, Grid3x3, TableIcon, Car, Settings, AlertTriangle, CheckCircle, Shield, MapPin, Wifi, FileText } from "lucide-react";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import type { Motorcycle, MotorcycleStatus } from '@/lib/types';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface FranchiseeFleetStatus {
  franqueadoName: string;
  counts: {
    alugada: number;
    active: number; // Disponível
    manutencao: number;
    relocada: number;
    renegociado: number;
    recolhida: number;
    inadimplente: number;
    indisponivel_rastreador: number;
    indisponivel_emplacamento: number;
    furto_roubo: number;
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

  // Filter states
  const [selectedFranchisee, setSelectedFranchisee] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [franchisees, setFranchisees] = useState<string[]>([]);


  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        const updatedMotorcycles = motosFromDB.map(moto =>
          moto.status === undefined ? { ...moto, status: 'alugada' as MotorcycleStatus } : moto
        );
        setAllMotorcycles(updatedMotorcycles);
         const uniqueFranchisees = Array.from(
          new Set(updatedMotorcycles.map(moto => moto.franqueado?.trim()).filter((franqueado): franqueado is string => !!franqueado))
        ).sort();
        setFranchisees(uniqueFranchisees);

      } else {
        console.warn("Data from subscribeToMotorcycles (franqueados page) was not an array:", motosFromDB);
        setAllMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) {
      setProcessedData([]);
      return;
    }

    // Filter logic
    const filteredMotorcycles = allMotorcycles.filter(moto => {
        const isFranchiseeMatch = !selectedFranchisee || (moto.franqueado?.toLowerCase().includes(selectedFranchisee.toLowerCase()));
        
        // Date filtering logic
        const motoDate = moto.data_ultima_mov ? new Date(moto.data_ultima_mov) : null;
        let isDateMatch = true;
        if(startDate && endDate && motoDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Adjust dates to ignore time
            start.setHours(0,0,0,0);
            end.setHours(23,59,59,999);
            motoDate.setHours(0,0,0,0);
            isDateMatch = motoDate >= start && motoDate <= end;
        } else if (startDate && motoDate) {
            const start = new Date(startDate);
            start.setHours(0,0,0,0);
            motoDate.setHours(0,0,0,0);
            isDateMatch = motoDate >= start;
        } else if (endDate && motoDate) {
            const end = new Date(endDate);
            end.setHours(23,59,59,999);
            motoDate.setHours(0,0,0,0);
            isDateMatch = motoDate <= end;
        }

        return isFranchiseeMatch && isDateMatch;
    });


    // Aplicar regra de placas únicas: considerar apenas a última atualização por placa
    const uniqueMotorcyclesByPlaca: { [placa: string]: Motorcycle } = {};
    filteredMotorcycles.forEach(moto => {
      if (!moto.placa) return;
      const existingMoto = uniqueMotorcyclesByPlaca[moto.placa];
      if (!existingMoto ||
          (moto.data_ultima_mov && existingMoto.data_ultima_mov && new Date(moto.data_ultima_mov) > new Date(existingMoto.data_ultima_mov)) ||
          (moto.data_ultima_mov && !existingMoto.data_ultima_mov)) {
        uniqueMotorcyclesByPlaca[moto.placa] = moto;
      }
    });
    const representativeMotorcycles = Object.values(uniqueMotorcyclesByPlaca);

    const franchiseeStats: Record<string, {
      counts: { [K in MotorcycleStatus]: number } & { indefinido: number };
      totalGeral: number;
    }> = {};

    representativeMotorcycles.forEach(moto => {
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
            renegociado: 0,
            recolhida: 0,
            inadimplente: 0,
            indisponivel_rastreador: 0,
            indisponivel_emplacamento: 0,
            furto_roubo: 0,
            indefinido: 0,
          },
          totalGeral: 0,
        };
      }

      const status = moto.status;
      console.log('Processando moto:', moto.placa, 'Status:', status, 'Franqueado:', frName);
      if (status && (status === 'active' || status === 'alugada' || status === 'manutencao' || status === 'relocada' || status === 'renegociado' || status === 'recolhida' || status === 'inadimplente' || status === 'indisponivel_rastreador' || status === 'indisponivel_emplacamento' || status === 'furto_roubo')) {
        console.log('Status válido, incrementando contador para:', status);
        franchiseeStats[frName].counts[status]++;
      } else {
        console.log('Status inválido ou undefined, indo para indefinido:', status);
        franchiseeStats[frName].counts.indefinido++;
      }
      franchiseeStats[frName].totalGeral++;
    });

    const dataForTable: FranchiseeFleetStatus[] = Object.entries(franchiseeStats).map(([name, stats]) => {
      const totalLocadasCount = stats.counts.alugada + stats.counts.relocada + stats.counts.renegociado;
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
          renegociado: stats.counts.renegociado,
          recolhida: stats.counts.recolhida,
          inadimplente: stats.counts.inadimplente,
          indisponivel_rastreador: stats.counts.indisponivel_rastreador,
          indisponivel_emplacamento: stats.counts.indisponivel_emplacamento,
          furto_roubo: stats.counts.furto_roubo,
        },
        totalGeral: stats.totalGeral,
        percentLocadas,
        percentManutencao,
        percentDisponivel,
      };
    }).sort((a, b) => b.totalGeral - a.totalGeral); 

    setProcessedData(dataForTable);

  }, [allMotorcycles, isLoading, selectedFranchisee, startDate, endDate]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Análise de Franqueados"
        description="Performance e distribuição da frota por franqueado."
        icon={Users}
        iconContainerClassName="bg-primary"
      />

        <Card className="mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="franchisee-search">Franqueado</Label>
                    <Input
                      id="franchisee-search"
                      placeholder="Buscar por franqueado"
                      value={selectedFranchisee}
                      onChange={e => setSelectedFranchisee(e.target.value)}
                      className="w-full"
                    />
                </div>
                <div>
                    <Label htmlFor="start-date">Data de Início</Label>
                    <Input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="end-date">Data de Fim</Label>
                    <Input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>
        </Card>


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
                Nenhum dado encontrado para os filtros selecionados.
                <br />
                Ajuste os filtros ou verifique os dados cadastrados.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="table" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Visualização em Tabela
                </TabsTrigger>
                <TabsTrigger value="cards" className="flex items-center gap-2">
                  <Grid3x3 className="h-4 w-4" />
                  Visualização em Cards
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="table">
                <div className="mt-6 overflow-x-auto">
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
                      <div>Disponível</div>
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
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          item.percentDisponivel < 4.5
                            ? "bg-green-100 text-green-700"
                            : item.percentDisponivel <= 7
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {item.percentDisponivel.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="cards">
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {processedData.map((item) => (
                    <Card key={item.franqueadoName} className="shadow-md hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
                        <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
                          <Bike className="h-5 w-5" />
                          {item.franqueadoName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {/* Status Operacionais */}
                          
                          {/* Alugada (soma de alugada + relocada + renegociado) */}
                          {(item.counts.alugada + item.counts.relocada + item.counts.renegociado) > 0 && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <Car className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Alugada</p>
                                  <p className="text-sm text-gray-600">Em operação</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{item.counts.alugada + item.counts.relocada + item.counts.renegociado}</div>
                                <div className="text-sm font-medium text-blue-600">
                                  {item.totalGeral > 0 ? (((item.counts.alugada + item.counts.relocada + item.counts.renegociado) / item.totalGeral) * 100).toFixed(0) : 0}%
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Disponível */}
                          {item.counts.active > 0 && (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Disponível</p>
                                  <p className="text-sm text-gray-600">Pronta para uso</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">{item.counts.active}</div>
                                <div className="text-sm font-medium text-green-600">
                                  {item.totalGeral > 0 ? ((item.counts.active / item.totalGeral) * 100).toFixed(0) : 0}%
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Manutenção */}
                          {item.counts.manutencao > 0 && (
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-full">
                                  <Settings className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Manutenção</p>
                                  <p className="text-sm text-gray-600">Em reparo</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-yellow-600">{item.counts.manutencao}</div>
                                <div className="text-sm font-medium text-yellow-600">
                                  {item.totalGeral > 0 ? ((item.counts.manutencao / item.totalGeral) * 100).toFixed(0) : 0}%
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Status Problemáticos */}
                          
                          {/* Inadimplente */}
                          {item.counts.inadimplente > 0 && (
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-full">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Inadimplente</p>
                                  <p className="text-sm text-gray-600">Cliente em débito</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-red-600">{item.counts.inadimplente}</div>
                                <div className="text-sm font-medium text-red-600">
                                  {item.totalGeral > 0 ? ((item.counts.inadimplente / item.totalGeral) * 100).toFixed(0) : 0}%
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Recolhida */}
                          {item.counts.recolhida > 0 && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-gray-500">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-full">
                                  <Shield className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Recolhida</p>
                                  <p className="text-sm text-gray-600">Fora de operação</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-600">{item.counts.recolhida}</div>
                                <div className="text-sm font-medium text-gray-600">
                                  {item.totalGeral > 0 ? ((item.counts.recolhida / item.totalGeral) * 100).toFixed(0) : 0}%
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Indisponível Rastreador */}
                          {item.counts.indisponivel_rastreador > 0 && (
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-full">
                                  <Wifi className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Sem Rastreador</p>
                                  <p className="text-sm text-gray-600">Problema técnico</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-orange-600">{item.counts.indisponivel_rastreador}</div>
                                <div className="text-sm font-medium text-orange-600">
                                  {item.totalGeral > 0 ? ((item.counts.indisponivel_rastreador / item.totalGeral) * 100).toFixed(0) : 0}%
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Indisponível Emplacamento */}
                          {item.counts.indisponivel_emplacamento > 0 && (
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-full">
                                  <FileText className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Sem Emplacamento</p>
                                  <p className="text-sm text-gray-600">Aguardando documentação</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-purple-600">{item.counts.indisponivel_emplacamento}</div>
                                <div className="text-sm font-medium text-purple-600">
                                  {item.totalGeral > 0 ? ((item.counts.indisponivel_emplacamento / item.totalGeral) * 100).toFixed(0) : 0}%
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Furto/Roubo */}
                          {item.counts.furto_roubo > 0 && (
                            <div className="flex items-center justify-between p-3 bg-black/5 rounded-lg border-l-4 border-black">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-black/10 rounded-full">
                                  <Shield className="h-4 w-4 text-black" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Furto/Roubo</p>
                                  <p className="text-sm text-gray-600">Ocorrência policial</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-black">{item.counts.furto_roubo}</div>
                                <div className="text-sm font-medium text-black">
                                  {item.totalGeral > 0 ? ((item.counts.furto_roubo / item.totalGeral) * 100).toFixed(0) : 0}%
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Total */}
                          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border-2 border-gray-300 mt-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-200 rounded-full">
                                <Bike className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">TOTAL GERAL</p>
                                <p className="text-sm text-gray-600">Toda a frota</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-gray-800">{item.totalGeral}</div>
                              <div className="text-sm font-medium text-gray-600">100%</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
