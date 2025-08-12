"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { RastreadoresList } from "@/components/rastreadores/rastreadores-list";
import { Button } from "@/components/ui/button";
import { Upload, X, BarChartBig, SatelliteDish, DollarSign, Calendar, ShieldAlert, Download } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const monthFullNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const processTrackerData = (rastreadores: RastreadorData[], selectedMonths: string[]) => {
    const filteredByMonth = selectedMonths.includes('all') || selectedMonths.length === 0
        ? rastreadores
        : rastreadores.filter(r => selectedMonths.includes(r.mes.toLowerCase()));

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
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  
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
    "edsTZ2zG54Ph2ZoNSyFZXoJj74s2",
    "VL0J7KdhhPUAmcTI0onP2PqZ19T2",
    "9NvNKnLzbJZIrO7p8FlgFJ0IuYL2",
    "asa5TnKscSgeZbOUZKem2cJl0Yf2",
    "y884M0oE6lbom15xQw0DpAup4Tg1",
    "nogEZZXp0JXZ0I79qutB3dlfgkI2",
    "Dnp47E9kimOhmsvegq6ixItbmUu1"
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
  
  const { kpiData, chartData } = useMemo(() => processTrackerData(rastreadoresData, selectedMonths), [rastreadoresData, selectedMonths]);

  const handleFilterChange = useCallback((newFilters: RastreadorFiltersState) => setFilters(newFilters), []);
  const handleClearFilters = useCallback(() => setFilters({ searchTerm: '', status: 'all', franqueado: 'all' }), []);
  
  const handleMonthToggle = (month: string) => {
    if (month === 'all') {
      setSelectedMonths(['all']);
    } else {
      setSelectedMonths(prev => {
        // Remove 'all' se estiver selecionado
        const withoutAll = prev.filter(m => m !== 'all');
        
        if (withoutAll.includes(month)) {
          // Remove o mês se já estiver selecionado
          const newSelection = withoutAll.filter(m => m !== month);
          // Mantém vazio ao invés de voltar para 'all'
          return newSelection;
        } else {
          // Adiciona o mês à seleção
          return [...withoutAll, month];
        }
      });
    }
  };

  const getSelectedMonthsDisplay = () => {
    if (selectedMonths.includes('all')) {
      return 'Todos os Meses';
    }
    if (selectedMonths.length === 0) {
      return 'Selecionar Meses';
    }
    if (selectedMonths.length === 1) {
      return selectedMonths[0].charAt(0).toUpperCase() + selectedMonths[0].slice(1);
    }
    return `${selectedMonths.length} meses selecionados`;
  };
  
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


  const handleExportData = () => {
    try {
      // Preparar dados para exportação
      const dataToExport = filteredRastreadores.length > 0 ? filteredRastreadores : rastreadoresData;
      
      if (dataToExport.length === 0) {
        toast({ title: "Aviso", description: "Não há dados para exportar.", variant: "destructive" });
        return;
      }

      // Cabeçalhos do CSV
      const headers = ['cnpj', 'empresa', 'franqueado', 'chassi', 'placa', 'rastreador', 'tipo', 'moto', 'mes', 'valor'];
      
      // Converter dados para CSV
      const csvContent = [
        headers.join(','), // Cabeçalho
        ...dataToExport.map(item => 
          headers.map(header => {
            const value = (item as any)[header] || '';
            // Escapar aspas e vírgulas
            return value.toString().includes(',') || value.toString().includes('"') 
              ? `"${value.toString().replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        // Nome do arquivo com data
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const monthsStr = selectedMonths.includes('all') ? 'todos' : selectedMonths.join('-');
        const fileName = `rastreadores_${monthsStr}_${dateStr}.csv`;
        
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({ 
          title: "Sucesso!", 
          description: `${dataToExport.length} registros exportados para ${fileName}`,
        });
      }
    } catch (error: any) {
      console.error('Erro na exportação:', error);
      toast({ 
        title: "Erro", 
        description: "Erro ao exportar dados.", 
        variant: "destructive" 
      });
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({ title: "Erro", description: "Por favor, selecione um arquivo CSV.", variant: "destructive" });
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({ title: "Erro", description: "Arquivo CSV vazio ou inválido.", variant: "destructive" });
        return;
      }

      const headers = parseCSVLine(lines[0]);
      const expectedHeaders = ['cnpj', 'empresa', 'franqueado', 'chassi', 'placa', 'rastreador', 'tipo', 'moto', 'mes', 'valor'];
      
      console.log('Headers encontrados:', headers);
      console.log('Headers esperados:', expectedHeaders);
      
      const isValidFormat = expectedHeaders.every(header => headers.includes(header));
      if (!isValidFormat) {
        toast({ title: "Erro", description: `Formato do CSV inválido. Headers encontrados: ${headers.join(', ')}`, variant: "destructive" });
        return;
      }

      const rastreadoresData: Omit<RastreadorData, 'id'>[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
          const rastreadorObj: any = {};
          headers.forEach((header, index) => {
            rastreadorObj[header] = values[index];
          });
          rastreadoresData.push(rastreadorObj);
        }
      }

      console.log('Dados processados:', rastreadoresData.length, 'registros');
      
      if (rastreadoresData.length === 0) {
        toast({ title: "Erro", description: "Nenhum dado válido encontrado no arquivo.", variant: "destructive" });
        return;
      }

      // Usar a função de importação em lote
      const { importRastreadoresBatch } = await import("@/lib/firebase/rastreadorService");
      await importRastreadoresBatch(rastreadoresData);
      
      toast({ 
        title: "Sucesso!", 
        description: `${rastreadoresData.length} rastreadores importados com sucesso!`,
      });

      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao importar arquivo CSV.", 
        variant: "destructive" 
      });
    }
  };
  
  const pageActions = (
    <>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              {getSelectedMonthsDisplay()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <div className="p-4 space-y-2">
              <div 
                className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded"
              >
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    id="all"
                    checked={selectedMonths.includes('all')}
                    onChange={() => handleMonthToggle('all')}
                    className="h-4 w-4 cursor-pointer"
                  />
                </div>
                <label 
                  htmlFor="all" 
                  className="text-sm font-medium cursor-pointer"
                  onClick={() => handleMonthToggle('all')}
                >
                  Todos os Meses
                </label>
              </div>
              <div className="border-t pt-2 space-y-2">
                {monthFullNames.map((month, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-2 hover:bg-gray-50 p-1 rounded ${selectedMonths.includes('all') ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        id={month}
                        checked={selectedMonths.includes(month)}
                        onChange={() => {
                          if (!selectedMonths.includes('all')) {
                            handleMonthToggle(month);
                          }
                        }}
                        disabled={selectedMonths.includes('all')}
                        className="h-4 w-4 cursor-pointer"
                      />
                    </div>
                    <label 
                      htmlFor={month} 
                      className="text-sm cursor-pointer"
                      onClick={() => {
                        if (!selectedMonths.includes('all')) {
                          handleMonthToggle(month);
                        }
                      }}
                    >
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" onClick={handleImportClick}><Upload className="mr-2 h-4 w-4" /> Importar CSV</Button>
        <Button variant="outline" onClick={handleExportData} className="bg-blue-50 hover:bg-blue-100 border-blue-300">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
        <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileChange} hidden />
        <Button onClick={handleOpenAddModal}>Adicionar Rastreador</Button>
        {(filters.searchTerm || filters.status !== 'all' || filters.franqueado !== 'all') && (
          <Button variant="ghost" onClick={handleClearFilters}><X className="mr-2 h-4 w-4" /> Limpar Filtros</Button>
        )}
      </div>
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
