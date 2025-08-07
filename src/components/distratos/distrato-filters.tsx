"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";

export interface DistratoFiltersState {
  searchTerm: string;
  franqueado: string;
  causa: string;
  periodo: string;
}

interface DistratoFiltersProps {
  onFilterChange: (filters: DistratoFiltersState) => void;
  initialFilters: DistratoFiltersState;
  franqueados: string[];
  causas: string[];
}

export function DistratoFilters({ 
  onFilterChange, 
  initialFilters, 
  franqueados,
  causas 
}: DistratoFiltersProps) {
  const [filters, setFilters] = useState<DistratoFiltersState>(initialFilters);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleInputChange = (field: keyof DistratoFiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Placa, motivo..."
              value={filters.searchTerm}
              onChange={(e) => handleInputChange('searchTerm', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Franqueado</Label>
            <Select
              value={filters.franqueado}
              onValueChange={(value) => handleInputChange('franqueado', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os franqueados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os franqueados</SelectItem>
                {franqueados.map((franqueado) => (
                  <SelectItem key={franqueado} value={franqueado}>
                    {franqueado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Causa</Label>
            <Select
              value={filters.causa}
              onValueChange={(value) => handleInputChange('causa', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as causas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as causas</SelectItem>
                {causas.map((causa) => (
                  <SelectItem key={causa} value={causa}>
                    {causa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Período</Label>
            <Select
              value={filters.periodo}
              onValueChange={(value) => handleInputChange('periodo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os períodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="60">Últimos 60 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="180">Últimos 6 meses</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}