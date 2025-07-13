import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, Edit, Save, XIcon } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import type { ManutencaoData } from "@/lib/types";

const formSchema = z.object({
  data: z.date({ required_error: "Data obrigatória" }),
  veiculo_placa: z.string().min(3, "Placa obrigatória"),
  veiculo: z.string().min(2, "Veículo obrigatório"),
  nome_cliente: z.string().min(2, "Nome obrigatório"),
  faturamento_pecas: z.coerce.number().min(0, "Faturamento obrigatório"),
  custo_pecas: z.coerce.number().min(0, "Custo obrigatório"),
  liquido: z.coerce.number().min(0, "Líquido obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultFormValues: FormValues = {
  data: new Date(),
  veiculo_placa: "",
  veiculo: "",
  nome_cliente: "",
  faturamento_pecas: 0,
  custo_pecas: 0,
  liquido: 0,
};

interface AddManutencaoFormProps {
  onSubmit: (data: Omit<ManutencaoData, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: ManutencaoData | null;
}

export function AddManutencaoForm({ onSubmit, onCancel, initialData }: AddManutencaoFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (initialData) {
      const dataToReset: FormValues = {
        data: initialData.data ? parseISO(initialData.data) : new Date(),
        veiculo_placa: initialData.veiculo_placa || "",
        veiculo: initialData.veiculo || "",
        nome_cliente: initialData.nome_cliente || "",
        faturamento_pecas: initialData.faturamento_pecas || 0,
        custo_pecas: initialData.custo_pecas || 0,
        liquido: initialData.liquido || 0,
      };
      form.reset(dataToReset);
    } else {
      form.reset(defaultFormValues);
    }
  }, [initialData, form]);

  function handleFormSubmit(values: FormValues) {
    const manutencaoData: Omit<ManutencaoData, 'id' | 'created_at' | 'updated_at'> = {
      data: format(values.data, "yyyy-MM-dd"),
      veiculo_placa: values.veiculo_placa,
      veiculo: values.veiculo,
      nome_cliente: values.nome_cliente,
      faturamento_pecas: values.faturamento_pecas,
      custo_pecas: values.custo_pecas,
      liquido: values.liquido,
    };
    onSubmit(manutencaoData);
  }

  const isEditing = !!initialData;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          {isEditing ? <Edit className="mr-2 h-6 w-6 text-primary" /> : <PlusCircle className="mr-2 h-6 w-6 text-primary" />}
          {isEditing ? 'Editar Manutenção' : 'Adicionar Manutenção'}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data <span className="text-destructive">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={field.value ? "outline" : "secondary"}
                        className={"w-full pl-3 text-left font-normal" + (!field.value ? " text-muted-foreground" : "")}
                      >
                        {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="veiculo_placa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: TGR9F96" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="veiculo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veículo <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: DAFRA - NH190" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="nome_cliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex: CG Motos Ltda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="faturamento_pecas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faturamento Peças (R$) <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 391.98" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custo_pecas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custo Peças (R$) <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 267.86" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="liquido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Líquido (R$) <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 124.12" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter className="flex flex-row gap-2 justify-end pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onCancel}>
                <XIcon className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" /> Salvar Manutenção
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
} 