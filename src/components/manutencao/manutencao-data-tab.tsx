"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, Plus, Edit2, Trash2, Save, Database } from "lucide-react";
import { ManutencaoData } from "@/lib/types";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  subscribeToManutencao, 
  addManutencao, 
  updateManutencao, 
  deleteManutencao, 
  importManutencaoBatch,
  deleteAllManutencao
} from "@/lib/firebase/manutencaoService";

export function ManutencaoDataTab() {
  const [data, setData] = useState<ManutencaoData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<ManutencaoData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToManutencao((manutencaoData) => {
      setData(manutencaoData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          console.log('Dados brutos do CSV:', results);
          
          if (results.errors && results.errors.length > 0) {
            console.error('Erros no parsing do CSV:', results.errors);
            throw new Error(`Erro no CSV: ${results.errors[0].message}`);
          }

          const csvData = results.data as any[];
          console.log('Primeira linha de dados:', csvData[0]);
          console.log('Headers disponíveis:', Object.keys(csvData[0] || {}));

          if (!csvData || csvData.length === 0) {
            throw new Error('Arquivo CSV está vazio ou não contém dados válidos');
          }

          // Tentar diferentes variações dos nomes das colunas
          const parsedData = csvData.map((row, index) => {
            try {
              // Função para converter data para formato ISO (assumindo formato brasileiro DD/MM/YYYY)
              const formatDate = (dateStr: string) => {
                if (!dateStr) return new Date().toISOString().split('T')[0];
                
                const trimmedDate = dateStr.trim();
                
                // Primeiro, tentar formato brasileiro DD/MM/YYYY ou DD/MM/YY
                if (trimmedDate.includes('/')) {
                  const parts = trimmedDate.split('/');
                  if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]);
                    let year = parseInt(parts[2]);
                    
                    // Se o ano tem apenas 2 dígitos, assumir 2000+
                    if (year < 100) {
                      year += 2000;
                    }
                    
                    // Validar se a data é válida
                    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
                      const formattedDate = new Date(year, month - 1, day);
                      if (!isNaN(formattedDate.getTime())) {
                        console.log(`Data convertida: ${trimmedDate} -> ${formattedDate.toISOString().split('T')[0]}`);
                        return formattedDate.toISOString().split('T')[0];
                      }
                    }
                  }
                }
                
                // Tentar formato ISO ou outros formatos padrão
                const date = new Date(trimmedDate);
                if (!isNaN(date.getTime())) {
                  return date.toISOString().split('T')[0];
                }
                
                // Se nada funcionar, usar data atual
                console.warn(`Não foi possível parsear a data: ${trimmedDate}, usando data atual`);
                return new Date().toISOString().split('T')[0];
              };

              // Função auxiliar para buscar valor em múltiplas variações de nome de coluna
              const getColumnValue = (possibleNames: string[]) => {
                for (const name of possibleNames) {
                  if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                    return String(row[name]).trim();
                  }
                }
                return '';
              };

              const data = {
                nome_cliente: getColumnValue([
                  'Nome do cliente', 'nome_cliente', 'cliente', 'Cliente', 'CLIENTE', 'Nome Cliente', 'nome cliente'
                ]),
                veiculo_placa: getColumnValue([
                  'Veículo placa', 'veiculo_placa', 'placa', 'Placa', 'PLACA', 'Veiculo Placa', 'veiculo placa'
                ]),
                veiculo_modelo: getColumnValue([
                  'Veículo modelo', 'veiculo_modelo', 'modelo', 'Modelo', 'MODELO', 'Veiculo Modelo', 'veiculo modelo'
                ]),
                veiculo_fabricante: getColumnValue([
                  'Veículo fabricante', 'veiculo_fabricante', 'fabricante', 'Fabricante', 'FABRICANTE', 'Veiculo Fabricante', 'veiculo fabricante', 'marca', 'Marca', 'MARCA'
                ]),
                semana: getColumnValue([
                  'SEMANA', 'semana', 'Semana', 'Sem', 'SEM', 'sem'
                ]),
                data: formatDate(getColumnValue([
                  'Data', 'data', 'DATA', 'Date', 'date', 'Data Manutencao', 'data_manutencao'
                ])),
                valor_total: parseFloat(String(getColumnValue([
                  'Valor Total', 'valor_total', 'valor', 'Valor', 'VALOR', 'Total', 'TOTAL', 'Valor total', 'valor total'
                ]) || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
                pecas_utilizadas: getColumnValue([
                  'Peças utilizadas', 'pecas_utilizadas', 'pecas', 'Pecas', 'PECAS', 'Peças', 'Pecas utilizadas', 'pecas utilizadas', 'Peça', 'peca'
                ]),
                responsaveis_mao_obra: getColumnValue([
                  'Responsáveis pela mão de obra', 'responsaveis_mao_obra', 'responsaveis', 'Responsaveis', 'RESPONSAVEIS', 'Responsáveis', 'mao_obra', 'mao de obra', 'Mao de obra', 'MAO DE OBRA', 'mecanico', 'Mecanico', 'MECANICO'
                ]),
              };
              
              console.log(`Linha ${index + 1} processada:`, data);
              return data;
            } catch (rowError) {
              console.error(`Erro ao processar linha ${index + 1}:`, rowError, row);
              throw new Error(`Erro na linha ${index + 1}: ${rowError}`);
            }
          });

          console.log('Dados processados para importação:', parsedData);

          await importManutencaoBatch(parsedData);
          toast({
            title: "Sucesso",
            description: `${parsedData.length} registros importados com sucesso.`,
          });
        } catch (error) {
          console.error('Erro detalhado ao importar dados:', error);
          toast({
            title: "Erro",
            description: error instanceof Error ? error.message : "Erro desconhecido ao processar o arquivo CSV.",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      },
      error: (error) => {
        toast({
          title: "Erro",
          description: "Erro ao ler o arquivo CSV.",
          variant: "destructive",
        });
        setIsUploading(false);
      },
    });
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `manutencao_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (item: ManutencaoData) => {
    setEditingId(item.id);
    setEditingData(item);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      await updateManutencao(editingId, editingData);
      setEditingId(null);
      setEditingData({});
      
      toast({
        title: "Sucesso",
        description: "Registro atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar manutenção:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o registro.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteManutencao(id);
      toast({
        title: "Sucesso",
        description: "Registro removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar manutenção:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover o registro.",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = async () => {
    const newItem = {
      nome_cliente: '',
      veiculo_placa: '',
      veiculo_modelo: '',
      veiculo_fabricante: '',
      semana: '',
      data: new Date().toISOString().split('T')[0],
      valor_total: 0,
      pecas_utilizadas: '',
      responsaveis_mao_obra: '',
    };
    
    try {
      const newId = await addManutencao(newItem);
      setEditingId(newId);
      setEditingData({ ...newItem, id: newId });
      
      toast({
        title: "Sucesso",
        description: "Novo registro criado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar manutenção:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar novo registro.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Dados
          </CardTitle>
          <CardDescription>
            Importe um arquivo CSV com os dados de manutenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="csvFile">Arquivo CSV</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                disabled={isUploading}
              />
              <div className="text-sm text-muted-foreground mt-1">
                <p className="mb-1"><strong>Colunas aceitas (várias variações):</strong></p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="font-medium">Cliente:</p>
                    <p>Nome do cliente, cliente, Cliente</p>
                  </div>
                  <div>
                    <p className="font-medium">Placa:</p>
                    <p>Veículo placa, placa, Placa</p>
                  </div>
                  <div>
                    <p className="font-medium">Modelo:</p>
                    <p>Veículo modelo, modelo, Modelo</p>
                  </div>
                  <div>
                    <p className="font-medium">Fabricante:</p>
                    <p>Veículo fabricante, fabricante, marca</p>
                  </div>
                  <div>
                    <p className="font-medium">Semana:</p>
                    <p>SEMANA, semana, Semana</p>
                  </div>
                  <div>
                    <p className="font-medium">Data:</p>
                    <p>Data, data, Date</p>
                  </div>
                  <div>
                    <p className="font-medium">Valor:</p>
                    <p>Valor Total, valor, Total</p>
                  </div>
                  <div>
                    <p className="font-medium">Peças:</p>
                    <p>Peças utilizadas, pecas, Pecas</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-medium">Responsáveis:</p>
                    <p>Responsáveis pela mão de obra, responsaveis, mecanico</p>
                  </div>
                </div>
                <p className="text-xs mt-2 text-orange-600">
                  💡 Dica: Abra o Console do navegador (F12) para ver detalhes do processamento
                </p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {isUploading ? "Processando..." : "Selecionar Arquivo"}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                disabled={data.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await deleteAllManutencao();
                    toast({
                      title: "Sucesso",
                      description: "Todos os registros foram removidos.",
                    });
                  } catch (error) {
                    console.error('Erro ao limpar dados:', error);
                    toast({
                      title: "Erro",
                      description: "Erro ao limpar os dados.",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={data.length === 0}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados de Manutenção
              </CardTitle>
              <CardDescription>
                {data.length} registros carregados
              </CardDescription>
            </div>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Semana</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Peças</TableHead>
                  <TableHead>Responsáveis</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingData.nome_cliente || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, nome_cliente: e.target.value }))}
                          className="w-32"
                        />
                      ) : (
                        item.nome_cliente
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingData.veiculo_placa || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, veiculo_placa: e.target.value }))}
                          className="w-24"
                        />
                      ) : (
                        item.veiculo_placa
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingData.veiculo_modelo || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, veiculo_modelo: e.target.value }))}
                          className="w-24"
                        />
                      ) : (
                        item.veiculo_modelo
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingData.veiculo_fabricante || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, veiculo_fabricante: e.target.value }))}
                          className="w-24"
                        />
                      ) : (
                        item.veiculo_fabricante
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingData.semana || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, semana: e.target.value }))}
                          className="w-20"
                        />
                      ) : (
                        item.semana
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          type="date"
                          value={editingData.data || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, data: e.target.value }))}
                          className="w-32"
                        />
                      ) : (
                        format(new Date(item.data), 'dd/MM/yyyy', { locale: ptBR })
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          value={editingData.valor_total || 0}
                          onChange={(e) => setEditingData(prev => ({ ...prev, valor_total: parseFloat(e.target.value) || 0 }))}
                          className="w-24"
                        />
                      ) : (
                        formatCurrency(item.valor_total)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingData.pecas_utilizadas || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, pecas_utilizadas: e.target.value }))}
                          className="w-32"
                        />
                      ) : (
                        <div className="max-w-32 truncate" title={item.pecas_utilizadas}>
                          {item.pecas_utilizadas}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingData.responsaveis_mao_obra || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, responsaveis_mao_obra: e.target.value }))}
                          className="w-32"
                        />
                      ) : (
                        <div className="max-w-32 truncate" title={item.responsaveis_mao_obra}>
                          {item.responsaveis_mao_obra}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {editingId === item.id ? (
                          <Button
                            size="sm"
                            onClick={handleSave}
                            className="flex items-center gap-1"
                          >
                            <Save className="h-3 w-3" />
                            Salvar
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                              className="flex items-center gap-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item.id)}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Excluir
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Carregando dados...
              </div>
            )}
            {!isLoading && data.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado encontrado. Faça upload de um arquivo CSV para começar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}