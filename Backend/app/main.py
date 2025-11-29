"""
API FastAPI para el agente de campañas - Compatible con Frontend Next.js
"""
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pathlib import Path
import os
import asyncio
import json
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

from app.models import (
    Cliente, EjecutarAgenteRequest, EjecutarAgenteResponse,
    ClienteListResponse, AgentResult, LogEntry
)
from app.orquestador import OrquestadorAgente
from app.session_manager import session_manager
from app.adapters import estado_to_agent_result
from app.utils import (
    cargar_clientes_csv,
    exportar_resultados_json,
    exportar_resultados_csv,
    exportar_resultados_html
)
from app.decisor_campaña import DecisorCampaña

app = FastAPI(
    title="Agente de Campañas - CRM Inteligente",
    version="2.0.0",
    description="Backend del sistema CRM con agente FSM autónomo"
)

# CORS - Permitir frontend
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "*"],  # En producción, quitar el *
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos
static_path = Path(__file__).parent.parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# Inicializar componentes
use_genai = os.getenv("USE_GENAI", "false").lower() == "true"
orquestador = OrquestadorAgente(use_genai=use_genai)
decisor = DecisorCampaña()

# Cargar clientes
CLIENTES_CSV_PATH = os.getenv("CLIENTES_CSV_PATH", "data/clientes.csv")
clientes_cache = []


@app.on_event("startup")
async def startup_event():
    """Carga clientes al iniciar"""
    global clientes_cache
    try:
        if os.path.exists(CLIENTES_CSV_PATH):
            clientes_cache = cargar_clientes_csv(CLIENTES_CSV_PATH)
            print(f"✅ Cargados {len(clientes_cache)} clientes desde {CLIENTES_CSV_PATH}")
        else:
            print(f"⚠️ Archivo CSV no encontrado: {CLIENTES_CSV_PATH}")
    except Exception as e:
        print(f"❌ Error cargando clientes: {e}")


@app.get("/", response_class=HTMLResponse)
async def root():
    """Endpoint raíz"""
    index_path = static_path / "index.html"
    if index_path.exists():
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return HTMLResponse(
        content="""
        <html>
        <head><title>API CRM Inteligente</title></head>
        <body>
            <h1>🤖 API del Agente de Campañas</h1>
            <p>Status: <strong>Running</strong></p>
            <h2>Endpoints disponibles:</h2>
            <ul>
                <li><a href="/api/clientes">GET /api/clientes</a> - Lista de clientes</li>
                <li>POST /api/agente/ejecutar - Ejecutar agente</li>
                <li>GET /api/agente/logs/:sessionId - Logs en tiempo real (SSE)</li>
                <li>GET /api/resultados/:sessionId - Obtener resultados</li>
                <li>GET /api/export/:sessionId/:formato - Exportar (json/csv/html)</li>
            </ul>
            <p><a href="/docs">📚 Documentación interactiva</a></p>
        </body>
        </html>
        """
    )


@app.get("/api/clientes", response_model=ClienteListResponse)
async def obtener_clientes():
    """Obtiene la lista de clientes desde el CSV"""
    global clientes_cache
    
    if not clientes_cache:
        try:
            clientes_cache = cargar_clientes_csv(CLIENTES_CSV_PATH)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron clientes: {e}"
            )
    
    return ClienteListResponse(
        clientes=clientes_cache,
        total=len(clientes_cache)
    )


@app.post("/api/agente/ejecutar", response_model=EjecutarAgenteResponse)
async def ejecutar_agente(request: EjecutarAgenteRequest):
    """
    Ejecuta el agente FSM para uno o varios clientes
    Compatible con el frontend Next.js
    """
    global clientes_cache
    
    if not clientes_cache:
        try:
            clientes_cache = cargar_clientes_csv(CLIENTES_CSV_PATH)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"No se encontraron clientes: {e}"
            )
    
    if not request.clienteIds or len(request.clienteIds) == 0:
        raise HTTPException(
            status_code=400,
            detail="Debe proporcionar al menos un clienteId"
        )
    
    # Crear sesión
    session_id = session_manager.create_session(request.clienteIds)
    
    # Ejecutar agente de forma asíncrona
    asyncio.create_task(procesar_clientes_async(session_id, request.clienteIds))
    
    return EjecutarAgenteResponse(
        sessionId=session_id,
        message=f"Procesando {len(request.clienteIds)} cliente(s)"
    )


async def procesar_clientes_async(session_id: str, client_ids: List[str]):
    """Procesa clientes de forma asíncrona"""
    try:
        for client_id in client_ids:
            # Buscar cliente
            cliente = next(
                (c for c in clientes_cache if c.id_cliente == client_id),
                None
            )
            
            if not cliente:
                # Log de error
                error_log = LogEntry(
                    state="ERROR",
                    timestamp=datetime.now().isoformat(),
                    message=f"Cliente {client_id} no encontrado"
                )
                session_manager.add_log(session_id, error_log)
                continue
            
            # Ejecutar agente
            estado_final = orquestador.ejecutar(cliente)
            
            # Agregar logs a la sesión
            for log in estado_final.logs:
                log_entry = LogEntry(
                    state=log.get("estado", "UNKNOWN"),
                    timestamp=log.get("timestamp", datetime.now().isoformat()),
                    message=log.get("mensaje", ""),
                    data=log.get("data")
                )
                session_manager.add_log(session_id, log_entry)
            
            # Convertir resultado al formato del frontend
            if estado_final.resultado and estado_final.segmento:
                mensaje_base = decisor.obtener_mensaje_base(estado_final.segmento)
                result = estado_to_agent_result(estado_final, session_id, mensaje_base)
                session_manager.add_result(session_id, result)
        
        # Marcar sesión como completada
        session_manager.complete_session(session_id)
        
    except Exception as e:
        error_log = LogEntry(
            state="ERROR",
            timestamp=datetime.now().isoformat(),
            message=f"Error procesando clientes: {str(e)}"
        )
        session_manager.add_log(session_id, error_log)
        session_manager.complete_session(session_id)


@app.get("/api/agente/logs/{session_id}")
async def stream_logs(session_id: str):
    """
    Stream de logs en tiempo real usando Server-Sent Events (SSE)
    Compatible con EventSource del frontend
    """
    print(f"📡 SSE: Cliente conectándose a session {session_id}")
    
    # No verificar si existe, crear una espera inicial
    async def event_generator():
        """Generador de eventos SSE"""
        last_log_count = 0
        max_iterations = 300  # 5 minutos máximo (1 segundo por iteración)
        iteration = 0
        wait_for_session = 10  # Esperar 10 segundos para que se cree la sesión
        
        # Enviar evento de conexión
        yield f'data: {json.dumps({"state": "CONNECTING", "timestamp": datetime.now().isoformat(), "message": "Conectado al stream de logs"})}\n\n'
        
        while iteration < max_iterations:
            session = session_manager.get_session(session_id)
            
            # Si no existe la sesión, esperar un poco
            if not session:
                if iteration < wait_for_session:
                    print(f"⏳ SSE: Esperando sesión {session_id} (intento {iteration}/{wait_for_session})")
                    await asyncio.sleep(1)
                    iteration += 1
                    continue
                else:
                    print(f"❌ SSE: Sesión {session_id} no encontrada después de {wait_for_session}s")
                    yield f'data: {json.dumps({"state": "ERROR", "timestamp": datetime.now().isoformat(), "message": "Sesión no encontrada"})}\n\n'
                    break
            
            # Obtener nuevos logs
            logs = session.get("logs", [])
            new_logs = logs[last_log_count:]
            
            # Enviar nuevos logs
            for log in new_logs:
                data = json.dumps(log)
                print(f"📨 SSE: Enviando log: {log.get('state', 'UNKNOWN')}")
                yield f"data: {data}\n\n"
            
            last_log_count = len(logs)
            
            # Si la sesión está completada, enviar evento final y terminar
            if session.get("status") == "completed":
                print(f"✅ SSE: Sesión {session_id} completada")
                yield f'data: {json.dumps({"state": "FIN", "timestamp": datetime.now().isoformat(), "message": "Stream finalizado"})}\n\n'
                break
            
            # Esperar antes de la siguiente iteración
            await asyncio.sleep(1)
            iteration += 1
        
        print(f"🔌 SSE: Stream cerrado para session {session_id}")
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Para nginx
            "Access-Control-Allow-Origin": "*",  # CORS para SSE
        }
    )


@app.get("/api/resultados/{session_id}")
async def obtener_resultados(session_id: str):
    """
    Obtiene los resultados de una sesión (un cliente)
    Compatible con el frontend
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    results = session_manager.get_results(session_id)
    
    if not results or len(results) == 0:
        raise HTTPException(
            status_code=404,
            detail="No hay resultados disponibles para esta sesión"
        )
    
    # Retornar el primer resultado
    return results[0]


@app.get("/api/resultados/{session_id}/multiples")
async def obtener_resultados_multiples(session_id: str):
    """
    Obtiene los resultados de una sesión (múltiples clientes)
    Compatible con el frontend
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    results = session_manager.get_results(session_id)
    
    if not results:
        raise HTTPException(
            status_code=404,
            detail="No hay resultados disponibles para esta sesión"
        )
    
    return results


@app.get("/api/export/{session_id}/{formato}")
async def exportar(session_id: str, formato: str):
    """
    Exporta los resultados en el formato especificado
    Compatible con el frontend
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    results = session_manager.get_results(session_id)
    
    if not results:
        raise HTTPException(
            status_code=404,
            detail="No hay resultados disponibles para esta sesión"
        )
    
    # Convertir AgentResult a ResultadoCampaña para la exportación
    from app.models import ResultadoCampaña, Campaña as CampañaBackend
    
    resultados_backend = []
    for result in results:
        # Convertir campaña frontend a backend
        campaña_backend = CampañaBackend(
            id_campaña=f"CAMP-{result.segmento.tipo[:3].upper()}",
            nombre=result.campaña.titulo,
            plantilla=result.campaña.plantilla,
            cta=result.campaña.cta,
            canal=result.campaña.canal_sugerido or "email",
            segmento_target=result.segmento.tipo
        )
        
        resultado_backend = ResultadoCampaña(
            id_cliente=result.cliente.id_cliente,
            nombre=result.cliente.nombre,
            segmento=result.segmento.tipo,
            campaña=campaña_backend,
            mensaje_html=result.htmlOutput,
            mensaje_json=result.dict(),
            métricas_simuladas={
                "ctr_estimado": 0.05,
                "tasa_apertura_estimada": 0.25
            }
        )
        resultados_backend.append(resultado_backend)
    
    # Exportar según formato
    if formato == "json":
        content = exportar_resultados_json(resultados_backend)
        return Response(
            content=content,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=campañas_{session_id}.json"
            }
        )
    
    elif formato == "csv":
        content = exportar_resultados_csv(resultados_backend)
        return Response(
            content=content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=campañas_{session_id}.csv"
            }
        )
    
    elif formato == "html":
        content = exportar_resultados_html(resultados_backend)
        return Response(
            content=content,
            media_type="text/html",
            headers={
                "Content-Disposition": f"attachment; filename=campañas_{session_id}.html"
            }
        )
    
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no soportado: {formato}. Use: json, csv o html"
        )


@app.get("/health")
async def health_check():
    """Health check para monitoreo"""
    return {
        "status": "healthy",
        "clientes_loaded": len(clientes_cache),
        "use_genai": use_genai
    }


# Handler para Lambda
try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    handler = None


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
