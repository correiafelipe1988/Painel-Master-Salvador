
"use client";

import React from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { VendaMoto } from '@/lib/types';
import { format } from 'date-fns';

export function CSVExportButton({ data }: { data: VendaMoto[] }) {
  
  const handleExport = () => {
    if (data.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    // Mapeia os dados para o formato desejado e renomeia as colunas
    const formattedData = data.map(item => ({
      'Data Compra': format(new Date(item.data_compra), 'dd/MM/yyyy'),
      'Parceiro': item.parceiro,
      'Status': item.status,
      'Entregue': item.entregue,
      'Franqueado': item.franqueado,
      'CNPJ': item.cnpj,
      'Razão Social': item.razao_social,
      'Quantidade': item.quantidade,
      'Marca': item.marca,
      'Modelo': item.modelo,
      'Valor Unitário': item.valor_unitario,
      'Valor Total': item.valor_total,
    }));

    const csv = Papa.unparse(formattedData);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'vendas_motos.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  );
}
