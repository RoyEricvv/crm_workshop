"""
Orquestador FSM con LangGraph
Controla el flujo: INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA
"""
from typing import Dict, Any, Literal
from datetime import datetime
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
import os

from app.models import (
    EstadoAgente, Estado, Cliente, PerfilSocial, Segmento, 
    Campaña, ResultadoCampaña
)
from app.perfilador_social import PerfiladorSocialMock
from app.segmentador import Segmentador
from app.decisor_campaña import DecisorCampaña
from app.compositor import Compositor


class OrquestadorAgente:
    """Orquestador que controla el flujo del agente con FSM"""
    
    def __init__(self, use_genai: bool = False):
        """
        Inicializa el orquestador
        
        Args:
            use_genai: Si True, usa OpenAI para decisiones. Si False, solo reglas.
        """
        self.use_genai = use_genai
        self.perfilador = PerfiladorSocialMock()
        self.segmentador = Segmentador()
        self.decisor = DecisorCampaña()
        self.compositor = Compositor()
        
        if use_genai and os.getenv("OPENAI_API_KEY"):
            self.llm = ChatOpenAI(
                model="gpt-3.5-turbo",
                temperature=0.3
            )
        else:
            self.llm = None
        
        # Construir el grafo de estados
        self.graph = self._construir_grafo()
    
    def _construir_grafo(self) -> StateGraph:
        """Construye el grafo de estados con LangGraph"""
        workflow = StateGraph(EstadoAgente)
        
        # Agregar nodos
        workflow.add_node("ingesta", self._nodo_ingesta)
        workflow.add_node("perfil", self._nodo_perfil)
        workflow.add_node("segmento", self._nodo_segmento)
        workflow.add_node("campaña", self._nodo_campaña)
        workflow.add_node("salida", self._nodo_salida)
        workflow.add_node("error", self._nodo_error)
        
        # Definir flujo
        workflow.set_entry_point("ingesta")
        workflow.add_edge("ingesta", "perfil")
        workflow.add_edge("perfil", "segmento")
        workflow.add_edge("segmento", "campaña")
        workflow.add_edge("campaña", "salida")
        workflow.add_edge("salida", END)
        
        # Manejo de errores
        workflow.add_edge("error", END)
        
        return workflow.compile()
    
    def _nodo_ingesta(self, state: EstadoAgente) -> EstadoAgente:
        """Estado INGESTA: Valida entrada del cliente"""
        try:
            state.estado_actual = Estado.INGESTA
            state.logs.append({
                "estado": "INGESTA",
                "mensaje": f"Procesando cliente: {state.cliente.id_cliente if state.cliente else 'N/A'}",
                "timestamp": datetime.now().isoformat()
            })
            
            if not state.cliente:
                raise ValueError("Cliente no proporcionado")
            
            return state
        except Exception as e:
            state.estado_actual = Estado.ERROR
            state.error = str(e)
            return state
    
    def _nodo_perfil(self, state: EstadoAgente) -> EstadoAgente:
        """Estado PERFIL: Genera perfil social"""
        try:
            state.estado_actual = Estado.PERFIL
            state.logs.append({
                "estado": "PERFIL",
                "mensaje": "Generando perfil social...",
                "timestamp": datetime.now().isoformat()
            })
            
            perfil = self.perfilador.generar_señales(state.cliente)
            state.perfil_social = perfil
            
            state.logs.append({
                "estado": "PERFIL",
                "mensaje": f"Perfil generado: {perfil.señales.actividad} actividad, {perfil.señales.tono} tono",
                "timestamp": datetime.now().isoformat()
            })
            
            return state
        except Exception as e:
            state.estado_actual = Estado.ERROR
            state.error = str(e)
            return state
    
    def _nodo_segmento(self, state: EstadoAgente) -> EstadoAgente:
        """Estado SEGMENTO: Segmenta al cliente"""
        try:
            state.estado_actual = Estado.SEGMENTO
            state.logs.append({
                "estado": "SEGMENTO",
                "mensaje": "Aplicando reglas de segmentación...",
                "timestamp": datetime.now().isoformat()
            })
            
            segmento = self.segmentador.segmentar(
                state.cliente,
                state.perfil_social
            )
            state.segmento = segmento
            
            state.logs.append({
                "estado": "SEGMENTO",
                "mensaje": f"Segmento asignado: {segmento.value}",
                "timestamp": datetime.now().isoformat()
            })
            
            return state
        except Exception as e:
            state.estado_actual = Estado.ERROR
            state.error = str(e)
            return state
    
    def _nodo_campaña(self, state: EstadoAgente) -> EstadoAgente:
        """Estado CAMPAÑA: Selecciona campaña"""
        try:
            state.estado_actual = Estado.CAMPAÑA
            state.logs.append({
                "estado": "CAMPAÑA",
                "mensaje": "Seleccionando campaña...",
                "timestamp": datetime.now().isoformat()
            })
            
            campaña = self.decisor.seleccionar_campaña(state.segmento)
            state.campaña = campaña
            
            state.logs.append({
                "estado": "CAMPAÑA",
                "mensaje": f"Campaña seleccionada: {campaña.nombre}",
                "timestamp": datetime.now().isoformat()
            })
            
            return state
        except Exception as e:
            state.estado_actual = Estado.ERROR
            state.error = str(e)
            return state
    
    def _nodo_salida(self, state: EstadoAgente) -> EstadoAgente:
        """Estado SALIDA: Genera resultado final"""
        try:
            state.estado_actual = Estado.SALIDA
            state.logs.append({
                "estado": "SALIDA",
                "mensaje": "Componiendo resultado final...",
                "timestamp": datetime.now().isoformat()
            })
            
            resultado = self.compositor.componer(
                state.cliente,
                state.segmento,
                state.campaña,
                state.perfil_social
            )
            
            # Agregar timestamp al JSON
            resultado.mensaje_json["timestamp"] = datetime.now().isoformat()
            
            state.resultado = resultado
            state.estado_actual = Estado.FIN
            
            state.logs.append({
                "estado": "SALIDA",
                "mensaje": "Resultado generado exitosamente",
                "timestamp": datetime.now().isoformat()
            })
            
            return state
        except Exception as e:
            state.estado_actual = Estado.ERROR
            state.error = str(e)
            return state
    
    def _nodo_error(self, state: EstadoAgente) -> EstadoAgente:
        """Maneja errores"""
        state.logs.append({
            "estado": "ERROR",
            "mensaje": f"Error: {state.error}",
            "timestamp": datetime.now().isoformat()
        })
        return state
    
    def ejecutar(self, cliente: Cliente) -> EstadoAgente:
        """
        Ejecuta el agente para un cliente
        
        Args:
            cliente: Cliente a procesar
            
        Returns:
            EstadoAgente con el resultado completo
        """
        estado_inicial = EstadoAgente(
            estado_actual=Estado.INGESTA,
            cliente=cliente,
            logs=[]
        )
        
        # Ejecutar el grafo
        resultado = self.graph.invoke(estado_inicial)
        
        return resultado

