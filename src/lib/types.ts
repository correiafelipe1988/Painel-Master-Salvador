export interface Kpi {
  title: string;
  value: string;
  icon?: React.ElementType;
  description?: string;
  color?: string;
}

export interface ChartDataPoint {
  date: string;
  count: number;
}

export interface RentalDataPoint {
  date: string;
  nova: number;
  usada: number;
}

export type MotorcycleStatus = 'active' | 'inadimplente' | 'recolhida' | 'relocada' | 'manutencao';
export type MotorcycleType = 'nova' | 'usada';

export interface Motorcycle {
  id: string;
  code: string;
  status: MotorcycleStatus;
  type: MotorcycleType;
  filial: string;
  data_ultima_mov: string; // YYYY-MM-DD
  tempo_ocioso_dias: number;
  qrCodeUrl?: string; // Optional: URL to the QR code image or data
}
