
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DollarSign, Package, Trophy, Users } from "lucide-react"; // Importa o ícone Users

// Função para formatar valores monetários
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// Tipagem para as props do componente
interface ProductPerformanceCardProps {
  rank: number;
  modelName: string;
  unitsSold: number;
  totalRevenue: number;
  averagePrice: number;
  revenuePercentage: number;
  franchiseeCount: number; // Novo campo
  isTopThree: boolean;
}

export function ProductPerformanceCard({
  rank,
  modelName,
  unitsSold,
  totalRevenue,
  averagePrice,
  revenuePercentage,
  franchiseeCount,
  isTopThree,
}: ProductPerformanceCardProps) {
  
  const rankColors = {
    1: "bg-amber-400 text-white",
    2: "bg-slate-400 text-white",
    3: "bg-orange-400 text-white",
  };

  const badgeColors = {
    1: "bg-amber-500 hover:bg-amber-600",
    2: "bg-slate-500 hover:bg-slate-600",
    3: "bg-orange-500 hover:bg-orange-600",
  };

  const rankColorClass = rank <= 3 ? rankColors[rank] : "bg-muted text-muted-foreground";
  const badgeColorClass = rank <= 3 ? badgeColors[rank] : "";

  return (
    <Card className={cn(
      "transition-all hover:shadow-lg",
      isTopThree ? "bg-amber-50 border-2 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700" : "bg-card"
    )}>
      <CardContent className="p-4">
        {/* Seção Superior: Ranking, Nome e Receita Total */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <span className={cn(
              "text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full",
              rankColorClass
            )}>
              {rank}º
            </span>
            <div>
              <h3 className="text-lg font-bold">{modelName}</h3>
              <p className="text-sm text-muted-foreground">{unitsSold} unidades vendidas</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">{revenuePercentage.toFixed(1)}% da receita total</p>
          </div>
        </div>

        {/* Seção Média: Métricas Detalhadas */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">
          {/* Preço Médio */}
          <div className="flex flex-col items-start">
            <p className="text-sm text-muted-foreground">Preço Médio</p>
            <div className="flex items-center gap-2 mt-1">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-lg font-bold text-green-600">{formatCurrency(averagePrice)}</span>
            </div>
          </div>
          {/* Unidades Vendidas */}
          <div className="flex flex-col items-start">
            <p className="text-sm text-muted-foreground">Unidades Vendidas</p>
            <div className="flex items-center gap-2 mt-1">
                <Package className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-bold text-blue-600">{unitsSold}</span>
            </div>
          </div>
           {/* Franqueados Compradores */}
          <div className="flex flex-col items-start">
            <p className="text-sm text-muted-foreground">Franqueados</p>
            <div className="flex items-center gap-2 mt-1">
                <Users className="h-5 w-5 text-indigo-500" />
                <span className="text-lg font-bold text-indigo-600">{franchiseeCount}</span>
            </div>
          </div>
        </div>

        {/* Selo de Top 3 */}
        {isTopThree && (
          <div className="mt-4 text-right">
            <Badge className={cn("text-white", badgeColorClass)}>
              <Trophy className="h-4 w-4 mr-2" />
              Top {rank}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
