
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Motorcycle, MotorcycleStatus } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MotorcyclePageFilters } from '@/app/motorcycles/page';

const getStatusBadgeVariant = (status: MotorcycleStatus) => {
  switch (status) {
    case 'active': return 'default'; // Alterado para default para um visual mais próximo do verde "Disponível"
    case 'inadimplente': return 'destructive';
    case 'manutencao': return 'secondary'; // Pode ser um amarelo/laranja customizado se necessário
    case 'recolhida': return 'outline'; // Cinza
    case 'relocada': return 'default'; // Azul, como no mockup
    default: return 'outline';
  }
};

const getStatusBadgeClassName = (status: MotorcycleStatus) => {
  switch (status) {
    case 'active': return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
    case 'inadimplente': return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
    case 'manutencao': return 'bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500'; // Ajustado para amarelo
    case 'recolhida': return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500';
    case 'relocada': return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500';
    default: return '';
  }
}


const translateStatus = (status: MotorcycleStatus): string => {
  switch (status) {
    case 'active': return 'Disponível';
    case 'inadimplente': return 'Inadimplente';
    case 'manutencao': return 'Manutenção';
    case 'recolhida': return 'Recolhida';
    case 'relocada': return 'Relocada';
    default:
      const s = status as string;
      return s.charAt(0).toUpperCase() + s.slice(1);
  }
};

interface MotorcycleListProps {
  filters: MotorcyclePageFilters;
  motorcycles: Motorcycle[]; // Recebe a lista de motos como prop
}

export function MotorcycleList({ filters, motorcycles }: MotorcycleListProps) {
  const [clientMounted, setClientMounted] = useState(false);
  useEffect(() => {
    setClientMounted(true);
  }, []);

  const filteredMotorcycles = useMemo(() => {
    return motorcycles.filter(moto => {
      const statusMatch = filters.status === 'all' || moto.status === filters.status;
      const modelMatch = filters.model === 'all' || moto.model.toLowerCase().includes(filters.model.toLowerCase()); // Case-insensitive model match
      const searchTermMatch = filters.searchTerm === '' ||
        moto.placa.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        moto.franqueado.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        moto.model.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      return statusMatch && modelMatch && searchTermMatch;
    });
  }, [filters, motorcycles]);

  if (!clientMounted) {
    return (
      <div className="mt-4 text-center text-muted-foreground">
        Carregando dados das motocicletas...
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {`Motocicletas (${filteredMotorcycles.length} encontradas)`}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CS</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Franqueado</TableHead>
              <TableHead>Valor Diária</TableHead>
              <TableHead>Últ. Movimento</TableHead>
              <TableHead>Ociosa (Dias)</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMotorcycles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground h-24">
                  Nenhuma motocicleta corresponde aos filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filteredMotorcycles.map((moto) => (
                <TableRow key={moto.id}>
                  <TableCell>
                    {moto.qrCodeUrl ? (
                       <a href={moto.qrCodeUrl} target="_blank" rel="noopener noreferrer" title={moto.qrCodeUrl}>
                        <Image 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=30x30&data=${encodeURIComponent(moto.qrCodeUrl)}`} 
                          alt={`CS para ${moto.placa}`} 
                          width={30} 
                          height={30} 
                          className="rounded"
                          data-ai-hint="qr code"
                        />
                       </a>
                    ) : (
                      <div className="w-[30px] h-[30px] bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">N/A</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{moto.placa}</TableCell>
                  <TableCell>{moto.model}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(moto.status)} className={getStatusBadgeClassName(moto.status)}>
                      {translateStatus(moto.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{moto.type === 'nova' ? 'Nova' : 'Usada'}</TableCell>
                  <TableCell>{moto.franqueado}</TableCell>
                  <TableCell>
                    {moto.valorDiaria ? `R$ ${moto.valorDiaria.toFixed(2).replace('.', ',')}` : 'N/A'}
                  </TableCell>
                  <TableCell>{new Date(moto.data_ultima_mov + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{moto.tempo_ocioso_dias}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Marcar como Recolhida</DropdownMenuItem>
                        <DropdownMenuItem>Marcar como Relocada</DropdownMenuItem>
                        <DropdownMenuItem>Marcar para Manutenção</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive hover:!bg-destructive/10">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

