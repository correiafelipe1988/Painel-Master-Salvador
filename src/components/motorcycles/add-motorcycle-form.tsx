
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
import { CalendarIcon, Save, XIcon, Edit, PlusCircle } from "lucide-react";
import { MotorcycleIcon as TitleIcon } from '@/components/icons/motorcycle-icon';
import type { Motorcycle, MotorcycleStatus, MotorcycleType } from "@/lib/types";
import { DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect } from "react";

const motorcycleStatusOptions: { value: MotorcycleStatus; label: string }[] = [
  { value: 'active', label: 'Disponível' },
  { value: 'alugada', label: 'Alugada' },
  { value: 'inadimplente', label: 'Inadimplente' },
  { value: 'recolhida', label: 'Recolhida' },
  { value: 'relocada', label: 'Relocada' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'indisponivel_rastreador', label: 'Indisponível Rastreador' },
  { value: 'indisponivel_emplacamento', label: 'Indisponível Emplacamento' },
  { value: 'furto_roubo', label: 'Furto/Roubo' },
];

const motorcycleTypeOptions: { value: MotorcycleType; label: string }[] = [
  { value: 'nova', label: 'Nova' },
  { value: 'usada', label: 'Usada' },
];

const motorcycleModelOptions = [
  { value: 'SHINERAY SHI 175 CARBURADA', label: 'SHINERAY SHI 175 CARBURADA' },
  { value: 'SHINERAY SHI 175 INJETADA', label: 'SHINERAY SHI 175 INJETADA' },
  { value: 'DAFRA NH190', label: 'DAFRA NH190' },
  { value: 'HAOJUE DK 150', label: 'HAOJUE DK 150' },
  { value: 'HAOJUE DK160', label: 'HAOJUE DK160' },
  { value: 'SHINERAY XY150', label: 'SHINERAY XY150' },
];

const formSchema = z.object({
  placa: z.string().min(7, "A placa deve ter pelo menos 7 caracteres.").max(8, "A placa deve ter no máximo 8 caracteres.").regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, "Formato de placa inválido (Ex: AAA1B23)."),
  model: z.string().optional(),
  type: z.enum(['nova', 'usada']).optional(),
  status: z.enum(['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada', 'indisponivel_rastreador', 'indisponivel_emplacamento', 'furto_roubo']).optional(),
  valorSemanal: z.coerce.number().positive("O valor semanal deve ser positivo.").optional().or(z.literal('')),
  data_ultima_mov: z.date().optional(),
  tempo_ocioso_dias: z.coerce.number().min(0, "Os dias parado não podem ser negativos.").optional().or(z.literal('')),
  franqueado: z.string().optional(),
  qrCodeUrl: z.string().optional(), // CS é agora um texto livre
});

type FormValues = z.infer<typeof formSchema>;

const defaultFormValues: FormValues = {
  placa: "",
  model: "",
  type: undefined,
  status: undefined,
  valorSemanal: undefined,
  data_ultima_mov: undefined,
  tempo_ocioso_dias: undefined,
  franqueado: "",
  qrCodeUrl: "",
};

interface AddMotorcycleFormProps {
  onSubmit: (data: Motorcycle) => void;
  onCancel: () => void;
  initialData?: Motorcycle | null;
}

export function AddMotorcycleForm({ onSubmit, onCancel, initialData }: AddMotorcycleFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (initialData) {
      const dataToReset: FormValues = {
        placa: initialData.placa || "",
        model: initialData.model || "",
        type: initialData.type || undefined,
        status: initialData.status || undefined,
        valorSemanal: initialData.valorSemanal !== undefined ? initialData.valorSemanal : '',
        // Convert string date from initialData to Date object for the calendar
        data_ultima_mov: initialData.data_ultima_mov && isValid(parseISO(initialData.data_ultima_mov)) ? parseISO(initialData.data_ultima_mov) : undefined,
        tempo_ocioso_dias: initialData.tempo_ocioso_dias !== undefined ? initialData.tempo_ocioso_dias : '',
        franqueado: initialData.franqueado || "",
        qrCodeUrl: initialData.qrCodeUrl || "",
      };
      form.reset(dataToReset);
    } else {
      form.reset(defaultFormValues);
    }
  }, [initialData, form]);

  function handleFormSubmit(values: FormValues) {
    const motorcycleData: Motorcycle = {
      id: initialData?.id || Date.now().toString(), // Use existing ID if editing
      placa: values.placa,
      model: values.model || undefined,
      type: values.type || undefined,
      status: values.status || undefined,
      valorSemanal: values.valorSemanal ? parseFloat(String(values.valorSemanal)) : undefined,
      data_criacao: initialData?.data_criacao || new Date().toISOString(), // Preserve original or set new creation date
      data_ultima_mov: values.data_ultima_mov && isValid(values.data_ultima_mov) ? format(values.data_ultima_mov, "yyyy-MM-dd") : undefined,
      tempo_ocioso_dias: values.tempo_ocioso_dias ? parseInt(String(values.tempo_ocioso_dias), 10) : undefined,
      franqueado: values.franqueado || undefined,
      qrCodeUrl: values.qrCodeUrl || undefined,
    };
    onSubmit(motorcycleData);
  }
  
  const isEditing = !!initialData;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          {isEditing ? <Edit className="mr-2 h-6 w-6 text-primary" /> : <PlusCircle className="mr-2 h-6 w-6 text-primary" />}
          {isEditing ? 'Editar Moto' : 'Adicionar Nova Moto'}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="placa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa <span className="text-destructive">*</span></FormLabel>
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
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {motorcycleModelOptions.map(opt => (
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
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
                  <Select onValueChange={field.onChange} value={field.value || ""}>
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
              name="valorSemanal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Semanal (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 245.00" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} value={field.value === undefined || field.value === null ? '' : field.value} />
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
                          {field.value && isValid(field.value) ? (
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
                    <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} value={field.value === undefined || field.value === null ? '' : field.value}/>
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
                  <Input placeholder="Nome do franqueado" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="qrCodeUrl" // Este é o campo CS
            render={({ field }) => (
              <FormItem>
                <FormLabel>CS (Código de Segurança)</FormLabel>
                <FormControl>
                  <Input placeholder="Identificador do CS (Ex: Nome do Cliente)" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onCancel}>
                <XIcon className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Salvar Alterações' : 'Salvar Moto'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
