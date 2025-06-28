export type MotorcycleStatus = 'active' | 'alugada' | 'inadimplente' | 'manutencao' | 'recolhida' | 'relocada' | 'indisponivel_rastreador' | 'indisponivel_emplacamento';
export type MotorcycleType = 'nova' | 'usada';

export interface Motorcycle {
  id: string;
  placa?: string;
  model?: string;
  status?: MotorcycleStatus;
  type?: MotorcycleType;
  franqueado?: string;
  data_criacao?: string; // ISO 8601 format: "YYYY-MM-DDTHH:mm:ss.sssZ"
  data_ultima_mov?: string; // ISO 8601 format: "YYYY-MM-DDTHH:mm:ss.sssZ"
  tempo_ocioso_dias?: number;
  qrCodeUrl?: string;
  valorSemanal?: number;
  contagemPausada?: boolean;
  dias_ociosos_congelados?: number; // Dias ociosos no momento que entrou em manutenção
}

export type Kpi = {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
  color?: string;
  iconBgColor?: string;
  iconColor?: string;
};

export type ChartDataPoint = {
  month: string;
  count?: number;
  revenue?: number;
};

export interface NavItem {
  href: string;
  label: string;
  subLabel?: string;
  labelTooltip?: string;
  icon: React.ElementType;
}

export interface StatusRapidoItem {
  label: string;
  subLabel: string;
  count: number;
  bgColor: string;
  textColor: string;
  badgeTextColor: string;
  statusKey?: MotorcycleStatus;
  icon: React.ElementType;
}
