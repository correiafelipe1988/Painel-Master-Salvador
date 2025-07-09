"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Users, Clock, BarChart3, Search, X, PieChart } from "lucide-react";
import { subscribeToMotorcycles, calculateActiveIdleDays, hasActiveIdleCount } from "@/lib/firebase/motorcycleService";
import type { Motorcycle } from "@/lib/types";
import { IdleChartsView } from "@/components/predict-idle/idle-charts-view";

interface IdleStats {
  totalMotorcycles: number;
  averageIdleDays: number;
  motorcyclesAbove7Days: number;
  percentageAbove7Days: number;
}

interface FranqueadoStats {
  franqueado: string;
  totalMotorcycles: number;
  averageIdleDays: number;
  motorcyclesAbove7Days: number;
  motorcyclesList: Array<{
    placa: string;
    idleDays: number;
    status: string;
  }>;
}

interface MotorcycleWithIdleDays extends Motorcycle {
  calculatedIdleDays: number | string;
}

export default function IdleReportPage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [franqueadoFilter, setFranqueadoFilter] = useState<string>('all');

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        setMotorcycles(motosFromDB);
      } else {
        console.warn("Data from subscribeToMotorcycles was not an array:", motosFromDB);
        setMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const motorcyclesWithIdleDays = useMemo((): MotorcycleWithIdleDays[] => {
    return motorcycles
      .filter(moto => hasActiveIdleCount(motorcycles, moto))
      .map(moto => ({
        ...moto,
        calculatedIdleDays: calculateActiveIdleDays(motorcycles, moto)
      }));
  }, [motorcycles]);

  // Aplicar filtros
  const filteredMotorcycles = useMemo((): MotorcycleWithIdleDays[] => {
    const normalizeFranqueadoName = (name: string): string => {
      if (!name || name === 'Sem Franqueado') return 'Sem Franqueado';
      
      return name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s*-\s*/g, ' - ');
    };

    return motorcyclesWithIdleDays.filter(moto => {
      // Filtro de busca (placa, franqueado, modelo)
      const searchMatch = searchTerm === '' ||
        (moto.placa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (moto.franqueado || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (moto.model || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de status
      const statusMatch = statusFilter === 'all' || moto.status === statusFilter;

      // Filtro de franqueado com normalização
      const franqueadoMatch = franqueadoFilter === 'all' ||
        normalizeFranqueadoName(moto.franqueado || 'Sem Franqueado') === normalizeFranqueadoName(franqueadoFilter);

      return searchMatch && statusMatch && franqueadoMatch;
    });
  }, [motorcyclesWithIdleDays, searchTerm, statusFilter, franqueadoFilter]);

  // Obter lista única de franqueados para o filtro
  const uniqueFranqueados = useMemo(() => {
    const franqueados = new Set<string>();
    const normalizeFranqueadoName = (name: string): string => {
      if (!name || name === 'Sem Franqueado') return 'Sem Franqueado';
      
      return name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s*-\s*/g, ' - ');
    };

    const consolidatedNames = new Map<string, string>();
    
    motorcyclesWithIdleDays.forEach(moto => {
      const originalName = moto.franqueado || 'Sem Franqueado';
      const normalizedName = normalizeFranqueadoName(originalName);
      
      if (!consolidatedNames.has(normalizedName)) {
        consolidatedNames.set(normalizedName, originalName);
      }
    });
    
    consolidatedNames.forEach((originalName) => {
      franqueados.add(originalName);
    });
    
    return Array.from(franqueados).sort();
  }, [motorcyclesWithIdleDays]);

  const idleStats = useMemo((): IdleStats => {
    const motorcyclesWithNumericIdle = filteredMotorcycles.filter(moto =>
      typeof moto.calculatedIdleDays === 'number' && moto.calculatedIdleDays >= 0
    );

    if (motorcyclesWithNumericIdle.length === 0) {
      return {
        totalMotorcycles: 0,
        averageIdleDays: 0,
        motorcyclesAbove7Days: 0,
        percentageAbove7Days: 0
      };
    }

    const totalIdleDays = motorcyclesWithNumericIdle.reduce((sum, moto) => 
      sum + (moto.calculatedIdleDays as number), 0
    );
    const averageIdleDays = totalIdleDays / motorcyclesWithNumericIdle.length;
    const motorcyclesAbove7Days = motorcyclesWithNumericIdle.filter(moto => 
      (moto.calculatedIdleDays as number) > 7
    ).length;
    const percentageAbove7Days = (motorcyclesAbove7Days / motorcyclesWithNumericIdle.length) * 100;

    return {
      totalMotorcycles: motorcyclesWithNumericIdle.length,
      averageIdleDays: Math.round(averageIdleDays * 10) / 10,
      motorcyclesAbove7Days,
      percentageAbove7Days: Math.round(percentageAbove7Days * 10) / 10
    };
  }, [filteredMotorcycles]);

  const franqueadoStats = useMemo((): FranqueadoStats[] => {
    const franqueadoMap = new Map<string, MotorcycleWithIdleDays[]>();

    // Função para normalizar nomes de franqueados
    const normalizeFranqueadoName = (name: string): string => {
      if (!name || name === 'Sem Franqueado') return 'Sem Franqueado';
      
      return name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ') // Remove espaços extras
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais exceto hífens
        .replace(/\s*-\s*/g, ' - '); // Normaliza hífens
    };

    // Mapa para consolidar franqueados similares
    const consolidatedMap = new Map<string, { originalName: string, motos: MotorcycleWithIdleDays[] }>();

    filteredMotorcycles.forEach(moto => {
      if (typeof moto.calculatedIdleDays === 'number' && moto.calculatedIdleDays >= 0) {
        const originalFranqueado = moto.franqueado || 'Sem Franqueado';
        const normalizedFranqueado = normalizeFranqueadoName(originalFranqueado);
        
        if (!consolidatedMap.has(normalizedFranqueado)) {
          consolidatedMap.set(normalizedFranqueado, {
            originalName: originalFranqueado,
            motos: []
          });
        }
        consolidatedMap.get(normalizedFranqueado)!.motos.push(moto);
      }
    });

    // Converter para o formato final
    consolidatedMap.forEach(({ originalName, motos }, normalizedName) => {
      franqueadoMap.set(originalName, motos);
    });

    return Array.from(franqueadoMap.entries()).map(([franqueado, motos]) => {
      const totalIdleDays = motos.reduce((sum, moto) => sum + (moto.calculatedIdleDays as number), 0);
      const averageIdleDays = totalIdleDays / motos.length;
      const motorcyclesAbove7Days = motos.filter(moto => (moto.calculatedIdleDays as number) > 7).length;

      return {
        franqueado,
        totalMotorcycles: motos.length,
        averageIdleDays: Math.round(averageIdleDays * 10) / 10,
        motorcyclesAbove7Days,
        motorcyclesList: motos
          .filter(moto => (moto.calculatedIdleDays as number) > 7)
          .map(moto => ({
            placa: moto.placa || 'N/A',
            idleDays: moto.calculatedIdleDays as number,
            status: moto.status || 'N/A'
          }))
          .sort((a, b) => b.idleDays - a.idleDays)
      };
    }).sort((a, b) => b.averageIdleDays - a.averageIdleDays);
  }, [filteredMotorcycles]);

  const criticalMotorcycles = useMemo(() => {
    return filteredMotorcycles
      .filter(moto => typeof moto.calculatedIdleDays === 'number' && moto.calculatedIdleDays > 7)
      .map(moto => ({
        placa: moto.placa || 'N/A',
        franqueado: moto.franqueado || 'Sem Franqueado',
        idleDays: moto.calculatedIdleDays as number,
        status: moto.status || 'N/A',
        model: moto.model || 'N/A'
      }))
      .sort((a, b) => b.idleDays - a.idleDays);
  }, [filteredMotorcycles]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFranqueadoFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || franqueadoFilter !== 'all';

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Relatório de Ociosidade"
          description="Análise completa dos dias ociosos da frota"
          icon={BarChart3}
          iconContainerClassName="bg-orange-500"
        />
        <div className="flex justify-center items-center h-64">
          <p>Carregando dados do relatório...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Relatório de Ociosidade"
        description="Análise completa dos dias ociosos da frota"
        icon={BarChart3}
        iconContainerClassName="bg-orange-500"
      />

      {/* Métricas Gerais - agora acima dos filtros */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6 mb-6">
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total de Motos</p>
              <p className="text-2xl font-bold text-blue-500">{idleStats.totalMotorcycles}</p>
              <p className="text-xs text-muted-foreground">Com dados de ociosidade</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Média de Dias Ociosos</p>
              <p className="text-2xl font-bold text-green-500">{idleStats.averageIdleDays}</p>
              <p className="text-xs text-muted-foreground">dias por moto</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Motos +7 Dias</p>
              <p className="text-2xl font-bold text-orange-500">{idleStats.motorcyclesAbove7Days}</p>
              <p className="text-xs text-muted-foreground">{idleStats.percentageAbove7Days}% do total</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Status da Frota</p>
              <div className="text-2xl font-bold">
                {idleStats.percentageAbove7Days > 20 ? (
                  <span className="text-red-600">Crítico</span>
                ) : idleStats.percentageAbove7Days > 10 ? (
                  <span className="text-orange-600">Atenção</span>
                ) : (
                  <span className="text-green-600">Bom</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Baseado em +7 dias</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Pesquisa
          </CardTitle>
          <CardDescription>
            Filtre os dados por placa, franqueado, modelo ou status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Placa, franqueado ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Disponível</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Franqueado</label>
              <Select value={franqueadoFilter} onValueChange={setFranqueadoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os franqueados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Franqueados</SelectItem>
                  {uniqueFranqueados.map((franqueado) => (
                    <SelectItem key={franqueado} value={franqueado}>
                      {franqueado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ações</label>
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Filtros ativos:</strong> Mostrando {filteredMotorcycles.length} de {motorcyclesWithIdleDays.length} motos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerta para Motos Críticas */}

      <Tabs defaultValue="franqueados" className="space-y-4">
        <TabsList>
          <TabsTrigger value="franqueados">Por Franqueado</TabsTrigger>
          <TabsTrigger value="criticas">Motos Críticas</TabsTrigger>
          <TabsTrigger value="graficos">
            <PieChart className="h-4 w-4 mr-2" />
            Gráficos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="franqueados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise por Franqueado</CardTitle>
              <CardDescription>
                Média de dias ociosos e motos críticas por franqueado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Franqueado</TableHead>
                      <TableHead className="text-center">Total Motos</TableHead>
                      <TableHead className="text-center">Média Dias Ociosos</TableHead>
                      <TableHead className="text-center">Motos +7 Dias</TableHead>
                      <TableHead className="text-center">% Críticas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {franqueadoStats.map((stats) => (
                      <TableRow key={stats.franqueado}>
                        <TableCell className="font-medium">{stats.franqueado}</TableCell>
                        <TableCell className="text-center">{stats.totalMotorcycles}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={stats.averageIdleDays > 7 ? "destructive" : stats.averageIdleDays > 5 ? "secondary" : "default"}>
                            {stats.averageIdleDays} dias
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {stats.motorcyclesAbove7Days > 0 ? (
                            <Badge variant="destructive">{stats.motorcyclesAbove7Days}</Badge>
                          ) : (
                            <span className="text-green-600">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {Math.round((stats.motorcyclesAbove7Days / stats.totalMotorcycles) * 100)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criticas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Motos com Mais de 7 Dias Ociosas</CardTitle>
              <CardDescription>
                Lista detalhada de todas as motos que precisam de atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {criticalMotorcycles.length === 0 ? (
                <div className="text-center py-8 text-green-600">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Excelente! Nenhuma moto com mais de 7 dias ociosa.</p>
                  <p className="text-sm text-muted-foreground">Sua frota está bem otimizada.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Placa</TableHead>
                        <TableHead>Franqueado</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Dias Ociosos</TableHead>
                        <TableHead className="text-center">Prioridade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criticalMotorcycles.map((moto) => (
                        <TableRow key={moto.placa}>
                          <TableCell className="font-medium">{moto.placa}</TableCell>
                          <TableCell>{moto.franqueado}</TableCell>
                          <TableCell>{moto.model}</TableCell>
                          <TableCell>
                            <Badge variant={
                              moto.status === 'manutencao' ? 'secondary' :
                              moto.status === 'active' ? 'default' : 'outline'
                            }>
                              {moto.status === 'manutencao' ? 'Manutenção' :
                               moto.status === 'active' ? 'Disponível' : moto.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="destructive">{moto.idleDays} dias</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {moto.idleDays > 15 ? (
                              <Badge variant="destructive">Urgente</Badge>
                            ) : moto.idleDays > 10 ? (
                              <Badge variant="secondary">Alta</Badge>
                            ) : (
                              <Badge variant="outline">Média</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graficos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualização Gráfica dos Dados de Ociosidade</CardTitle>
              <CardDescription>
                Análise visual executiva dos dados de ociosidade por franqueado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IdleChartsView
                data={franqueadoStats.map(stats => ({
                  franqueado: stats.franqueado,
                  totalMotorcycles: stats.totalMotorcycles,
                  averageIdleDays: stats.averageIdleDays,
                  motorcyclesAbove7Days: stats.motorcyclesAbove7Days,
                  percentualCriticas: Math.round((stats.motorcyclesAbove7Days / stats.totalMotorcycles) * 100)
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
