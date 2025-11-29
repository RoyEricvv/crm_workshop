export type FSMState = "INGESTA" | "PERFIL" | "SEGMENTO" | "CAMPAÑA" | "SALIDA" | "FIN"

export interface Cliente {
  id_cliente: string
  nombre: string
  sector: string
  gasto_promedio: number
  riesgo: "BAJO" | "MEDIO" | "ALTO" | "bajo" | "medio" | "alto"
  red_social: "LinkedIn" | "Twitter" | "Instagram" | "Facebook" | "linkedin" | "twitter" | "instagram" | "facebook"
}

export interface PerfilSocial {
  engagement_rate: number
  followers: number
  avg_likes: number
  sentiment_score: number // -1 a 1
  activity_freq: "BAJA" | "MEDIA" | "ALTA"
}

export interface Segmento {
  tipo: "ALTO_VALOR" | "ESTANDAR" | "BASICO" | "PREMIUM" | "ESTÁNDAR" | "CRECIMIENTO" | "RIESGO"
  score: number
  rationale: string
}

export interface Campaña {
  plantilla: "PREMIUM_GROWTH" | "VALUE_FOCUSED" | "RISK_MITIGATION"
  titulo: string
  mensaje: string
  cta: string
  color_tema: string
  canal_sugerido?: string
}

export interface LogEntry {
  state: FSMState
  timestamp: string
  message: string
  data?: Record<string, any>
}

export interface AgentResult {
  cliente: Cliente
  perfil: PerfilSocial
  segmento: Segmento
  campaña: Campaña
  logs: LogEntry[]
  htmlOutput: string
  sessionId?: string
  timestamp?: string
}

export interface ClienteListResponse {
  clientes: Cliente[]
  total: number
}

export interface ExecuteAgentRequest {
  clienteIds: string[]
}

export interface ExecuteAgentResponse {
  sessionId: string
  message: string
}
