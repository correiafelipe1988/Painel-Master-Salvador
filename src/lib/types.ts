
export interface Kpi {
  title: string;
  value: string;
  icon?: React.ElementType;
  description?: string;
  color?: string; // Cor do texto principal do valor
  iconBgColor?: string; // Cor de fundo da caixa do ícone
  iconColor?: string; // Cor do ícone
}

export interface ChartDataPoint {
  date: string;
  count: number;
}

// RentalDataPoint não é mais estritamente necessário para RentalVolumeChart,
// pois ele agora usa ChartDataPoint. Mantendo caso seja usado em outro lugar,
// ou pode ser removido se não for.
export interface RentalDataPoint {
  date: string;
  nova: number;
  usada: number;
}

export type MotorcycleStatus = 'active' | 'inadimplente' | 'recolhida' | 'relocada' | 'manutencao' | 'alugada';
export type MotorcycleType = 'nova' | 'usada';

export interface Motorcycle {
  id: string;
  placa: string;
  model?: string;
  status?: MotorcycleStatus;
  type?: MotorcycleType;
  franqueado?: string;
  data_ultima_mov?: string; // YYYY-MM-DD
  tempo_ocioso_dias?: number;
  qrCodeUrl?: string; // Usado para CS (agora um identificador textual)
  valorDiaria?: number;
}

export interface NavItem {
  href: string;
  label: string;
  subLabel?: string;
  icon: React.ElementType;
  labelTooltip?: string;
}

export interface StatusRapidoItem {
  label: string;
  subLabel: string;
  count: number;
  bgColor: string;
  textColor: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
}

export type MotorcyclePageFilters = {
  status: MotorcycleStatus | 'all';
  model: string | 'all';
  searchTerm: string;
};
