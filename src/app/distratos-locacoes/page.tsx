"use client";

import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DistratosList } from "@/components/distratos/distratos-list";
import { DistratoFilters, DistratoFiltersState } from "@/components/distratos/distrato-filters";
import { Button } from "@/components/ui/button";
import { Upload, X, AlertTriangle, ShieldAlert, Plus, Brain, Calendar as CalendarIcon, TrendingUp as TrendingUpIcon } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, TrendingUp } from "lucide-react";
import { RentalPeriodChart } from "@/components/charts/rental-period-chart";
import { GroupedCausesChart } from "@/components/charts/grouped-causes-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const currentYear = new Date().getFullYear();

const years = Array.from({ length: 3 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));


export default function DistratosLocacoesPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [distratosData, setDistratosData] = useState<DistratoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  
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
    
    // Subscribe to distratos
    const unsubscribeDistratos = subscribeToDistratos((dataFromDB) => {
      setDistratosData(Array.isArray(dataFromDB) ? dataFromDB : []);
      setIsLoading(false);
    });
    
    
    return () => {
      unsubscribeDistratos();
    };
  }, []);

  const franqueadosUnicos = useMemo(() => {
    const franqueadoSet = new Set(distratosData.map(d => d.franqueado).filter(Boolean));
    return Array.from(franqueadoSet);
  }, [distratosData]);

  const causasUnicas = useMemo(() => {
    const causaSet = new Set(distratosData.map(d => d.causa).filter(Boolean));
    return Array.from(causaSet);
  }, [distratosData]);

  // Filtrar dados por ano selecionado
  const filteredDistratosDataByYear = useMemo(() => {
    if (!selectedYear || selectedYear === "all") return distratosData;
    
    return distratosData.filter(distrato => {
      try {
        if (distrato.fim_ctt && distrato.fim_ctt.includes('/')) {
          const [, , ano] = distrato.fim_ctt.split('/');
          return parseInt(ano) === parseInt(selectedYear);
        }
        return false;
      } catch {
        return false;
      }
    });
  }, [distratosData, selectedYear]);

  const filteredDistratos = useMemo(() => {
    return filteredDistratosDataByYear.filter(d => {
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
  }, [filteredDistratosDataByYear, filters]);
  



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



  // Função para reclassificar causas baseado nos motivos
  const reclassificarCausas = (motivo: string, causaAtual: string): string => {
    const motivoLower = motivo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Padrões para Problemas Mecânicos/Manutenção
    const padroesMecanicos = [
      'insatisfação', 'insatisfacao', 'problema', 'defeito', 'manutencao', 'manutenção',
      'reparo', 'conserto', 'quebra', 'quebrou', 'danificad', 'avaria', 'falha',
      'não funciona', 'nao funciona', 'ruim', 'péssim', 'pessim', 'horrível', 'horrible',
      'condições', 'condicoes', 'estado', 'qualidade', 'funcionamento', 'motor',
      'freio', 'pneu', 'bateria', 'combustível', 'combustivel', 'vazamento',
      'barulho', 'vibração', 'vibracao', 'travando', 'emperr', 'dificuld'
    ];
    
    // Padrões para Inadimplência/Financeiro
    const padroesFinanceiros = [
      'inadimpl', 'financei', 'pagamento', 'pagar', 'dinheiro', 'valor', 'preço', 'preco',
      'caro', 'custo', 'conta', 'débito', 'debito', 'atraso', 'vencimento', 'parcela',
      'boleto', 'cartão', 'cartao', 'empréstimo', 'emprestimo', 'crédito', 'credito',
      'economia', 'econom', 'situação financeira', 'situacao financeira', 'sem dinheiro',
      'desempreg', 'renda', 'salário', 'salario'
    ];
    
    // Padrões para Mudança de Cidade/Pessoal
    const padroesMudanca = [
      'mudança', 'mudanca', 'mudar', 'cidade', 'estado', 'viagem', 'trabalho',
      'emprego', 'casa', 'família', 'familia', 'pessoal', 'saúde', 'saude',
      'doença', 'doenca', 'hospital', 'médico', 'medico', 'tratamento',
      'aposentad', 'idade', 'faleceu', 'falecimento', 'morte', 'óbito', 'obito',
      'casamento', 'divórcio', 'divorcio', 'separação', 'separacao',
      'transferência', 'transferencia', 'relocação', 'relocacao'
    ];
    
    // Padrões para Furto/Roubo/Acidente
    const padroesFurto = [
      'furto', 'roubo', 'roubada', 'furtada', 'acidente', 'bateu', 'colisão', 'colisao',
      'sinistro', 'seguro', 'polícia', 'policia', 'bo', 'boletim', 'delegacia',
      'ladrão', 'ladrao', 'bandido', 'criminoso', 'assalto', 'assaltada',
      'danificada', 'destruída', 'destruida', 'perda total', 'guincho'
    ];
    
    // Padrões para Desistência/Não Adaptação
    const padroesDesistencia = [
      'desistência', 'desistencia', 'desistir', 'desisti', 'não quer', 'nao quer',
      'não precisa', 'nao precisa', 'não usa', 'nao usa', 'não utiliza', 'nao utiliza',
      'sem necessidade', 'desnecessário', 'desnecessario', 'adaptação', 'adaptacao',
      'não se adaptou', 'nao se adaptou', 'preferência', 'preferencia', 'prefere',
      'mudou de ideia', 'mudou de idéia', 'arrependimento', 'arrependeu'
    ];
    
    // Análise dos padrões
    const contemMecanico = padroesMecanicos.some(padrao => motivoLower.includes(padrao));
    const contemFinanceiro = padroesFinanceiros.some(padrao => motivoLower.includes(padrao));
    const contemMudanca = padroesMudanca.some(padrao => motivoLower.includes(padrao));
    const contemFurto = padroesFurto.some(padrao => motivoLower.includes(padrao));
    const contemDesistencia = padroesDesistencia.some(padrao => motivoLower.includes(padrao));
    
    // Reclassificação baseada na análise
    if (contemFurto) return 'Furto/Roubo/Acidente';
    if (contemFinanceiro) return 'Inadimplência/Financeiro';
    if (contemMecanico) return 'Problemas Mecânicos/Manutenção';
    if (contemMudanca) return 'Mudança de Cidade/Pessoal';
    if (contemDesistencia) return 'Desistência/Não Adaptação';
    
    // Se não encontrar padrão específico, manter a causa atual ou usar uma genérica
    if (causaAtual && causaAtual.trim()) return causaAtual;
    return 'Outros/Diversos';
  };

  // Função para aplicar reclassificação em lote
  const handleReclassificarCausas = async () => {
    if (!window.confirm('🤖 Deseja reclassificar automaticamente as causas baseado na análise inteligente dos motivos?\n\nEsta ação irá:\n• Analisar todos os motivos\n• Reclassificar causas inadequadas\n• Atualizar os dados no Firebase')) {
      return;
    }

    setIsLoading(true);
    console.log('🤖 Iniciando reclassificação inteligente...');
    
    try {
      const distratosReclassificados = distratosData.map(distrato => {
        const novaCausa = reclassificarCausas(distrato.motivo || '', distrato.causa || '');
        const mudou = novaCausa !== distrato.causa;
        
        if (mudou) {
          console.log(`🔄 ${distrato.placa}: "${distrato.causa}" → "${novaCausa}"`);
        }
        
        return {
          ...distrato,
          causa: novaCausa
        };
      });

      const mudancas = distratosReclassificados.filter(d => {
        const original = distratosData.find(orig => orig.id === d.id);
        return original && original.causa !== d.causa;
      }).length;

      if (mudancas === 0) {
        toast({ 
          title: "🤖 Análise Concluída", 
          description: "Nenhuma reclassificação necessária. As causas já estão adequadas!",
        });
        setIsLoading(false);
        return;
      }

      // Atualizar no Firebase
      for (const distrato of distratosReclassificados) {
        if (distrato.id) {
          const original = distratosData.find(d => d.id === distrato.id);
          if (original && original.causa !== distrato.causa) {
            await updateDistratoInDB(distrato.id, { causa: distrato.causa });
          }
        }
      }

      toast({ 
        title: "🤖 Reclassificação Concluída!", 
        description: `${mudancas} causas foram reclassificadas automaticamente com base na análise dos motivos.`,
      });

      console.log(`✅ Reclassificação concluída: ${mudancas} alterações`);
      
    } catch (error: any) {
      console.error('Erro na reclassificação:', error);
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao reclassificar causas.", 
        variant: "destructive" 
      });
    }
    
    setIsLoading(false);
  };

  // Função robusta para parsing de CSV
  const parseCSVLine = (line: string, separator: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Aspas escapadas
          current += '"';
          i += 2;
        } else {
          // Alternar estado das aspas
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === separator && !inQuotes) {
        // Separador fora de aspas
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
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
      
      console.log(`📊 Total de linhas no arquivo (incluindo header): ${lines.length}`);
      
      if (lines.length < 2) {
        toast({ title: "Erro", description: "Arquivo CSV vazio ou inválido.", variant: "destructive" });
        return;
      }

      // Detectar separador mais inteligentemente
      const firstLine = lines[0];
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const separator = semicolonCount > commaCount ? ';' : ',';
      
      console.log(`🔍 Análise de separadores: vírgulas=${commaCount}, pontos-vírgula=${semicolonCount}`);
      console.log(`🎯 Separador escolhido: ${separator === ';' ? 'ponto e vírgula' : 'vírgula'}`);
      
      // Parse robusto do header
      const headers = parseCSVLine(firstLine, separator).map(h => h.toLowerCase().trim().replace(/"/g, ''));
      
      console.log('📋 Headers encontrados:', headers);
      console.log(`📏 Número de colunas esperado: ${headers.length}`);
      
      // Mapeamento mais flexível com variações comuns
      const headerMapping: { [key: string]: string } = {
        'placa': 'placa',
        'franqueado': 'franqueado',
        'franquiado': 'franqueado', // typo comum
        'inicio_ctt': 'inicio_ctt',
        'inicio ctt': 'inicio_ctt',
        'inicio': 'inicio_ctt',
        'data inicio': 'inicio_ctt',
        'fim_ctt': 'fim_ctt',
        'fim ctt': 'fim_ctt',
        'fim': 'fim_ctt',
        'data fim': 'fim_ctt',
        'motivo': 'motivo',
        'causa': 'causa',
        'motivo distrato': 'causa', // fallback
        'observacao': 'motivo', // fallback
        'observações': 'motivo'
      };
      
      // Verificar campos obrigatórios de forma mais flexível
      const requiredFields = ['placa', 'franqueado', 'motivo', 'causa'];
      const mappedHeaders = headers.map(h => headerMapping[h] || h);
      const foundRequired = requiredFields.filter(field => mappedHeaders.includes(field));
      
      console.log('✅ Campos mapeados:', mappedHeaders.filter(h => requiredFields.includes(h)));
      
      if (foundRequired.length < requiredFields.length) {
        const missing = requiredFields.filter(f => !foundRequired.includes(f));
        console.error('❌ Campos obrigatórios faltando:', missing);
        toast({ 
          title: "Erro", 
          description: `Headers obrigatórios não encontrados: ${missing.join(', ')}. Verifique se o arquivo tem as colunas: placa, franqueado, motivo, causa`,
          variant: "destructive" 
        });
        return;
      }

      const distratosData: Omit<DistratoData, 'id'>[] = [];
      let processedLines = 0;
      let skippedColumnCount = 0;
      let skippedValidation = 0;
      let flexibleMatches = 0;

      for (let i = 1; i < lines.length; i++) {
        processedLines++;
        const values = parseCSVLine(lines[i], separator);
        
        // Tentar diferentes estratégias se o número de colunas não bater
        let finalValues = values;
        
        if (values.length !== headers.length) {
          console.warn(`⚠️ Linha ${i + 1}: ${values.length} colunas, esperado ${headers.length}`);
          
          // Estratégia 1: Se tem menos colunas, preencher com vazios
          if (values.length < headers.length) {
            finalValues = [...values, ...Array(headers.length - values.length).fill('')];
            flexibleMatches++;
            console.log(`🔧 Linha ${i + 1}: Preenchida com campos vazios`);
          }
          // Estratégia 2: Se tem mais colunas, truncar
          else if (values.length > headers.length) {
            finalValues = values.slice(0, headers.length);
            flexibleMatches++;
            console.log(`🔧 Linha ${i + 1}: Truncada para ${headers.length} colunas`);
          }
          
          // Se ainda não conseguir ajustar, pular
          if (finalValues.length !== headers.length) {
            skippedColumnCount++;
            continue;
          }
        }
        
        const distratoObj: any = {};
        
        headers.forEach((header, index) => {
          const mappedField = headerMapping[header] || header;
          const value = (finalValues[index] || '').replace(/"/g, '').trim();
          
          if (mappedField && requiredFields.includes(mappedField)) {
            distratoObj[mappedField] = value;
          }
        });
        
        // Garantir estrutura básica
        const validDistrato = {
          placa: distratoObj.placa || '',
          franqueado: distratoObj.franqueado || '',
          inicio_ctt: distratoObj.inicio_ctt || '',
          fim_ctt: distratoObj.fim_ctt || '',
          motivo: distratoObj.motivo || '',
          causa: distratoObj.causa || ''
        };
        
        // Validação mais permissiva - só precisa de placa E (franqueado OU motivo OU causa)
        const hasPlaca = !!validDistrato.placa;
        const hasAtLeastOneOther = !!(validDistrato.franqueado || validDistrato.motivo || validDistrato.causa);
        
        if (!hasPlaca || !hasAtLeastOneOther) {
          console.warn(`⚠️ Linha ${i + 1} rejeitada - dados insuficientes`);
          skippedValidation++;
          continue;
        }
        
        distratosData.push(validDistrato);
      }
      
      // LOG: Resumo detalhado
      console.log(`📈 RESUMO DA IMPORTAÇÃO:`);
      console.log(`   • Linhas processadas: ${processedLines}`);
      console.log(`   • Ajustes flexíveis aplicados: ${flexibleMatches}`);
      console.log(`   • Rejeitadas por estrutura: ${skippedColumnCount}`);
      console.log(`   • Rejeitadas por validação: ${skippedValidation}`);
      console.log(`   • ✅ Aceitas para importação: ${distratosData.length}`);
      
      if (distratosData.length === 0) {
        toast({ title: "Erro", description: "Nenhum dado válido encontrado no arquivo.", variant: "destructive" });
        return;
      }

      await importDistratosBatch(distratosData);
      
      // Força uma atualização dos dados após importação
      console.log("🔄 Forçando atualização dos dados...");
      setTimeout(() => {
        const unsubscribe = subscribeToDistratos((dataFromDB) => {
          console.log(`📊 Dados atualizados: ${dataFromDB.length} distratos`);
          setDistratosData(Array.isArray(dataFromDB) ? dataFromDB : []);
          setIsLoading(false);
        });
        
        // Limpar o listener após 5 segundos para não duplicar
        setTimeout(() => unsubscribe(), 5000);
      }, 1000);
      
      const rejectedTotal = skippedColumnCount + skippedValidation;
      const successMessage = rejectedTotal > 0 
        ? `${distratosData.length} distratos importados (${rejectedTotal} linhas rejeitadas, ${flexibleMatches} ajustadas)`
        : `${distratosData.length} distratos importados com sucesso!`;
      
      toast({ 
        title: "Sucesso!", 
        description: successMessage,
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
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleImportClick}>
          <Upload className="mr-2 h-4 w-4" /> Importar CSV
        </Button>
        <Button variant="outline" onClick={handleReclassificarCausas} className="bg-purple-50 hover:bg-purple-100 border-purple-300">
          <Brain className="mr-2 h-4 w-4" /> Reclassificar IA
        </Button>
        <Button variant="outline" onClick={handleClearAllData} className="bg-red-50 hover:bg-red-100 border-red-300">
          <X className="mr-2 h-4 w-4" /> Limpar Todos
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
        description=""
        icon={AlertTriangle}
        iconContainerClassName="bg-red-600"
        actions={pageActions} 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-4">
                <AlertTriangle className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Distratos</p>
                <p className="text-2xl font-bold text-red-700">{filteredDistratosDataByYear.length}</p>
                <p className="text-xs text-gray-500">Contratos encerrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-4">
                <CalendarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Mesmo mês do início</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredDistratosDataByYear.filter(d => {
                    try {
                      const [diaI, mesI, anoI] = (d.inicio_ctt || '').split('/');
                      const [diaF, mesF, anoF] = (d.fim_ctt || '').split('/');
                      if (!diaI || !mesI || !anoI || !diaF || !mesF || !anoF) return false;
                      return mesI === mesF && anoI === anoF;
                    } catch { return false; }
                  }).length}
                  <span className="text-sm font-normal">
                    ({filteredDistratosDataByYear.length > 0 ? Math.round((filteredDistratosDataByYear.filter(d => {
                      try {
                        const [diaI, mesI, anoI] = (d.inicio_ctt || '').split('/');
                        const [diaF, mesF, anoF] = (d.fim_ctt || '').split('/');
                        if (!diaI || !mesI || !anoI || !diaF || !mesF || !anoF) return false;
                        return mesI === mesF && anoI === anoF;
                      } catch { return false; }
                    }).length / filteredDistratosDataByYear.length) * 100) : 0}%)
                  </span>
                </p>
                <p className="text-xs text-gray-500">Início e fim no mesmo mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Últimos 30 dias</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(() => {
                    const now = new Date();
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return filteredDistratosDataByYear.filter(d => {
                      try {
                        const [dia, mes, ano] = (d.fim_ctt || '').split('/');
                        if (!dia || !mes || !ano) return false;
                        const fimDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
                        return fimDate >= thirtyDaysAgo && fimDate <= now;
                      } catch { return false; }
                    }).length;
                  })()}
                </p>
                <p className="text-xs text-gray-500">vs 30 dias anteriores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <TrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo médio até distrato</p>
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    const durations: number[] = [];
                    filteredDistratosDataByYear.forEach(d => {
                      try {
                        const [diaI, mesI, anoI] = (d.inicio_ctt || '').split('/');
                        const [diaF, mesF, anoF] = (d.fim_ctt || '').split('/');
                        if (!diaI || !mesI || !anoI || !diaF || !mesF || !anoF) return;
                        const inicioDate = new Date(parseInt(anoI), parseInt(mesI) - 1, parseInt(diaI));
                        const fimDate = new Date(parseInt(anoF), parseInt(mesF) - 1, parseInt(diaF));
                        if (fimDate >= inicioDate) {
                          const diffDays = Math.round((fimDate.getTime() - inicioDate.getTime()) / (1000 * 60 * 60 * 24));
                          durations.push(diffDays);
                        }
                      } catch {}
                    });
                    const avgDays = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
                    return `${avgDays} dias`;
                  })()}
                </p>
                <p className="text-xs text-gray-500">
                  Mediana {(() => {
                    const durations: number[] = [];
                    filteredDistratosDataByYear.forEach(d => {
                      try {
                        const [diaI, mesI, anoI] = (d.inicio_ctt || '').split('/');
                        const [diaF, mesF, anoF] = (d.fim_ctt || '').split('/');
                        if (!diaI || !mesI || !anoI || !diaF || !mesF || !anoF) return;
                        const inicioDate = new Date(parseInt(anoI), parseInt(mesI) - 1, parseInt(diaI));
                        const fimDate = new Date(parseInt(anoF), parseInt(mesF) - 1, parseInt(diaF));
                        if (fimDate >= inicioDate) {
                          const diffDays = Math.round((fimDate.getTime() - inicioDate.getTime()) / (1000 * 60 * 60 * 24));
                          durations.push(diffDays);
                        }
                      } catch {}
                    });
                    if (durations.length === 0) return '0 dias';
                    durations.sort((a, b) => a - b);
                    const median = durations[Math.floor(durations.length / 2)];
                    return `${median} dias`;
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          {/* Gráfico 1: Causas Agrupadas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Causas Agrupadas por Categoria
              </CardTitle>
              <CardDescription>Análise estratégica dos motivos de distrato organizados por grupos principais</CardDescription>
            </CardHeader>
            <CardContent>
              <GroupedCausesChart data={filteredDistratosDataByYear} />
            </CardContent>
          </Card>
          
          {/* Gráfico 2: Distratos ao Longo do Tempo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Distratos ao Longo do Tempo
              </CardTitle>
              <CardDescription>Evolução mensal por período de locação (até 30 dias vs maior que 30 dias)</CardDescription>
            </CardHeader>
            <CardContent>
              <RentalPeriodChart data={filteredDistratosDataByYear} />
            </CardContent>
          </Card>
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
