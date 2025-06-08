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
import { MoreHorizontal, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockMotorcycles: Motorcycle[] = [
  { id: '1', code: 'MOTO001', status: 'active', type: 'nova', filial: 'Salvador Centro', data_ultima_mov: '2024-07-20', tempo_ocioso_dias: 2, qrCodeUrl: 'https://placehold.co/50x50.png' },
  { id: '2', code: 'MOTO002', status: 'inadimplente', type: 'usada', filial: 'Salvador Norte', data_ultima_mov: '2024-07-10', tempo_ocioso_dias: 12, qrCodeUrl: 'https://placehold.co/50x50.png' },
  { id: '3', code: 'MOTO003', status: 'manutencao', type: 'nova', filial: 'Salvador Centro', data_ultima_mov: '2024-07-15', tempo_ocioso_dias: 7, qrCodeUrl: 'https://placehold.co/50x50.png' },
  { id: '4', code: 'MOTO004', status: 'recolhida', type: 'usada', filial: 'Lauro de Freitas', data_ultima_mov: '2024-06-25', tempo_ocioso_dias: 27, qrCodeUrl: 'https://placehold.co/50x50.png' },
  { id: '5', code: 'MOTO005', status: 'active', type: 'nova', filial: 'Salvador Norte', data_ultima_mov: '2024-07-22', tempo_ocioso_dias: 0, qrCodeUrl: 'https://placehold.co/50x50.png' },
  { id: '6', code: 'MOTO006', status: 'relocada', type: 'usada', filial: 'Salvador Centro', data_ultima_mov: '2024-07-18', tempo_ocioso_dias: 4, qrCodeUrl: 'https://placehold.co/50x50.png' },
];

const getStatusBadgeVariant = (status: MotorcycleStatus) => {
  switch (status) {
    case 'active': return 'default';
    case 'inadimplente': return 'destructive';
    case 'manutencao': return 'secondary';
    case 'recolhida': return 'outline'; 
    case 'relocada': return 'default'; 
    default: return 'outline';
  }
};

const translateStatus = (status: MotorcycleStatus): string => {
  switch (status) {
    case 'active': return 'Ativa';
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
  filters: { status: MotorcycleStatus | 'all'; idleTime: number };
}

export function MotorcycleList({ filters }: MotorcycleListProps) {
  const [clientMounted, setClientMounted] = useState(false);
  useEffect(() => {
    setClientMounted(true);
  }, []);


  const filteredMotorcycles = useMemo(() => {
    return mockMotorcycles.filter(moto => {
      const statusMatch = filters.status === 'all' || moto.status === filters.status;
      const idleTimeMatch = moto.tempo_ocioso_dias >= filters.idleTime;
      return statusMatch && idleTimeMatch;
    });
  }, [filters]);

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
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Exportar Dados
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>QR</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead>Últ. Movimento</TableHead>
              <TableHead>Ociosa (Dias)</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMotorcycles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Nenhuma motocicleta corresponde aos filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filteredMotorcycles.map((moto) => (
                <TableRow key={moto.id}>
                  <TableCell>
                    {moto.qrCodeUrl && (
                      <Image 
                        src={moto.qrCodeUrl} 
                        alt={`QR para ${moto.code}`} 
                        width={30} 
                        height={30} 
                        className="rounded"
                        data-ai-hint="qr code" 
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{moto.code}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(moto.status)}>
                      {translateStatus(moto.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{moto.type}</TableCell>
                  <TableCell>{moto.filial}</TableCell>
                  <TableCell>{new Date(moto.data_ultima_mov).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{moto.tempo_ocioso_dias}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Marcar como Recolhida</DropdownMenuItem>
                        <DropdownMenuItem>Marcar como Relocada</DropdownMenuItem>
                        <DropdownMenuItem>Marcar para Manutenção</DropdownMenuItem>
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
