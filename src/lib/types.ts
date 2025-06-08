
export interface Kpi {
  title: string;
  value: string;
  icon?: React.ElementType;
  description?: string;
  color?: string; // Cor do texto principal do valor
  iconBgColor?: string; // Cor de fundo da caixa do ícone e borda do card
  iconColor?: string; // Cor do ícone
  titleClassName?: string; // Classe CSS opcional para o título
  valueClassName?: string; // Classe CSS opcional para o valor
  descriptionClassName?: string; // Classe CSS opcional para a descrição
}

export interface ChartDataPoint {
  date?: string; // Mantido opcional para compatibilidade com gráficos mensais que usam 'month'
  month?: string; // Para gráficos mensais ou diários formatados como 'dd/MM'
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
  statusKey?: MotorcycleStatus; // Adicionado para facilitar o mapeamento
  icon?: React.ElementType; // Adicionado para ícones no StatusRapidoItem
}

export type MotorcyclePageFilters = {
  status: MotorcycleStatus | 'all';
  model: string | 'all';
  searchTerm: string;
  data_ultima_mov?: Date | null; // Adicionado para filtro de data
};


    