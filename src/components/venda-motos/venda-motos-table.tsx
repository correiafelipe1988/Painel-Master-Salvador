
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
import { PlusCircle, Edit, Trash2, Upload, Trash, Database } from 'lucide-react';
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

  const handleClearData = async () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      try {
        for (const venda of allVendas) {
          await deleteVendaMoto(venda.id);
        }
        fetchVendas();
        alert('Dados limpos com sucesso!');
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
        alert('Erro ao limpar dados.');
      }
    }
  };

  const handleInsertSampleData = async () => {
    const rawData = `08/11/2024	PRIME	PAGO		Fabio Weyhrother de Oliveira	58.122.712/0001-63	FVE LOCACOES E SERVICOS LTDA	2	Shineray	SHI175cc - Injetada	R$ 15.900,00	R$ 31.800,00
08/11/2024	PRIME	PAGO		Fabio Weyhrother de Oliveira	58.122.712/0001-63	FVE LOCACOES E SERVICOS LTDA	5	Shineray	SHI175cc - Carburada	R$ 13.500,00	R$ 67.500,00
25/11/2024	PRIME	PAGO			57.791.375/0001-34	LOCNOW LTDA	5	Shineray	SHI175cc - Carburada	R$ 12.800,00	R$ 64.000,00
25/11/2024	PRIME	PAGO			57.713.021/0001-71	ACRP LOCACAO LTDA	20	Shineray	SHI175cc - Carburada	R$ 12.800,00	R$ 256.000,00
25/11/2024	PRIME	PAGO	SIM	Gileno Fernando Araujo	57.656.066/0001-51	G&G LOCAÇÕES AUTOMOTIVAS LTDA	10	Shineray	SHI175cc - Carburada	R$ 12.800,00	R$ 128.000,00
27/12/2024	MEGA	PAGO	SIM	Andre Moscoso Cicarelli	58.333.572/0001-72	HUB MOTOS LTDA	2	Shineray	SHI175cc - Injetada	R$ 15.550,00	R$ 31.100,00
30/12/2024	MEGA	PAGO	SIM	Gabriela Pinheiro	59.162.864/0001-52	PINHEIROS LOCAÇÕES LTDA	5	Shineray	SHI175cc - Injetada	R$ 15.550,00	R$ 77.750,00
23/01/2025	MEGA	PAGO	SIM	Wilson Rezende Ribeiro Júnior	59.935.205/0001-49	H4S SERVIÇOS DE LOCAÇÕES DE MOTOS LTDA	8	Shineray	SHI175cc - Carburada	R$ 14.400,00	R$ 115.200,00
07/02/2025	MEGA	PAGO	SIM	José Alves Nascimento Filho	03.268.997/0001-53	REALIZAR LOCAÇÃO DE AUTOMOVEIS LTDA	9	Dafra	NH190cc - Injetada	R$ 19.500,00	R$ 175.500,00
04/02/2025	MEGA	PAGO	SIM	Fabio Weyhrother de Oliveira	58.122.712/0001-63	FVE LOCACOES E SERVICOS LTDA	1	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 16.900,00
14/02/2025	MEGA	PAGO	SIM	Fabio Weyhrother de Oliveira	58.122.712/0001-63	FVE LOCACOES E SERVICOS LTDA	1	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 16.900,00
17/02/2025	MEGA	PAGO	SIM	Rodrigo Rogério Oehlmeyer	58.513.802/0001-85	RJD INDEPENDENCIA FINANCEIRA E MOBILIDADE LTDA	2	Dafra	NH190cc - Injetada	R$ 19.750,00	R$ 39.500,00
19/02/2025	MEGA	PAGO	SIM	Luiz Fernando Moreno Santos e Silva	53.282.205/0001-73	LOC AND GO LTDA	2	Shineray	SHI175cc - Carburada	R$ 14.550,00	R$ 29.100,00
24/02/2025	MEGA	PAGO	SIM	Gabriela Pinheiro	59.162.864/0001-52	PINHEIROS LOCAÇÕES LTDA	3	Dafra	NH190cc - Injetada	R$ 19.825,00	R$ 59.475,00
24/02/2025	MEGA	PAGO	SIM	Lana Shely de Freitas Ferreira	58.236.596/0001-03	SAMPAIO FREITAS C. E SERVIÇOS DE LOCAÇÃO LTDA	2	Dafra	NH190cc - Injetada	R$ 19.900,00	R$ 39.800,00
28/02/2024	MEGA	PAGO	SIM	Andre Moscoso Cicarelli	58.333.572/0001-72	HUB MOTOS LTDA	1	Shineray	SHI175cc - Carburada	R$ 14.500,00	R$ 14.500,00
08/03/2025	MEGA	PAGO	SIM	Fabio Weyhrother de Oliveira	58.122.712/0001-63	FVE Locadoções e Serviços LTDA	1	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 16.900,00
24/03/2025	MEGA	PAGO	SIM	Fabio Weyhrother de Oliveira	60.074.308/0001-03	FBF Locações e Serviços LTDA	17	Shineray	SHI175cc - Injetada	R$ 16.800,00	R$ 285.600,00
25/03/2025	MEGA	PAGO	SIM	João Paulo Melcore	60.218.068/0001-73	JP LocMotos	10	Dafra	NH190cc - Injetada	R$ 20.400,00	R$ 204.000,00
31/03/2025	MEGA	PAGO	SIM	Fernando Maia Rezende	59.621.282/0001-97	CG Motos LTDA	5	Dafra	NH190cc - Injetada	R$ 20.450,00	R$ 102.250,00
01/04/2025	MEGA	PAGO	SIM	João Henrique Caló de Oliveira Tourinho	???	???	15	Shineray	SHI175cc - Carburada	R$ 14.500,00	R$ 217.500,00
03/04/2025	MEGA	PAGO	SIM	Wilson Rezende Ribeiro Júnior	59.020.244/0001-89	Locagora 1000 LTDA	5	Shineray	SHI175cc - Carburada	R$ 14.400,00	R$ 72.000,00
04/04/2025	MEGA	20% PAGO	SIM	Antonio Carlos S Costa/Marcel	60.407.011/0001-12	NC LOCMAIS SERVIÇOS	10	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 169.000,00
12/04/2025	HABBYZUCA	PAGO	SIM	Fabio Weyhrother de Oliveira	58.122.712/0001-63	FVE LOCAÇÕES E SERVIÇOS LTDA	1	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 16.900,00
14/04/2025	MEGA	PAGO	SIM	Antonio Carlos S Costa	60.407.011/0001-12	NC LOCMAIS SERVIÇOS	10	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 169.000,00
30/04/2025	MEGA	PAGO	SIM	Washington Souza Nogueira	60.645.220/0001-02	LOCNOG LOCAÇÕES LTDA	10	Dafra	NH190cc - Injetada	R$ 19.990,00	R$ 199.900,00
05/05/2025	HABBYZUCA	PAGANDO	SIM	Fabio Weyhrother de Oliveira	58.122.712/0001-63	FVE LOCAÇÕES E SERVIÇOS LTDA	2	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 33.800,00
05/05/2025	HABBYZUCA	PAGANDO	SIM	Fabio Weyhrother de Oliveira	60.074.308/0001-03	FBF LOCAÇÕES E SERVIÇOS LTDA	3	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 50.700,00
05/05/2025	HABBYZUCA	PAGANDO	SIM	Gileno Fernando Araujo	57.656.066/0001-51	G&G LOCAÇÕES AUTOMOTIVAS LTDA	20	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 338.000,00
05/05/2025	MEGA	PAGANDO	SIM	José Alves Nascimento Filho	03.268.997/0001-53	REALIZAR LOCAÇÃO DE AUTOMOVEIS LTDA	6	Dafra	NH190cc - Injetada	R$ 19.990,00	R$ 119.940,00
13/05/2025	HABBYZUCA	PAGO	SIM	Andrei Tavares de Souza Casaes	60.642.191/0001-17	LOCAT LOCAÇOES DE VEICULOS LTDA	4	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 67.600,00
13/05/2025	MEGA	PAGO	SIM	Manuoel Biluca de Andrade Neto	60.729.864/0001-70	ADSUMUS LOCAÇÕES LTDA	3	Dafra	NH190cc - Injetada	R$ 20.400,00	R$ 61.200,00
13/05/2025	MEGA	PAGO	01 ENTREGUE	Manuoel Biluca de Andrade Neto	60.729.864/0001-70	ADSUMUS LOCAÇÕES LTDA	3	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 50.700,00
14/05/2025	HABBYZUCA	PAGO	SIM	Antonio Carlos S Costa	60.407.011/0001-12	NC LOCMAIS SERVIÇOS LTDA	5	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 84.500,00
16/05/2025	HABBYZUCA	PAGO	SIM	Rodolfo Victor Ribeiro	60.821.271/0001-30	RODOLFO VICTOR RIBEIRO	7	Shineray	SHI175cc - Carburada	R$ 14.600,00	R$ 102.200,00
19/05/2025	MEGA	PAGO	05 ENTREGUES	Ignacio Ricardo Lucero	60.940.578/0001-50	LIT SERVIÇOS LTDA	17	Dafra	NH190cc - Injetada	R$ 19.990,00	R$ 339.830,00
19/05/2025	MEGA	PAGANDO	SIM	Fernando Maia Rezende	59.621.282/0001-97	CG MOTOS LTDA	1	Dafra	NH190cc - Injetada	R$ 19.990,00	R$ 19.990,00
22/05/2025	MEGA	PAGO	07 ENTREGUES	Antonio Carlos S Costa/Marcel	60.407.011/0001-12	NC LOCMAIS SERVIÇOS	8	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 135.200,00
22/05/2025	MEGA	PAGANDO	NÃO	Fernando Maia Rezende	59.621.282/0001-97	CG MOTOS LTDA	4	Dafra	NH190cc - Injetada	R$ 19.990,00	R$ 79.960,00
23/05/2025	MEGA	PAGO	NÃO	João Paulo Melcore	60.218.068/0001-73	JP LOCMOTOS LTDA	2	Dafra	NH190cc - Injetada	R$ 19.990,00	R$ 39.980,00
23/05/2025	HABBYZUCA	PAGO	SIM	Fernando Maia Rezende	59.621.282/0001-97	CG MOTOS LTDA	5	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 84.500,00
02/06/2025	HABBYZUCA	PAGO	NÃO	Marcelo Figueiredo Machado	56.993.324/0001-22	MG RENTAL MOTOS LTDA	1	Dafra	NH190cc - Injetada	R$ 20.400,00	R$ 20.400,00
02/06/2025	HABBYZUCA	PAGO	NÃO	Ana Paula Pegado Ribeiro	60.975.805/0001-82	APT LOCAÇÕES LTDA	3	Shineray	SHI175cc - Carburada	R$ 14.600,00	R$ 43.800,00
10/06/2025	HABBYZUCA	PAGO	NÃO	Aliatir Silveira Filho	60.909.378/0001-34	ASF LOCAÇÕES LTDA	12	Shineray	SHI175cc - Injetada	R$ 16.900,00	R$ 202.800,00
10/06/2025	MEGA	PAGO	NÃO	Eduardo de Toledo Bruder	61.222.438/0001-09	ITAPOA MOBILIDADE LTDA	10	Dafra	NH190cc - Injetada	R$ 19.990,00	R$ 199.900,00`;

    const lines = rawData.split('\n').filter(line => line.trim());
    
    try {
      for (const line of lines) {
        const values = line.split('\t').map(v => v.trim());
        
        if (values.length >= 12) {
          const formatDate = (dateStr: string) => {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return dateStr;
          };
          
          const parseMonetaryValue = (str: string) => {
            if (!str) return 0;
            let cleanStr = str.replace(/R\$\s*/g, '').replace(/\s/g, '').replace(/\./g, '');
            cleanStr = cleanStr.replace(',', '.');
            return parseFloat(cleanStr) || 0;
          };
          
          const vendaData = {
            data_compra: formatDate(values[0]),
            parceiro: values[1],
            status: values[2],
            entregue: values[3],
            franqueado: values[4],
            cnpj: values[5],
            razao_social: values[6],
            quantidade: parseInt(values[7]) || 0,
            marca: values[8],
            modelo: values[9],
            valor_unitario: parseMonetaryValue(values[10]),
            valor_total: parseMonetaryValue(values[11])
          };
          
          await addVendaMoto(vendaData);
        }
      }
      
      fetchVendas();
      alert('Dados inseridos com sucesso!');
    } catch (error) {
      console.error('Erro ao inserir dados:', error);
      alert('Erro ao inserir dados.');
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
        <Button 
          variant="secondary" 
          onClick={handleInsertSampleData}
        >
          <Database className="mr-2 h-4 w-4" />
          Inserir Dados
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
