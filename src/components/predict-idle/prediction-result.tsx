import type { PredictIdleTimeOutput } from "@/ai/flows/predict-idle-time";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

interface PredictionResultProps {
  result: PredictIdleTimeOutput | null;
}

export function PredictionResult({ result }: PredictionResultProps) {
  if (!result) {
    return null;
  }

  const isError = result.predictedIdleTimeDays === -1;

  return (
    <Card className={`mt-6 shadow-lg ${isError ? 'border-destructive' : 'border-primary'}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertCircle className="h-6 w-6 text-destructive" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-primary" />
          )}
          <CardTitle className={`font-headline ${isError ? 'text-destructive' : 'text-primary'}`}>
            {isError ? "Prediction Error" : "Prediction Result"}
          </Title>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError ? (
          <p className="text-destructive">{result.reasoning}</p>
        ) : (
          <>
            <div>
              <CardDescription>Predicted Idle Time</CardDescription>
              <p className="text-2xl font-semibold text-primary">
                {result.predictedIdleTimeDays} days
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <CardDescription>Reasoning & Trends</CardDescription>
              </div>
              <p className="text-sm text-foreground bg-muted p-3 rounded-md leading-relaxed">
                {result.reasoning}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
