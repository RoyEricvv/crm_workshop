import type { Cliente, ClienteListResponse, ExecuteAgentRequest, ExecuteAgentResponse, AgentResult, LogEntry } from "./types"

// URL del backend - puede venir de variable de entorno o usar mock local
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ""
const USE_MOCK = !BACKEND_URL || BACKEND_URL === ""

/**
 * Cliente API para conectar con el backend
 * Si no hay backend configurado, usa los mocks locales
 */
export const api = {
  /**
   * Obtiene la lista de clientes desde el CSV vía API
   */
  async getClientes(): Promise<Cliente[]> {
    if (USE_MOCK) {
      // Fallback a mock local
      const { MOCK_CLIENTES } = await import("./mock-data")
      return MOCK_CLIENTES
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/clientes`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data: ClienteListResponse = await response.json()
      return data.clientes
    } catch (error) {
      console.error("Error obteniendo clientes, usando mock:", error)
      // Fallback a mock en caso de error
      const { MOCK_CLIENTES } = await import("./mock-data")
      return MOCK_CLIENTES
    }
  },

  /**
   * Ejecuta el agente FSM para uno o varios clientes
   * Retorna un sessionId para trackear la ejecución
   */
  async ejecutarAgente(clienteIds: string[]): Promise<ExecuteAgentResponse> {
    if (USE_MOCK) {
      // Simular respuesta con sessionId
      return {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: "Agente iniciado correctamente",
      }
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/agente/ejecutar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteIds } as ExecuteAgentRequest),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error ejecutando agente:", error)
      throw error
    }
  },

  /**
   * Obtiene los logs en tiempo real de una ejecución
   * Usa Server-Sent Events (SSE) o polling según disponibilidad
   */
  streamLogs(sessionId: string, onLog: (log: LogEntry) => void): EventSource | null {
    if (USE_MOCK) {
      console.log("⚠️ Modo MOCK activado, sin SSE")
      return null
    }

    try {
      const url = `${BACKEND_URL}/api/agente/logs/${sessionId}`
      console.log("🔌 Conectando a SSE:", url)
      console.log("Backend URL configurado:", BACKEND_URL)
      
      const eventSource = new EventSource(url)
      let hasReceivedData = false
      
      eventSource.onopen = () => {
        console.log("✅ Conexión SSE establecida exitosamente")
        hasReceivedData = false
      }
      
      eventSource.onmessage = (event) => {
        try {
          hasReceivedData = true
          console.log("📨 Log recibido:", event.data)
          const log: LogEntry = JSON.parse(event.data)
          onLog(log)
          
          // Si es FIN, cerrar la conexión
          if (log.state === "FIN") {
            console.log("🏁 Log FIN recibido, cerrando conexión SSE")
            setTimeout(() => {
              eventSource.close()
            }, 500)
          }
        } catch (err) {
          console.error("❌ Error parseando log:", err, "Data:", event.data)
        }
      }
      
      eventSource.onerror = (error) => {
        // Solo logear si no hemos recibido datos aún
        if (!hasReceivedData) {
          console.warn("⚠️ Error en EventSource antes de recibir datos:", error)
          console.log("EventSource readyState:", eventSource.readyState, 
                      "(0=CONNECTING, 1=OPEN, 2=CLOSED)")
        }
        
        // Si el stream ya estaba funcionando, es normal que se cierre
        if (hasReceivedData && eventSource.readyState === 2) {
          console.log("✅ Stream SSE cerrado correctamente después de recibir datos")
          // No registrar como error
          return
        }
        
        // Solo cerrar si está permanentemente cerrado y no recibimos nada
        if (eventSource.readyState === 2 && !hasReceivedData) {
          console.error("❌ Conexión SSE falló completamente")
          eventSource.close()
        }
      }
      
      return eventSource
    } catch (error) {
      console.error("❌ Error creando EventSource:", error)
      console.log("Verifica que el backend esté corriendo en:", BACKEND_URL)
      return null
    }
  },

  /**
   * Obtiene los resultados finales de una ejecución
   */
  async getResultado(sessionId: string): Promise<AgentResult> {
    if (USE_MOCK) {
      // En modo mock, esto se maneja localmente
      throw new Error("En modo mock, los resultados se obtienen directamente")
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/resultados/${sessionId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error obteniendo resultado:", error)
      throw error
    }
  },

  /**
   * Obtiene resultados de múltiples clientes procesados
   */
  async getResultadosMultiples(sessionId: string): Promise<AgentResult[]> {
    if (USE_MOCK) {
      throw new Error("En modo mock, usar getResultado individual")
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/resultados/${sessionId}/multiples`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error obteniendo resultados múltiples:", error)
      throw error
    }
  },

  /**
   * Descarga un archivo exportado (JSON, CSV, HTML)
   */
  async downloadExport(sessionId: string, formato: "json" | "csv" | "html", clienteId?: string): Promise<Blob> {
    if (USE_MOCK) {
      throw new Error("En modo mock, usar exportación local")
    }

    try {
      const url = clienteId
        ? `${BACKEND_URL}/api/export/${sessionId}/${formato}?clienteId=${clienteId}`
        : `${BACKEND_URL}/api/export/${sessionId}/${formato}`

      const response = await fetch(url, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      return await response.blob()
    } catch (error) {
      console.error("Error descargando exportación:", error)
      throw error
    }
  },
}

