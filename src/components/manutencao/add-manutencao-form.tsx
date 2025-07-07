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
  nome_cliente: z.string().min(2, "Nome obrigatório"),
  veiculo_placa: z.string().min(3, "Placa obrigatória"),
  veiculo_modelo: z.string().min(2, "Modelo obrigatório"),
  veiculo_fabricante: z.string().min(2, "Fabricante obrigatório"),
  semana: z.string().min(1, "Semana obrigatória"),
  data: z.date({ required_error: "Data obrigatória" }),
  valor_total: z.coerce.number().min(0, "Valor obrigatório"),
  pecas_utilizadas: z.string().optional(),
  responsaveis_mao_obra: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultFormValues: FormValues = {
  nome_cliente: "",
  veiculo_placa: "",
  veiculo_modelo: "",
  veiculo_fabricante: "",
  semana: "",
  data: new Date(),
  valor_total: 0,
  pecas_utilizadas: "",
  responsaveis_mao_obra: "",
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
        nome_cliente: initialData.nome_cliente || "",
        veiculo_placa: initialData.veiculo_placa || "",
        veiculo_modelo: initialData.veiculo_modelo || "",
        veiculo_fabricante: initialData.veiculo_fabricante || "",
        semana: initialData.semana || "",
        data: initialData.data ? parseISO(initialData.data) : new Date(),
        valor_total: initialData.valor_total || 0,
        pecas_utilizadas: initialData.pecas_utilizadas || "",
        responsaveis_mao_obra: initialData.responsaveis_mao_obra || "",
      };
      form.reset(dataToReset);
    } else {
      form.reset(defaultFormValues);
    }
  }, [initialData, form]);

  function handleFormSubmit(values: FormValues) {
    const manutencaoData: Omit<ManutencaoData, 'id' | 'created_at' | 'updated_at'> = {
      nome_cliente: values.nome_cliente,
      veiculo_placa: values.veiculo_placa,
      veiculo_modelo: values.veiculo_modelo,
      veiculo_fabricante: values.veiculo_fabricante,
      semana: values.semana,
      data: format(values.data, "yyyy-MM-dd"),
      valor_total: values.valor_total,
      pecas_utilizadas: values.pecas_utilizadas || "",
      responsaveis_mao_obra: values.responsaveis_mao_obra || "",
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
            name="nome_cliente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Ex: FVE LOCAÇÕES LTDA" {...field} />
                </FormControl>
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
                    <Input placeholder="Ex: BRA2E19" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="veiculo_modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: SHINERAY SHI 175" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="veiculo_fabricante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: SHINERAY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="semana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semana <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <FormField
              control={form.control}
              name="valor_total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Total (R$) <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 245.00" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="pecas_utilizadas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peças Utilizadas</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Filtro de óleo, Pastilha de freio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responsaveis_mao_obra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsáveis pela Mão de Obra</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: João, Maria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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