
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
import { predictIdleTime, type PredictIdleTimeInput, type PredictIdleTimeOutput } from "@/ai/flows/predict-idle-time";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  status: z.enum(['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada'], {
    required_error: "O status é obrigatório.",
  }),
  type: z.enum(['nova', 'usada'], {
    required_error: "O tipo é obrigatório.",
  }),
  franqueado: z.string().min(1, "O franqueado é obrigatório."),
  data_ultima_mov: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "A data deve estar no formato AAAA-MM-DD."),
});

type FormValues = z.infer<typeof formSchema>;

interface PredictIdleFormProps {
  onPredictionResult: (result: PredictIdleTimeOutput | null) => void;
}

export function PredictIdleForm({ onPredictionResult }: PredictIdleFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "active",
      type: "nova",
      franqueado: "", 
      data_ultima_mov: new Date().toISOString().split('T')[0], 
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    onPredictionResult(null); 
    try {
      const input: PredictIdleTimeInput = {
        status: values.status,
        type: values.type,
        franqueado: values.franqueado,
        data_ultima_mov: values.data_ultima_mov,
      };
      const result = await predictIdleTime(input);
      onPredictionResult(result);
    } catch (error) {
      console.error("Erro ao prever tempo ocioso:", error);
      onPredictionResult({ predictedIdleTimeDays: -1, reasoning: "Erro ao buscar a previsão." }); 
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status da Motocicleta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="alugada">Alugada</SelectItem>
                        <SelectItem value="inadimplente">Inadimplente</SelectItem>
                        <SelectItem value="recolhida">Recolhida</SelectItem>
                        <SelectItem value="relocada">Relocada</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
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
                    <FormLabel>Tipo da Motocicleta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nova">Nova</SelectItem>
                        <SelectItem value="usada">Usada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="franqueado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Franqueado</FormLabel> 
                    <FormControl>
                      <Input placeholder="Ex: Franqueado Salvador Centro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_ultima_mov"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Última Movimentação</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Formato: AAAA-MM-DD</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Prevendo...
                </>
              ) : (
                "Prever Tempo Ocioso"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
