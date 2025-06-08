
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

export interface RentalDataPoint {
  date: string;
  nova: number;
  usada: number;
}

export type MotorcycleStatus = 'active' | 'inadimplente' | 'recolhida' | 'relocada' | 'manutencao';
export type MotorcycleType = 'nova' | 'usada';

export interface Motorcycle {
  id: string;
  placa: string; // Alterado de code para placa
  status: MotorcycleStatus;
  type: MotorcycleType;
  franqueado: string; // Alterado de filial para franqueado
  data_ultima_mov: string; // YYYY-MM-DD
  tempo_ocioso_dias: number;
  qrCodeUrl?: string; // Mantido para dados, mas label na UI será CS
  model?: string;
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
