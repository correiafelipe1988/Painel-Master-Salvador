"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { RastreadoresList } from "@/components/rastreadores/rastreadores-list";
import { Button } from "@/components/ui/button";
import { Upload, X, BarChartBig, SatelliteDish, DollarSign, Calendar, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  addRastreador, 
  subscribeToRastreadores,
  deleteRastreador as deleteRastreadorFromDB,
  updateRastreador as updateRastreadorInDB,
  RastreadorData,
} from "@/lib/firebase/rastreadorService";
import { normalizeHeader } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RastreadorFilters, RastreadorFiltersState } from "@/components/rastreadores/rastreador-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrackerInstallationRevenueChart } from "@/components/charts/tracker-installation-revenue-chart";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { type Kpi } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const monthFullNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const processTrackerData = (rastreadores: RastreadorData[], selectedMonth: string) => {
    const filteredByMonth = selectedMonth === 'all'
        ? rastreadores
        : rastreadores.filter(r => r.mes.toLowerCase() === selectedMonth);

    const monthlyInstallations = Array(12).fill(0);
    const monthlyRevenue = Array(12).fill(0);
    
    filteredByMonth.forEach(rastreador => {
        const mesIndex = monthFullNames.indexOf(rastreador.mes.toLowerCase());
        if (mesIndex !== -1) {
            monthlyInstallations[mesIndex]++;
            monthlyRevenue[mesIndex] += parseFloat(rastreador.valor) || 0;
        }
    });

    const totalInstallations = filteredByMonth.length;
    const totalRevenue = filteredByMonth.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0);
    
    const chartData = monthFullNames.map((m, i) => ({
      month: m.substring(0, 3),
      count: monthlyInstallations[i],
      revenue: monthlyRevenue[i],
    }));

    return {
        kpiData: [
            { title: "Rastreadores Instalados", value: totalInstallations.toString(), icon: SatelliteDish, description: "Total no período", color: "text-indigo-700" },
            { title: "Receita de Rastreadores", value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, description: "Soma no período", color: "text-green-600" },
        ],
        chartData,
    }
};

export default function RastreadoresPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rastreadoresData, setRastreadoresData] = useState<RastreadorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRastreador, setEditingRastreador] = useState<RastreadorData | null>(null);
  const [currentFormData, setCurrentFormData] = useState<Omit<RastreadorData, 'id'>>({
    cnpj: "", empresa: "", franqueado: "", chassi: "", placa: "",
    rastreador: "", tipo: "", moto: "", mes: "", valor: "",
  });

  const [filters, setFilters] = useState<RastreadorFiltersState>({
    searchTerm: '', status: 'all', franqueado: 'all',
  });

  // Lista de IDs permitidos
  const allowedUsers = [
    "1dpkLRLH3Sgm5hTkmNJAlfDQgoP2",
    "FOHbVCbMyhadO3tm1rVdknwLVPr1",
    "orbGQ8lbCfb51KuJlD5oSflsLRx1",
    "edsTZ2zG54Ph2ZoNSyFZXoJj74s2"
  ];

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToRastreadores((dataFromDB) => {
      setRastreadoresData(Array.isArray(dataFromDB) ? dataFromDB : []);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const franqueadosUnicos = useMemo(() => {
    const franqueadoSet = new Set(rastreadoresData.map(r => r.franqueado).filter(Boolean));
    return Array.from(franqueadoSet);
  }, [rastreadoresData]);

  const filteredRastreadores = useMemo(() => {
    return rastreadoresData.filter(r => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const searchMatch = !filters.searchTerm ||
        r.placa?.toLowerCase().includes(searchTermLower) ||
        r.rastreador?.toLowerCase().includes(searchTermLower) ||
        r.chassi?.toLowerCase().includes(searchTermLower);
      const statusMatch = filters.status === 'all' || r.tipo?.toLowerCase() === filters.status;
      const franqueadoMatch = filters.franqueado === 'all' || r.franqueado === filters.franqueado;
      return searchMatch && statusMatch && franqueadoMatch;
    });
  }, [rastreadoresData, filters]);
  
  const { kpiData, chartData } = useMemo(() => processTrackerData(rastreadoresData, selectedMonth), [rastreadoresData, selectedMonth]);

  const handleFilterChange = useCallback((newFilters: RastreadorFiltersState) => setFilters(newFilters), []);
  const handleClearFilters = useCallback(() => setFilters({ searchTerm: '', status: 'all', franqueado: 'all' }), []);
  
  const handleOpenAddModal = () => {
    setEditingRastreador(null);
    setCurrentFormData({
      cnpj: "", empresa: "", franqueado: "", chassi: "", placa: "",
      rastreador: "", tipo: "", moto: "", mes: "", valor: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (rastreador: any) => {
    setEditingRastreador(rastreador);
    setCurrentFormData({ ...rastreador });
    setIsFormModalOpen(true);
  };
  
  const handleCloseFormModal = () => setIsFormModalOpen(false);

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCurrentFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveRastreador = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingRastreador?.id) {
        await updateRastreadorInDB(editingRastreador.id, currentFormData);
        toast({ title: "Sucesso!", description: "Rastreador atualizado." });
      } else {
        await addRastreador(currentFormData);
        toast({ title: "Sucesso!", description: "Rastreador adicionado." });
      }
      handleCloseFormModal();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível salvar o rastreador.", variant: "destructive" });
    }
  };

  const handleDeleteRastreador = async (id: string) => {
    if (!id) return;
    try {
      await deleteRastreadorFromDB(id);
      toast({ title: "Sucesso!", description: "Rastreador excluído.", variant: "destructive" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível excluir o rastreador.", variant: "destructive" });
    }
  };
  
  const handleImportClick = () => fileInputRef.current?.click();
  
  const pageActions = (
    <>
      <Button variant="outline" onClick={handleImportClick}><Upload className="mr-2 h-4 w-4" /> Importar CSV</Button>
      <input type="file" ref={fileInputRef} hidden />
      <Button onClick={handleOpenAddModal}>Adicionar Rastreador</Button>
      {(filters.searchTerm || filters.status !== 'all' || filters.franqueado !== 'all') && (
        <Button variant="ghost" onClick={handleClearFilters}><X className="mr-2 h-4 w-4" /> Limpar Filtros</Button>
      )}
    </>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }
  if (!user || !allowedUsers.includes(user.uid)) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Acesso Restrito"
          description="Você não tem permissão para visualizar esta página."
          icon={ShieldAlert}
          iconContainerClassName="bg-red-600"
        />
        <div className="p-4">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Acesso Negado</AlertTitle>
            <AlertDescription>
              Esta área é restrita e requer permissões especiais. Por favor, entre em contato com o administrador se você acredita que isso é um erro.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader 
        title="Gestão de Rastreadores" 
        description="Visualize e gerencie os rastreadores." 
        icon={SatelliteDish}
        iconContainerClassName="bg-indigo-600"
        actions={pageActions} 
      />

      <Tabs defaultValue="graficos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>
        <TabsContent value="dados" className="mt-4">
          <RastreadorFilters 
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            franqueados={franqueadosUnicos}
          />
          <RastreadoresList
            rastreadores={filteredRastreadores}
            onEditRastreador={handleOpenEditModal}
            onDeleteRastreador={handleDeleteRastreador}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="graficos" className="mt-4 space-y-4">
          <div className="flex justify-start">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Selecione o Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Meses</SelectItem>
                {monthFullNames.map((month, index) => (
                  <SelectItem key={index} value={month}>{month.charAt(0).toUpperCase() + month.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {kpiData.map((kpi: Kpi) => <KpiCard key={kpi.title} {...kpi} />)}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChartBig className="h-5 w-5" />
                Volume e Receita de Instalações de Rastreadores
              </CardTitle>
              <CardDescription>
                Volume de instalações (barras) e receita correspondente (linha).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrackerInstallationRevenueChart data={chartData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingRastreador ? "Editar" : "Adicionar"} Rastreador</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveRastreador} className="space-y-4">
            {Object.keys(currentFormData).map((key) => (
              <div key={key} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={key} className="text-right capitalize">{key}</Label>
                <Input id={key} value={(currentFormData as any)[key]} onChange={handleFormInputChange} className="col-span-3" />
              </div>
            ))}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
