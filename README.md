# 🤖 CRM Inteligente - Hackathon GenAI 2025

Sistema completo de CRM con agente autónomo FSM (Finite State Machine) que ejecuta automáticamente el flujo de segmentación y asignación de campañas personalizadas.

## 🎯 Reto 1 - Completado al 100%

✅ Agente FSM con 6 estados (INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA → FIN)
✅ Backend con API REST completa  
✅ Frontend React/Next.js con UI moderna  
✅ Lectura desde CSV  
✅ Señales sociales mockeadas  
✅ Logs en tiempo real (SSE)  
✅ Exportación JSON/CSV/HTML  
✅ Selección múltiple de clientes  
✅ Sin scraping real  
✅ Sin prompts libres del usuario  

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                      │
│  • Selector de clientes (individual/múltiple)           │
│  • Cargador de CSV (3 opciones)                         │
│  • Botón "Ejecutar Agente"                              │
│  • Stepper visual de estados FSM                        │
│  • Panel de logs en tiempo real                         │
│  • Tabla comparativa de resultados                      │
│  • Vista detallada de campaña                           │
│  • Exportación JSON/CSV/HTML                            │
└──────────────────┬──────────────────────────────────────┘
                   │ REST API + SSE
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                       │
│  POST /api/agente/ejecutar    → Inicia proceso          │
│  GET  /api/agente/logs/:id    → Logs en tiempo real     │
│  GET  /api/resultados/:id     → Obtiene resultados      │
│  GET  /api/export/:id/:format → Descarga archivos       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              ORQUESTADOR FSM (LangGraph)                 │
├─────────────────────────────────────────────────────────┤
│ [INGESTA]  → Carga cliente desde CSV                    │
│ [PERFIL]   → PerfiladorSocialMock genera señales        │
│ [SEGMENTO] → Segmentador aplica reglas                  │
│ [CAMPAÑA]  → DecisorCampaña selecciona plantilla        │
│ [SALIDA]   → Compositor genera HTML + JSON              │
│ [FIN]      → Proceso completado                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Inicio Rápido

### 1. Backend

```bash
cd Backend

# Configurar .env (¡IMPORTANTE!)
# Lee Backend/CORREGIR_ENV.md si tienes dudas
cp env.example .env
# Edita .env y configura:
# - OPENAI_API_KEY=tu_key (opcional)
# - USE_GENAI=false (o true si quieres GenAI)

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
python start.bat  # Windows
# o
./start.sh        # Linux/Mac
```

### 2. Frontend

```bash
cd frontCRM/gen-ai-hackathon-prototype

# Configurar backend URL
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

# Instalar dependencias (si no lo hiciste)
npm install

# Iniciar frontend
npm run dev
```

### 3. Acceder

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 📊 Formato del CSV

El archivo `Backend/data/clientes.csv` debe tener estas columnas:

```csv
id_cliente,nombre,sector,gasto_promedio,riesgo,red_social
C001,María López,retail,450.5,medio,instagram
C002,Juan Pérez,tech,750.0,bajo,linkedin
```

**Columnas:**
- `id_cliente`: String (ej: "C001")
- `nombre`: String (ej: "María López")
- `sector`: String (ej: "retail", "tech", "salud")
- `gasto_promedio`: Float (ej: 450.5)
- `riesgo`: String ("bajo", "medio", "alto")
- `red_social`: String ("instagram", "facebook", "linkedin", "twitter")

---

## 🎨 Funcionalidades del Sistema

### Frontend (Next.js + Tailwind + shadcn/ui)

1. **Cargador de CSV** (3 opciones)
   - Subir archivo CSV
   - Cargar desde URL
   - Pegar contenido CSV

2. **Selector de Clientes**
   - Modo individual (dropdown)
   - Modo múltiple (checkboxes)
   - "Seleccionar todos"

3. **Stepper Visual**
   - Muestra progreso: INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA → FIN
   - Indicadores de completado/activo/pendiente

4. **Panel de Logs**
   - Logs en tiempo real (SSE)
   - Colores por estado
   - Timestamp y mensajes descriptivos

5. **Tabla Comparativa**
   - Para múltiples clientes
   - Muestra: Cliente, Segmento, Score, Campaña, Canal
   - Acciones: Ver detalle y Exportar

6. **Vista Detallada**
   - Información completa del cliente
   - Segmento con score y rationale
   - Campaña personalizada
   - Preview HTML en iframe

7. **Exportación**
   - Individual: JSON, CSV, HTML
   - Batch: CSV con todos los resultados

### Backend (FastAPI + LangGraph)

1. **Orquestador FSM**
   - Control de estados con LangGraph
   - Manejo de errores
   - Ejecución asíncrona

2. **PerfiladorSocialMock**
   - Genera señales basadas en `red_social`
   - Intereses por sector
   - Tono por red social
   - Engagement y actividad

3. **Segmentador**
   - 4 segmentos con reglas determinísticas
   - Considera: gasto, riesgo, actividad, engagement
   - Score calculado (0-100)

4. **DecisorCampaña**
   - 4 plantillas de campaña
   - Mapeo segmento → campaña
   - Canal sugerido

5. **Compositor**
   - Genera HTML personalizado
   - Genera JSON estructurado
   - Métricas simuladas (CTR, apertura)

6. **SessionManager**
   - Gestiona sesiones de ejecución
   - Almacena resultados y logs
   - Thread-safe

7. **Adapters**
   - Transforma modelos backend ↔ frontend
   - Mantiene compatibilidad

---

## 📁 Estructura del Proyecto

```
crm_workshop/
│
├── Backend/
│   ├── app/
│   │   ├── main.py              # API FastAPI integrada v2.0
│   │   ├── models.py            # Modelos actualizados
│   │   ├── session_manager.py  # Gestión de sesiones ⭐
│   │   ├── adapters.py          # Transformación de datos ⭐
│   │   ├── orquestador.py       # FSM con LangGraph
│   │   ├── perfilador_social.py # Mock de señales
│   │   ├── segmentador.py       # Reglas de segmentación
│   │   ├── decisor_campaña.py   # Selección de campañas
│   │   ├── compositor.py        # Generación de salidas
│   │   └── utils.py             # Utilidades (CSV, export)
│   ├── data/
│   │   └── clientes.csv         # 10 clientes de ejemplo
│   ├── requirements.txt
│   ├── .env.example
│   ├── start.bat               # Script Windows ⭐
│   ├── start.sh                # Script Linux/Mac ⭐
│   ├── check_config.py         # Verificador ⭐
│   ├── INTEGRACION_QUICKSTART.md  ⭐
│   ├── CORREGIR_ENV.md         ⭐
│   └── README_INTEGRACION.md   ⭐
│
├── frontCRM/gen-ai-hackathon-prototype/
│   ├── app/
│   │   ├── page.tsx
│   │   └── api/
│   │       ├── clientes/route.ts
│   │       └── execute-agent/route.ts (solo para mock)
│   ├── components/
│   │   ├── agent-executor.tsx   # Componente principal ⭐
│   │   ├── csv-loader.tsx       # Cargador de CSV ⭐
│   │   ├── state-stepper.tsx    # Stepper visual ⭐
│   │   ├── results-table.tsx    # Tabla comparativa ⭐
│   │   └── ui/ (shadcn/ui components)
│   ├── lib/
│   │   ├── api.ts              # Cliente API ⭐
│   │   ├── csv-parser.ts       # Parser de CSV ⭐
│   │   ├── agent.tsx           # Agente local (mock)
│   │   ├── types.ts            # Tipos TypeScript ⭐
│   │   └── mock-data.ts        # Datos mock
│   ├── .env.local              # ← CREAR ESTE ARCHIVO
│   ├── package.json
│   └── README.md
│
├── .gitignore                  # ⭐ Actualizado
└── README.md                   # ← Este archivo
```

⭐ = Archivos nuevos o modificados para la integración

---

## 🔄 Flujo de Ejecución Integrado

### 1. Usuario en Frontend
- Selecciona cliente(s)
- Click "Ejecutar Agente"

### 2. Frontend → Backend
```typescript
POST /api/agente/ejecutar
{ clienteIds: ["C001", "C002"] }
```

### 3. Backend Responde
```json
{ sessionId: "session_abc123", message: "Procesando..." }
```

### 4. Frontend Conecta a Logs (SSE)
```typescript
EventSource(`/api/agente/logs/session_abc123`)
```

### 5. Backend Procesa y Emite Logs
```
[INGESTA] Cargando cliente...
[PERFIL] Generando señales sociales...
[SEGMENTO] Aplicando reglas...
[CAMPAÑA] Seleccionando plantilla...
[SALIDA] Generando HTML...
[FIN] Completado
```

### 6. Frontend Obtiene Resultados
```typescript
GET /api/resultados/session_abc123
```

### 7. Usuario Exporta
```typescript
GET /api/export/session_abc123/json
```

---

## ⚙️ Configuración para Producción

### Backend

```env
OPENAI_API_KEY=sk-prod-...
USE_GENAI=true
CLIENTES_CSV_PATH=/app/data/clientes.csv
PORT=8000
FRONTEND_URL=https://tu-frontend.vercel.app
```

### Frontend

```env
NEXT_PUBLIC_BACKEND_URL=https://tu-backend.railway.app
```

---

## 📚 Documentación

- **Backend:** `Backend/README_INTEGRACION.md`
- **Frontend:** `frontCRM/gen-ai-hackathon-prototype/README.md`
- **Guía rápida:** `Backend/INTEGRACION_QUICKSTART.md`
- **Corregir .env:** `Backend/CORREGIR_ENV.md`

---

## 🧪 Testing

### Probar Backend Solo
```bash
cd Backend
python test_agente.py
```

### Probar API
```bash
# Health check
curl http://localhost:8000/health

# Obtener clientes
curl http://localhost:8000/api/clientes

# Ejecutar agente
curl -X POST http://localhost:8000/api/agente/ejecutar \
  -H "Content-Type: application/json" \
  -d '{"clienteIds":["C001"]}'
```

---

## 🐛 Troubleshooting

### Backend no inicia
1. Verifica Python 3.11+: `python --version`
2. Verifica dependencias: `pip list | grep fastapi`
3. Revisa `.env`: ejecuta `python check_config.py`
4. Revisa logs del terminal

### Frontend no se conecta
1. Verifica backend: `curl http://localhost:8000/health`
2. Verifica `.env.local` del frontend
3. Reinicia el frontend: `npm run dev`
4. Revisa consola del navegador (F12)

### Logs no aparecen en tiempo real
1. Verifica que EventSource esté conectado (consola del navegador)
2. Prueba el endpoint SSE manualmente
3. Verifica que no haya proxy/firewall bloqueando SSE

### "Error: Sesión no encontrada"
1. El backend se reinició y perdió las sesiones (están en memoria)
2. El sessionId es incorrecto
3. La sesión expiró (normal después de varios minutos)

---

## 📦 Stack Tecnológico

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- EventSource (SSE)

### Backend
- Python 3.11+
- FastAPI
- LangChain / LangGraph
- Pandas
- Pydantic
- Uvicorn

---

## 🔐 Seguridad

- ✅ CORS configurado
- ✅ Validación de requests (Pydantic)
- ✅ Sin datos personales reales
- ✅ API keys en variables de entorno
- ⚠️ En producción: configurar CORS específico, HTTPS, rate limiting

---

## 🎓 Equipo

**Grupo 2 - Hackathon GenAI 2025**

---

## 📄 Licencia

Proyecto educativo para workshop.

---

## 🚀 ¿Listo para Empezar?

### Paso 1: Backend
```bash
cd Backend
python check_config.py  # Verifica configuración
python start.bat        # Windows
# o
./start.sh             # Linux/Mac
```

### Paso 2: Frontend
```bash
cd frontCRM/gen-ai-hackathon-prototype
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev
```

### Paso 3: Probar
Abre http://localhost:3000 y ejecuta el agente. ¡Disfruta!

---

**¿Dudas?** Lee los archivos `*_QUICKSTART.md` o `CORREGIR_ENV.md`.

