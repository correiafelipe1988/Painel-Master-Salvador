'use server';

/**
 * @fileOverview Fluxo de IA para prever o tempo ocioso de motocicletas com base no status, tipo e filial.
 *
 * - predictIdleTime - Prevê o tempo ocioso de uma motocicleta.
 * - PredictIdleTimeInput - Tipo de entrada para predictIdleTime.
 * - PredictIdleTimeOutput - Tipo de saída para predictIdleTime.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictIdleTimeInputSchema = z.object({
  status: z
    .enum(['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao'])
    .describe('O status atual da motocicleta.'),
  type: z.enum(['nova', 'usada']).describe('O tipo da motocicleta (nova ou usada).'),
  filial: z.string().describe('A filial da motocicleta.'),
  data_ultima_mov: z.string().describe('A data da última movimentação da motocicleta. Formato: AAAA-MM-DD'),
});

export type PredictIdleTimeInput = z.infer<typeof PredictIdleTimeInputSchema>;

const PredictIdleTimeOutputSchema = z.object({
  predictedIdleTimeDays: z
    .number()
    .describe('O tempo ocioso previsto em dias com base em dados históricos.'),
  reasoning: z
    .string()
    .describe('A justificativa da IA para o tempo ocioso previsto, incluindo tendências.'),
});

export type PredictIdleTimeOutput = z.infer<typeof PredictIdleTimeOutputSchema>;

export async function predictIdleTime(input: PredictIdleTimeInput): Promise<PredictIdleTimeOutput> {
  return predictIdleTimeFlow(input);
}

const predictIdleTimePrompt = ai.definePrompt({
  name: 'predictIdleTimePrompt',
  input: {schema: PredictIdleTimeInputSchema},
  output: {schema: PredictIdleTimeOutputSchema},
  prompt: `Você é um assistente de IA que prevê o tempo ocioso de uma motocicleta com base em seu status atual, tipo, filial e data da última movimentação.

  Analise dados históricos e tendências atuais para estimar por quanto tempo a motocicleta permanecerá ociosa.
  Forneça um tempo ocioso previsto em dias e uma justificativa detalhada para a previsão, incluindo tendências identificadas.

  Status da Motocicleta: {{{status}}}
  Tipo da Motocicleta: {{{type}}}
  Filial: {{{filial}}}
  Data da Última Movimentação: {{{data_ultima_mov}}}

  Responda com o tempo ocioso previsto em dias e a justificativa para a previsão:
  `,
});

const predictIdleTimeFlow = ai.defineFlow(
  {
    name: 'predictIdleTimeFlow',
    inputSchema: PredictIdleTimeInputSchema,
    outputSchema: PredictIdleTimeOutputSchema,
  },
  async input => {
    const {output} = await predictIdleTimePrompt(input);
    return output!;
  }
);
