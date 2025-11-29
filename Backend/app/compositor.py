"""
Módulo Compositor
Construye el mensaje final en formato HTML y JSON
"""
import json
from typing import Dict
from app.models import Cliente, Campaña, Segmento, PerfilSocial, ResultadoCampaña
from app.decisor_campaña import DecisorCampaña


class Compositor:
    """Compone el mensaje final de la campaña"""
    
    def __init__(self):
        self.decisor = DecisorCampaña()
    
    def componer(
        self,
        cliente: Cliente,
        segmento: Segmento,
        campaña: Campaña,
        perfil_social: PerfilSocial
    ) -> ResultadoCampaña:
        """
        Compone el resultado final de la campaña
        
        Args:
            cliente: Información del cliente
            segmento: Segmento asignado
            campaña: Campaña seleccionada
            perfil_social: Perfil social del cliente
            
        Returns:
            ResultadoCampaña con HTML y JSON
        """
        mensaje_base = self.decisor.obtener_mensaje_base(segmento)
        
        # Personalizar mensaje con datos del cliente
        mensaje_personalizado = self._personalizar_mensaje(
            mensaje_base, cliente, perfil_social
        )
        
        # Generar HTML
        html = self._generar_html(cliente, campaña, mensaje_personalizado)
        
        # Generar JSON
        json_data = self._generar_json(cliente, segmento, campaña, perfil_social)
        
        # Métricas simuladas
        métricas = self._generar_métricas_simuladas(segmento)
        
        return ResultadoCampaña(
            id_cliente=cliente.id_cliente,
            nombre=cliente.nombre,
            segmento=segmento.value,
            campaña=campaña,
            mensaje_html=html,
            mensaje_json=json_data,
            métricas_simuladas=métricas
        )
    
    def _personalizar_mensaje(
        self,
        mensaje_base: str,
        cliente: Cliente,
        perfil_social: PerfilSocial
    ) -> str:
        """Personaliza el mensaje con información del cliente"""
        intereses_str = ", ".join(perfil_social.señales.intereses[:2])
        mensaje = f"Hola {cliente.nombre},\n\n"
        mensaje += mensaje_base
        mensaje += f"\n\nBasado en tu interés en {intereses_str}, "
        mensaje += "creemos que esta campaña es perfecta para ti."
        return mensaje
    
    def _generar_html(
        self,
        cliente: Cliente,
        campaña: Campaña,
        mensaje: str
    ) -> str:
        """Genera el HTML del mensaje"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Campaña: {campaña.nombre}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #333;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }}
        .mensaje {{
            line-height: 1.6;
            color: #555;
            margin: 20px 0;
            white-space: pre-wrap;
        }}
        .cta-button {{
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
        }}
        .cta-button:hover {{
            background-color: #45a049;
        }}
        .info {{
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 0.9em;
            color: #666;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{campaña.nombre}</h1>
        <div class="mensaje">{mensaje}</div>
        <a href="#" class="cta-button">{campaña.cta}</a>
        <div class="info">
            <strong>Campaña ID:</strong> {campaña.id_campaña}<br>
            <strong>Canal:</strong> {campaña.canal}<br>
            <strong>Cliente:</strong> {cliente.id_cliente}
        </div>
    </div>
</body>
</html>
        """
        return html.strip()
    
    def _generar_json(
        self,
        cliente: Cliente,
        segmento: Segmento,
        campaña: Campaña,
        perfil_social: PerfilSocial
    ) -> Dict:
        """Genera el JSON exportable"""
        return {
            "id_cliente": cliente.id_cliente,
            "nombre": cliente.nombre,
            "sector": cliente.sector,
            "segmento": segmento.value,
            "campaña": {
                "id": campaña.id_campaña,
                "nombre": campaña.nombre,
                "plantilla": campaña.plantilla,
                "cta": campaña.cta,
                "canal": campaña.canal
            },
            "perfil_social": {
                "red_social": perfil_social.red_social,
                "intereses": perfil_social.señales.intereses,
                "tono": perfil_social.señales.tono,
                "actividad": perfil_social.señales.actividad,
                "engagement": perfil_social.señales.engagement_promedio
            },
            "timestamp": None  # Se llenará en el orquestador
        }
    
    def _generar_métricas_simuladas(self, segmento: Segmento) -> Dict:
        """Genera métricas simuladas según el segmento"""
        import random
        
        # CTR base por segmento
        ctr_base = {
            Segmento.PREMIUM_ALTO_ENGAGEMENT: (0.12, 0.18),
            Segmento.MEDIO_CONSERVADOR: (0.06, 0.10),
            Segmento.BASICO_CRECIMIENTO: (0.03, 0.06),
            Segmento.RIESGO_ALTO: (0.02, 0.05)
        }
        
        ctr_min, ctr_max = ctr_base.get(segmento, (0.03, 0.06))
        ctr = round(random.uniform(ctr_min, ctr_max), 3)
        
        # Tasa de apertura simulada
        apertura_base = {
            Segmento.PREMIUM_ALTO_ENGAGEMENT: (0.35, 0.50),
            Segmento.MEDIO_CONSERVADOR: (0.25, 0.35),
            Segmento.BASICO_CRECIMIENTO: (0.15, 0.25),
            Segmento.RIESGO_ALTO: (0.10, 0.20)
        }
        
        apertura_min, apertura_max = apertura_base.get(segmento, (0.15, 0.25))
        tasa_apertura = round(random.uniform(apertura_min, apertura_max), 3)
        
        return {
            "ctr_estimado": ctr,
            "tasa_apertura_estimada": tasa_apertura,
            "segmento": segmento.value
        }

