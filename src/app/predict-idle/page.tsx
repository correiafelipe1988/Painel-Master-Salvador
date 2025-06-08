"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { PredictIdleForm } from "@/components/predict-idle/predict-idle-form";
import { PredictionResult } from "@/components/predict-idle/prediction-result";
import type { PredictIdleTimeOutput } from "@/ai/flows/predict-idle-time";

export default function PredictIdlePage() {
  const [predictionResult, setPredictionResult] = useState<PredictIdleTimeOutput | null>(null);

  const handlePredictionResult = (result: PredictIdleTimeOutput | null) => {
    setPredictionResult(result);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Ferramenta Preditiva de Tempo Ocioso"
        description="Use IA para estimar o tempo ocioso de motocicletas com base em diversos fatores."
      />
      <PredictIdleForm onPredictionResult={handlePredictionResult} />
      {predictionResult !== null && <PredictionResult result={predictionResult} />}
    </DashboardLayout>
  );
}
