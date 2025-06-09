
"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { MoreHorizontal, QrCode, Eye, Edit, Trash2, CheckCircle, XCircle, Bike, Wrench } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { MotorcyclePageFilters } from '@/app/motorcycles/page';
import { differenceInCalendarDays, parseISO, isValid as dateIsValid } from 'date-fns';

const getStatusBadgeVariant = (status?: MotorcycleStatus) => {
  if (!status) return 'outline';
  switch (status) {
    case 'active': return 'default';
    case 'alugada': return 'default';
    case 'inadimplente': return 'destructive';
    case 'manutencao': return 'secondary';
    case 'recolhida': return 'outline';
    case 'relocada': return 'default';
    default: return 'outline';
  }
};

const getStatusBadgeClassName = (status?: MotorcycleStatus) => {
  if (!status) return 'bg-gray-200 text-gray-700 border-gray-400';
  switch (status) {
    case 'active': return 'bg-green-500 hover:bg-green-600 text-white border-green-500';
    case 'alugada': return 'bg-sky-500 hover:bg-sky-600 text-white border-sky-500';
    case 'inadimplente': return 'bg-red-500 hover:bg-red-600 text-white border-red-500';
    case 'manutencao': return 'bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500';
    case 'recolhida': return 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500';
    case 'relocada': return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500';
    default: return 'bg-gray-200 text-gray-700 border-gray-400';
  }
}


const translateStatus = (status?: MotorcycleStatus): string => {
  if (!status) return 'N/Definido';
  switch (status) {
    case 'active': return 'Disponível';
    case 'alugada': return 'Alugada';
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
  motorcycles: Motorcycle[];
  onUpdateStatus: (motorcycleId: string, newStatus: MotorcycleStatus) => void;
  onDeleteMotorcycle: (motorcycleId: string) => void;
  onEditMotorcycle: (motorcycle: Motorcycle) => void;
}

export function MotorcycleList({ filters, motorcycles, onUpdateStatus, onDeleteMotorcycle, onEditMotorcycle }: MotorcycleListProps) {
  const [clientMounted, setClientMounted] = useState(false);
  useEffect(() => {
    setClientMounted(true);
  }, []);

  const filteredMotorcycles = useMemo(() => {
    return motorcycles.filter(moto => {
      const statusMatch = filters.status === 'all' || moto.status === filters.status;
      const modelMatch = filters.model === 'all' || (moto.model || '').toLowerCase().includes(filters.model.toLowerCase());
      const searchTermMatch = filters.searchTerm === '' ||
        moto.placa.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (moto.franqueado || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (moto.model || '').toLowerCase().includes(filters.searchTerm.toLowerCase());

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
              filteredMotorcycles.map((moto) => {
                let daysIdle: string | number = 'N/A';
                if (moto.data_ultima_mov) {
                  try {
                    const lastMoveDate = parseISO(moto.data_ultima_mov);
                    if (dateIsValid(lastMoveDate)) {
                      const today = new Date();
                      // Garante que as datas sejam comparadas sem a parte do horário, para evitar resultados parciais
                      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const lastMoveDateMidnight = new Date(lastMoveDate.getFullYear(), lastMoveDate.getMonth(), lastMoveDate.getDate());
                      
                      daysIdle = differenceInCalendarDays(todayMidnight, lastMoveDateMidnight);
                      if (daysIdle < 0) daysIdle = 0; // Se a data for futura por algum motivo, considerar 0 dias.
                    }
                  } catch (error) {
                    console.error("Error parsing data_ultima_mov for idle calculation:", moto.data_ultima_mov, error);
                  }
                }

                return (
                  <TableRow key={moto.id}>
                    <TableCell>
                      {moto.qrCodeUrl ? (
                         <span title={moto.qrCodeUrl} className="flex items-center gap-1 text-sm">
                          <QrCode className="h-4 w-4 text-muted-foreground" />
                          {moto.qrCodeUrl}
                        </span>
                      ) : (
                        <div className="text-xs text-muted-foreground">N/A</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{moto.placa}</TableCell>
                    <TableCell>{moto.model || 'N/Definido'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(moto.status)} className={getStatusBadgeClassName(moto.status)}>
                        {translateStatus(moto.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{moto.type ? (moto.type === 'nova' ? 'Nova' : 'Usada') : 'N/Definido'}</TableCell>
                    <TableCell>{moto.franqueado || 'N/Definido'}</TableCell>
                    <TableCell>
                      {moto.valorDiaria ? `R$ ${moto.valorDiaria.toFixed(2).replace('.', ',')}` : 'N/A'}
                    </TableCell>
                    <TableCell>{moto.data_ultima_mov ? new Date(moto.data_ultima_mov + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</TableCell>
                    <TableCell>{daysIdle}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => console.log('Ver Detalhes:', moto)}>
                            <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditMotorcycle(moto)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onUpdateStatus(moto.id, 'active')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Marcar como Disponível
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(moto.id, 'alugada')}>
                            <Bike className="mr-2 h-4 w-4 text-sky-500" /> Marcar como Alugada
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(moto.id, 'recolhida')}>
                             <XCircle className="mr-2 h-4 w-4 text-gray-500" /> Marcar como Recolhida
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(moto.id, 'relocada')}>
                             <Bike className="mr-2 h-4 w-4 text-blue-500" /> Marcar como Relocada
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(moto.id, 'manutencao')}>
                            <Wrench className="mr-2 h-4 w-4 text-yellow-500" /> Marcar para Manutenção
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteMotorcycle(moto.id)}
                            className="text-destructive hover:!text-destructive focus:!text-destructive !bg-transparent hover:!bg-destructive/10 focus:!bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
