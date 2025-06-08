
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Save, XIcon, MotorcycleIcon as TitleIcon } from "lucide-react"; // Renomeado MotorcycleIcon para TitleIcon para evitar conflito
import type { Motorcycle, MotorcycleStatus, MotorcycleType } from "@/lib/types";
import { DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"; // Adicionado DialogFooter e DialogClose
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const motorcycleStatusOptions: { value: MotorcycleStatus; label: string }[] = [
  { value: 'active', label: 'Disponível' },
  { value: 'inadimplente', label: 'Inadimplente' },
  { value: 'recolhida', label: 'Recolhida' },
  { value: 'relocada', label: 'Relocada' },
  { value: 'manutencao', label: 'Manutenção' },
];

const motorcycleTypeOptions: { value: MotorcycleType; label: string }[] = [
  { value: 'nova', label: 'Nova' },
  { value: 'usada', label: 'Usada' },
];

const formSchema = z.object({
  placa: z.string().min(7, "A placa deve ter pelo menos 7 caracteres.").max(8, "A placa deve ter no máximo 8 caracteres.").regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, "Formato de placa inválido (Ex: AAA1B23)."),
  model: z.string().min(1, "O modelo é obrigatório."),
  type: z.enum(['nova', 'usada'], { required_error: "O tipo é obrigatório." }),
  status: z.enum(['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao'], { required_error: "O status é obrigatório." }),
  valorDiaria: z.coerce.number().positive("O valor da diária deve ser positivo."),
  data_ultima_mov: z.date({ required_error: "A data da última movimentação é obrigatória." }),
  tempo_ocioso_dias: z.coerce.number().min(0, "Os dias parado não podem ser negativos."),
  franqueado: z.string().min(1, "O franqueado é obrigatório."),
  qrCodeUrl: z.string().url("Deve ser uma URL válida para o CS.").or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddMotorcycleFormProps {
  onSubmit: (data: Motorcycle) => void;
  onCancel: () => void;
}

export function AddMotorcycleForm({ onSubmit, onCancel }: AddMotorcycleFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placa: "",
      model: "",
      type: "nova",
      status: "active",
      valorDiaria: undefined, // Para mostrar o placeholder
      data_ultima_mov: new Date(),
      tempo_ocioso_dias: 0,
      franqueado: "",
      qrCodeUrl: "",
    },
  });

  function handleFormSubmit(values: FormValues) {
    const newMotorcycle: Motorcycle = {
      id: Date.now().toString(), // Simple ID generation
      ...values,
      data_ultima_mov: format(values.data_ultima_mov, "yyyy-MM-dd"),
      qrCodeUrl: values.qrCodeUrl || undefined, // Garante que é undefined se vazio
    };
    onSubmit(newMotorcycle);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <TitleIcon className="mr-2 h-6 w-6 text-primary" />
          Adicionar Nova Moto
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="placa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: BRA2E19" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Honda Pop 110i" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {motorcycleTypeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {motorcycleStatusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valorDiaria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Diária (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 35.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data_ultima_mov"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data Última Movimentação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tempo_ocioso_dias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias Parado</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="franqueado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Franqueado Responsável</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do franqueado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="qrCodeUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CS (Código de Segurança/QR Link)</FormLabel>
                <FormControl>
                  <Input placeholder="URL ou identificador do CS" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <XIcon className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salvar Moto
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
