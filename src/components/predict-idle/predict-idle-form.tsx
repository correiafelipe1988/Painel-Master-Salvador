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
  status: z.enum(['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao'], {
    required_error: "Status is required.",
  }),
  type: z.enum(['nova', 'usada'], {
    required_error: "Type is required.",
  }),
  filial: z.string().min(1, "Branch is required."),
  data_ultima_mov: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
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
      filial: "",
      data_ultima_mov: new Date().toISOString().split('T')[0], // Default to today
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    onPredictionResult(null); // Clear previous results
    try {
      const input: PredictIdleTimeInput = values;
      const result = await predictIdleTime(input);
      onPredictionResult(result);
    } catch (error) {
      console.error("Error predicting idle time:", error);
      // You might want to show an error toast or message to the user here
      onPredictionResult({ predictedIdleTimeDays: -1, reasoning: "Error fetching prediction." }); // Indicate error
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
                    <FormLabel>Motorcycle Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inadimplente">Delinquent</SelectItem>
                        <SelectItem value="recolhida">Recovered</SelectItem>
                        <SelectItem value="relocada">Relocated</SelectItem>
                        <SelectItem value="manutencao">Maintenance</SelectItem>
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
                    <FormLabel>Motorcycle Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nova">New</SelectItem>
                        <SelectItem value="usada">Used</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="filial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch (Filial)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Salvador Centro" {...field} />
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
                    <FormLabel>Last Movement Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Format: YYYY-MM-DD</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                "Predict Idle Time"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
