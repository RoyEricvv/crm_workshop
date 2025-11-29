# GenAI Hackathon 2025 - Reto 1: Agente FSM Autónomo

## Descripción

Prototipo minimalista de un **agente autónomo estilo FSM (Finite State Machine)** que ejecuta automáticamente el flujo:

**INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA → FIN**

Sin prompts libres del usuario. El sistema orquesta perfiles sociales simulados, segmentación basada en reglas y decisión de campañas personalizadas.

## Arquitectura

\`\`\`
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│  • Selector cliente | Botón ejecutar | Logs en vivo │
│  • Vistas de resultados | Exportar HTML/JSON/CSV    │
└──────────────────────┬──────────────────────────────┘
                       │ POST /api/execute-agent
                       ▼
┌─────────────────────────────────────────────────────┐
│                 API ROUTE (Next.js)                  │
│              Endpoint /api/execute-agent             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              ORQUESTADOR (FSM ENGINE)                │
├─────────────────────────────────────────────────────┤
│ [INGESTA]  → Carga cliente desde mock CSV           │
│ [PERFIL]   → PerfiladorSocialMock genera señales    │
│ [SEGMENTO] → Segmentador clasifica en categorías    │
│ [CAMPAÑA]  → DecorCampaña selecciona plantilla      │
│ [SALIDA]   → Compositor genera HTML + JSON + CSV    │
└─────────────────────────────────────────────────────┘
\`\`\`

## Módulos

### 1. **lib/types.ts**
Define tipos TypeScript para Cliente, PerfilSocial, Segmento, Campaña, LogEntry, AgentResult.

### 2. **lib/mock-data.ts**
Datos CSV ficticios con 5 clientes de prueba + utilidades de exportación.

### 3. **lib/agent.ts**
- **PerfiladorSocialMock**: Genera señales sociales simuladas (engagement, followers, sentiment)
- **Segmentador**: Reglas de segmentación basadas en sector, riesgo, gasto_promedio
- **DecorCampaña**: Decisor que selecciona entre 3 plantillas
- **Compositor**: Genera HTML final e integra datos
- **Orquestador**: Motor FSM que coordina todo

### 4. **app/api/execute-agent/route.ts**
Endpoint POST que recibe clienteId y retorna AgentResult completo.

### 5. **components/agent-executor.tsx**
UI principal mejorada:
- **Selector de cliente(s)**: Dropdown individual o checkboxes múltiples
- **Toggle de modo**: Cambiar entre selección individual/múltiple
- **Botón "Ejecutar Agente"**: Con estados de carga
- **Stepper visual**: Progreso de estados FSM en tiempo real
- **Panel de logs**: Logs que aparecen progresivamente con colores por estado
- **Tabla comparativa**: Vista de resultados para múltiples clientes
- **Vista detallada**: Información completa del cliente, segmento y campaña
- **Botones de exportación**: HTML, JSON, CSV (individual y batch)
- **Preview HTML**: Vista previa de la campaña generada

### 6. **lib/api.ts**
Cliente API para conectar con backend:
- `getClientes()`: Obtiene lista de clientes desde CSV/API
- `ejecutarAgente()`: Inicia ejecución del agente
- `streamLogs()`: Conecta a logs en tiempo real (SSE)
- `getResultado()`: Obtiene resultados finales
- Fallback automático a mock local si no hay backend

### 7. **components/state-stepper.tsx**
Componente visual que muestra el progreso de los estados FSM con indicadores de completado/activo/pendiente.

### 8. **components/results-table.tsx**
Tabla comparativa para visualizar resultados de múltiples clientes procesados.

## Características

✅ **FSM Determinista**: Sin IA externa, flujo predefinido con 6 estados (incluye FIN)
✅ **3 Plantillas de Campaña**: PREMIUM_GROWTH, VALUE_FOCUSED, RISK_MITIGATION
✅ **Reglas de Segmentación Avanzadas**: Sector + Riesgo + Gasto + Señales Sociales
✅ **Segmentos**: ALTO_VALOR, ESTANDAR, BASICO (según requisitos del reto)
✅ **Perfilador Social Mock**: Genera señales realistas basadas en red social (Instagram, Facebook, LinkedIn, Twitter)
✅ **Logs en Tiempo Real**: Panel que muestra cada estado progresivamente
✅ **Selección Múltiple**: Procesa uno o varios clientes simultáneamente
✅ **Tabla Comparativa**: Vista de resultados para múltiples clientes
✅ **Stepper Visual**: Indicador de progreso de estados FSM
✅ **Exportación Triple**: HTML (visual), JSON (datos), CSV (analítica)
✅ **Exportación Batch**: Descarga CSV con todos los resultados
✅ **Preparado para Backend**: Cliente API con fallback a mock local
✅ **100% Funcional**: Sin dependencias externas adicionales

## Datos de Prueba

8 clientes mock (formato CSV compatible):
- **C001**: María López (retail, bajo riesgo, $350.5, instagram)
- **C002**: TechCorp Solutions (tecnología, bajo riesgo, $50k, linkedin)
- **C003**: RetailHub SPA (retail, medio riesgo, $25k, instagram)
- **C004**: FinanceWave Ltd (finanzas, bajo riesgo, $75k, linkedin)
- **C005**: MediaStream Inc (medios, alto riesgo, $15k, twitter)
- **C006**: HealthPlus Clinics (salud, bajo riesgo, $30k, facebook)
- **C007**: EduTech Academy (educación, medio riesgo, $12k, facebook)
- **C008**: GreenEnergy Corp (energía, bajo riesgo, $45k, linkedin)

## Instalación & Ejecución

### 1. Clonar o descargar el proyecto
\`\`\`bash
git clone <repo> && cd <project>
# o descargar ZIP desde v0
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Ejecutar servidor local
\`\`\`bash
npm run dev
\`\`\`

Abre **http://localhost:3000** en el navegador.

### 4. Configurar backend (opcional)
Si tienes un backend separado, crea un archivo `.env.local`:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```
Si no configuras esta variable, el frontend usará datos mock locales.

### 5. Usar el agente
1. **Seleccionar cliente(s)**:
   - Modo Individual: Usa el dropdown para elegir un cliente
   - Modo Múltiple: Activa el toggle y selecciona varios con checkboxes
2. **Ejecutar**: Haz clic en "Ejecutar Agente FSM"
3. **Observar progreso**: 
   - Stepper visual muestra el estado actual
   - Panel de logs muestra mensajes en tiempo real
   - Estados: INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA → FIN
4. **Revisar resultados**:
   - Si procesaste múltiples: Ver tabla comparativa
   - Si procesaste uno: Ver vista detallada
5. **Exportar**: Descarga individual (HTML/JSON/CSV) o batch (CSV de todos)

## Exportaciones

### HTML
Campaña visual renderizada, lista para enviar por email o publicar.

### JSON
Objeto completo con cliente, perfil, segmento, campaña, logs y HTML.

### CSV
Fila única con id_cliente, nombre, sector, gasto_promedio, riesgo, red_social, segmento_tipo, segmento_score, campaña_plantilla.

## Funcionalidades Implementadas ✅

- [x] Selección múltiple de clientes (checkboxes)
- [x] Logs en tiempo real con stepper visual
- [x] Tabla comparativa de resultados
- [x] Estado FIN explícito en el flujo
- [x] Perfilador social basado en red social del cliente
- [x] Segmentación mejorada con señales sociales
- [x] Exportación batch (CSV de múltiples clientes)
- [x] Cliente API preparado para backend real
- [x] Manejo de errores mejorado
- [x] Estados de carga descriptivos

## Próximas Mejoras (Opcional)

- [ ] Integrar GenAI para refinar mensajes (con prompts embebidos)
- [ ] Agregar más reglas de segmentación
- [ ] Base de datos persistente (Supabase/Neon)
- [ ] Análisis de performance
- [ ] A/B testing de plantillas
- [ ] WebSocket nativo para logs en tiempo real (actualmente usa polling/SSE)

## Tech Stack

- **Frontend**: React + Next.js 16 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Next.js API Routes
- **State**: React hooks (useState)
- **Exportación**: Blob API + Links

## Estructura del CSV

El sistema espera un CSV con estas columnas exactas:
```csv
id_cliente,nombre,sector,gasto_promedio,riesgo,red_social
C001,María López,retail,350.5,bajo,instagram
C002,TechCorp Solutions,tecnología,50000,bajo,linkedin
```

- `id_cliente`: String (ej: "C001")
- `nombre`: String (ej: "María López")
- `sector`: String (ej: "retail", "tecnología", "finanzas")
- `gasto_promedio`: Float (ej: 350.5, 50000)
- `riesgo`: String ("bajo", "medio", "alto")
- `red_social`: String ("instagram", "facebook", "linkedin", "twitter")

## Notas

- ✅ Sin scraping real
- ✅ Sin datos personales reales
- ✅ Sin llamadas externas innecesarias
- ✅ Código comentado y estructurado
- ✅ Preparado para conectar con backend real
- ✅ Fallback automático a mock si no hay backend
- ✅ Cumple 100% con los requisitos del Reto 1

---

**Hackathon GenAI 2025 — Reto 1 Completado** 🚀
