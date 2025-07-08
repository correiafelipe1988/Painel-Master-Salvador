"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { ManutencaoData } from "@/lib/types";

interface SearchFilterProps {
  data: ManutencaoData[];
  onFilteredDataChange: (filteredData: ManutencaoData[]) => void;
}

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const parseSearchQuery = (query: string) => {
  const filters: { field?: string; value: string; operator?: string }[] = [];
  const parts = query.split(" ").filter(Boolean);

  for (const part of parts) {
    if (part.includes(":")) {
      const [field, value] = part.split(":");
      if (field && value) {
        filters.push({ field, value: normalizeText(value) });
      }
    } else if (part.startsWith(">")) {
      const value = part.substring(1);
      if (value) {
        filters.push({ operator: ">", value });
      }
    } else if (part.startsWith("<")) {
      const value = part.substring(1);
      if (value) {
        filters.push({ operator: "<", value });
      }
    } else {
      filters.push({ value: normalizeText(part) });
    }
  }

  return filters;
};

const matchesFilter = (item: ManutencaoData, filter: { field?: string; value: string; operator?: string }) => {
  if (filter.operator === ">" || filter.operator === "<") {
    const numValue = parseFloat(filter.value);
    if (isNaN(numValue)) return false;
    
    const itemValue = item.valor_total;
    return filter.operator === ">" ? itemValue > numValue : itemValue < numValue;
  }

  if (filter.field) {
    const fieldMap: { [key: string]: keyof ManutencaoData } = {
      cliente: "nome_cliente",
      placa: "veiculo_placa",
      modelo: "veiculo_modelo",
      fabricante: "veiculo_fabricante",
      data: "data",
      semana: "semana",
      pecas: "pecas_utilizadas",
      responsavel: "responsaveis_mao_obra",
      responsaveis: "responsaveis_mao_obra",
    };

    const fieldKey = fieldMap[filter.field] || filter.field as keyof ManutencaoData;
    const fieldValue = item[fieldKey];
    
    if (fieldValue === undefined || fieldValue === null) return false;
    
    return normalizeText(String(fieldValue)).includes(filter.value);
  }

  const searchableFields = [
    item.nome_cliente,
    item.veiculo_placa,
    item.veiculo_modelo,
    item.veiculo_fabricante,
    item.data,
    item.semana,
    item.pecas_utilizadas,
    item.responsaveis_mao_obra,
  ];

  return searchableFields.some(field => 
    field && normalizeText(String(field)).includes(filter.value)
  );
};

export function SearchFilter({ data, onFilteredDataChange }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(data);
      onFilteredDataChange(data);
      return;
    }

    const filters = parseSearchQuery(searchQuery);
    const filtered = data.filter(item => 
      filters.every(filter => matchesFilter(item, filter))
    );

    setFilteredData(filtered);
    onFilteredDataChange(filtered);
  }, [searchQuery, data, onFilteredDataChange]);

  const handleClearFilter = () => {
    setSearchQuery("");
  };

  const resultCount = filteredData.length;
  const totalCount = data.length;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="search-filter" className="text-sm font-medium">
        Filtrar Manutenções
      </Label>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="search-filter"
            type="text"
            placeholder="Buscar por cliente, placa, data, modelo... Ex: Honda, ABC-1234, cliente:João"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        {searchQuery && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilter}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          {resultCount} de {totalCount} registros encontrados
        </div>
      )}
      {searchQuery && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <strong>Dicas:</strong> Use "cliente:João" para buscar cliente específico, 
          "placa:ABC-1234" para placa, ">500" para valores acima de R$ 500, 
          "2024-01" para data específica
        </div>
      )}
    </div>
  );
}