
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function RastreadoresTable({
  rastreadores,
  onEdit,
  onDelete,
}: {
  rastreadores: any[];
  onEdit: (rastreador: any) => void;
  onDelete: (rastreador: any) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>CNPJ</TableHead>
          <TableHead>EMPRESA</TableHead>
          <TableHead>FRANQUEADO</TableHead>
          <TableHead>CHASSI</TableHead>
          <TableHead>PLACA</TableHead>
          <TableHead>RASTREADOR</TableHead>
          <TableHead>TIPO</TableHead>
          <TableHead>MOTO</TableHead>
          <TableHead>MÊS</TableHead>
          <TableHead>VALOR</TableHead>
          <TableHead>AÇÕES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* CORREÇÃO: Garante que 'rastreadores' seja um array antes de chamar .map() */}
        {(rastreadores || []).map((rastreador, index) => (
          <TableRow key={rastreador.id || index}>
            <TableCell>{rastreador.cnpj}</TableCell>
            <TableCell>{rastreador.empresa}</TableCell>
            <TableCell>{rastreador.franqueado}</TableCell>
            <TableCell>{rastreador.chassi}</TableCell>
            <TableCell>{rastreador.placa}</TableCell>
            <TableCell>{rastreador.rastreador}</TableCell>
            <TableCell>{rastreador.tipo}</TableCell>
            <TableCell>{rastreador.moto}</TableCell>
            <TableCell>{rastreador.mes}</TableCell>
            <TableCell>{rastreador.valor}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(rastreador)}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(rastreador)}
                    className="text-destructive hover:!text-destructive focus:!text-destructive !bg-transparent hover:!bg-destructive/10 focus:!bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
