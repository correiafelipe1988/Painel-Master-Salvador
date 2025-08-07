export type MotorcycleStatus = 'active' | 'alugada' | 'inadimplente' | 'manutencao' | 'recolhida' | 'relocada' | 'indisponivel_rastreador' | 'indisponivel_emplacamento' | 'furto_roubo';
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

export interface VendaMoto {
  id: string;
  data_compra: string;
  parceiro: string;
  status: string;
  entregue: string;
  franqueado: string;
  cnpj: string;
  razao_social: string;
  quantidade: number;
  marca: string;
  modelo: string;
  valor_unitario: number;
  valor_total: number;
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

export interface ManutencaoData {
  id: string;
  data: string;
  veiculo_placa: string;
  veiculo: string;
  nome_cliente: string;
  faturamento_pecas: number;
  custo_pecas: number;
  liquido: number;
  created_at: string;
  updated_at: string;
}
