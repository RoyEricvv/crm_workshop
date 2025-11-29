"""
Módulo Segmentador
Aplica reglas determinísticas para segmentar clientes
"""
from app.models import Cliente, PerfilSocial, Segmento


class Segmentador:
    """Segmenta clientes basado en reglas determinísticas"""
    
    def segmentar(
        self, 
        cliente: Cliente, 
        perfil_social: PerfilSocial
    ) -> Segmento:
        """
        Segmenta un cliente basado en:
        - Sector
        - Riesgo
        - Gasto promedio
        - Señales sociales (actividad, engagement)
        
        Args:
            cliente: Información del cliente
            perfil_social: Perfil social generado
            
        Returns:
            Segmento asignado
        """
        gasto = cliente.gasto_promedio
        riesgo = cliente.riesgo.lower()
        actividad = perfil_social.señales.actividad
        engagement = perfil_social.señales.engagement_promedio
        
        # Regla 1: Premium Alto Engagement
        # Alto gasto + baja/medio riesgo + alta actividad + buen engagement
        if (gasto > 500 and 
            riesgo in ["bajo", "medio"] and 
            actividad == "alta" and 
            engagement > 0.08):
            return Segmento.PREMIUM_ALTO_ENGAGEMENT
        
        # Regla 2: Riesgo Alto
        # Cualquier cliente con riesgo alto
        if riesgo == "alto":
            return Segmento.RIESGO_ALTO
        
        # Regla 3: Medio Conservador
        # Gasto medio + riesgo medio/bajo + actividad media/baja
        if (200 <= gasto <= 500 and 
            riesgo in ["bajo", "medio"] and 
            actividad in ["media", "baja"]):
            return Segmento.MEDIO_CONSERVADOR
        
        # Regla 4: Básico Crecimiento (default)
        # Clientes con bajo gasto pero potencial de crecimiento
        return Segmento.BASICO_CRECIMIENTO

