"use client";

import React, { useState, useEffect } from 'react';
import { getVendasMotos } from '@/lib/firebase/vendaMotoService';
import { VendaMoto } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, AlertTriangle, CheckCircle } from 'lucide-react';

interface DuplicateGroup {
  key: string;
  records: VendaMoto[];
  totalValue: number;
  totalQuantity: number;
}

export function DuplicateChecker() {
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [duplicateImpact, setDuplicateImpact] = useState({ revenue: 0, quantity: 0 });

  const checkDuplicates = async () => {
    setLoading(true);
    try {
      const vendas = await getVendasMotos();
      setTotalRecords(vendas.length);

      // Criar mapa de registros agrupados por chave única
      const recordMap = new Map<string, VendaMoto[]>();

      vendas.forEach(venda => {
        // Criar chave única baseada em campos importantes
        const key = `${venda.data_compra}_${venda.cnpj}_${venda.quantidade}_${venda.marca}_${venda.modelo}_${venda.valor_total}`;
        
        if (recordMap.has(key)) {
          recordMap.get(key)!.push(venda);
        } else {
          recordMap.set(key, [venda]);
        }
      });

      // Identificar grupos com duplicatas
      const duplicateGroups: DuplicateGroup[] = [];
      let totalDuplicateRevenue = 0;
      let totalDuplicateQuantity = 0;

      recordMap.forEach((records, key) => {
        if (records.length > 1) {
          const totalValue = records.reduce((sum, r) => sum + (r.valor_total || 0), 0);
          const totalQuantity = records.reduce((sum, r) => sum + (r.quantidade || 0), 0);
          
          duplicateGroups.push({
            key,
            records,
            totalValue,
            totalQuantity
          });

          // Calcular impacto das duplicatas (excluindo o primeiro registro de cada grupo)
          const duplicateRecords = records.slice(1);
          totalDuplicateRevenue += duplicateRecords.reduce((sum, r) => sum + (r.valor_total || 0), 0);
          totalDuplicateQuantity += duplicateRecords.reduce((sum, r) => sum + (r.quantidade || 0), 0);
        }
      });

      setDuplicates(duplicateGroups);
      setDuplicateImpact({
        revenue: totalDuplicateRevenue,
        quantity: totalDuplicateQuantity
      });

    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Verificador de Duplicatas
          </CardTitle>
          <CardDescription>
            Analise os dados de vendas para identificar possíveis registros duplicados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={checkDuplicates} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Verificando...' : 'Verificar Duplicatas'}
          </Button>
        </CardContent>
      </Card>

      {totalRecords > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {duplicates.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
              Resultado da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalRecords}</div>
                <div className="text-sm text-muted-foreground">Total de Registros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{duplicates.length}</div>
                <div className="text-sm text-muted-foreground">Grupos Duplicados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {duplicates.reduce((sum, group) => sum + (group.records.length - 1), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Registros Duplicados</div>
              </div>
            </div>

            {duplicates.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Impacto das Duplicatas:</strong><br />
                  Receita duplicada: {formatCurrency(duplicateImpact.revenue)}<br />
                  Quantidade duplicada: {duplicateImpact.quantity} motos
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes das Duplicatas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {duplicates.map((group, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-medium text-sm text-muted-foreground mb-2">
                    Grupo {index + 1} - {group.records.length} registros idênticos
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <strong>Data:</strong> {formatDate(group.records[0].data_compra)}
                    </div>
                    <div>
                      <strong>CNPJ:</strong> {group.records[0].cnpj}
                    </div>
                    <div className="col-span-2">
                      <strong>Razão Social:</strong> {group.records[0].razao_social}
                    </div>
                    <div>
                      <strong>Quantidade:</strong> {group.records[0].quantidade}
                    </div>
                    <div>
                      <strong>Valor Total:</strong> {formatCurrency(group.records[0].valor_total)}
                    </div>
                    <div className="col-span-2">
                      <strong>Produto:</strong> {group.records[0].marca} {group.records[0].modelo}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <strong>IDs dos registros:</strong> {group.records.map(r => r.id).join(', ')}
                  </div>
                  
                  <div className="text-xs text-red-600 mt-2">
                    <strong>Impacto:</strong> {formatCurrency(group.totalValue - (group.records[0].valor_total || 0))} em receita duplicada, 
                    {group.totalQuantity - (group.records[0].quantidade || 0)} motos duplicadas
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}