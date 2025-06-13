
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// AddRastreadorForm é removido daqui, pois o modal está agora na página principal
import { RastreadorFilters } from "./rastreador-filters";
import { RastreadoresTable } from "./rastreadores-table";
import { Skeleton } from "@/components/ui/skeleton"; // Para feedback de carregamento

// Define a interface para os dados do rastreador
interface RastreadorData {
  id?: string;
  // Outros campos do rastreador
  [key: string]: any;
}

interface RastreadoresListProps {
  rastreadores: RastreadorData[];
  // onAddRastreador não é mais necessário aqui, o modal é gerenciado pela página
  onDeleteRastreador: (id: string) => Promise<void>;
  onEditRastreador: (rastreador: RastreadorData) => void;
  isLoading: boolean;
}

export function RastreadoresList({
  rastreadores,
  onDeleteRastreador,
  onEditRastreador,
  isLoading,
}: RastreadoresListProps) {
  const [filters, setFilters] = useState({}); // Filtros podem ser implementados futuramente

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleDelete = async (rastreador: RastreadorData) => {
    if (rastreador.id) {
      await onDeleteRastreador(rastreador.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rastreadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rastreadores ({rastreadores.length})</CardTitle>
        {/* O botão de adicionar foi movido para PageHeader na página principal */}
      </CardHeader>
      <CardContent>
        {/* <RastreadorFilters onFilterChange={handleFilterChange} /> */}
        <div className="mt-4">
          <RastreadoresTable
            rastreadores={rastreadores}
            onEdit={onEditRastreador}
            onDelete={handleDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
}
