"use client";

import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Motorcycle } from "@/lib/types"; // Assuming Motorcycle type exists
import { fetchMotorcyclesByFranchiseeAndDateRange, subscribeToMotorcycles, MotorcycleStatus } from "@/lib/firebase/motorcycleService";

export default function ResumoFranqueadoPage() {
  const [selectedFranchisee, setSelectedFranchisee] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Placeholder for fetching and displaying data
  // Example structure for franchiseeSummary:
  // {
  //   total: number;
  //   statusCounts: { [status: string]: number };
  // }
  // const [franchiseeSummary, setFranchiseeSummary] = useState<any>(null);
  const [franchiseeSummary, setFranchiseeSummary] = useState<{ [status: string]: number } | null>(null);
  const [dailyMovementData, setDailyMovementData] = useState<Array<{ date: string; count: number }>>([]);



  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [franchisees, setFranchisees] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        const uniqueFranchisees = Array.from(
          new Set(motosFromDB.map(moto => moto.franqueado?.trim().toLowerCase()).filter((franqueado): franqueado is string => !!franqueado))
        ).sort(); // Optional: sort alphabetically
        console.log('Franqueados únicos obtidos:', uniqueFranchisees);
        setFranchisees(uniqueFranchisees);
      } else {
        console.warn("Data from subscribeToMotorcycles (resumo franqueado page) was not an array:", motosFromDB);
        setFranchisees([]);
      }
    });

    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    console.log('Filter values:', { selectedFranchisee, startDate, endDate });
    if (selectedFranchisee && startDate && endDate) {
      setIsLoading(true);
      setError(null);
      fetchMotorcyclesByFranchiseeAndDateRange(selectedFranchisee, startDate, endDate)
        .then(data => {
          const counts: { [status: string]: number } = {};
          data.forEach(moto => {
            if (moto.status) { // Ensure status exists
              counts[moto.status] = (counts[moto.status] || 0) + 1;
            }
          });
          setFranchiseeSummary(counts);

          const dailyCounts: { [date: string]: number } = {};
          data.forEach(moto => {
            if (moto.data_ultima_mov) {
              const date = format(new Date(moto.data_ultima_mov), 'yyyy-MM-dd');
              dailyCounts[date] = (dailyCounts[date] || 0) + 1;
            }
          });

          const formattedDailyData = Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setDailyMovementData(formattedDailyData);
        })
        .catch(err => setError("Erro ao buscar dados: " + (err instanceof Error ? err.message : String(err))))
        .finally(() => setIsLoading(false));
    } else {
      setFranchiseeSummary(null);
    }
  }, [selectedFranchisee, startDate, endDate]);


  return (
 <DashboardLayout>
 <PageHeader
 title="Resumo Franqueado"
 description="Visualize um resumo das motocicletas por status para um franqueado e período específicos."
 />
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 <div>
 <Label htmlFor="franchisee">Franqueado:</Label>
 <Select onValueChange={setSelectedFranchisee} value={selectedFranchisee}>
 <SelectTrigger id="franchisee">
 <SelectValue placeholder="Selecione o Franqueado" />
 </SelectTrigger>
 <SelectContent>
 {franchisees.map(franqueado => (
 <SelectItem key={franqueado} value={franqueado}>{franqueado}</SelectItem>
 ))}
            </SelectContent>
          </Select>
 </div>
 <div>
 <Label htmlFor="startDate">Data Início:</Label>
 <Input
 type="date"
 id="startDate"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}

          />
 </div>
 <div>
 <Label htmlFor="endDate">Data Fim:</Label>
 <Input
 type="date"
 id="endDate"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}

          />
        </div>
      </div>

      {isLoading && <p>Carregando resumo...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {franchiseeSummary !== null && !isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {['active', 'alugada', 'manutencao', 'relocada'].map(statusKey => {
            const count = franchiseeSummary[statusKey];
            if (typeof count === 'number') {
              let title = '';
              // Assign titles based on statusKey
              switch (statusKey) {
                case 'active':
                  title = 'Motos Disponíveis';
                  break;
                case 'alugada':
                  title = 'Motos Alugadas';
                  break;
                case 'manutencao':
                  title = 'Em Manutenção';
                  break;
                case 'relocada':
                  title = 'Motos Relocadas';
                  break;
              }
              return (
                <Card key={statusKey}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    {/* Placeholder Icon - Replace with actual icons */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count}</div>
                    {/* Optional: Add time period text here, e.g., <p className="text-xs text-muted-foreground">no período</p> */}
                  </CardContent>
                </Card>
              );
            }
            return null; // Don't render card if status count doesn't exist
          })}
        </div>
      )}

      {dailyMovementData.length > 0 && !isLoading && !error && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Movimentações Diárias</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for the Chart Component */}
            <div style={{ height: '300px', border: '1px dashed #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Gráfico de Barras Aqui</div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}