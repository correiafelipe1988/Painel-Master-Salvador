"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddRastreadorForm } from "./add-rastreador-form";
import { RastreadorFilters } from "./rastreador-filters";
import { RastreadoresTable } from "./rastreadores-table";

// Define a interface para os dados do rastreador
interface RastreadorData {
  id?: string;
  // Outros campos do rastreador
  [key: string]: any;
}

interface RastreadoresListProps {
  rastreadores: RastreadorData[];
  onAddRastreador: (data: Omit<RastreadorData, 'id'>) => Promise<void>;
  onDeleteRastreador: (id: string) => Promise<void>;
  onEditRastreador: (rastreador: RastreadorData) => void;
}

export function RastreadoresList({
  rastreadores,
  onAddRastreador,
  onDeleteRastreador,
  onEditRastreador,
}: RastreadoresListProps) {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // A função de exclusão agora usa o ID e chama a prop recebida
  const handleDelete = async (rastreador: RastreadorData) => {
    if (rastreador.id) {
      await onDeleteRastreador(rastreador.id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rastreadores</CardTitle>
        {/* Passa a função de adicionar para o formulário */}
        <AddRastreadorForm onAddRastreador={onAddRastreador} />
      </CardHeader>
      <CardContent>
        <RastreadorFilters onFilterChange={handleFilterChange} />
        <div className="mt-4">
          <RastreadoresTable
            rastreadores={rastreadores}
            onEdit={onEditRastreador}
            onDelete={handleDelete} // Passa a função de exclusão para a tabela
          />
        </div>
      </CardContent>
    </Card>
  );
}
