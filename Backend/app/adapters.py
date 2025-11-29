"""
Adaptador para convertir modelos del backend a formato del frontend
"""
from typing import List, Dict
import random
from app.models import (
    Cliente, PerfilSocial, Segmento, Campaña, ResultadoCampaña,
    PerfilSocialFrontend, SegmentoFrontend, CampañaFrontend,
    AgentResult, LogEntry, EstadoAgente
)


def perfil_to_frontend(perfil: PerfilSocial) -> PerfilSocialFrontend:
    """Convierte PerfilSocial del backend al formato del frontend"""
    # Simular métricas basadas en las señales
    engagement = perfil.señales.engagement_promedio
    
    # Generar followers basado en actividad
    if perfil.señales.actividad == "alta":
        followers = random.randint(10000, 100000)
        avg_likes = random.randint(500, 5000)
    elif perfil.señales.actividad == "media":
        followers = random.randint(1000, 10000)
        avg_likes = random.randint(50, 500)
    else:
        followers = random.randint(100, 1000)
        avg_likes = random.randint(10, 50)
    
    # Sentiment score basado en tono
    tonos_positivos = ["inspiracional", "estético", "profesional"]
    sentiment_score = 0.7 if any(t in perfil.señales.tono for t in tonos_positivos) else 0.3
    sentiment_score += random.uniform(-0.2, 0.2)
    sentiment_score = max(-1, min(1, sentiment_score))
    
    return PerfilSocialFrontend(
        engagement_rate=round(engagement, 3),
        followers=followers,
        avg_likes=avg_likes,
        sentiment_score=round(sentiment_score, 3),
        activity_freq=perfil.señales.actividad.upper()
    )


def segmento_to_frontend(segmento: Segmento, cliente: Cliente, perfil: PerfilSocial) -> SegmentoFrontend:
    """Convierte Segmento del backend al formato del frontend"""
    # Calcular score basado en múltiples factores
    score = 50  # Base
    
    # Factores de gasto
    if cliente.gasto_promedio > 500:
        score += 25
    elif cliente.gasto_promedio > 200:
        score += 15
    else:
        score += 5
    
    # Factores de riesgo
    riesgo_lower = cliente.riesgo.lower()
    if riesgo_lower == "bajo":
        score += 15
    elif riesgo_lower == "medio":
        score += 5
    else:
        score -= 10
    
    # Factores de actividad social
    if perfil.señales.actividad == "alta":
        score += 10
    elif perfil.señales.actividad == "media":
        score += 5
    
    # Engagement
    if perfil.señales.engagement_promedio > 0.08:
        score += 10
    elif perfil.señales.engagement_promedio > 0.04:
        score += 5
    
    score = max(0, min(100, score))
    
    # Generar rationale
    rationales = {
        Segmento.PREMIUM_ALTO_ENGAGEMENT: f"Cliente {cliente.nombre} clasificado como premium: alto gasto (${cliente.gasto_promedio}), {riesgo_lower} riesgo, alta actividad social con engagement de {perfil.señales.engagement_promedio:.1%}.",
        Segmento.MEDIO_CONSERVADOR: f"Cliente {cliente.nombre} en segmento medio: gasto moderado (${cliente.gasto_promedio}), perfil conservador con {riesgo_lower} riesgo.",
        Segmento.BASICO_CRECIMIENTO: f"Cliente {cliente.nombre} con potencial de crecimiento: actualmente gasto básico (${cliente.gasto_promedio}), pero muestra interés en {', '.join(perfil.señales.intereses[:2])}.",
        Segmento.RIESGO_ALTO: f"Cliente {cliente.nombre} requiere atención especial: riesgo {riesgo_lower}, necesita seguimiento personalizado."
    }
    
    rationale = rationales.get(segmento, f"Cliente segmentado como {segmento.value}")
    
    return SegmentoFrontend(
        tipo=segmento.value,
        score=score,
        rationale=rationale
    )


def campaña_to_frontend(campaña: Campaña, mensaje_base: str = "") -> CampañaFrontend:
    """Convierte Campaña del backend al formato del frontend"""
    # Mapeo de colores por plantilla
    colores = {
        "premium_exclusivo": "#1E40AF",  # Azul profundo
        "valor_confianza": "#059669",    # Verde
        "crecimiento": "#F59E0B",        # Amarillo/naranja
        "gestion_riesgo": "#DC2626",     # Rojo
    }
    
    return CampañaFrontend(
        plantilla=campaña.plantilla,
        titulo=campaña.nombre,
        mensaje=mensaje_base or f"Campaña {campaña.nombre} diseñada especialmente para tu perfil.",
        cta=campaña.cta,
        color_tema=colores.get(campaña.plantilla, "#4B5563"),
        canal_sugerido=campaña.canal
    )


def estado_to_agent_result(
    estado: EstadoAgente,
    session_id: str,
    mensaje_base: str = ""
) -> AgentResult:
    """Convierte EstadoAgente del backend a AgentResult del frontend"""
    if not estado.cliente or not estado.perfil_social or not estado.segmento or not estado.campaña or not estado.resultado:
        raise ValueError("EstadoAgente incompleto")
    
    # Convertir perfil
    perfil_frontend = perfil_to_frontend(estado.perfil_social)
    
    # Convertir segmento
    segmento_frontend = segmento_to_frontend(estado.segmento, estado.cliente, estado.perfil_social)
    
    # Convertir campaña
    campaña_frontend = campaña_to_frontend(estado.campaña, mensaje_base)
    
    # Convertir logs
    logs_frontend = [
        LogEntry(
            state=log.get("estado", "UNKNOWN"),
            timestamp=log.get("timestamp", ""),
            message=log.get("mensaje", ""),
            data=log.get("data")
        )
        for log in estado.logs
    ]
    
    # Agregar log FIN si no existe
    if not any(log.state == "FIN" for log in logs_frontend):
        from datetime import datetime
        logs_frontend.append(
            LogEntry(
                state="FIN",
                timestamp=datetime.now().isoformat(),
                message=f"Proceso completado exitosamente para {estado.cliente.nombre}",
                data=None
            )
        )
    
    return AgentResult(
        cliente=estado.cliente,
        perfil=perfil_frontend,
        segmento=segmento_frontend,
        campaña=campaña_frontend,
        logs=logs_frontend,
        htmlOutput=estado.resultado.mensaje_html,
        sessionId=session_id,
        timestamp=logs_frontend[-1].timestamp if logs_frontend else None
    )

