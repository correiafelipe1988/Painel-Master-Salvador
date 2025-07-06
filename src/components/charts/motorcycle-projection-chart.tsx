"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Calendar, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { subscribeToMotorcycles } from "@/lib/firebase/motorcycleService"
import type { Motorcycle } from "@/lib/types"

interface ProjectionData {
  month: string
  monthNumber: number
  atual: number
  projecao: number
  meta: number
  motosNecessarias: number
}

export function MotorcycleProjectionChart() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        setMotorcycles(motosFromDB)
      } else {
        console.warn("Data from subscribeToMotorcycles was not an array:", motosFromDB)
        setMotorcycles([])
      }
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Calcular base atual dinâmica (placas únicas)
  const baseAtual = useMemo(() => {
    const placasUnicas = new Set(motorcycles.map(moto => moto.placa).filter(Boolean))
    return placasUnicas.size
  }, [motorcycles])

  // Determinar o mês atual
  const mesAtual = new Date().getMonth() + 1 // 1-12
  const metaFinal = 1000
  const mesesRestantes = Math.max(1, 12 - mesAtual) // Pelo menos 1 mês
  
  // Calcular quantas motos precisam ser adicionadas
  const motasFaltantes = Math.max(0, metaFinal - baseAtual)
  const motasPorMes = Math.ceil(motasFaltantes / mesesRestantes)

  // Dados históricos estimados (baseado no crescimento até o mês atual)
  const dadosHistoricos = useMemo(() => {
    const crescimentoMedio = baseAtual / mesAtual // Crescimento médio por mês até agora
    
    return [
      { month: "Jan", monthNumber: 1, atual: Math.round(crescimentoMedio * 1) },
      { month: "Fev", monthNumber: 2, atual: Math.round(crescimentoMedio * 2) },
      { month: "Mar", monthNumber: 3, atual: Math.round(crescimentoMedio * 3) },
      { month: "Abr", monthNumber: 4, atual: Math.round(crescimentoMedio * 4) },
      { month: "Mai", monthNumber: 5, atual: Math.round(crescimentoMedio * 5) },
      { month: "Jun", monthNumber: 6, atual: mesAtual >= 6 ? baseAtual : Math.round(crescimentoMedio * 6) },
      { month: "Jul", monthNumber: 7, atual: mesAtual >= 7 ? baseAtual : baseAtual }, // Manter base atual para meses futuros
      { month: "Ago", monthNumber: 8, atual: mesAtual >= 8 ? baseAtual : baseAtual },
      { month: "Set", monthNumber: 9, atual: mesAtual >= 9 ? baseAtual : baseAtual },
      { month: "Out", monthNumber: 10, atual: mesAtual >= 10 ? baseAtual : baseAtual },
      { month: "Nov", monthNumber: 11, atual: mesAtual >= 11 ? baseAtual : baseAtual },
      { month: "Dez", monthNumber: 12, atual: mesAtual >= 12 ? baseAtual : baseAtual }
    ]
  }, [baseAtual, mesAtual])

  // Criar dados de projeção
  const dadosProjecao: ProjectionData[] = useMemo(() => {
    return dadosHistoricos.map((item) => {
      let projecao = item.atual
      let motosNecessarias = 0

      if (item.monthNumber > mesAtual) {
        const mesesApos = item.monthNumber - mesAtual
        projecao = baseAtual + (motasPorMes * mesesApos)
        motosNecessarias = motasPorMes
      } else if (item.monthNumber === mesAtual) {
        projecao = baseAtual
      }

      return {
        ...item,
        projecao: Math.min(projecao, metaFinal),
        meta: metaFinal,
        motosNecessarias
      }
    })
  }, [dadosHistoricos, mesAtual, baseAtual, motasPorMes, metaFinal])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          <p className="text-blue-600">{`Atual: ${data.atual} motos`}</p>
          {data.projecao > data.atual && (
            <p className="text-green-600">{`Projeção: ${data.projecao} motos`}</p>
          )}
          {data.motosNecessarias > 0 && (
            <p className="text-orange-600">{`Necessário: +${data.motosNecessarias} motos`}</p>
          )}
        </div>
      )
    }
    return null
  }

  const getNomesMeses = () => {
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ]
    return meses[mesAtual - 1]
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-l-4 border-l-gray-300 shadow-lg">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="p-3 rounded-lg bg-gray-300 animate-pulse">
                  <div className="h-6 w-6 bg-gray-400 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-[400px] bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Base Atual</p>
              <p className="text-2xl font-bold text-blue-500">{baseAtual}</p>
              <p className="text-xs text-muted-foreground">motos em {getNomesMeses()}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Target className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Meta Dezembro</p>
              <p className="text-2xl font-bold text-green-500">{metaFinal}</p>
              <p className="text-xs text-muted-foreground">motos até dezembro</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Faltam</p>
              <p className="text-2xl font-bold text-orange-500">{motasFaltantes}</p>
              <p className="text-xs text-muted-foreground">motos para a meta</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-500">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Por Mês</p>
              <p className="text-2xl font-bold text-purple-500">+{motasPorMes}</p>
              <p className="text-xs text-muted-foreground">motos necessárias</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Projeção */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Crescimento da Base de Motos</CardTitle>
          <CardDescription>
            Crescimento necessário para atingir 1.000 motos até dezembro de 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dadosProjecao}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 1100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Linha da meta */}
                <ReferenceLine
                  y={metaFinal}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: "Meta: 1.000 motos", position: "top" }}
                />
                
                {/* Linha dos dados atuais */}
                <Line
                  type="monotone"
                  dataKey="atual"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  name="Base Atual"
                />
                
                {/* Linha da projeção */}
                <Line
                  type="monotone"
                  dataKey="projecao"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  name="Projeção Necessária"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Detalhamento Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Mensal</CardTitle>
          <CardDescription>
            Quantidade de motos necessárias por mês para atingir a meta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Mês</th>
                  <th className="text-right p-2">Base Atual</th>
                  <th className="text-right p-2">Projeção</th>
                  <th className="text-right p-2">Motos a Adicionar</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {dadosProjecao.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{item.month}</td>
                    <td className="text-right p-2">{item.atual}</td>
                    <td className="text-right p-2">
                      {item.projecao > item.atual ? (
                        <span className="text-green-600 font-medium">{item.projecao}</span>
                      ) : (
                        item.atual
                      )}
                    </td>
                    <td className="text-right p-2">
                      {item.motosNecessarias > 0 ? (
                        <Badge variant="outline" className="text-orange-600">
                          +{item.motosNecessarias}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="text-center p-2">
                      {item.monthNumber <= mesAtual ? (
                        <Badge variant="secondary">Realizado</Badge>
                      ) : (
                        <Badge variant="outline">Planejado</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resumo da Estratégia */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Resumo da Estratégia</CardTitle>
        </CardHeader>
        <CardContent className="text-orange-700">
          <div className="space-y-2">
            <p>
              <strong>Situação Atual:</strong> {baseAtual} motos na base ({getNomesMeses()} 2025)
            </p>
            <p>
              <strong>Meta:</strong> 1.000 motos até dezembro 2025
            </p>
            <p>
              <strong>Crescimento Necessário:</strong> +{motasFaltantes} motos em {mesesRestantes} meses
            </p>
            <p>
              <strong>Média Mensal:</strong> +{motasPorMes} motos por mês ({getNomesMeses() === 'dezembro' ? 'dezembro' : `${getNomesMeses()} a dezembro`})
            </p>
            <p className="text-sm mt-4 p-3 bg-orange-100 rounded-lg">
              <strong>Recomendação:</strong> Para atingir a meta de 1.000 motos até dezembro, 
              é necessário adicionar aproximadamente {motasPorMes} motos por mês a partir de {getNomesMeses()}. 
              {baseAtual > 0 && (
                <>
                  Isso representa um crescimento mensal de {((motasPorMes / baseAtual) * 100).toFixed(1)}% 
                  sobre a base atual.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}