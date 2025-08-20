
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { VendaMoto } from '@/lib/types';
import { getVendasMotos, addVendaMoto, updateVendaMoto, deleteVendaMoto } from '@/lib/firebase/vendaMotoService';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VendaMotoForm } from '@/components/venda-motos/venda-moto-form';
import { CSVExportButton } from '@/components/venda-motos/csv-export-button';
import { VendaMotosFilters } from '@/components/venda-motos/venda-motos-filters';
import { PlusCircle, Edit, Trash2, Upload, Trash } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function VendaMotosTable() {
  const [allVendas, setAllVendas] = useState<VendaMoto[]>([]);
  const [filters, setFilters] = useState({ searchTerm: '' });
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState<VendaMoto | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchVendas();
  }, []);

  const fetchVendas = async () => {
    setLoading(true);
    try {
        const data = await getVendasMotos();
        setAllVendas(data);
    } catch (error) {
        console.error("Erro ao buscar vendas:", error);
    } finally {
        setLoading(false);
    }
  };

  const filteredVendas = useMemo(() => {
    const searchTerm = filters.searchTerm.toLowerCase();
    if (!searchTerm) {
      return allVendas;
    }
    return allVendas.filter(venda => 
      venda.razao_social.toLowerCase().includes(searchTerm) ||
      venda.cnpj.toLowerCase().includes(searchTerm) ||
      venda.franqueado.toLowerCase().includes(searchTerm) ||
      venda.modelo.toLowerCase().includes(searchTerm)
    );
  }, [allVendas, filters]);

  const handleFormSubmit = async (vendaData: Omit<VendaMoto, 'id'>) => {
    if (selectedVenda) {
      await updateVendaMoto(selectedVenda.id, vendaData);
    } else {
      await addVendaMoto(vendaData);
    }
    fetchVendas();
    handleCancel();
  };

  const handleEdit = (venda: VendaMoto) => {
    setSelectedVenda(venda);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(confirm('Tem certeza que deseja excluir esta venda?')) {
      await deleteVendaMoto(id);
      fetchVendas();
    }
  };

  const openNewForm = () => {
    setSelectedVenda(null);
    setIsFormOpen(true);
  }

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedVenda(null);
  }

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('Arquivo CSV deve conter pelo menos uma linha de cabeçalho e uma linha de dados.');
        return;
      }
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by tab character since the data appears to be tab-separated
        const values = line.split('\t').map(v => v.trim());
        
        // Convert date format from DD/MM/YYYY to YYYY-MM-DD
        const formatDate = (dateStr: string) => {
          if (!dateStr) return '';
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
          return dateStr;
        };
        
        // Parse monetary values (remove R$, spaces, dots and convert comma to dot)
        const parseMonetaryValue = (str: string) => {
          if (!str) return 0;
          // Remove R$, spaces, and dots (thousands separator)
          let cleanStr = str.replace(/R\$\s*/g, '').replace(/\s/g, '').replace(/\./g, '');
          // Convert comma to dot for decimal separator
          cleanStr = cleanStr.replace(',', '.');
          return parseFloat(cleanStr) || 0;
        };
        
        const vendaData: Omit<VendaMoto, 'id'> = {
          data_compra: formatDate(values[0]) || '',
          parceiro: values[1] || '',
          status: values[2] || '',
          entregue: values[3] || '',
          franqueado: values[4] || '',
          cnpj: values[5] || '',
          razao_social: values[6] || '',
          quantidade: parseInt(values[7]) || 0,
          marca: values[8] || '',
          modelo: values[9] || '',
          valor_unitario: parseMonetaryValue(values[10]),
          valor_total: parseMonetaryValue(values[11]),
        };
        
        await addVendaMoto(vendaData);
      }
      
      fetchVendas();
      alert('Importação concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      alert('Erro ao importar CSV. Verifique o formato do arquivo.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  
  const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  
  const formatDate = (dateString: string) => {
    try {
        return format(parseISO(dateString + 'T00:00:00'), 'dd/MM/yyyy');
    } catch (error) {
        return "Data inválida";
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-end gap-2 mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVImport}
          style={{ display: 'none' }}
          id="csv-import-input"
        />
        <Button 
          variant="outline" 
          onClick={() => document.getElementById('csv-import-input')?.click()}
          disabled={isImporting}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isImporting ? 'Importando...' : 'Importar CSV'}
        </Button>
        <CSVExportButton data={filteredVendas} />
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewForm}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedVenda ? <Edit className="mr-2 h-6 w-6" /> : <PlusCircle className="mr-2 h-6 w-6" />}
                {selectedVenda ? 'Editar Venda' : 'Adicionar Nova Venda'}
              </DialogTitle>
            </DialogHeader>
            <VendaMotoForm
              onSubmit={handleFormSubmit}
              venda={selectedVenda}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      <VendaMotosFilters onFilterChange={setFilters} />

      <div className="border rounded-md overflow-x-auto">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead style={{ minWidth: '120px' }}>Data Compra</TableHead>
                <TableHead style={{ minWidth: '150px' }}>Parceiro</TableHead>
                <TableHead style={{ minWidth: '100px' }}>Status</TableHead>
                <TableHead style={{ minWidth: '100px' }}>Entregue</TableHead>
                <TableHead style={{ minWidth: '200px' }}>Franqueado</TableHead>
                <TableHead style={{ minWidth: '180px' }}>CNPJ</TableHead>
                <TableHead style={{ minWidth: '250px' }}>Razão Social</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead style={{ minWidth: '150px' }}>Marca</TableHead>
                <TableHead style={{ minWidth: '200px' }}>Modelo</TableHead>
                <TableHead style={{ minWidth: '150px' }}>Valor Unitário</TableHead>
                <TableHead style={{ minWidth: '150px' }}>Valor Total</TableHead>
                <TableHead style={{ minWidth: '100px' }}>Ações</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {filteredVendas.length > 0 ? (
                filteredVendas.map((venda) => (
                <TableRow key={venda.id}>
                    <TableCell>{formatDate(venda.data_compra)}</TableCell>
                    <TableCell>{venda.parceiro}</TableCell>
                    <TableCell>{venda.status}</TableCell>
                    <TableCell>{venda.entregue}</TableCell>
                    <TableCell>{venda.franqueado}</TableCell>
                    <TableCell>{venda.cnpj}</TableCell>
                    <TableCell>{venda.razao_social}</TableCell>
                    <TableCell>{venda.quantidade}</TableCell>
                    <TableCell>{venda.marca}</TableCell>
                    <TableCell>{venda.modelo}</TableCell>
                    <TableCell>{formatCurrency(venda.valor_unitario)}</TableCell>
                    <TableCell>{formatCurrency(venda.valor_total)}</TableCell>
                    <TableCell>
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(venda)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(venda.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={13} className="h-24 text-center">
                        Nenhum registro encontrado.
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
