"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, Plus, Edit2, Trash2, Save, Database, MoreHorizontal } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddManutencaoForm } from "./add-manutencao-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function ManutencaoDataTab() {
  const [data, setData] = useState<ManutencaoData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<ManutencaoData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
                    if (year < 100) {
                      year += 2000;
                    }
                    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
                      // Corrigir: adicionar 1 dia
                      const dateObj = new Date(year, month - 1, day);
                      dateObj.setDate(dateObj.getDate() + 1);
                      const yyyy = dateObj.getFullYear().toString().padStart(4, '0');
                      const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                      const dd = dateObj.getDate().toString().padStart(2, '0');
                      const formatted = `${yyyy}-${mm}-${dd}`;
                      console.log(`Data convertida: ${trimmedDate} -> ${formatted}`);
                      return formatted;
                    }
                  }
                }
                // Tentar formato ISO ou outros formatos padrão
                const date = new Date(trimmedDate);
                if (!isNaN(date.getTime())) {
                  date.setDate(date.getDate() + 1);
                  const yyyy = date.getFullYear().toString().padStart(4, '0');
                  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
                  const dd = date.getDate().toString().padStart(2, '0');
                  const formatted = `${yyyy}-${mm}-${dd}`;
                  return formatted;
                }
                // Se nada funcionar, usar data atual
                console.warn(`Não foi possível parsear a data: ${trimmedDate}, usando data atual`);
                const now = new Date();
                now.setDate(now.getDate() + 1);
                const yyyy = now.getFullYear().toString().padStart(4, '0');
                const mm = (now.getMonth() + 1).toString().padStart(2, '0');
                const dd = now.getDate().toString().padStart(2, '0');
                return `${yyyy}-${mm}-${dd}`;
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

              // Função para converter valores monetários
              const parseMoneyValue = (value: string) => {
                if (!value) return 0;
                // Remove tudo exceto números, vírgulas e pontos
                const cleanValue = String(value).replace(/[^\d.,]/g, '');
                // Substitui vírgula por ponto para decimal
                const normalizedValue = cleanValue.replace(',', '.');
                return parseFloat(normalizedValue) || 0;
              };

              const data = {
                data: formatDate(getColumnValue([
                  'Data', 'data', 'DATA', 'Date', 'date'
                ])),
                veiculo_placa: getColumnValue([
                  'Placa', 'placa', 'PLACA', 'Veículo placa', 'veiculo_placa'
                ]),
                veiculo: getColumnValue([
                  'Veículo', 'veiculo', 'VEICULO', 'Veiculo'
                ]),
                nome_cliente: getColumnValue([
                  'Cliente', 'cliente', 'CLIENTE', 'Nome do cliente', 'nome_cliente'
                ]),
                faturamento_pecas: parseMoneyValue(getColumnValue([
                  'Faturamento Peças', 'faturamento_pecas', 'Faturamento Pecas', 'FATURAMENTO PECAS'
                ])),
                custo_pecas: parseMoneyValue(getColumnValue([
                  'Custo Peças', 'custo_pecas', 'Custo Pecas', 'CUSTO PECAS'
                ])),
                liquido: parseMoneyValue(getColumnValue([
                  'Líquido', 'liquido', 'LIQUIDO', 'Liquido'
                ])),
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
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
            <div className="flex items-center gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {isUploading ? "Processando..." : "Importar"}
              </Button>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={data.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
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
              <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Faturamento Peças</TableHead>
                  <TableHead>Custo Peças</TableHead>
                  <TableHead>Líquido</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
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
                          value={editingData.veiculo || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, veiculo: e.target.value }))}
                          className="w-32"
                        />
                      ) : (
                        item.veiculo
                      )}
                    </TableCell>
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
                          type="number"
                          step="0.01"
                          value={editingData.faturamento_pecas || 0}
                          onChange={(e) => setEditingData(prev => ({ ...prev, faturamento_pecas: parseFloat(e.target.value) || 0 }))}
                          className="w-24"
                        />
                      ) : (
                        formatCurrency(item.faturamento_pecas)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editingData.custo_pecas || 0}
                          onChange={(e) => setEditingData(prev => ({ ...prev, custo_pecas: parseFloat(e.target.value) || 0 }))}
                          className="w-24"
                        />
                      ) : (
                        formatCurrency(item.custo_pecas)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editingData.liquido || 0}
                          onChange={(e) => setEditingData(prev => ({ ...prev, liquido: parseFloat(e.target.value) || 0 }))}
                          className="w-24"
                        />
                      ) : (
                        formatCurrency(item.liquido)
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {editingId === item.id ? (
                            <DropdownMenuItem onClick={handleSave}>
                              <Save className="mr-2 h-4 w-4" /> Salvar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Modal de Adição */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg w-full">
          <AddManutencaoForm
            onSubmit={async (manutencaoData) => {
              await addManutencao(manutencaoData);
              setIsAddModalOpen(false);
            }}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}