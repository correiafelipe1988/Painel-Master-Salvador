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
        title="Predictive Idle Time Tool"
        description="Use AI to estimate motorcycle idle time based on various factors."
      />
      <PredictIdleForm onPredictionResult={handlePredictionResult} />
      {predictionResult !== null && <PredictionResult result={predictionResult} />}
    </DashboardLayout>
  );
}
