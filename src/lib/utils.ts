
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MotorcycleStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const translateMotorcycleStatus = (status?: MotorcycleStatus): string => {
  if (!status) return 'N/Definido';
  switch (status) {
    case 'active': return 'Disponível';
    case 'alugada': return 'Alugada';
    case 'inadimplente': return 'Inadimplente';
    case 'manutencao': return 'Manutenção';
    case 'recolhida': return 'Recolhida';
    case 'relocada': return 'Relocada';
    default:
      const s = status as string;
      return s.charAt(0).toUpperCase() + s.slice(1);
  }
};
