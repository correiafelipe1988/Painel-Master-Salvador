
"use client";

import { Input } from "@/components/ui/input";

export function RastreadorFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  return (
    <div>
      <Input
        placeholder="Filtrar por ID do rastreador..."
        onChange={(e) => onFilterChange({ id: e.target.value })}
      />
    </div>
  );
}
