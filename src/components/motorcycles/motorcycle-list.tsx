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
import { MoreHorizontal, QrCode, Eye, Edit, Trash2, CheckCircle, XCircle, Bike, Wrench, Play, Pause } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { MotorcyclePageFilters } from '@/app/motorcycles/page';
import { differenceInCalendarDays, parseISO, isValid as dateIsValid } from 'date-fns';
import { calculateCorrectIdleDays } from '@/lib/firebase/motorcycleService';

const getStatusBadgeVariant = (status?: MotorcycleStatus) => {
  if (!status) return 'outline';
  switch (status) {
    case 'active': return 'default';
    case 'alugada': return 'default';
    case 'inadimplente': return 'destructive';
    case 'manutencao': return 'secondary';
    case 'recolhida': return 'outline';
    case 'relocada': return 'default';
    case 'indisponivel_rastreador': return 'destructive';
    case 'indisponivel_emplacamento': return 'destructive';
    case 'furto_roubo': return 'destructive';
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
    case 'indisponivel_rastreador': return 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500';
    case 'indisponivel_emplacamento': return 'bg-purple-500 hover:bg-purple-600 text-white border-purple-500';
    case 'furto_roubo': return 'bg-black hover:bg-gray-800 text-white border-black';
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
    case 'indisponivel_rastreador': return 'Indisponível Rastreador';
    case 'indisponivel_emplacamento': return 'Indisponível Emplacamento';
    case 'furto_roubo': return 'Furto/Roubo';
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
  onPauseIdleCount: (motorcycle: Motorcycle) => void;
}

export function MotorcycleList({ filters, motorcycles, onUpdateStatus, onDeleteMotorcycle, onEditMotorcycle, onPauseIdleCount }: MotorcycleListProps) {
  const [clientMounted, setClientMounted] = useState(false);
  useEffect(() => {
    setClientMounted(true);
  }, []);

  const filteredMotorcycles = useMemo(() => {
    return motorcycles.filter(moto => {
      const statusMatch = filters.status === 'all' || moto.status === filters.status;
      const modelMatch = filters.model === 'all' || (moto.model || '').toLowerCase().includes(filters.model.toLowerCase());
      const searchTermMatch = filters.searchTerm === '' ||
        (moto.placa || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (moto.franqueado || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (moto.model || '').toLowerCase().includes(filters.searchTerm.toLowerCase());

      return statusMatch && modelMatch && searchTermMatch;
    })
    // Ordenar por data_ultima_mov decrescente (mais recente no topo)
    .sort((a, b) => {
      const dateA = a.data_ultima_mov ? new Date(a.data_ultima_mov) : null;
      const dateB = b.data_ultima_mov ? new Date(b.data_ultima_mov) : null;
      if (dateA && dateB) return dateB.getTime() - dateA.getTime();
      if (dateA) return -1;
      if (dateB) return 1;
      return 0;
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
              <TableHead>Valor Semanal</TableHead>
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
                // Usar a nova função que considera o histórico de movimentações
                const daysIdle = calculateCorrectIdleDays(motorcycles, moto);

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
                      {moto.valorSemanal ? `R$ ${moto.valorSemanal.toFixed(2).replace('.', ',')}` : 'N/A'}
                    </TableCell>
                    <TableCell>{moto.data_ultima_mov ? new Date(moto.data_ultima_mov + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</TableCell>
                    <TableCell>
                      {daysIdle === 'Pausado' ? <Badge variant="secondary">Pausado</Badge> : daysIdle}
                    </TableCell>
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
                          
                          {moto.status === 'manutencao' || moto.status === 'active' ? (
                            <DropdownMenuItem onClick={() => onPauseIdleCount(moto)}>
                              {moto.contagemPausada ? (
                                <Play className="mr-2 h-4 w-4 text-green-500" />
                              ) : (
                                <Pause className="mr-2 h-4 w-4 text-yellow-500" />
                              )}
                              {moto.contagemPausada ? 'Retomar Contagem' : 'Parar Contagem'}
                            </DropdownMenuItem>
                          ) : null}

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
                          <DropdownMenuItem onClick={() => onUpdateStatus(moto.id, 'indisponivel_rastreador')}>
                            <XCircle className="mr-2 h-4 w-4 text-orange-500" /> Indisponível Rastreador
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(moto.id, 'indisponivel_emplacamento')}>
                            <XCircle className="mr-2 h-4 w-4 text-purple-500" /> Indisponível Emplacamento
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(moto.id, 'furto_roubo')}>
                            <XCircle className="mr-2 h-4 w-4 text-black" /> Furto/Roubo
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
