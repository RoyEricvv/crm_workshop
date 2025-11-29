"""
Módulo Decisor de Campaña
Selecciona la campaña apropiada según el segmento
"""
from app.models import Segmento, Campaña


class DecisorCampaña:
    """Decide qué campaña asignar según el segmento"""
    
    PLANTILLAS_CAMPAÑA = {
        Segmento.PREMIUM_ALTO_ENGAGEMENT: {
            "id_campaña": "CAMP-001",
            "nombre": "Exclusividad Premium",
            "plantilla": "premium_exclusivo",
            "cta": "Accede a beneficios exclusivos ahora",
            "canal": "email",
            "mensaje_base": "Como cliente premium, tienes acceso exclusivo a nuestras mejores ofertas y experiencias personalizadas."
        },
        Segmento.MEDIO_CONSERVADOR: {
            "id_campaña": "CAMP-002",
            "nombre": "Valor y Confianza",
            "plantilla": "valor_confianza",
            "cta": "Descubre nuestras opciones",
            "canal": "email",
            "mensaje_base": "Te ofrecemos opciones de gran valor que se adaptan a tus necesidades, con la confianza que buscas."
        },
        Segmento.BASICO_CRECIMIENTO: {
            "id_campaña": "CAMP-003",
            "nombre": "Crecimiento y Oportunidades",
            "plantilla": "crecimiento",
            "cta": "Comienza tu crecimiento hoy",
            "canal": "sms",
            "mensaje_base": "Tenemos oportunidades diseñadas para ayudarte a crecer. Comienza con opciones accesibles y escala según tus resultados."
        },
        Segmento.RIESGO_ALTO: {
            "id_campaña": "CAMP-004",
            "nombre": "Gestión de Riesgo",
            "plantilla": "gestion_riesgo",
            "cta": "Consulta opciones seguras",
            "canal": "email",
            "mensaje_base": "Entendemos tus necesidades. Te ofrecemos opciones con gestión de riesgo adecuada y seguimiento personalizado."
        }
    }
    
    def seleccionar_campaña(self, segmento: Segmento) -> Campaña:
        """
        Selecciona la campaña apropiada para el segmento
        
        Args:
            segmento: Segmento del cliente
            
        Returns:
            Campaña seleccionada
        """
        info_campaña = self.PLANTILLAS_CAMPAÑA.get(
            segmento,
            self.PLANTILLAS_CAMPAÑA[Segmento.BASICO_CRECIMIENTO]
        )
        
        return Campaña(
            id_campaña=info_campaña["id_campaña"],
            nombre=info_campaña["nombre"],
            plantilla=info_campaña["plantilla"],
            cta=info_campaña["cta"],
            canal=info_campaña["canal"],
            segmento_target=segmento.value
        )
    
    def obtener_mensaje_base(self, segmento: Segmento) -> str:
        """Obtiene el mensaje base para la plantilla"""
        info_campaña = self.PLANTILLAS_CAMPAÑA.get(
            segmento,
            self.PLANTILLAS_CAMPAÑA[Segmento.BASICO_CRECIMIENTO]
        )
        return info_campaña["mensaje_base"]

