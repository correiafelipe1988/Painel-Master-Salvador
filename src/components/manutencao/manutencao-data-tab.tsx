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
              const data = {
                nome_cliente: row['Nome do cliente'] || row['nome_cliente'] || row['cliente'] || '',
                veiculo_placa: row['Veículo placa'] || row['veiculo_placa'] || row['placa'] || '',
                veiculo_modelo: row['Veículo modelo'] || row['veiculo_modelo'] || row['modelo'] || '',
                veiculo_fabricante: row['Veículo fabricante'] || row['veiculo_fabricante'] || row['fabricante'] || '',
                semana: row['SEMANA'] || row['semana'] || '',
                data: row['Data'] || row['data'] || new Date().toISOString().split('T')[0],
                valor_total: parseFloat(String(row['Valor Total'] || row['valor_total'] || row['valor'] || '0').replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
                pecas_utilizadas: row['Peças utilizadas'] || row['pecas_utilizadas'] || row['pecas'] || '',
                responsaveis_mao_obra: row['Responsáveis pela mão de obra'] || row['responsaveis_mao_obra'] || row['responsaveis'] || '',
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
                <p className="mb-1"><strong>Colunas esperadas:</strong></p>
                <ul className="text-xs space-y-0.5">
                  <li>• Nome do cliente</li>
                  <li>• Veículo placa</li>
                  <li>• Veículo modelo</li>
                  <li>• Veículo fabricante</li>
                  <li>• SEMANA</li>
                  <li>• Data</li>
                  <li>• Valor Total</li>
                  <li>• Peças utilizadas</li>
                  <li>• Responsáveis pela mão de obra</li>
                </ul>
                <p className="text-xs mt-2 text-orange-600">
                  💡 Dica: Abra o Console do navegador (F12) para ver detalhes do erro
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