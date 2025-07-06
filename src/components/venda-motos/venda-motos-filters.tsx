
"use client";

import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface VendaMotosFiltersProps {
  onFilterChange: (filters: { searchTerm: string }) => void;
}

export function VendaMotosFilters({ onFilterChange }: VendaMotosFiltersProps) {
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchTerm: event.target.value });
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg mb-4">
        <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar por Razão Social, CNPJ, Franqueado, Modelo..."
                className="w-full pl-8"
                onChange={handleSearchChange}
            />
        </div>
    </div>
  );
}
