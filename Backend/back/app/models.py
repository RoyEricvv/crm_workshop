from pydantic import BaseModel
from typing import Optional, Dict, List, Literal
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


class Segmento(str, Enum):
    PREMIUM_ALTO_ENGAGEMENT = "premium_alto_engagement"
    MEDIO_CONSERVADOR = "medio_conservador"
    BASICO_CRECIMIENTO = "basico_crecimiento"
    RIESGO_ALTO = "riesgo_alto"


class Campaña(BaseModel):
    id_campaña: str
    nombre: str
    plantilla: str
    cta: str
    canal: str
    segmento_target: str


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

