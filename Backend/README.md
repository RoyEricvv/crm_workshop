# 🎯 Agente de Campañas - Sistema de Segmentación Inteligente

Sistema completo de segmentación y asignación de campañas de marketing usando un agente con loop de decisiones implementado con LangGraph.

## 📋 Características

- **Agente con FSM (Finite State Machine)**: Flujo controlado con estados: INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA
- **Perfilador Social Mock**: Genera señales sociales simuladas basadas en el cliente
- **Segmentación Inteligente**: 4 segmentos diferentes con reglas determinísticas
- **Decisión de Campaña**: Asignación automática de campañas según segmento
- **Exportación**: JSON, CSV y HTML
- **UI Moderna**: Interfaz web intuitiva y responsive
- **Deployment Flexible**: Compatible con Docker y AWS Lambda

## 🏗️ Arquitectura

```
INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA → FIN
   ↓         ↓         ↓          ↓         ↓
  Error    Error     Error      Error    Error
   ↓         ↓         ↓          ↓         ↓
   └─────────┴─────────┴──────────┴─────────┘
                    ERROR → LOG → FIN
```

### Módulos

1. **Orquestador (FSM)**: Controla el flujo de estados usando LangGraph
2. **PerfiladorSocialMock**: Genera señales sociales simuladas
3. **Segmentador**: Aplica reglas para segmentar clientes
4. **DecisorCampaña**: Selecciona la campaña apropiada
5. **Compositor**: Genera mensajes finales en HTML y JSON

## 🚀 Instalación y Uso

### Requisitos

- Python 3.11+
- OpenAI API Key (opcional, para usar GenAI)

### Instalación Local

```bash
# Clonar o descargar el proyecto
cd workshop

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (opcional)
cp .env.example .env
# Editar .env y agregar tu OPENAI_API_KEY si quieres usar GenAI
```

### Ejecutar con Docker

```bash
# Construir imagen
docker build -t agente-campanas .

# Ejecutar contenedor
docker run -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e CLIENTES_CSV_PATH=/app/data/clientes.csv \
  agente-campanas

# Acceder a http://localhost:8000
```

### Ejecutar Localmente

```bash
# Ejecutar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Acceder a http://localhost:8000
```

### Deployment en AWS Lambda

1. **Instalar dependencias en un directorio**:
```bash
mkdir package
pip install -r requirements.txt -t package/
cp -r app package/
cp app/lambda_handler.py package/
```

2. **Crear ZIP para Lambda**:
```bash
cd package
zip -r ../lambda-deployment.zip .
cd ..
```

3. **Configurar Lambda**:
   - Runtime: Python 3.11
   - Handler: `lambda_handler.handler`
   - Variables de entorno: `CLIENTES_CSV_PATH`, `OPENAI_API_KEY` (opcional)

4. **Usar API Gateway** para exponer el endpoint

## 📊 Estructura de Datos

### CSV de Clientes

El archivo `data/clientes.csv` debe tener las siguientes columnas:

| Columna | Tipo | Ejemplo |
|---------|------|---------|
| id_cliente | string | C001 |
| nombre | string | María López |
| sector | string | retail |
| gasto_promedio | float | 350.5 |
| riesgo | string | medio |
| red_social | string | instagram |

### Segmentos

1. **premium_alto_engagement**: Clientes con alto gasto, bajo riesgo, alta actividad
2. **medio_conservador**: Gasto medio, riesgo medio/bajo, actividad media/baja
3. **basico_crecimiento**: Clientes con potencial de crecimiento
4. **riesgo_alto**: Clientes con riesgo alto

### Campañas

Cada segmento tiene una campaña asociada con:
- Plantilla personalizada
- CTA (Call to Action) específico
- Canal de comunicación (email/sms)
- Mensaje base personalizable

## 🔧 Configuración

### Variables de Entorno

- `OPENAI_API_KEY`: API key de OpenAI (opcional, para usar GenAI)
- `USE_GENAI`: `true`/`false` - Activa uso de GenAI (default: false)
- `CLIENTES_CSV_PATH`: Ruta al archivo CSV de clientes (default: `data/clientes.csv`)

## 📡 API Endpoints

### GET `/api/clientes`
Obtiene la lista de clientes disponibles.

**Respuesta**:
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
  ]
}
```

### POST `/api/ejecutar`
Ejecuta el agente para uno o todos los clientes.

**Request**:
```json
{
  "id_cliente": "C001",  // Opcional
  "procesar_todos": false  // Si true, procesa todos
}
```

**Respuesta**:
```json
{
  "resultado": {
    "id_cliente": "C001",
    "nombre": "María López",
    "segmento": "medio_conservador",
    "campaña": {
      "id": "CAMP-002",
      "nombre": "Valor y Confianza",
      "plantilla": "valor_confianza",
      "cta": "Descubre nuestras opciones",
      "canal": "email"
    }
  },
  "logs": [...],
  "estado_final": "FIN"
}
```

## 🎨 Uso de la Interfaz Web

1. **Seleccionar Cliente**: Elige un cliente del dropdown o marca "Procesar todos"
2. **Ejecutar Agente**: Haz clic en "🚀 Ejecutar Agente"
3. **Ver Logs**: Observa el progreso en tiempo real
4. **Resultados**: Revisa la campaña asignada y métricas
5. **Exportar**: Descarga resultados en JSON, CSV o HTML

## 🧪 Ejemplo de Flujo

1. Cliente: María López (retail, gasto: 450.5, riesgo: medio)
2. **PERFIL**: Genera señales sociales simuladas (intereses: moda, tendencias; actividad: media)
3. **SEGMENTO**: Asigna "medio_conservador" (gasto medio, riesgo medio, actividad media)
4. **CAMPAÑA**: Selecciona "Valor y Confianza" (CAMP-002)
5. **SALIDA**: Genera HTML y JSON con mensaje personalizado

## 📦 Estructura del Proyecto

```
workshop/
├── app/
│   ├── __init__.py
│   ├── main.py              # API FastAPI
│   ├── lambda_handler.py    # Handler para Lambda
│   ├── models.py            # Modelos Pydantic
│   ├── orquestador.py       # FSM con LangGraph
│   ├── perfilador_social.py # Generador de señales
│   ├── segmentador.py       # Lógica de segmentación
│   ├── decisor_campaña.py   # Selección de campaña
│   ├── compositor.py        # Generador de mensajes
│   └── utils.py             # Utilidades
├── data/
│   └── clientes.csv        # Datos de ejemplo
├── static/
│   └── index.html          # Frontend
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

## 🔒 Restricciones y Consideraciones

- ✅ Sin scraping real - todas las señales son simuladas
- ✅ Sin prompts libres del usuario - prompts embebidos en código
- ✅ Datos simulados - no se usan datos personales reales
- ✅ Reglas determinísticas - lógica predecible y testeable

## 🚀 Próximos Pasos (Opcional)

- [ ] Persistencia de resultados en base de datos
- [ ] Memoria corta por cliente (cache de decisiones)
- [ ] Selector de canal más sofisticado
- [ ] Dashboard de métricas agregadas
- [ ] Integración con APIs reales de redes sociales (con permisos)

## 📝 Licencia

Este proyecto es un ejemplo educativo para workshop.

## 🤝 Contribuciones

Este es un proyecto de ejemplo. Siéntete libre de adaptarlo a tus necesidades.
