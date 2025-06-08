'use server';

/**
 * @fileOverview AI flow to predict motorcycle idle time based on status, type and filial.
 *
 * - predictIdleTime - Predicts the idle time of a motorcycle.
 * - PredictIdleTimeInput - Input type for predictIdleTime.
 * - PredictIdleTimeOutput - Output type for predictIdleTime.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictIdleTimeInputSchema = z.object({
  status: z
    .enum(['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao'])
    .describe('The current status of the motorcycle.'),
  type: z.enum(['nova', 'usada']).describe('The type of the motorcycle (new or used).'),
  filial: z.string().describe('The branch (filial) of the motorcycle.'),
  data_ultima_mov: z.string().describe('The last movement date of the motorcycle. Date format: YYYY-MM-DD'),
});

export type PredictIdleTimeInput = z.infer<typeof PredictIdleTimeInputSchema>;

const PredictIdleTimeOutputSchema = z.object({
  predictedIdleTimeDays: z
    .number()
    .describe('The predicted idle time in days based on historical data.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the predicted idle time, including trends.'),
});

export type PredictIdleTimeOutput = z.infer<typeof PredictIdleTimeOutputSchema>;

export async function predictIdleTime(input: PredictIdleTimeInput): Promise<PredictIdleTimeOutput> {
  return predictIdleTimeFlow(input);
}

const predictIdleTimePrompt = ai.definePrompt({
  name: 'predictIdleTimePrompt',
  input: {schema: PredictIdleTimeInputSchema},
  output: {schema: PredictIdleTimeOutputSchema},
  prompt: `You are an AI assistant that predicts the idle time of a motorcycle based on its current status, type, filial, and last movement date.

  Analyze historical data and current trends to estimate how long the motorcycle will remain idle.
  Provide a predicted idle time in days and a detailed reasoning behind the prediction, including identified trends.

  Motorcycle Status: {{{status}}}
  Motorcycle Type: {{{type}}}
  Branch (Filial): {{{filial}}}
  Last Movement Date: {{{data_ultima_mov}}}

  Respond with the predicted idle time in days and the reasoning behind the prediction:
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
