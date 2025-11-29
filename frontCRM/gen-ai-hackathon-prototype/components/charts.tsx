"use client"

import { AgentResult } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"

interface ChartsProps {
  results: AgentResult[]
}

export function Charts({ results }: ChartsProps) {
  if (results.length === 0) {
    return null
  }

  // Datos para gráfico de pie - Distribución de segmentos
  const segmentosData = useMemo(() => {
    const segmentos = results.reduce((acc, r) => {
      const tipo = r.segmento.tipo
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(segmentos).map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value,
      percentage: ((value / results.length) * 100).toFixed(1),
    }))
  }, [results])

  // Datos para gráfico de barras - Gasto por segmento
  const gastoPorSegmento = useMemo(() => {
    const gastos: Record<string, { total: number; count: number }> = {}

    results.forEach((r) => {
      const tipo = r.segmento.tipo
      if (!gastos[tipo]) {
        gastos[tipo] = { total: 0, count: 0 }
      }
      gastos[tipo].total += r.cliente.gasto_promedio
      gastos[tipo].count += 1
    })

    return Object.entries(gastos).map(([name, data]) => ({
      name: name.replace(/_/g, " "),
      promedio: (data.total / data.count).toFixed(2),
      total: data.total.toFixed(2),
    }))
  }, [results])

  // Datos para engagement por red social
  const engagementPorRed = useMemo(() => {
    const engagement: Record<string, { total: number; count: number }> = {}

    results.forEach((r) => {
      const red = r.cliente.red_social
      if (!engagement[red]) {
        engagement[red] = { total: 0, count: 0 }
      }
      engagement[red].total += r.perfil.engagement_rate
      engagement[red].count += 1
    })

    return Object.entries(engagement).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      engagement: ((data.total / data.count) * 100).toFixed(2),
    }))
  }, [results])

  // Colores para los segmentos
  const getSegmentColor = (segmento: string) => {
    if (segmento.includes("premium") || segmento.includes("alto")) return "#3B82F6"
    if (segmento.includes("medio") || segmento.includes("estandar")) return "#10B981"
    if (segmento.includes("basico")) return "#F59E0B"
    return "#EF4444"
  }

  const maxGasto = Math.max(...gastoPorSegmento.map((d) => parseFloat(d.promedio)))

  return (
    <div className="space-y-4">
      {/* Gráfico de Pie - Distribución de Segmentos */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Segmentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            {/* Gráfico de dona CSS */}
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {segmentosData.reduce(
                  (acc, segment, index) => {
                    const percentage = (segment.value / results.length) * 100
                    const offset = acc.offset
                    const strokeDasharray = `${percentage} ${100 - percentage}`
                    const strokeDashoffset = -offset

                    acc.elements.push(
                      <circle
                        key={segment.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={getSegmentColor(segment.name)}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        opacity="0.9"
                      />
                    )

                    acc.offset += percentage
                    return acc
                  },
                  { offset: 0, elements: [] as JSX.Element[] }
                ).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{results.length}</div>
                  <div className="text-sm text-muted-foreground">Clientes</div>
                </div>
              </div>
            </div>

            {/* Leyenda */}
            <div className="space-y-2">
              {segmentosData.map((segment) => (
                <div key={segment.name} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: getSegmentColor(segment.name) }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium capitalize">{segment.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {segment.value} clientes ({segment.percentage}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Gasto Promedio por Segmento */}
      <Card>
        <CardHeader>
          <CardTitle>Gasto Promedio por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gastoPorSegmento.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">{item.name}</span>
                  <span className="text-muted-foreground">${item.promedio}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(parseFloat(item.promedio) / maxGasto) * 100}%`,
                      backgroundColor: getSegmentColor(item.name),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement por Red Social */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement por Red Social</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engagementPorRed.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.engagement}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${parseFloat(item.engagement) * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matriz de Score vs Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz: Score vs Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 border rounded-lg p-4">
            {/* Ejes */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300" />
            <div className="absolute top-0 bottom-0 left-0 w-px bg-gray-300" />

            {/* Labels */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
              Score
            </div>
            <div className="absolute top-1/2 -left-16 transform -translate-y-1/2 -rotate-90 text-xs text-muted-foreground">
              Engagement
            </div>

            {/* Puntos */}
            {results.map((result, index) => {
              const x = (result.segmento.score / 100) * 100
              const y = 100 - result.perfil.engagement_rate * 100 * 10

              return (
                <div
                  key={index}
                  className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-150 transition-transform"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    backgroundColor: getSegmentColor(result.segmento.tipo),
                  }}
                  title={`${result.cliente.nombre}: Score ${result.segmento.score}, Engagement ${(result.perfil.engagement_rate * 100).toFixed(1)}%`}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

