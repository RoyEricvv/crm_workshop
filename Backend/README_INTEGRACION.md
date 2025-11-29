# 🎯 CRM Inteligente - Backend Integrado

Backend del sistema CRM con agente FSM autónomo, **completamente integrado con el frontend Next.js**.

## 🚀 Cambios de Integración v2.0

### ✅ Compatibilidad Total con Frontend

- **Endpoints actualizados** a las URLs correctas
- **Server-Sent Events (SSE)** para logs en tiempo real
- **Sistema de sesiones** con `sessionId`
- **Modelos adaptados** al formato del frontend
- **Exportación funcional** (JSON/CSV/HTML)

---

## 📡 API Endpoints (Compatible con Frontend)

### 1. Obtener Clientes
```bash
GET /api/clientes
```
**Response:**
```json
{
  "clientes": [
    {
      "id_cliente": "C001",
      "nombre": "María López",
      "sector": "retail",
      "gasto_promedio": 450.5,
      "riesgo": "medio",
      "red_social": "instagram"
    }
  ],
  "total": 10
}
```

### 2. Ejecutar Agente
```bash
POST /api/agente/ejecutar
Content-Type: application/json

{
  "clienteIds": ["C001", "C002"]
}
```
**Response:**
```json
{
  "sessionId": "session_abc123_1234567890",
  "message": "Procesando 2 cliente(s)"
}
```

### 3. Logs en Tiempo Real (SSE)
```bash
GET /api/agente/logs/:sessionId
```
**Response:** Stream de eventos Server-Sent Events
```
data: {"state":"INGESTA","timestamp":"2025-11-29T...","message":"Cargando..."}

data: {"state":"PERFIL","timestamp":"2025-11-29T...","message":"Generando perfil..."}

data: {"state":"FIN","timestamp":"2025-11-29T...","message":"Completado"}
```

### 4. Obtener Resultados

**Un cliente:**
```bash
GET /api/resultados/:sessionId
```

**Múltiples clientes:**
```bash
GET /api/resultados/:sessionId/multiples
```

**Response:**
```json
{
  "cliente": {...},
  "perfil": {
    "engagement_rate": 0.085,
    "followers": 5420,
    "avg_likes": 234,
    "sentiment_score": 0.7,
    "activity_freq": "ALTA"
  },
  "segmento": {
    "tipo": "premium_alto_engagement",
    "score": 85,
    "rationale": "Cliente clasificado como premium..."
  },
  "campaña": {
    "plantilla": "premium_exclusivo",
    "titulo": "Exclusividad Premium",
    "mensaje": "...",
    "cta": "Accede ahora",
    "color_tema": "#1E40AF",
    "canal_sugerido": "email"
  },
  "logs": [...],
  "htmlOutput": "<html>...</html>",
  "sessionId": "session_abc123",
  "timestamp": "2025-11-29T..."
}
```

### 5. Exportar Resultados
```bash
GET /api/export/:sessionId/json
GET /api/export/:sessionId/csv
GET /api/export/:sessionId/html
```
**Response:** Archivo descargable

---

## 🏗️ Arquitectura

```
Frontend (Next.js)
    ↓ POST /api/agente/ejecutar
Backend FastAPI
    ↓ Crea sessionId
SessionManager
    ↓ Procesa async
Orquestador FSM
    ↓ INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA → FIN
    ↓ Emite logs progresivos
SessionManager guarda resultados
    ↑ GET /api/agente/logs/:id (SSE)
    ↑ GET /api/resultados/:id
Frontend recibe y muestra
```

---

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

Copia y edita el archivo `.env`:

```bash
# IMPORTANTE: Asegúrate de configurar correctamente
OPENAI_API_KEY=tu_api_key_aqui  # Solo si quieres usar GenAI
USE_GENAI=false                 # true o false
CLIENTES_CSV_PATH=data/clientes.csv
PORT=8000
FRONTEND_URL=http://localhost:3000
```

**⚠️ Nota sobre el .env existente:**
Si ya tienes un archivo `.env`, verifica que:
- `USE_GENAI` sea `true` o `false` (no la API key)
- `OPENAI_API_KEY` contenga solo la API key
- Si no quieres usar GenAI, pon `USE_GENAI=false`

### 3. Ejecutar el Backend

#### Opción A: Con Uvicorn (Desarrollo)
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Opción B: Con Docker
```bash
docker build -t crm-backend .
docker run -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e OPENAI_API_KEY=tu_key \
  -e USE_GENAI=false \
  crm-backend
```

#### Opción C: Con Docker Compose
```bash
docker-compose up --build
```

### 4. Verificar que Funciona

```bash
# Health check
curl http://localhost:8000/health

# Obtener clientes
curl http://localhost:8000/api/clientes

# Ver documentación interactiva
open http://localhost:8000/docs
```

---

## 🔗 Conectar con Frontend

En el frontend Next.js, crea/edita `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Reinicia el frontend** después de configurar:
```bash
cd frontCRM/gen-ai-hackathon-prototype
npm run dev
```

El frontend ahora se conectará automáticamente al backend.

---

## 📊 Flujo de Integración

### 1. Usuario selecciona cliente(s) en el frontend
### 2. Frontend llama `POST /api/agente/ejecutar`
### 3. Backend crea sessionId y retorna inmediatamente
### 4. Frontend conecta a `/api/agente/logs/:sessionId` (SSE)
### 5. Backend procesa clientes y emite logs progresivos
### 6. Frontend muestra logs en tiempo real
### 7. Al terminar, frontend obtiene resultados de `/api/resultados/:sessionId`
### 8. Usuario exporta en JSON/CSV/HTML

---

## 🔧 Módulos del Sistema

### `app/main.py`
- API FastAPI con todos los endpoints
- Integración con SessionManager
- SSE para logs en tiempo real

### `app/session_manager.py`
- Gestiona sesiones de ejecución
- Almacena resultados y logs
- Thread-safe

### `app/adapters.py`
- Transforma modelos del backend al formato del frontend
- Mantiene compatibilidad entre sistemas

### `app/models.py`
- Modelos Pydantic del backend
- Modelos compatibles con frontend
- Enums y estructuras de datos

### `app/orquestador.py`
- FSM con LangGraph
- Flujo: INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA → FIN
- Manejo de errores

### `app/perfilador_social.py`
- Mock de señales sociales
- Basado en red_social del cliente

### `app/segmentador.py`
- Reglas determinísticas
- 4 segmentos: premium, medio, básico, riesgo

### `app/decisor_campaña.py`
- 4 plantillas de campaña
- Mapeo segmento → campaña

### `app/compositor.py`
- Genera HTML y JSON
- Métricas simuladas

---

## 🧪 Probar la Integración

### 1. Ejecutar Backend
```bash
cd Backend
uvicorn app.main:app --reload
```

### 2. Ejecutar Frontend
```bash
cd frontCRM/gen-ai-hackathon-prototype
npm run dev
```

### 3. Abrir Frontend
```
http://localhost:3000
```

### 4. Probar Flujo Completo
1. Cargar clientes desde CSV
2. Seleccionar uno o varios clientes
3. Click "Ejecutar Agente FSM"
4. Ver logs en tiempo real
5. Ver resultados en tabla
6. Exportar en JSON/CSV/HTML

---

## 📝 Notas Importantes

### Sobre GenAI
- **Por defecto está desactivado** (`USE_GENAI=false`)
- El agente funciona perfectamente con reglas determinísticas
- Si quieres activar GenAI:
  1. Consigue una API key de OpenAI
  2. Pon `OPENAI_API_KEY=tu_key_real`
  3. Pon `USE_GENAI=true`

### Sobre el CSV
- El archivo `data/clientes.csv` tiene 10 clientes de ejemplo
- Puedes agregar más clientes siguiendo el formato
- Columnas requeridas: `id_cliente,nombre,sector,gasto_promedio,riesgo,red_social`

### Sobre CORS
- Configurado para permitir `http://localhost:3000`
- En producción, actualiza `FRONTEND_URL` en `.env`

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verifica Python
python --version  # Debe ser 3.11+

# Reinstala dependencias
pip install -r requirements.txt --force-reinstall
```

### Frontend no se conecta
```bash
# Verifica que el backend esté corriendo
curl http://localhost:8000/health

# Verifica la variable de entorno del frontend
cat frontCRM/gen-ai-hackathon-prototype/.env.local
# Debe tener: NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Logs no aparecen en tiempo real
- Verifica que tu navegador soporte EventSource (todos los modernos lo soportan)
- Revisa la consola del navegador para errores
- Verifica que el endpoint SSE responda: `curl http://localhost:8000/api/agente/logs/session_test`

### Exportación no funciona
- Verifica que la sesión exista
- Revisa los logs del backend para errores
- Asegúrate de que hay resultados en la sesión

---

## 📚 Documentación API Completa

Visita `http://localhost:8000/docs` para la documentación interactiva de Swagger.

---

## ✅ Cumplimiento del Reto

- ✅ Agente FSM con 6 estados (incluye FIN)
- ✅ Lectura desde CSV
- ✅ Señales sociales mockeadas
- ✅ Segmentación con reglas determinísticas
- ✅ 4 plantillas de campaña
- ✅ Exportación JSON/CSV/HTML
- ✅ Sin scraping real
- ✅ Sin prompts libres (si usa GenAI, están embebidos)
- ✅ Logs en tiempo real
- ✅ Integración completa con frontend

---

**¡El backend está 100% integrado con el frontend Next.js!** 🎉

