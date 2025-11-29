"""
API FastAPI para el agente de campañas
Compatible con Lambda (usando Mangum) y Docker
"""
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import tempfile

from app.models import Cliente, ResultadoCampaña
from app.orquestador import OrquestadorAgente
from app.utils import (
    cargar_clientes_csv, 
    exportar_resultados_json,
    exportar_resultados_csv,
    exportar_resultados_html
)

app = FastAPI(title="Agente de Campañas", version="1.0.0")

# CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar orquestador
use_genai = os.getenv("USE_GENAI", "false").lower() == "true"
orquestador = OrquestadorAgente(use_genai=use_genai)

# Cargar clientes al inicio
CLIENTES_CSV_PATH = os.getenv("CLIENTES_CSV_PATH", "data/clientes.csv")
clientes_cache = []


class EjecutarAgenteRequest(BaseModel):
    id_cliente: Optional[str] = None
    procesar_todos: bool = False


class EjecutarAgenteResponse(BaseModel):
    resultado: dict
    logs: List[dict]
    estado_final: str


@app.on_event("startup")
async def startup_event():
    """Carga clientes al iniciar la aplicación"""
    global clientes_cache
    try:
        if os.path.exists(CLIENTES_CSV_PATH):
            clientes_cache = cargar_clientes_csv(CLIENTES_CSV_PATH)
    except Exception as e:
        print(f"Advertencia: No se pudo cargar CSV inicial: {e}")


@app.get("/")
async def root():
    """Endpoint raíz - redirige al frontend"""
    return {"message": "API del Agente de Campañas", "status": "running"}


@app.get("/api/clientes")
async def obtener_clientes():
    """Obtiene la lista de clientes disponibles"""
    global clientes_cache
    
    if not clientes_cache:
        try:
            clientes_cache = cargar_clientes_csv(CLIENTES_CSV_PATH)
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"No se encontraron clientes: {e}")
    
    return {
        "clientes": [
            {
                "id_cliente": c.id_cliente,
                "nombre": c.nombre,
                "sector": c.sector,
                "gasto_promedio": c.gasto_promedio,
                "riesgo": c.riesgo,
                "red_social": c.red_social
            }
            for c in clientes_cache
        ]
    }


@app.post("/api/ejecutar", response_model=EjecutarAgenteResponse)
async def ejecutar_agente(request: EjecutarAgenteRequest):
    """
    Ejecuta el agente para uno o todos los clientes
    """
    global clientes_cache
    
    if not clientes_cache:
        try:
            clientes_cache = cargar_clientes_csv(CLIENTES_CSV_PATH)
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"No se encontraron clientes: {e}")
    
    resultados = []
    
    if request.procesar_todos:
        # Procesar todos los clientes
        for cliente in clientes_cache:
            estado_final = orquestador.ejecutar(cliente)
            if estado_final.resultado:
                resultados.append(estado_final.resultado)
    elif request.id_cliente:
        # Procesar un cliente específico
        cliente = next(
            (c for c in clientes_cache if c.id_cliente == request.id_cliente),
            None
        )
        if not cliente:
            raise HTTPException(status_code=404, detail=f"Cliente {request.id_cliente} no encontrado")
        
        estado_final = orquestador.ejecutar(cliente)
        if estado_final.resultado:
            resultados.append(estado_final.resultado)
        
        return EjecutarAgenteResponse(
            resultado=estado_final.resultado.mensaje_json if estado_final.resultado else {},
            logs=estado_final.logs,
            estado_final=estado_final.estado_actual.value
        )
    else:
        raise HTTPException(status_code=400, detail="Debe proporcionar id_cliente o procesar_todos=True")
    
    # Si procesamos todos, retornamos resumen
    if request.procesar_todos:
        return EjecutarAgenteResponse(
            resultado={"total_procesados": len(resultados)},
            logs=[],
            estado_final="FIN"
        )


@app.get("/api/resultados")
async def obtener_resultados():
    """Obtiene todos los resultados procesados (requiere ejecución previa)"""
    # En una implementación real, esto vendría de una base de datos
    # Por ahora retornamos un mensaje
    return {"message": "Ejecuta el agente primero usando /api/ejecutar"}


@app.get("/api/exportar/json")
async def exportar_json():
    """Exporta resultados en formato JSON"""
    # En producción, esto vendría de una base de datos
    return JSONResponse(
        content={"message": "Ejecuta el agente primero"},
        media_type="application/json"
    )


@app.get("/api/exportar/csv")
async def exportar_csv():
    """Exporta resultados en formato CSV"""
    # En producción, esto vendría de una base de datos
    return {"message": "Ejecuta el agente primero"}


@app.get("/api/exportar/html")
async def exportar_html():
    """Exporta resultados en formato HTML"""
    # En producción, esto vendría de una base de datos
    return HTMLResponse(content="<html><body>Ejecuta el agente primero</body></html>")


# Handler para Lambda (usando Mangum)
try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    handler = None


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

