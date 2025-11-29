from pydantic import BaseModel
from typing import Optional, Dict, List
from enum import Enum


class Estado(str, Enum):
    INGESTA = "INGESTA"
    PERFIL = "PERFIL"
    SEGMENTO = "SEGMENTO"
    CAMPAÑA = "CAMPAÑA"
    SALIDA = "SALIDA"
    ERROR = "ERROR"
    FIN = "FIN"


class Cliente(BaseModel):
    id_cliente: str
    nombre: str
    sector: str
    gasto_promedio: float
    riesgo: str
    red_social: str


class SeñalesSociales(BaseModel):
    intereses: List[str]
    tono: str
    actividad: str
    engagement_promedio: float
    frecuencia_publicacion: str


class PerfilSocial(BaseModel):
    id_cliente: str
    red_social: str
    señales: SeñalesSociales


# Modelo compatible con frontend
class PerfilSocialFrontend(BaseModel):
    """Modelo de perfil social compatible con el frontend"""
    engagement_rate: float
    followers: int
    avg_likes: int
    sentiment_score: float
    activity_freq: str


class Segmento(str, Enum):
    PREMIUM_ALTO_ENGAGEMENT = "premium_alto_engagement"
    MEDIO_CONSERVADOR = "medio_conservador"
    BASICO_CRECIMIENTO = "basico_crecimiento"
    RIESGO_ALTO = "riesgo_alto"


# Modelo de segmento compatible con frontend
class SegmentoFrontend(BaseModel):
    """Modelo de segmento compatible con el frontend"""
    tipo: str
    score: int
    rationale: str


class Campaña(BaseModel):
    id_campaña: str
    nombre: str
    plantilla: str
    cta: str
    canal: str
    segmento_target: str


# Modelo de campaña compatible con frontend
class CampañaFrontend(BaseModel):
    """Modelo de campaña compatible con el frontend"""
    plantilla: str
    titulo: str
    mensaje: str
    cta: str
    color_tema: str
    canal_sugerido: Optional[str] = None


class ResultadoCampaña(BaseModel):
    id_cliente: str
    nombre: str
    segmento: str
    campaña: Campaña
    mensaje_html: str
    mensaje_json: Dict
    métricas_simuladas: Optional[Dict] = None


class EstadoAgente(BaseModel):
    estado_actual: Estado
    cliente: Optional[Cliente] = None
    perfil_social: Optional[PerfilSocial] = None
    segmento: Optional[Segmento] = None
    campaña: Optional[Campaña] = None
    resultado: Optional[ResultadoCampaña] = None
    logs: List[Dict] = []
    error: Optional[str] = None


# Modelos para la API compatible con frontend
class LogEntry(BaseModel):
    """Log entry compatible con frontend"""
    state: str
    timestamp: str
    message: str
    data: Optional[Dict] = None


class AgentResult(BaseModel):
    """Resultado del agente compatible con el frontend"""
    cliente: Cliente
    perfil: PerfilSocialFrontend
    segmento: SegmentoFrontend
    campaña: CampañaFrontend
    logs: List[LogEntry]
    htmlOutput: str
    sessionId: Optional[str] = None
    timestamp: Optional[str] = None


class EjecutarAgenteRequest(BaseModel):
    """Request para ejecutar agente - compatible con frontend"""
    clienteIds: List[str]


class EjecutarAgenteResponse(BaseModel):
    """Response para ejecutar agente - compatible con frontend"""
    sessionId: str
    message: str


class ClienteListResponse(BaseModel):
    """Response de lista de clientes"""
    clientes: List[Cliente]
    total: int
