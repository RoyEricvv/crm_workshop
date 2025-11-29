"""
Gestor de sesiones para almacenar resultados de ejecuciones
"""
import uuid
from typing import Dict, List, Optional
from datetime import datetime
from app.models import AgentResult, LogEntry
import threading


class SessionManager:
    """Gestiona sesiones de ejecución del agente"""
    
    def __init__(self):
        self._sessions: Dict[str, Dict] = {}
        self._lock = threading.Lock()
    
    def create_session(self, client_ids: List[str]) -> str:
        """Crea una nueva sesión y retorna el ID"""
        session_id = f"session_{uuid.uuid4().hex[:16]}_{int(datetime.now().timestamp())}"
        
        with self._lock:
            self._sessions[session_id] = {
                "session_id": session_id,
                "client_ids": client_ids,
                "results": [],
                "logs": [],
                "status": "running",
                "created_at": datetime.now().isoformat(),
                "completed_at": None
            }
        
        return session_id
    
    def add_log(self, session_id: str, log: LogEntry):
        """Agrega un log a la sesión"""
        with self._lock:
            if session_id in self._sessions:
                self._sessions[session_id]["logs"].append(log.dict())
    
    def add_result(self, session_id: str, result: AgentResult):
        """Agrega un resultado a la sesión"""
        with self._lock:
            if session_id in self._sessions:
                self._sessions[session_id]["results"].append(result)
    
    def complete_session(self, session_id: str):
        """Marca la sesión como completada"""
        with self._lock:
            if session_id in self._sessions:
                self._sessions[session_id]["status"] = "completed"
                self._sessions[session_id]["completed_at"] = datetime.now().isoformat()
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Obtiene información de una sesión"""
        with self._lock:
            return self._sessions.get(session_id)
    
    def get_results(self, session_id: str) -> List[AgentResult]:
        """Obtiene los resultados de una sesión"""
        with self._lock:
            session = self._sessions.get(session_id)
            if session:
                return session.get("results", [])
            return []
    
    def get_logs(self, session_id: str) -> List[Dict]:
        """Obtiene los logs de una sesión"""
        with self._lock:
            session = self._sessions.get(session_id)
            if session:
                return session.get("logs", [])
            return []
    
    def session_exists(self, session_id: str) -> bool:
        """Verifica si existe una sesión"""
        with self._lock:
            return session_id in self._sessions


# Instancia global del gestor
session_manager = SessionManager()

