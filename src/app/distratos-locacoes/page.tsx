"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DistratosList } from "@/components/distratos/distratos-list";
import { DistratoFilters, DistratoFiltersState } from "@/components/distratos/distrato-filters";
import { Button } from "@/components/ui/button";
import { Upload, X, BarChartBig, AlertTriangle, ShieldAlert, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  addDistrato, 
  subscribeToDistratos,
  deleteDistrato as deleteDistratoFromDB,
  updateDistrato as updateDistratoInDB,
  importDistratosBatch,
  deleteAllDistratosBatch,
  DistratoData,
} from "@/lib/firebase/distratoService";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { type Kpi } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, Building2, TrendingUp } from "lucide-react";
import { ParetoChart } from "@/components/charts/pareto-chart";
import { MonthlyDistratosChart } from "@/components/charts/monthly-distratos-chart";

// Função para processar dados dos distratos para gráficos
const processDistratosData = (distratos: DistratoData[]) => {
  // Contar por causa
  const causasCount = distratos.reduce((acc, distrato) => {
    const causa = distrato.causa || 'Sem informações';
    acc[causa] = (acc[causa] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top 10 causas mais frequentes
  const topCausas = Object.entries(causasCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([causa, count]) => ({ causa, count }));

  // Contar por franqueado
  const franqueadosCount = distratos.reduce((acc, distrato) => {
    acc[distrato.franqueado] = (acc[distrato.franqueado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top 5 franqueados com mais distratos
  const topFranqueados = Object.entries(franqueadosCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([franqueado, count]) => ({ franqueado, count }));

  // Dados mensais (últimos 6 meses)
  const monthlyData = Array(6).fill(0);
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  distratos.forEach(distrato => {
    try {
      const [dia, mes, ano] = distrato.fim_ctt.split('/');
      const dataFim = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      const hoje = new Date();
      const diffMonths = hoje.getMonth() - dataFim.getMonth() + (12 * (hoje.getFullYear() - dataFim.getFullYear()));
      
      if (diffMonths >= 0 && diffMonths < 6) {
        monthlyData[5 - diffMonths]++;
      }
    } catch (e) {
      // Ignorar datas inválidas
    }
  });

  const chartData = monthlyData.map((count, index) => {
    const monthIndex = (new Date().getMonth() - (5 - index) + 12) % 12;
    return {
      month: monthNames[monthIndex],
      count
    };
  });

  return {
    kpiData: [
      { title: "Total de Distratos", value: distratos.length.toString(), icon: AlertTriangle, description: "Contratos encerrados", color: "text-red-700" },
      { title: "Principal Causa", value: topCausas[0]?.causa || "N/A", icon: BarChartBig, description: `${topCausas[0]?.count || 0} ocorrências`, color: "text-orange-600" },
    ] as Kpi[],
    topCausas,
    topFranqueados,
    chartData,
  };
};

export default function DistratosLocacoesPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [distratosData, setDistratosData] = useState<DistratoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDistrato, setEditingDistrato] = useState<DistratoData | null>(null);
  const [currentFormData, setCurrentFormData] = useState<Omit<DistratoData, 'id'>>({
    placa: "", franqueado: "", inicio_ctt: "", fim_ctt: "", motivo: "", causa: "",
  });

  const [filters, setFilters] = useState<DistratoFiltersState>({
    searchTerm: '', franqueado: 'all', causa: 'all', periodo: 'all',
  });

  // Lista de IDs permitidos (mesma dos rastreadores)
  const allowedUsers = [
    "1dpkLRLH3Sgm5hTkmNJAlfDQgoP2",
    "FOHbVCbMyhadO3tm1rVdknwLVPr1",
    "orbGQ8lbCfb51KuJlD5oSflsLRx1",
    "edsTZ2zG54Ph2ZoNSyFZXoJj74s2",
    "VL0J7KdhhPUAmcTI0onP2PqZ19T2",
    "9NvNKnLzbJZIrO7p8FlgFJ0IuYL2",
    "asa5TnKscSgeZbOUZKem2cJl0Yf2",
    "y884M0oE6lbom15xQw0DpAup4Tg1",
    "nogEZZXp0JXZ0I79qutB3dlfgkI2"
  ];

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToDistratos((dataFromDB) => {
      setDistratosData(Array.isArray(dataFromDB) ? dataFromDB : []);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const franqueadosUnicos = useMemo(() => {
    const franqueadoSet = new Set(distratosData.map(d => d.franqueado).filter(Boolean));
    return Array.from(franqueadoSet);
  }, [distratosData]);

  const causasUnicas = useMemo(() => {
    const causaSet = new Set(distratosData.map(d => d.causa).filter(Boolean));
    return Array.from(causaSet);
  }, [distratosData]);

  const filteredDistratos = useMemo(() => {
    return distratosData.filter(d => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const searchMatch = !filters.searchTerm ||
        d.placa?.toLowerCase().includes(searchTermLower) ||
        d.motivo?.toLowerCase().includes(searchTermLower) ||
        d.franqueado?.toLowerCase().includes(searchTermLower);
      
      const franqueadoMatch = filters.franqueado === 'all' || d.franqueado === filters.franqueado;
      const causaMatch = filters.causa === 'all' || d.causa === filters.causa;

      let periodoMatch = true;
      if (filters.periodo !== 'all') {
        try {
          const [dia, mes, ano] = d.fim_ctt.split('/');
          const dataFim = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
          const hoje = new Date();
          const diffDays = Math.floor((hoje.getTime() - dataFim.getTime()) / (1000 * 60 * 60 * 24));
          periodoMatch = diffDays <= parseInt(filters.periodo);
        } catch {
          periodoMatch = true;
        }
      }

      return searchMatch && franqueadoMatch && causaMatch && periodoMatch;
    });
  }, [distratosData, filters]);
  
  const { kpiData, topCausas, topFranqueados } = useMemo(() => processDistratosData(distratosData), [distratosData]);

  const handleFilterChange = useCallback((newFilters: DistratoFiltersState) => setFilters(newFilters), []);
  const handleClearFilters = useCallback(() => setFilters({ searchTerm: '', franqueado: 'all', causa: 'all', periodo: 'all' }), []);
  
  const handleOpenAddModal = () => {
    setEditingDistrato(null);
    setCurrentFormData({
      placa: "", franqueado: "", inicio_ctt: "", fim_ctt: "", motivo: "", causa: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (distrato: DistratoData) => {
    setEditingDistrato(distrato);
    setCurrentFormData({ ...distrato });
    setIsFormModalOpen(true);
  };
  
  const handleCloseFormModal = () => setIsFormModalOpen(false);

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setCurrentFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveDistrato = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingDistrato?.id) {
        await updateDistratoInDB(editingDistrato.id, currentFormData);
        toast({ title: "Sucesso!", description: "Distrato atualizado." });
      } else {
        await addDistrato(currentFormData);
        toast({ title: "Sucesso!", description: "Distrato adicionado." });
      }
      handleCloseFormModal();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível salvar o distrato.", variant: "destructive" });
    }
  };

  const handleDeleteDistrato = async (id: string) => {
    if (!id) return;
    try {
      await deleteDistratoFromDB(id);
      toast({ title: "Sucesso!", description: "Distrato excluído.", variant: "destructive" });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível excluir o distrato.", variant: "destructive" });
    }
  };
  
  const handleImportClick = () => fileInputRef.current?.click();

  const handleExportData = () => {
    try {
      const dataToExport = filteredDistratos.length > 0 ? filteredDistratos : distratosData;
      
      if (dataToExport.length === 0) {
        toast({ title: "Aviso", description: "Não há dados para exportar.", variant: "destructive" });
        return;
      }

      const headers = ['placa', 'franqueado', 'inicio_ctt', 'fim_ctt', 'motivo', 'causa'];
      
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(item => 
          headers.map(header => {
            const value = (item as any)[header] || '';
            return value.toString().includes(',') || value.toString().includes('"') 
              ? `"${value.toString().replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const fileName = `distratos_locacoes_${dateStr}.csv`;
        
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

      // Detectar separador (vírgula ou ponto e vírgula)
      const firstLine = lines[0];
      const separator = firstLine.includes(';') ? ';' : ',';
      
      const headers = firstLine.split(separator).map(h => h.toLowerCase().trim());
      
      // Debug - mostrar headers encontrados
      console.log('Headers encontrados:', headers);
      
      // Mapeamento mais flexível
      const headerMap = new Map([
        ['placa', 'placa'],
        ['franqueado', 'franqueado'],
        ['inicio_ctt', 'inicio_ctt'],
        ['inicio ctt', 'inicio_ctt'],
        ['fim_ctt', 'fim_ctt'], 
        ['fim ctt', 'fim_ctt'],
        ['motivo', 'motivo'],
        ['causa', 'causa']
      ]);
      
      // Verificar se encontrou pelo menos placa, franqueado, motivo e causa
      const requiredFields = ['placa', 'franqueado', 'motivo', 'causa'];
      const foundRequired = requiredFields.filter(field => 
        headers.some(h => headerMap.has(h) && headerMap.get(h) === field)
      );
      
      if (foundRequired.length < requiredFields.length) {
        const missing = requiredFields.filter(f => !foundRequired.includes(f));
        toast({ title: "Erro", description: `Headers obrigatórios não encontrados: ${missing.join(', ')}. Encontrados: ${headers.join(', ')}`, variant: "destructive" });
        return;
      }

      const distratosData: Omit<DistratoData, 'id'>[] = [];
      
      // Criar mapeamento de headers
      const headerMapping: { [key: string]: string } = {
        'placa': 'placa',
        'franqueado': 'franqueado', 
        'inicio_ctt': 'inicio_ctt',
        'inicio ctt': 'inicio_ctt',
        'fim_ctt': 'fim_ctt',
        'fim ctt': 'fim_ctt',
        'motivo': 'motivo',
        'causa': 'causa'
      };

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(separator).map(v => v.trim());
        if (values.length === headers.length) {
          const distratoObj: any = {};
          
          headers.forEach((header, index) => {
            // Só adicionar campos com nomes válidos (não vazios)
            if (header && header.trim()) {
              const mappedField = headerMapping[header] || header;
              const value = values[index] || '';
              
              // Só adicionar se o campo mapeado também não for vazio
              if (mappedField && mappedField.trim()) {
                distratoObj[mappedField] = value;
              }
            }
          });
          
          // Garantir que tenha os campos básicos com valores válidos
          const validDistrato = {
            placa: distratoObj.placa || '',
            franqueado: distratoObj.franqueado || '',
            inicio_ctt: distratoObj.inicio_ctt || '',
            fim_ctt: distratoObj.fim_ctt || '',
            motivo: distratoObj.motivo || '',
            causa: distratoObj.causa || ''
          };
          
          // Só adicionar se tiver pelo menos os campos obrigatórios preenchidos
          if (validDistrato.placa && validDistrato.franqueado && validDistrato.motivo && validDistrato.causa) {
            distratosData.push(validDistrato);
          }
        }
      }
      
      if (distratosData.length === 0) {
        toast({ title: "Erro", description: "Nenhum dado válido encontrado no arquivo.", variant: "destructive" });
        return;
      }

      await importDistratosBatch(distratosData);
      
      toast({ 
        title: "Sucesso!", 
        description: `${distratosData.length} distratos importados com sucesso!`,
      });

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


  const handleClearAllData = async () => {
    if (!window.confirm("⚠️ ATENÇÃO: Esta ação vai remover TODOS os distratos. Tem certeza?")) {
      return;
    }

    try {
      toast({ title: "Removendo...", description: "Limpando TODOS os dados de uma vez..." });
      
      // Usar batch delete - remove tudo de uma vez
      const result = await deleteAllDistratosBatch();
      
      toast({ 
        title: "✅ Sucesso!", 
        description: `${result.count || 0} distratos removidos de uma só vez!`,
      });
    } catch (error: any) {
      console.error('Erro ao limpar dados:', error);
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao limpar dados.", 
        variant: "destructive" 
      });
    }
  };
  
  const pageActions = (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handleImportClick}>
          <Upload className="mr-2 h-4 w-4" /> Importar CSV
        </Button>
        <Button variant="outline" onClick={handleClearAllData} className="bg-red-50 hover:bg-red-100 border-red-300">
          <X className="mr-2 h-4 w-4" /> Limpar Todos
        </Button>
        <Button variant="outline" onClick={handleExportData} className="bg-blue-50 hover:bg-blue-100 border-blue-300">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
        <input type="file" ref={fileInputRef} accept=".csv" onChange={handleFileChange} hidden />
        <Button onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Distrato
        </Button>
        {(filters.searchTerm || filters.franqueado !== 'all' || filters.causa !== 'all' || filters.periodo !== 'all') && (
          <Button variant="ghost" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" /> Limpar Filtros
          </Button>
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
        title="Distratos Locações" 
        description="Visualize e gerencie os distratos de locação." 
        icon={AlertTriangle}
        iconContainerClassName="bg-red-600"
        actions={pageActions} 
      />

      <Tabs defaultValue="graficos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dados" className="mt-4">
          <DistratoFilters 
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            franqueados={franqueadosUnicos}
            causas={causasUnicas}
          />
          <DistratosList
            distratos={filteredDistratos}
            onEditDistrato={handleOpenEditModal}
            onDeleteDistrato={handleDeleteDistrato}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="graficos" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {kpiData.map((kpi: Kpi) => <KpiCard key={kpi.title} {...kpi} />)}
          </div>
          
          {/* Gráfico de Pareto - Tela Inteira */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChartBig className="h-5 w-5" />
                Principais Causas de Distrato
              </CardTitle>
              <CardDescription>Top 10 motivos mais frequentes - Análise de Pareto</CardDescription>
            </CardHeader>
            <CardContent>
              <ParetoChart data={topCausas.slice(0, 10)} />
            </CardContent>
          </Card>
          
          {/* Gráfico Mensal - Tela Inteira */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Distratos ao Longo do Tempo
              </CardTitle>
              <CardDescription>Evolução mensal dos distratos</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyDistratosChart data={distratosData} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Principais Franqueados
                </CardTitle>
                <CardDescription>Top 5 franqueados com mais distratos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topFranqueados.slice(0, 5).map((item, index) => (
                    <div key={item.franqueado} className="flex justify-between items-center p-2 rounded bg-gray-50">
                      <span className="text-sm">{item.franqueado}</span>
                      <span className="font-semibold text-orange-600">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendências Semanais
                </CardTitle>
                <CardDescription>Padrões semanais de distratos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Análise de tendências semanais</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-semibold text-blue-600">{Math.round(distratosData.length / 52)}</div>
                      <div className="text-xs text-blue-500">Média/Semana</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-semibold text-green-600">{distratosData.length}</div>
                      <div className="text-xs text-green-500">Total Anual</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isFormModalOpen && (
        <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingDistrato ? "Editar Distrato" : "Adicionar Distrato"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveDistrato} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="placa">Placa</Label>
                  <Input id="placa" value={currentFormData.placa} onChange={handleFormInputChange} required />
                </div>
                <div>
                  <Label htmlFor="franqueado">Franqueado</Label>
                  <Input id="franqueado" value={currentFormData.franqueado} onChange={handleFormInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inicio_ctt">Início CTT</Label>
                  <Input id="inicio_ctt" value={currentFormData.inicio_ctt} onChange={handleFormInputChange} />
                </div>
                <div>
                  <Label htmlFor="fim_ctt">Fim CTT</Label>
                  <Input id="fim_ctt" value={currentFormData.fim_ctt} onChange={handleFormInputChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="motivo">Motivo</Label>
                <Textarea id="motivo" value={currentFormData.motivo} onChange={handleFormInputChange} required />
              </div>
              <div>
                <Label htmlFor="causa">Causa</Label>
                <Input id="causa" value={currentFormData.causa} onChange={handleFormInputChange} required />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">{editingDistrato ? "Atualizar" : "Adicionar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
