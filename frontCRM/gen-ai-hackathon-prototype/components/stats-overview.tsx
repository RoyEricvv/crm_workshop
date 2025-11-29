"use client"

import { AgentResult } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Target, DollarSign } from "lucide-react"

interface StatsOverviewProps {
  results: AgentResult[]
}

export function StatsOverview({ results }: StatsOverviewProps) {
  if (results.length === 0) {
    return null
  }

  // Calcular estadísticas
  const totalClientes = results.length
  
  // Distribución de segmentos
  const segmentos = results.reduce((acc, r) => {
    const tipo = r.segmento.tipo
    acc[tipo] = (acc[tipo] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Gasto promedio total
  const gastoTotal = results.reduce((sum, r) => sum + r.cliente.gasto_promedio, 0)
  const gastoPromedio = gastoTotal / totalClientes

  // Score promedio
  const scorePromedio = results.reduce((sum, r) => sum + r.segmento.score, 0) / totalClientes

  // Engagement promedio
  const engagementPromedio = results.reduce((sum, r) => sum + r.perfil.engagement_rate, 0) / totalClientes

  // Segmento más común
  const segmentoComun = Object.entries(segmentos).sort((a, b) => b[1] - a[1])[0]

  // Distribución de canales
  const canales = results.reduce((acc, r) => {
    const canal = r.campaña.canal_sugerido || 'email'
    acc[canal] = (acc[canal] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const stats = [
    {
      title: "Total Clientes",
      value: totalClientes.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Gasto Promedio",
      value: `$${gastoPromedio.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Score Promedio",
      value: `${scorePromedio.toFixed(0)}/100`,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Engagement",
      value: `${(engagementPromedio * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="space-y-4">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribución de Segmentos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Segmentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(segmentos).map(([segmento, count]) => (
                <div key={segmento} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        segmento.includes("premium") || segmento.includes("ALTO")
                          ? "bg-blue-500"
                          : segmento.includes("medio") || segmento.includes("ESTANDAR")
                          ? "bg-green-500"
                          : segmento.includes("basico") || segmento.includes("BASICO")
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium capitalize">
                      {segmento.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((count / totalClientes) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribución de Canales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Canales Sugeridos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(canales).map(([canal, count]) => (
                <div key={canal} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        canal === "email"
                          ? "bg-blue-500"
                          : canal === "sms"
                          ? "bg-green-500"
                          : canal === "push"
                          ? "bg-purple-500"
                          : "bg-gray-500"
                      }`}
                    />
                    <span className="text-sm font-medium capitalize">{canal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((count / totalClientes) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insight destacado */}
      {segmentoComun && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Insight Principal</h3>
                <p className="text-muted-foreground">
                  El segmento más común es{" "}
                  <span className="font-semibold text-foreground capitalize">
                    {segmentoComun[0].replace(/_/g, " ")}
                  </span>{" "}
                  con {segmentoComun[1]} cliente{segmentoComun[1] > 1 ? "s" : ""} (
                  {((segmentoComun[1] / totalClientes) * 100).toFixed(0)}% del total).
                  {gastoPromedio > 400
                    ? " El gasto promedio es alto, considera campañas premium."
                    : gastoPromedio > 200
                    ? " El gasto promedio es moderado, enfócate en retención."
                    : " El gasto promedio es bajo, implementa estrategias de upselling."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

