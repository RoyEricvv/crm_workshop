"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { api } from "@/lib/api"
import { agent } from "@/lib/agent"
import type { AgentResult, Cliente, FSMState, LogEntry } from "@/lib/types"
import { StateStepper } from "./state-stepper"
import { ResultsTable } from "./results-table"
import { CSVLoader } from "./csv-loader"
import { StatsOverview } from "./stats-overview"
import { Charts } from "./charts"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AgentExecutor() {
  // Estados principales
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectionMode, setSelectionMode] = useState<"single" | "multiple">("single")
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [isLoadingClientes, setIsLoadingClientes] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  // Resultados y logs
  const [results, setResults] = useState<AgentResult[]>([])
  const [activeResult, setActiveResult] = useState<AgentResult | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentState, setCurrentState] = useState<FSMState | null>(null)
  const [completedStates, setCompletedStates] = useState<FSMState[]>([])
  
  // Errores
  const [error, setError] = useState<string | null>(null)
  
  // Refs para limpiar recursos
  const eventSourceRef = useRef<EventSource | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true)
    loadClientes()
  }, [])

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const loadClientes = async () => {
    try {
      setIsLoadingClientes(true)
      const clientesData = await api.getClientes()
      setClientes(clientesData)
      if (clientesData.length > 0) {
        setSelectedClientId(clientesData[0].id_cliente)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando clientes")
    } finally {
      setIsLoadingClientes(false)
    }
  }

  const handleClientesLoaded = (newClientes: Cliente[]) => {
    setClientes(newClientes)
    if (newClientes.length > 0) {
      setSelectedClientId(newClientes[0].id_cliente)
      setSelectedClientIds([]) // Limpiar selección múltiple
    }
    setError(null)
  }

  const handleExecute = async () => {
    setIsExecuting(true)
    setError(null)
    setResults([])
    setActiveResult(null)
    setLogs([])
    setCurrentState(null)
    setCompletedStates([])

    try {
      const clientesToProcess = selectionMode === "single" 
        ? [selectedClientId] 
        : selectedClientIds

      if (clientesToProcess.length === 0) {
        throw new Error("Debes seleccionar al menos un cliente")
      }

      // En modo mock, ejecutar directamente
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ""
      const USE_MOCK = !BACKEND_URL || BACKEND_URL === ""

      if (USE_MOCK) {
        // Ejecutar en modo mock (local)
        await executeMockMode(clientesToProcess)
      } else {
        // Ejecutar con backend real
        await executeBackendMode(clientesToProcess)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsExecuting(false)
      setCurrentState(null)
    }
  }

  const executeMockMode = async (clienteIds: string[]) => {
    const newResults: AgentResult[] = []
    
    for (const clienteId of clienteIds) {
      const cliente = clientes.find(c => c.id_cliente === clienteId)
      if (!cliente) continue

      // Simular logs en tiempo real con delays
      const estados: FSMState[] = ["INGESTA", "PERFIL", "SEGMENTO", "CAMPAÑA", "SALIDA", "FIN"]
      
      for (let i = 0; i < estados.length; i++) {
        const estado = estados[i]
        setCurrentState(estado)
        
        // Agregar log
        const log: LogEntry = {
          state: estado,
          timestamp: new Date().toISOString(),
          message: getEstadoMessage(estado, cliente),
        }
        setLogs(prev => [...prev, log])
        setCompletedStates(prev => [...prev, estado])
        
        // Delay para simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // Ejecutar agente
      const result = await agent.execute(cliente)
      
      // Agregar log FIN si no está
      if (!result.logs.some(l => l.state === "FIN")) {
        result.logs.push({
          state: "FIN",
          timestamp: new Date().toISOString(),
          message: `Proceso completado exitosamente para ${cliente.nombre}`,
        })
      }

      newResults.push(result)
      setResults([...newResults])
      
      // Si es un solo cliente, mostrarlo activo
      if (clienteIds.length === 1) {
        setActiveResult(result)
      }
    }
  }

  const executeBackendMode = async (clienteIds: string[]) => {
    try {
      // Iniciar ejecución
      console.log("🚀 Ejecutando agente para:", clienteIds)
      const { sessionId } = await api.ejecutarAgente(clienteIds)
      
      console.log(`✅ Sesión iniciada: ${sessionId}`)
      
      // Variable para rastrear si llegó FIN
      let finReceived = false
      
      // Intentar conectar a logs en tiempo real (SSE)
      const eventSource = api.streamLogs(sessionId, (log) => {
        console.log("📨 Log recibido en componente:", log)
        setLogs(prev => [...prev, log])
        setCurrentState(log.state as FSMState)
        setCompletedStates(prev => {
          if (!prev.includes(log.state as FSMState)) {
            return [...prev, log.state as FSMState]
          }
          return prev
        })
        
        // Marcar si llegó FIN
        if (log.state === "FIN") {
          finReceived = true
        }
      })

      if (eventSource) {
        eventSourceRef.current = eventSource
        console.log("✅ EventSource conectado, esperando logs...")
        
        // Esperar hasta que la sesión termine o timeout
        let attempts = 0
        const maxAttempts = 60 // 60 segundos
        
        while (attempts < maxAttempts && !finReceived) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          attempts++
        }
        
        console.log(`⏱️ Tiempo de espera: ${attempts}s, FIN recibido: ${finReceived}`)
        
        // Cerrar conexión SSE
        eventSource.close()
        eventSourceRef.current = null
      } else {
        console.warn("⚠️ No se pudo establecer conexión SSE, esperando 5 segundos...")
        // Si no hay SSE, esperar un tiempo prudencial
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
      
      // Obtener resultados finales
      console.log("📊 Obteniendo resultados finales...")
      try {
        // Pequeño delay para asegurar que el backend terminó
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (clienteIds.length === 1) {
          const result = await api.getResultado(sessionId)
          console.log("✅ Resultado obtenido:", result)
          setResults([result])
          setActiveResult(result)
        } else {
          const resultados = await api.getResultadosMultiples(sessionId)
          console.log(`✅ ${resultados.length} resultados obtenidos`)
          setResults(resultados)
          if (resultados.length > 0) {
            setActiveResult(resultados[0])
          }
        }
      } catch (err) {
        console.warn("⚠️ Error obteniendo resultados finales:", err)
        // Si falla, intentar nuevamente después de un delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        try {
          if (clienteIds.length === 1) {
            const result = await api.getResultado(sessionId)
            setResults([result])
            setActiveResult(result)
          } else {
            const resultados = await api.getResultadosMultiples(sessionId)
            setResults(resultados)
            if (resultados.length > 0) {
              setActiveResult(resultados[0])
            }
          }
        } catch (err2) {
          console.error("❌ Error obteniendo resultados (segundo intento):", err2)
          throw new Error("No se pudieron obtener los resultados. Los logs están disponibles arriba.")
        }
      }

    } catch (err) {
      console.error("❌ Error en executeBackendMode:", err)
      throw new Error(`Error conectando con backend: ${err instanceof Error ? err.message : "Error desconocido"}`)
    }
  }

  const startPollingLogs = (sessionId: string) => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        // En un backend real, esto sería un endpoint GET /api/agente/logs/:id
        // Por ahora, solo simulamos
      } catch (err) {
        console.error("Error polling logs:", err)
      }
    }, 1000)
  }

  const getEstadoMessage = (estado: FSMState, cliente: Cliente): string => {
    const messages: Record<FSMState, string> = {
      INGESTA: `Cargando datos del cliente ${cliente.nombre}...`,
      PERFIL: `Generando perfil social desde ${cliente.red_social}...`,
      SEGMENTO: `Aplicando reglas de segmentación...`,
      CAMPAÑA: `Seleccionando plantilla de campaña...`,
      SALIDA: `Generando salidas (HTML, JSON, CSV)...`,
      FIN: `Proceso completado exitosamente`,
    }
    return messages[estado] || `Ejecutando ${estado}...`
  }

  const handleToggleSelection = (clienteId: string, checked: boolean) => {
    if (checked) {
      setSelectedClientIds(prev => [...prev, clienteId])
    } else {
      setSelectedClientIds(prev => prev.filter(id => id !== clienteId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClientIds(clientes.map(c => c.id_cliente))
    } else {
      setSelectedClientIds([])
    }
  }

  const handleExportResult = (result: AgentResult, formato: "json" | "csv" | "html") => {
    if (formato === "html") {
      const blob = new Blob([result.htmlOutput], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `campaña_${result.cliente.id_cliente}.html`
      a.click()
      URL.revokeObjectURL(url)
    } else if (formato === "json") {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `campaña_${result.cliente.id_cliente}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (formato === "csv") {
      const csv = [
        [
          "id_cliente",
          "nombre",
          "sector",
          "gasto_promedio",
          "riesgo",
          "red_social",
          "segmento_tipo",
          "segmento_score",
          "campaña_plantilla",
          "campaña_titulo",
          "campaña_cta",
        ],
        [
          result.cliente.id_cliente,
          result.cliente.nombre,
          result.cliente.sector,
          result.cliente.gasto_promedio.toString(),
          result.cliente.riesgo,
          result.cliente.red_social,
          result.segmento.tipo,
          result.segmento.score.toString(),
          result.campaña.plantilla,
          result.campaña.titulo,
          result.campaña.cta,
        ],
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `campaña_${result.cliente.id_cliente}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleExportAllCSV = () => {
    if (results.length === 0) return

    const csv = [
      [
        "id_cliente",
        "nombre",
        "sector",
        "gasto_promedio",
        "riesgo",
        "red_social",
        "segmento_tipo",
        "segmento_score",
        "campaña_plantilla",
        "campaña_titulo",
        "campaña_cta",
      ],
      ...results.map((r) => [
        r.cliente.id_cliente,
        r.cliente.nombre,
        r.cliente.sector,
        r.cliente.gasto_promedio.toString(),
        r.cliente.riesgo,
        r.cliente.red_social,
        r.segmento.tipo,
        r.segmento.score.toString(),
        r.campaña.plantilla,
        r.campaña.titulo,
        r.campaña.cta,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `campañas_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Cargador de CSV */}
      <CSVLoader 
        onClientesLoaded={handleClientesLoaded}
        currentCount={clientes.length}
      />

      {/* Selector de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Cliente(s)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle entre modo single/multiple */}
          <div className="flex items-center justify-between">
            <Label htmlFor="selection-mode" className="text-sm font-medium">
              Modo de selección
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Individual</span>
              <Switch
                id="selection-mode"
                checked={selectionMode === "multiple"}
                onCheckedChange={(checked) => {
                  setSelectionMode(checked ? "multiple" : "single")
                  setSelectedClientIds([])
                }}
              />
              <span className="text-sm text-muted-foreground">Múltiple</span>
            </div>
          </div>

          {!isMounted || isLoadingClientes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando clientes...</span>
            </div>
          ) : selectionMode === "single" ? (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
              disabled={isExecuting}
            >
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.nombre} ({cliente.id_cliente}) - {cliente.sector}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-4">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox
                  id="select-all"
                  checked={selectedClientIds.length === clientes.length && clientes.length > 0}
                  onCheckedChange={handleSelectAll}
                  disabled={isExecuting}
                />
                <Label htmlFor="select-all" className="text-sm font-semibold cursor-pointer">
                  Seleccionar todos ({clientes.length})
                </Label>
              </div>
              {clientes.map((cliente) => (
                <div key={cliente.id_cliente} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cliente-${cliente.id_cliente}`}
                    checked={selectedClientIds.includes(cliente.id_cliente)}
                    onCheckedChange={(checked) => handleToggleSelection(cliente.id_cliente, checked as boolean)}
                    disabled={isExecuting}
                  />
                  <Label
                    htmlFor={`cliente-${cliente.id_cliente}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    <div className="font-medium">{cliente.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {cliente.id_cliente} • {cliente.sector} • {cliente.red_social}
                    </div>
                  </Label>
                </div>
              ))}
              {selectedClientIds.length > 0 && (
                <div className="pt-2 border-t text-sm text-muted-foreground">
                  {selectedClientIds.length} cliente{selectedClientIds.length > 1 ? "s" : ""} seleccionado{selectedClientIds.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleExecute}
            disabled={isExecuting || (selectionMode === "single" ? !selectedClientId : selectedClientIds.length === 0)}
            className="w-full"
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando agente...
              </>
            ) : (
              "Ejecutar Agente FSM"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Stepper de Estados */}
      {(isExecuting || completedStates.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso del Agente</CardTitle>
          </CardHeader>
          <CardContent>
            <StateStepper
              currentState={currentState}
              completedStates={completedStates}
            />
          </CardContent>
        </Card>
      )}

      {/* Panel de Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Logs de Ejecución</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className="p-3 bg-muted rounded-md border-l-4"
                  style={{
                    borderLeftColor:
                      log.state === "FIN"
                        ? "#10b981"
                        : log.state === currentState
                        ? "#3b82f6"
                        : "#6b7280",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-primary min-w-[100px]">
                      [{log.state}]
                    </span>
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs mb-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-foreground">{log.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Resultados (múltiples clientes) */}
      {results.length > 1 && (
        <>
          {/* Estadísticas y Gráficos */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Estadísticas y Análisis</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsOverview results={results} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📈 Visualizaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Charts results={results} />
            </CardContent>
          </Card>

          <ResultsTable
            results={results}
            onViewResult={setActiveResult}
            onExportResult={handleExportResult}
          />
          {results.length > 1 && (
            <Card>
              <CardContent className="pt-6">
                <Button onClick={handleExportAllCSV} variant="outline" className="w-full">
                  📊 Exportar Todos los Resultados (CSV)
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Vista Detallada de Resultado Individual */}
      {activeResult && results.length === 1 && (
        <>
          {/* Estadísticas del cliente individual */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Análisis Individual</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsOverview results={results} />
            </CardContent>
          </Card>
        </>
      )}

      {/* Vista Detallada de Resultado */}
      {activeResult && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">ID</p>
                <p className="font-semibold">{activeResult.cliente.id_cliente}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nombre</p>
                <p className="font-semibold">{activeResult.cliente.nombre}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sector</p>
                <p className="font-semibold">{activeResult.cliente.sector}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gasto Promedio</p>
                <p className="font-semibold">${activeResult.cliente.gasto_promedio.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Riesgo</p>
                <p className="font-semibold">{activeResult.cliente.riesgo}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Red Social</p>
                <p className="font-semibold">{activeResult.cliente.red_social}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Segmentación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-semibold text-lg">{activeResult.segmento.tipo}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Score</p>
                <div className="w-full bg-border rounded-full h-3 mt-1">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${activeResult.segmento.score}%` }}
                  />
                </div>
                <p className="font-semibold mt-1">{activeResult.segmento.score}/100</p>
              </div>
              <div>
                <p className="text-muted-foreground">Razón</p>
                <p className="text-sm bg-muted p-2 rounded">{activeResult.segmento.rationale}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaña Seleccionada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div style={{ borderLeft: `4px solid ${activeResult.campaña.color_tema}` }} className="pl-3">
                <p className="text-muted-foreground text-xs">Plantilla</p>
                <p className="font-semibold">{activeResult.campaña.plantilla}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Título</p>
                <p className="font-semibold">{activeResult.campaña.titulo}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Mensaje</p>
                <p className="text-sm">{activeResult.campaña.mensaje}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">CTA</p>
                <p className="font-semibold">{activeResult.campaña.cta}</p>
              </div>
              {activeResult.campaña.canal_sugerido && (
                <div>
                  <p className="text-muted-foreground text-xs">Canal Sugerido</p>
                  <p className="font-semibold">{activeResult.campaña.canal_sugerido}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de exportación */}
          <Card>
            <CardHeader>
              <CardTitle>Exportar Resultados</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              <Button onClick={() => handleExportResult(activeResult, "html")} variant="outline" size="sm">
                📄 HTML
              </Button>
              <Button onClick={() => handleExportResult(activeResult, "json")} variant="outline" size="sm">
                📋 JSON
              </Button>
              <Button onClick={() => handleExportResult(activeResult, "csv")} variant="outline" size="sm">
                📊 CSV
              </Button>
            </CardContent>
          </Card>

          {/* Preview HTML */}
          <Card>
            <CardHeader>
              <CardTitle>Preview de Campaña</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                srcDoc={activeResult.htmlOutput}
                className="w-full rounded-lg border border-border"
                style={{ height: "500px" }}
                title="Preview de campaña"
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
