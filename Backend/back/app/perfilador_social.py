"""
Módulo PerfiladorSocialMock
Simula señales sociales de redes sociales para un cliente
"""
import random
from typing import Dict
from app.models import Cliente, PerfilSocial, SeñalesSociales


class PerfiladorSocialMock:
    """Genera señales sociales simuladas basadas en el cliente"""
    
    INTERESES_POR_SECTOR = {
        "retail": ["moda", "tendencias", "ofertas", "compras", "estilo"],
        "tech": ["tecnología", "innovación", "gadgets", "startups", "apps"],
        "salud": ["bienestar", "fitness", "nutrición", "salud mental", "ejercicio"],
        "educación": ["aprendizaje", "cursos", "libros", "desarrollo profesional", "habilidades"],
        "gastronomía": ["comida", "recetas", "restaurantes", "cocina", "sabores"],
    }
    
    TONOS_POR_RED = {
        "instagram": ["visual", "inspiracional", "estético", "casual"],
        "facebook": ["comunitario", "informativo", "conversacional"],
        "twitter": ["directo", "actual", "opinión", "breve"],
        "linkedin": ["profesional", "corporativo", "networking"],
    }
    
    ACTIVIDAD_LEVELS = ["alta", "media", "baja"]
    
    def generar_señales(self, cliente: Cliente) -> PerfilSocial:
        """
        Genera señales sociales simuladas para un cliente
        
        Args:
            cliente: Cliente con información básica
            
        Returns:
            PerfilSocial con señales simuladas
        """
        # Intereses basados en sector
        intereses_base = self.INTERESES_POR_SECTOR.get(
            cliente.sector.lower(), 
            ["general", "interés", "contenido"]
        )
        intereses = random.sample(intereses_base, k=min(3, len(intereses_base)))
        
        # Tono basado en red social
        tonos_disponibles = self.TONOS_POR_RED.get(
            cliente.red_social.lower(),
            ["general"]
        )
        tono = random.choice(tonos_disponibles)
        
        # Actividad basada en gasto promedio (proxy de engagement)
        if cliente.gasto_promedio > 500:
            actividad = "alta"
        elif cliente.gasto_promedio > 200:
            actividad = "media"
        else:
            actividad = "baja"
        
        # Engagement promedio simulado
        engagement_base = 0.05
        if actividad == "alta":
            engagement_promedio = round(random.uniform(0.08, 0.15), 3)
        elif actividad == "media":
            engagement_promedio = round(random.uniform(0.04, 0.08), 3)
        else:
            engagement_promedio = round(random.uniform(0.01, 0.04), 3)
        
        # Frecuencia de publicación
        if actividad == "alta":
            frecuencia = random.choice(["diaria", "2-3 veces por semana"])
        elif actividad == "media":
            frecuencia = random.choice(["semanal", "2 veces por semana"])
        else:
            frecuencia = random.choice(["quincenal", "mensual"])
        
        señales = SeñalesSociales(
            intereses=intereses,
            tono=tono,
            actividad=actividad,
            engagement_promedio=engagement_promedio,
            frecuencia_publicacion=frecuencia
        )
        
        return PerfilSocial(
            id_cliente=cliente.id_cliente,
            red_social=cliente.red_social,
            señales=señales
        )

