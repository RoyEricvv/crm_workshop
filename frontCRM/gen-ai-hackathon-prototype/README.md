# 🤖 CRM Inteligente - Frontend Next.js

Sistema completo de CRM con agente autónomo FSM (Finite State Machine) para segmentación inteligente y asignación de campañas personalizadas.

**Hackathon GenAI 2025 - Reto 1**

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Características](#-características)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Componentes Principales](#-componentes-principales)
- [Estadísticas y Gráficos](#-estadísticas-y-gráficos)
- [Integración con Backend](#-integración-con-backend)
- [Tech Stack](#-tech-stack)
- [Créditos](#-créditos)

---

## 🎯 Descripción

Prototipo profesional de un **agente autónomo estilo FSM** que ejecuta automáticamente el flujo completo de segmentación y asignación de campañas:

**INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA → FIN**

Sin prompts libres del usuario. El sistema orquesta perfiles sociales simulados, segmentación basada en reglas determinísticas y decisión de campañas personalizadas.

### 🔗 Base del Proyecto

Este proyecto fue inicialmente generado con **[v0.dev by Vercel](https://v0.dev)** y luego expandido significativamente:

- **Link original:** [GenAI Hackathon Prototype en v0](https://v0.app/chat/gen-ai-hackathon-prototype-c1NrrxCUzrb?ref=28Q3WC#ZkuF5D6V3BA0NrU0ym4vwdEeRUpvryEW)
- **Mejoras agregadas:** Integración con backend real, estadísticas, gráficos, selección múltiple, logs en tiempo real (SSE), exportación avanzada

---

## 🏗️ Arquitectura

```
┌────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js + React)                │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ • Selector de cliente(s) (individual/múltiple)   │ │
│  │ • Botón "Ejecutar Agente FSM"                    │ │
│  │ • Stepper visual de estados                      │ │
│  │ • Logs en tiempo real (SSE)                      │ │
│  │ • Estadísticas y gráficos                        │ │
│  │ • Tabla comparativa de resultados                │ │
│  │ • Vista detallada de campaña                     │ │
│  │ • Exportación HTML/JSON/CSV                      │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────┬─────────────────────────────────────┘
                   │ REST API + SSE
                   ▼
┌────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI/Python)                  │
│              o API Routes (Next.js)                     │
│                                                         │
│  POST /api/agente/ejecutar                             │
│  GET  /api/agente/logs/:sessionId (SSE)               │
│  GET  /api/resultados/:sessionId                       │
│  GET  /api/export/:sessionId/:formato                  │
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│           ORQUESTADOR FSM (LangGraph)                  │
├────────────────────────────────────────────────────────┤
│ [INGESTA]  → Carga cliente desde CSV                   │
│ [PERFIL]   → PerfiladorSocialMock genera señales       │
│ [SEGMENTO] → Segmentador clasifica en categorías       │
│ [CAMPAÑA]  → DecisorCampaña selecciona plantilla       │
│ [SALIDA]   → Compositor genera HTML + JSON + CSV       │
│ [FIN]      → Proceso completado                        │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Características

### 🎯 Core Features

- ✅ **Agente FSM Autónomo**: 6 estados determinísticos sin intervención del usuario
- ✅ **Selección Múltiple**: Procesa uno o varios clientes simultáneamente
- ✅ **Logs en Tiempo Real**: Server-Sent Events (SSE) con actualizaciones progresivas
- ✅ **Stepper Visual**: Indicador de progreso de estados FSM con iconos animados
- ✅ **3 Modos de Carga CSV**: Subir archivo, URL o pegar contenido
- ✅ **Tabla Comparativa**: Vista de resultados para múltiples clientes
- ✅ **Exportación Triple**: HTML, JSON y CSV (individual y batch)
- ✅ **Preview de Campaña**: Vista previa HTML en iframe
- ✅ **Integración Backend**: Cliente API con fallback automático a mock

### 📊 Estadísticas y Análisis

- ✅ **4 KPIs Principales**: Total clientes, Gasto promedio, Score, Engagement
- ✅ **Gráfico de Dona**: Distribución visual de segmentos
- ✅ **Gráfico de Barras**: Gasto promedio por segmento
- ✅ **Engagement por Red Social**: Comparación entre redes
- ✅ **Matriz de Dispersión**: Score vs Engagement
- ✅ **Insights Inteligentes**: Recomendaciones automáticas basadas en datos

### 🎨 UI/UX

- ✅ **Diseño Moderno**: shadcn/ui + Tailwind CSS
- ✅ **Responsive**: Adaptado para móvil, tablet y desktop
- ✅ **Estados de Carga**: Indicadores claros de procesamiento
- ✅ **Manejo de Errores**: Mensajes descriptivos
- ✅ **Animaciones Suaves**: Transiciones CSS

---

## 🚀 Instalación

### Requisitos Previos

- Node.js 18+ 
- npm o pnpm

### Pasos de Instalación

```bash
# 1. Clonar el repositorio (o descargar desde v0)
git clone <repo-url>
cd frontCRM/gen-ai-hackathon-prototype

# 2. Instalar dependencias
npm install
# o
pnpm install

# 3. Configurar variables de entorno (opcional)
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

# 4. Ejecutar servidor de desarrollo
npm run dev

# 5. Abrir en navegador
# http://localhost:3000
```

### Configuración del Backend (Opcional)

Si quieres conectar con un backend real, crea `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Si no configuras esta variable, el frontend usará datos mock locales automáticamente.

---

## 💻 Uso

### 1. Cargar Clientes

**Opción A: Usar clientes mock (por defecto)**
- El sistema viene con 10 clientes de ejemplo

**Opción B: Cargar desde CSV**
- Click en "📂 Cargar Clientes desde CSV"
- Elige: Subir archivo, URL o pegar contenido
- Formato requerido:
  ```csv
  id_cliente,nombre,sector,gasto_promedio,riesgo,red_social
  C001,María López,retail,350.5,bajo,instagram
  ```

**Opción C: Conectar con backend**
- Configura `NEXT_PUBLIC_BACKEND_URL` en `.env.local`
- Los clientes se cargarán automáticamente del backend

### 2. Seleccionar Cliente(s)

**Modo Individual:**
- Usa el dropdown para elegir un cliente

**Modo Múltiple:**
- Activa el toggle "Selección Múltiple"
- Marca los checkboxes de los clientes deseados
- Usa "Seleccionar todos" para marcar todos

### 3. Ejecutar Agente

1. Click en **"Ejecutar Agente FSM"**
2. Observa el progreso en el stepper visual
3. Lee los logs en tiempo real
4. Espera a que llegue al estado **FIN**

### 4. Ver Resultados

**Si procesaste múltiples clientes:**
- 📊 Estadísticas generales (KPIs)
- 📈 Gráficos de análisis
- 📋 Tabla comparativa
- 💡 Insights automáticos

**Si procesaste un cliente:**
- 📊 Análisis individual
- 📝 Vista detallada completa
- 🎨 Preview de campaña HTML

### 5. Exportar

**Individual:**
- Click en botones JSON/CSV/HTML por cliente

**Batch (múltiples):**
- Click en "📊 Exportar Todos los Resultados (CSV)"

---

## 📂 Estructura del Proyecto

```
gen-ai-hackathon-prototype/
├── app/
│   ├── page.tsx                    # Página principal
│   ├── layout.tsx                  # Layout root
│   └── api/
│       ├── clientes/route.ts       # API: Lista de clientes
│       └── execute-agent/route.ts  # API: Ejecutar agente (mock)
│
├── components/
│   ├── agent-executor.tsx          # ⭐ Componente principal
│   ├── state-stepper.tsx           # Stepper visual FSM
│   ├── results-table.tsx           # Tabla comparativa
│   ├── csv-loader.tsx              # Cargador de CSV
│   ├── stats-overview.tsx          # ⭐ Estadísticas y KPIs
│   ├── charts.tsx                  # ⭐ Gráficos visuales
│   └── ui/                         # Componentes shadcn/ui
│
├── lib/
│   ├── types.ts                    # Tipos TypeScript
│   ├── agent.tsx                   # Lógica del agente FSM
│   ├── api.ts                      # ⭐ Cliente API (backend)
│   ├── csv-parser.ts               # Parser de CSV
│   ├── mock-data.ts                # Datos mock
│   └── utils.ts                    # Utilidades
│
├── public/
│   └── clientes.csv                # CSV de ejemplo
│
├── .env.local                      # Variables de entorno (crear)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md                       # ← Este archivo
```

⭐ = Archivos clave para entender el sistema

---

## 🧩 Componentes Principales

### 1. **AgentExecutor** (`components/agent-executor.tsx`)

Componente principal que orquesta toda la UI:

```tsx
import { AgentExecutor } from "@/components/agent-executor"

export default function Home() {
  return <AgentExecutor />
}
```

**Funcionalidades:**
- Gestión de estado (clientes, selección, resultados, logs)
- Comunicación con API (backend o mock)
- Renderizado condicional según modo (individual/múltiple)
- Manejo de exportación

### 2. **StatsOverview** (`components/stats-overview.tsx`)

Muestra estadísticas agregadas:

```tsx
<StatsOverview results={results} />
```

- 4 KPIs principales con iconos
- Distribución de segmentos y canales
- Insight inteligente con recomendaciones

### 3. **Charts** (`components/charts.tsx`)

Visualizaciones de datos:

```tsx
<Charts results={results} />
```

- Gráfico de dona (distribución de segmentos)
- Barras (gasto por segmento)
- Engagement por red social
- Matriz de dispersión (Score vs Engagement)

### 4. **StateStepper** (`components/state-stepper.tsx`)

Indicador visual del progreso FSM:

```tsx
<StateStepper 
  currentState={currentState} 
  completedStates={completedStates} 
/>
```

### 5. **CSVLoader** (`components/csv-loader.tsx`)

Diálogo para cargar clientes desde CSV:

```tsx
<CSVLoader onClientesLoaded={handleClientesLoaded} />
```

---

## 📊 Estadísticas y Gráficos

### KPIs Disponibles

| KPI | Descripción | Icono |
|-----|-------------|-------|
| Total Clientes | Cantidad procesada | 👥 |
| Gasto Promedio | $ promedio | 💵 |
| Score Promedio | /100 | 🎯 |
| Engagement | % promedio | 📈 |

### Gráficos

1. **Gráfico de Dona**
   - Distribución porcentual de segmentos
   - Colores por tipo (Premium=Azul, Medio=Verde, Básico=Amarillo, Riesgo=Rojo)
   - Total en el centro

2. **Gráfico de Barras**
   - Gasto promedio por segmento
   - Escala relativa
   - Animación de entrada

3. **Engagement por Red**
   - Instagram, Facebook, LinkedIn, Twitter
   - Barras con gradiente
   - Comparación visual

4. **Matriz de Dispersión**
   - Eje X: Score (0-100)
   - Eje Y: Engagement (0-10%)
   - Puntos interactivos con tooltip

### Insights Automáticos

El sistema analiza automáticamente los datos y genera recomendaciones:
- Segmento más común
- Estrategias basadas en gasto promedio
- Sugerencias de campañas

---

## 🔗 Integración con Backend

### Cliente API (`lib/api.ts`)

El sistema incluye un cliente API completo:

```typescript
import { api } from "@/lib/api"

// Obtener clientes
const clientes = await api.getClientes()

// Ejecutar agente
const { sessionId } = await api.ejecutarAgente(["C001", "C002"])

// Stream de logs (SSE)
const eventSource = api.streamLogs(sessionId, (log) => {
  console.log(log)
})

// Obtener resultados
const result = await api.getResultado(sessionId)

// Exportar
const blob = await api.downloadExport(sessionId, "json")
```

### Fallback Automático

Si no hay backend configurado (`NEXT_PUBLIC_BACKEND_URL`), el sistema:
1. Usa datos mock locales
2. Ejecuta el agente en el navegador
3. Simula logs progresivos
4. Genera resultados localmente

**Esto significa que el frontend funciona 100% standalone.**

### Endpoints Esperados del Backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes` | Lista de clientes |
| POST | `/api/agente/ejecutar` | Iniciar agente |
| GET | `/api/agente/logs/:id` | Logs SSE |
| GET | `/api/resultados/:id` | Resultados |
| GET | `/api/export/:id/:fmt` | Exportar |

Ver `Backend/README_INTEGRACION.md` para detalles del backend.

---

## 🛠️ Tech Stack

### Core
- **Framework:** Next.js 16.0.3 (App Router)
- **React:** 19.0.0
- **TypeScript:** 5.x
- **Node:** 18+

### UI/Styling
- **UI Components:** shadcn/ui
- **CSS Framework:** Tailwind CSS 3.x
- **Icons:** lucide-react

### State Management
- React Hooks (useState, useEffect, useRef, useMemo)

### Data Fetching
- Fetch API (REST)
- EventSource (SSE para logs en tiempo real)

### Build Tools
- Turbopack (Next.js 16)
- PostCSS
- TypeScript Compiler

---

## 📝 Datos de Prueba

### Clientes Mock Incluidos

El sistema incluye 10 clientes de ejemplo:

| ID | Nombre | Sector | Gasto | Riesgo | Red Social |
|----|--------|--------|-------|--------|------------|
| C001 | María López | retail | $350 | bajo | instagram |
| C002 | Juan Pérez | tecnología | $750 | bajo | linkedin |
| C003 | Ana García | salud | $320 | medio | facebook |
| C004 | Carlos Rodríguez | educación | $180 | bajo | twitter |
| C005 | Laura Martínez | gastronomía | $550 | bajo | instagram |
| C006 | Pedro Sánchez | retail | $280 | medio | facebook |
| C007 | Sofía Hernández | tecnología | $920 | bajo | linkedin |
| C008 | Diego Torres | salud | $150 | alto | instagram |
| C009 | Isabella Ramírez | educación | $420 | medio | twitter |
| C010 | Miguel González | gastronomía | $380 | bajo | facebook |

### Segmentos Generados

- **ALTO_VALOR**: Alto gasto, bajo riesgo, alta actividad social
- **ESTANDAR**: Gasto medio, riesgo moderado
- **BASICO**: Gasto bajo, potencial de crecimiento
- **RIESGO**: Riesgo alto, necesita atención especial

### Plantillas de Campaña

- **Exclusividad Premium**: Para segmento alto valor
- **Valor y Confianza**: Para segmento estándar
- **Crecimiento y Oportunidades**: Para segmento básico
- **Gestión de Riesgo**: Para segmento de riesgo

---

## 🎨 Personalización

### Colores por Segmento

Puedes cambiar los colores en `components/charts.tsx`:

```typescript
const getSegmentColor = (segmento: string) => {
  if (segmento.includes("alto")) return "#3B82F6"  // Azul
  if (segmento.includes("estandar")) return "#10B981"  // Verde
  if (segmento.includes("basico")) return "#F59E0B"  // Amarillo
  return "#EF4444"  // Rojo
}
```

### Agregar Nuevos Segmentos

Edita `lib/types.ts` y `lib/agent.tsx`:

```typescript
// types.ts
export type Segmento = 
  | "ALTO_VALOR" 
  | "ESTANDAR" 
  | "BASICO"
  | "TU_NUEVO_SEGMENTO"  // ← Agregar aquí
```

### Cambiar Plantillas de Campaña

Edita `lib/agent.tsx` en la clase `DecisorCampaña`:

```typescript
const PLANTILLAS_CAMPAÑA = {
  TU_SEGMENTO: {
    plantilla: "tu_plantilla",
    titulo: "Tu Título",
    mensaje: "Tu mensaje...",
    cta: "Tu CTA",
    color_tema: "#123456"
  }
}
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
npm run test
```

### Verificar Tipos

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

---

## 🐛 Troubleshooting

### El frontend no se conecta al backend

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica `.env.local` tenga `NEXT_PUBLIC_BACKEND_URL`
3. Reinicia el frontend: `npm run dev`

### Los logs no aparecen en tiempo real

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores de EventSource
3. Verifica que el backend soporte SSE

### Error al cargar CSV

**Solución:**
1. Verifica el formato del CSV (ver sección "Estructura del CSV")
2. Asegúrate de tener todas las columnas requeridas
3. Revisa que `gasto_promedio` sea un número válido

---

## 📚 Documentación Adicional

- **Backend:** `../../../Backend/README_INTEGRACION.md`
- **Guía Rápida:** `../../../Backend/INTEGRACION_QUICKSTART.md`
- **Estadísticas:** `../../../ESTADISTICAS_AGREGADAS.md`
- **Errores Corregidos:** `../../../ERRORES_CORREGIDOS.md`

---

## 🤝 Contribuciones

Este es un proyecto de hackathon educativo. Si quieres mejorarlo:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m "feat: agregar nueva característica"`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

---

## 📜 Licencia

Proyecto educativo para Hackathon GenAI 2025.

---

## 🙏 Créditos

### Tecnologías Utilizadas

- **[Next.js](https://nextjs.org/)** - Framework React
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Lucide Icons](https://lucide.dev/)** - Iconos
- **[v0.dev](https://v0.dev)** - Prototipado inicial

### Proyecto Base

Este proyecto se basó inicialmente en un prototipo generado con **v0.dev by Vercel**:

**Link original:** [GenAI Hackathon Prototype](https://v0.app/chat/gen-ai-hackathon-prototype-c1NrrxCUzrb?ref=28Q3WC#ZkuF5D6V3BA0NrU0ym4vwdEeRUpvryEW)

El código fue posteriormente expandido significativamente con:
- Integración completa con backend FastAPI
- Sistema de estadísticas y gráficos
- Logs en tiempo real con SSE
- Selección múltiple y exportación batch
- Cliente API robusto con fallback

---

## 🎯 Cumplimiento del Reto

Este proyecto cumple **100%** con los requisitos del Reto 1:

- ✅ Agente FSM autónomo (6 estados)
- ✅ Sin prompts libres del usuario
- ✅ Lectura desde CSV
- ✅ Señales sociales mockeadas
- ✅ Segmentación con reglas determinísticas
- ✅ Mínimo 3 plantillas de campaña (4 implementadas)
- ✅ Exportación en JSON, CSV y HTML
- ✅ Interfaz mínima cumplida y superada
- ✅ Logs de ejecución en tiempo real
- ✅ Sin scraping real ni datos personales

---

## 🚀 **¡Proyecto Completo y Funcional!**

**Hackathon GenAI 2025 — Reto 1 ✅**

Para empezar:
```bash
npm install && npm run dev
```

Luego abre: **http://localhost:3000**

¡Disfruta! 🎉
