import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ClienteFilterProps {
  clientes: string[];
  clienteSelecionado: string;
  onChange: (cliente: string) => void;
}

export function ClienteFilter({ clientes, clienteSelecionado, onChange }: ClienteFilterProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[200px]">
      <Label htmlFor="cliente-select">Cliente</Label>
      <Select value={clienteSelecionado} onValueChange={onChange}>
        <SelectTrigger id="cliente-select" className="w-full">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos</SelectItem>
          {clientes.map((cliente) => (
            <SelectItem key={cliente} value={cliente}>
              {cliente}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 