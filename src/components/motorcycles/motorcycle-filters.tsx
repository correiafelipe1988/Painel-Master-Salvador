"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MotorcycleStatus } from '@/lib/types';
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal } from 'lucide-react';

interface MotorcycleFiltersProps {
  onFilterChange: (filters: { status: MotorcycleStatus | 'all'; idleTime: number }) => void;
  initialFilters: { status: MotorcycleStatus | 'all'; idleTime: number };
}

const statusOptions: { value: MotorcycleStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inadimplente', label: 'Delinquent' },
  { value: 'recolhida', label: 'Recovered' },
  { value: 'relocada', label: 'Relocated' },
  { value: 'manutencao', label: 'Maintenance' },
];

export function MotorcycleFilters({ onFilterChange, initialFilters }: MotorcycleFiltersProps) {
  const [status, setStatus] = useState<MotorcycleStatus | 'all'>(initialFilters.status);
  const [idleTime, setIdleTime] = useState<number>(initialFilters.idleTime);

  const handleApplyFilters = () => {
    onFilterChange({ status, idleTime });
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-card shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as MotorcycleStatus | 'all')}>
            <SelectTrigger id="status-filter" className="w-full">
              <SelectValue placeholder="Select status" />
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
        
        <div className="md:col-span-1 lg:col-span-1">
          <Label htmlFor="idle-time-filter" className="text-sm font-medium">
            Min. Idle Time (days): {idleTime}
          </Label>
          <Slider
            id="idle-time-filter"
            min={0}
            max={30}
            step={1}
            value={[idleTime]}
            onValueChange={(value) => setIdleTime(value[0])}
            className="mt-2"
          />
        </div>
        
        <div className="flex items-end space-x-2">
          <Button onClick={handleApplyFilters} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            <Search className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
