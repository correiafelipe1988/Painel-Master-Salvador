
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from 'lucide-react';

export interface RastreadorFiltersState {
  searchTerm: string;
  status: string | 'all';
  franqueado: string | 'all';
}

interface RastreadorFiltersProps {
  onFilterChange: (filters: RastreadorFiltersState) => void;
  initialFilters: RastreadorFiltersState;
  franqueados: string[];
}

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'manutencao', label: 'Manutenção' },
];

export function RastreadorFilters({ onFilterChange, initialFilters, franqueados }: RastreadorFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
  const [status, setStatus] = useState(initialFilters.status);
  const [franqueado, setFranqueado] = useState(initialFilters.franqueado);

  const franqueadoOptions = [
    { value: 'all', label: 'Todos os Franqueados' },
    ...franqueados.map(f => ({ value: f, label: f })),
  ];

  useEffect(() => {
    onFilterChange({ searchTerm, status, franqueado });
  }, [searchTerm, status, franqueado, onFilterChange]);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
  }, []);

  const handleFranqueadoChange = useCallback((value: string) => {
    setFranqueado(value);
  }, []);

  return (
    <div className="mb-6 p-6 border rounded-lg bg-card shadow-lg">
      <div className="flex items-center mb-4">
        <SlidersHorizontal className="h-5 w-5 mr-2 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div className="lg:col-span-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-filter"
            placeholder="Buscar por placa, rastreador ou chassi"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status-filter" className="w-full">
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={franqueado} onValueChange={handleFranqueadoChange}>
            <SelectTrigger id="franqueado-filter" className="w-full">
              <SelectValue placeholder="Todos os Franqueados" />
            </SelectTrigger>
            <SelectContent>
              {franqueadoOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
