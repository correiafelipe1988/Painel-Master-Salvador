"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileSpreadsheet, Search, DollarSign, Bike, TrendingUp, TrendingDown } from "lucide-react";
import type { Motorcycle } from "@/lib/types";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { calculateFranchiseeRevenue, type FranchiseeRevenue } from '@/lib/firebase/financialService';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type SortField = 'name' | 'revenue' | 'motorcycles' | 'occupation' | 'averageTicket';
type SortDirection = 'asc' | 'desc';

export default function ReceitaFranqueadosPage() {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [minRevenue, setMinRevenue] = useState("");
  const [maxRevenue, setMaxRevenue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        setAllMotorcycles(motosFromDB);
      } else {
        console.warn("Data from subscribeToMotorcycles (receita franqueados) was not an array:", motosFromDB);
        setAllMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const franchiseeData = useMemo(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) {
      return [];
    }

    let data = calculateFranchiseeRevenue(allMotorcycles);

    // Filtrar por termo de busca
    if (searchTerm) {
      data = data.filter(item => 
        item.franqueadoName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por faixa de receita
    if (minRevenue) {
      const min = parseFloat(minRevenue);
      data = data.filter(item => item.weeklyRevenue >= min);
    }
    if (maxRevenue) {
      const max = parseFloat(maxRevenue);
      data = data.filter(item => item.weeklyRevenue <= max);
    }

    // Ordenar
    data.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'name':
          aValue = a.franqueadoName;
          bValue = b.franqueadoName;
          break;
        case 'revenue':
          aValue = a.weeklyRevenue;
          bValue = b.weeklyRevenue;
          break;
        case 'motorcycles':
          aValue = a.motorcycleCount;
          bValue = b.motorcycleCount;
          break;
        case 'occupation':
          aValue = a.occupationRate;
          bValue = b.occupationRate;
          break;
        case 'averageTicket':
          aValue = a.averageRevenuePerMoto;
          bValue = b.averageRevenuePerMoto;
          break;
        default:
          aValue = a.weeklyRevenue;
          bValue = b.weeklyRevenue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? 
        (aValue as number) - (bValue as number) : 
        (bValue as number) - (aValue as number);
    });

    return data;
  }, [allMotorcycles, isLoading, searchTerm, sortField, sortDirection, minRevenue, maxRevenue]);

  const totalStats = useMemo(() => {
    if (franchiseeData.length === 0) {
      return {
        totalRevenue: 0,
        totalMotorcycles: 0,
        averageOccupation: 0,
        totalFranchisees: 0
      };
    }

    const totalRevenue = franchiseeData.reduce((sum, item) => sum + item.weeklyRevenue, 0);
    const totalMotorcycles = franchiseeData.reduce((sum, item) => sum + item.motorcycleCount, 0);
    const averageOccupation = franchiseeData.reduce((sum, item) => sum + item.occupationRate, 0) / franchiseeData.length;

    return {
      totalRevenue,
      totalMotorcycles,
      averageOccupation,
      totalFranchisees: franchiseeData.length
    };
  }, [franchiseeData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportExcel = () => {
    toast({ 
      title: "Funcionalidade em Desenvolvimento",
      description: "A exportação de dados de receita por franqueado será implementada em breve."
    });
  };

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getOccupationBadge = (rate: number) => {
    if (rate >= 91) return { variant: "default" as const, color: "bg-green-100 text-green-700" };
    if (rate >= 85) return { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-700" };
    return { variant: "destructive" as const, color: "bg-red-100 text-red-700" };
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <TrendingUp className="h-4 w-4 ml-1" /> : 
      <TrendingDown className="h-4 w-4 ml-1" />;
  };

  const pageActions = (
    <Button onClick={handleExportExcel} variant="default" className="bg-green-600 hover:bg-green-700 text-white">
      <FileSpreadsheet className="mr-2 h-4 w-4" /> 
      Exportar
    </Button>
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Receita por Franqueado"
        description="Análise detalhada da receita semanal por franqueado"
        icon={Users}
        iconContainerClassName="bg-blue-600"
        actions={pageActions}
      />

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar Franqueado</Label>
              <Input
                id="search"
                placeholder="Nome do franqueado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="min-revenue">Receita Mínima (R$)</Label>
              <Input
                id="min-revenue"
                type="number"
                placeholder="0.00"
                value={minRevenue}
                onChange={(e) => setMinRevenue(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="max-revenue">Receita Máxima (R$)</Label>
              <Input
                id="max-revenue"
                type="number"
                placeholder="10000.00"
                value={maxRevenue}
                onChange={(e) => setMaxRevenue(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sort">Ordenar por</Label>
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger id="sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="motorcycles">Qtd Motos</SelectItem>
                  <SelectItem value="occupation">Taxa Ocupação</SelectItem>
                  <SelectItem value="averageTicket">Ticket Médio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Resumo */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(totalStats.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Motos</p>
                <p className="text-lg font-bold text-blue-600">
                  {totalStats.totalMotorcycles}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Franqueados</p>
                <p className="text-lg font-bold text-purple-600">
                  {totalStats.totalFranchisees}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ocupação Média</p>
                <p className="text-lg font-bold text-orange-600">
                  {totalStats.averageOccupation.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            Receita Detalhada por Franqueado
          </CardTitle>
          <CardDescription>
            {franchiseeData.length} franqueado(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando dados de receita...</p>
            </div>
          ) : franchiseeData.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Nenhum franqueado encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Franqueado
                        <SortIcon field="name" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('revenue')}
                    >
                      <div className="flex items-center justify-end">
                        Receita Semanal
                        <SortIcon field="revenue" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Receita Mensal</TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('motorcycles')}
                    >
                      <div className="flex items-center justify-end">
                        Qtd Motos
                        <SortIcon field="motorcycles" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('averageTicket')}
                    >
                      <div className="flex items-center justify-end">
                        Ticket Médio
                        <SortIcon field="averageTicket" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('occupation')}
                    >
                      <div className="flex items-center justify-end">
                        Taxa Ocupação
                        <SortIcon field="occupation" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {franchiseeData.map((item) => {
                    const occupationBadge = getOccupationBadge(item.occupationRate);
                    return (
                      <TableRow key={item.franqueadoName} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.franqueadoName}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(item.weeklyRevenue)}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {formatCurrency(item.monthlyRevenue)}
                        </TableCell>
                        <TableCell className="text-right">{item.motorcycleCount}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.averageRevenuePerMoto)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={cn("font-medium", occupationBadge.color)}>
                            {item.occupationRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}