
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RastreadoresTable } from "./rastreadores-table";
import { Skeleton } from "@/components/ui/skeleton";

interface RastreadorData {
  id?: string;
  [key: string]: any;
}

interface RastreadoresListProps {
  rastreadores: RastreadorData[];
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

  const handleDelete = async (rastreador: RastreadorData) => {
    if (rastreador.id) {
      await onDeleteRastreador(rastreador.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rastreadores ({rastreadores.length})</CardTitle>
      </CardHeader>
      <CardContent>
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
