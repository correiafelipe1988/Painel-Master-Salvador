
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { VendaMoto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Save, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

// Exemplo de opções, podem ser carregadas de outro lugar
const parceiroOptions = ['PRIME', 'MEGA', 'HABBYZUCA'];
const statusOptions = ['PAGO', 'PAGANDO', 'A PAGAR'];
const entregueOptions = ['SIM', 'NÃO'];

const formSchema = z.object({
  data_compra: z.date({
    required_error: "A data da compra é obrigatória.",
  }),
  parceiro: z.string().min(1, "O parceiro é obrigatório."),
  status: z.string().min(1, "O status é obrigatório."),
  entregue: z.string().min(1, "O status de entrega é obrigatório."),
  franqueado: z.string().min(1, "O franqueado é obrigatório."),
  cnpj: z.string().min(14, "O CNPJ deve ter 14 caracteres.").max(18, "O CNPJ deve ter no máximo 18 caracteres."),
  razao_social: z.string().min(1, "A razão social é obrigatória."),
  quantidade: z.coerce.number().positive("A quantidade deve ser maior que zero."),
  marca: z.string().min(1, "A marca é obrigatória."),
  modelo: z.string().min(1, "O modelo é obrigatório."),
  valor_unitario: z.coerce.number().positive("O valor unitário deve ser maior que zero."),
  valor_total: z.coerce.number().positive("O valor total deve ser maior que zero."),
});

type VendaMotoFormValues = z.infer<typeof formSchema>;

interface VendaMotoFormProps {
  onSubmit: (data: Omit<VendaMoto, 'id'>) => void;
  onCancel: () => void;
  venda?: VendaMoto | null;
}

export function VendaMotoForm({ onSubmit, venda, onCancel }: VendaMotoFormProps) {
  const defaultValues: VendaMotoFormValues = {
    data_compra: venda?.data_compra ? parseISO(venda.data_compra) : new Date(),
    parceiro: venda?.parceiro || '',
    status: venda?.status || '',
    entregue: venda?.entregue || '',
    franqueado: venda?.franqueado || '',
    cnpj: venda?.cnpj || '',
    razao_social: venda?.razao_social || '',
    quantidade: venda?.quantidade || 0,
    marca: venda?.marca || '',
    modelo: venda?.modelo || '',
    valor_unitario: venda?.valor_unitario || 0,
    valor_total: venda?.valor_total || 0,
  };
  
  const form = useForm<VendaMotoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit: SubmitHandler<VendaMotoFormValues> = (data) => {
    const finalData = {
      ...data,
      data_compra: format(data.data_compra, "yyyy-MM-dd"), // Converte data para string antes de enviar
    };
    onSubmit(finalData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data_compra"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Compra</FormLabel>
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
            name="parceiro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parceiro</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="entregue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entregue</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Franqueado</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="razao_social"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                    <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="valor_unitario"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Valor Unitário</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="valor_total"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Valor Total</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onCancel}>
                <XIcon className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {venda ? 'Salvar Alterações' : 'Salvar Venda'}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
