# PLAN DE PROYECTO - RETO 1: CRM INTELIGENTE
## Hackathon NTTDATA IActiva 2025

---

## 📋 RESUMEN EJECUTIVO

**Proyecto:** Sistema CRM Inteligente con Agente Autónomo para Optimización de Campañas de Ventas  
**Duración:** 2 horas (Hackathon)  
**Objetivo Principal:** Construir una aplicación web donde un agente autónomo analice clientes, segmente automáticamente según sector/historial/consumo, y compile campañas de marketing personalizadas sin intervención manual.

---

## 🎯 OBJETIVOS DEL PROYECTO

### Objetivos Principales
1. **Crear un agente autónomo** que opere con un loop de decisiones sin prompts manuales del usuario
2. **Implementar una FSM (Finite State Machine)** con estados: INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA
3. **Visualizar campañas personalizadas** para clientes de cualquier sector
4. **Generar salidas exportables** en formatos JSON, CSV y HTML

### Objetivos Secundarios
1. Simular señales sociales de Facebook/Instagram de forma ética
2. Proveer logs detallados por cada estado del agente
3. Aplicar segmentación inteligente basada en múltiples criterios
4. Generar mínimo 3 plantillas de campaña distintas

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Diagrama de Máquina de Estados (FSM)

```
┌─────────┐
│ INICIO  │
└────┬────┘
     │
     ▼
┌─────────────┐     Error     ┌────────┐
│   INGESTA   ├──────────────►│ ERROR  │
└──────┬──────┘               │  LOG   │
       │                      └───┬────┘
       │                          │
       ▼                          ▼
┌─────────────┐                ┌─────┐
│   PERFIL    ├───────────────►│ FIN │
└──────┬──────┘                └─────┘
       │
       │
       ▼
┌─────────────┐
│  SEGMENTO   │
└──────┬──────┘
       │
       │
       ▼
┌─────────────┐
│  CAMPAÑA    │
└──────┬──────┘
       │
       │
       ▼
┌─────────────┐
│   SALIDA    │
└──────┬──────┘
       │
       ▼
    ┌─────┐
    │ FIN │
    └─────┘
```

### Componentes del Sistema

#### 1. **Orquestador (FSM Controller)**
- **Función:** Controlar el flujo entre estados
- **Input:** `id_cliente` o lista de clientes
- **Output:** Artefactos finales (JSON/HTML/CSV)
- **Tecnología sugerida:** LangGraph, LangChain, o FSM personalizada

#### 2. **Herramienta: PerfiladorSocialMock**
- **Función:** Simular señales de redes sociales
- **Input:** `id_cliente`
- **Output:** JSON con intereses, tono, actividad, red social
- **Datos simulados:** No scraping real

#### 3. **Segmentador**
- **Función:** Aplicar reglas de negocio para clasificación
- **Input:** Features del cliente (sector, riesgo, gasto_promedio, señales sociales)
- **Output:** Segmento asignado (ej: "VIP Retail", "Básico Tech", "Premium Salud")
- **Método:** Reglas determinísticas

#### 4. **Decisor de Campaña**
- **Función:** Seleccionar plantilla de campaña según segmento
- **Input:** Segmento del cliente
- **Output:** Campaña seleccionada con CTA (Call-to-Action)
- **Método:** Mapeo segmento → plantilla (puede usar GenAI internamente)

#### 5. **Compositor**
- **Función:** Generar mensaje final y artefactos exportables
- **Input:** Campaña + datos del cliente
- **Output:** HTML renderizado + JSON estructurado + CSV opcional

---

## 📊 MODELO DE DATOS

### CSV de Clientes (Entrada)

```csv
id_cliente,nombre,sector,gasto_promedio,riesgo,red_social
C001,María López,retail,350.5,medio,instagram
C002,Juan Pérez,tech,1200.0,bajo,linkedin
C003,Ana Torres,salud,450.0,alto,facebook
C004,Carlos Ruiz,retail,180.0,medio,instagram
C005,Sofía Méndez,tech,800.0,bajo,twitter
C006,Pedro García,educacion,250.0,medio,facebook
C007,Laura Díaz,salud,600.0,bajo,instagram
C008,Diego Vega,retail,420.0,medio,facebook
C009,Carmen Silva,tech,950.0,bajo,linkedin
C010,Roberto Cruz,educacion,300.0,alto,instagram
```

**Columnas:**
- `id_cliente` (string): Identificador único
- `nombre` (string): Nombre completo del cliente
- `sector` (string): Industria (retail, tech, salud, educacion, etc.)
- `gasto_promedio` (float): Promedio de gasto en soles
- `riesgo` (string): Nivel de riesgo (bajo, medio, alto)
- `red_social` (string): Red social preferida

### JSON de Señales Sociales (Mock)

```json
{
  "id_cliente": "C001",
  "intereses": ["moda", "viajes", "tecnología"],
  "tono_preferido": "casual",
  "actividad_reciente": "alta",
  "frecuencia_publicacion": "diaria",
  "engagement_promedio": 0.08,
  "horario_activo": "18:00-22:00",
  "dispositivo_principal": "móvil",
  "sentimiento_marca": "positivo"
}
```

### Esquema de Segmentos

```json
{
  "segmentos": {
    "VIP_RETAIL": {
      "criterios": "gasto > 300 AND sector == retail AND riesgo == bajo|medio",
      "prioridad": "alta"
    },
    "PREMIUM_TECH": {
      "criterios": "gasto > 800 AND sector == tech AND riesgo == bajo",
      "prioridad": "muy_alta"
    },
    "BASICO_SALUD": {
      "criterios": "gasto < 500 AND sector == salud",
      "prioridad": "media"
    },
    "BASICO_EDUCACION": {
      "criterios": "sector == educacion",
      "prioridad": "media"
    },
    "ALTO_RIESGO": {
      "criterios": "riesgo == alto",
      "prioridad": "baja"
    }
  }
}
```

### Esquema de Campañas

```json
{
  "campanas": {
    "DESCUENTO_EXCLUSIVO_VIP": {
      "segmento_objetivo": "VIP_RETAIL",
      "tipo": "promocional",
      "descuento": "20%",
      "duracion": "48 horas",
      "canal": ["email", "instagram_dm"]
    },
    "LANZAMIENTO_PREMIUM": {
      "segmento_objetivo": "PREMIUM_TECH",
      "tipo": "producto_nuevo",
      "beneficio": "Acceso anticipado + soporte premium",
      "canal": ["email", "linkedin"]
    },
    "EDUCACION_SALUD": {
      "segmento_objetivo": "BASICO_SALUD",
      "tipo": "contenido_educativo",
      "oferta": "Webinar gratuito + e-book",
      "canal": ["email", "facebook"]
    }
  }
}
```

### Output JSON Final

```json
{
  "timestamp": "2025-11-29T14:30:00Z",
  "cliente": {
    "id_cliente": "C001",
    "nombre": "María López",
    "sector": "retail",
    "gasto_promedio": 350.5,
    "riesgo": "medio"
  },
  "segmento_asignado": "VIP_RETAIL",
  "campana_seleccionada": {
    "nombre": "DESCUENTO_EXCLUSIVO_VIP",
    "tipo": "promocional",
    "mensaje_personalizado": "¡Hola María! Como cliente VIP, tienes un 20% de descuento exclusivo en toda nuestra nueva colección. Solo por 48 horas.",
    "cta": "COMPRAR AHORA",
    "canal_recomendado": "instagram_dm",
    "probabilidad_conversion": 0.78
  },
  "estados_ejecutados": {
    "INGESTA": "SUCCESS - 0.2s",
    "PERFIL": "SUCCESS - 0.5s",
    "SEGMENTO": "SUCCESS - 0.1s",
    "CAMPAÑA": "SUCCESS - 0.8s",
    "SALIDA": "SUCCESS - 0.3s"
  },
  "metricas_estimadas": {
    "ctr_esperado": 0.12,
    "tasa_apertura": 0.45,
    "conversion_estimada": 0.08
  }
}
```

---

## 👥 HISTORIAS DE USUARIO

### Sprint 1: Core del Agente

#### HU-01: Carga de Datos de Clientes
**Como** usuario del sistema  
**Quiero** cargar un archivo CSV con datos de clientes  
**Para que** el agente pueda procesarlos automáticamente

**Criterios de aceptación:**
- [x] El sistema acepta archivos CSV con el formato especificado
- [x] Valida que todas las columnas requeridas estén presentes
- [x] Muestra error descriptivo si el formato es incorrecto
- [x] Carga exitosa muestra número de clientes importados

**Prioridad:** ALTA  
**Estimación:** 15 minutos

---

#### HU-02: Selección de Cliente
**Como** usuario del sistema  
**Quiero** seleccionar uno o varios clientes de una lista  
**Para que** el agente genere campañas específicas para ellos

**Criterios de aceptación:**
- [x] Lista desplegable muestra todos los clientes cargados
- [x] Opción de checkbox para seleccionar múltiples clientes
- [x] Opción "Procesar todos" disponible
- [x] Muestra información básica del cliente seleccionado

**Prioridad:** ALTA  
**Estimación:** 10 minutos

---

#### HU-03: Ejecución Autónoma del Agente
**Como** usuario del sistema  
**Quiero** ejecutar el agente con un solo botón  
**Para que** procese automáticamente sin mi intervención

**Criterios de aceptación:**
- [x] Botón "Ejecutar Agente" inicia el proceso
- [x] El agente ejecuta todos los estados sin prompts adicionales
- [x] No se requiere intervención manual durante la ejecución
- [x] Proceso completo termina con resultado final

**Prioridad:** CRÍTICA  
**Estimación:** 30 minutos

---

#### HU-04: Perfilado de Señales Sociales (Mock)
**Como** agente autónomo  
**Quiero** obtener señales sociales simuladas del cliente  
**Para** enriquecer el perfil y mejorar la segmentación

**Criterios de aceptación:**
- [x] Genera datos simulados de intereses, tono, actividad
- [x] Retorna JSON estructurado con señales
- [x] No realiza scraping real de redes sociales
- [x] Datos son coherentes con el sector del cliente

**Prioridad:** ALTA  
**Estimación:** 20 minutos

---

#### HU-05: Segmentación Automática
**Como** agente autónomo  
**Quiero** clasificar clientes en segmentos  
**Para** personalizar las campañas según su perfil

**Criterios de aceptación:**
- [x] Implementa al menos 2 segmentos distintos (mínimo requerido)
- [x] Usa reglas determinísticas basadas en sector, gasto, riesgo
- [x] Asigna correctamente el segmento según criterios
- [x] Maneja casos donde no hay segmento claro (default)

**Prioridad:** CRÍTICA  
**Estimación:** 25 minutos

---

#### HU-06: Selección de Campaña
**Como** agente autónomo  
**Quiero** elegir la campaña más adecuada para cada segmento  
**Para** maximizar la probabilidad de conversión

**Criterios de aceptación:**
- [x] Implementa al menos 3 plantillas de campaña (mínimo requerido)
- [x] Mapea correctamente segmento → campaña
- [x] Personaliza el mensaje con datos del cliente
- [x] Incluye CTA (Call-to-Action) relevante

**Prioridad:** CRÍTICA  
**Estimación:** 30 minutos

---

#### HU-07: Generación de Salida
**Como** agente autónomo  
**Quiero** generar artefactos finales en múltiples formatos  
**Para** que puedan ser utilizados por diferentes sistemas

**Criterios de aceptación:**
- [x] Genera JSON estructurado exportable
- [x] Genera vista HTML legible
- [x] Opción de exportar CSV (opcional)
- [x] Incluye todos los datos relevantes de la campaña

**Prioridad:** ALTA  
**Estimación:** 20 minutos

---

### Sprint 2: Interfaz y Experiencia

#### HU-08: Visualización de Logs por Estado
**Como** usuario del sistema  
**Quiero** ver logs detallados de cada estado del agente  
**Para** entender qué está haciendo en cada momento

**Criterios de aceptación:**
- [x] Panel de logs muestra estados: INGESTA, PERFIL, SEGMENTO, CAMPAÑA, SALIDA
- [x] Cada estado muestra timestamp y duración
- [x] Indica SUCCESS o ERROR para cada estado
- [x] Muestra información relevante de cada paso

**Prioridad:** MEDIA  
**Estimación:** 15 minutos

---

#### HU-09: Visualización de Resultados
**Como** usuario del sistema  
**Quiero** ver las campañas generadas en formato tabla  
**Para** revisar rápidamente los resultados

**Criterios de aceptación:**
- [x] Tabla muestra: cliente, segmento, campaña, canal
- [x] Vista responsive y legible
- [x] Permite expandir para ver detalles completos
- [x] Opciones de filtrado básico (opcional)

**Prioridad:** MEDIA  
**Estimación:** 15 minutos

---

#### HU-10: Exportación de Resultados
**Como** usuario del sistema  
**Quiero** exportar los resultados en diferentes formatos  
**Para** integrarlos con otros sistemas o compartirlos

**Criterios de aceptación:**
- [x] Botón de exportación a JSON
- [x] Botón de exportación a CSV
- [x] Botón de exportación a HTML (vista previa imprimible)
- [x] Archivos descargables con nombres descriptivos

**Prioridad:** ALTA  
**Estimación:** 10 minutos

---

### Sprint 3: Funcionalidades Extra (Opcional)

#### HU-11: Memoria Corta por Cliente
**Como** agente autónomo  
**Quiero** recordar decisiones previas sobre un cliente  
**Para** mantener consistencia en interacciones futuras

**Criterios de aceptación:**
- [x] Persiste segmento y campaña asignada previamente
- [x] Considera historial al generar nueva campaña
- [x] Almacenamiento simple (JSON/LocalStorage)
- [x] Permite resetear memoria por cliente

**Prioridad:** BAJA (Extra)  
**Estimación:** 20 minutos

---

#### HU-12: Selector de Canal por Reglas
**Como** agente autónomo  
**Quiero** seleccionar el canal óptimo de comunicación  
**Para** aumentar la tasa de respuesta

**Criterios de aceptación:**
- [x] Considera red_social preferida del cliente
- [x] Aplica reglas por segmento (ej: B2B → LinkedIn, B2C → Instagram)
- [x] Soporta al menos 3 canales: email, SMS (simulado), DM (simulado)
- [x] Justifica la elección del canal en logs

**Prioridad:** BAJA (Extra)  
**Estimación:** 15 minutos

---

#### HU-13: Métricas Simuladas
**Como** usuario del sistema  
**Quiero** ver métricas estimadas de las campañas  
**Para** evaluar su potencial efectividad

**Criterios de aceptación:**
- [x] Calcula CTR esperado por segmento
- [x] Estima tasa de apertura
- [x] Proyecta conversión estimada
- [x] Muestra métricas en dashboard o resultado final

**Prioridad:** BAJA (Extra)  
**Estimación:** 20 minutos

---

## ⚙️ REQUERIMIENTOS FUNCIONALES

### RF-001: Carga de Datos
**Descripción:** El sistema debe permitir cargar un archivo CSV con datos de clientes.  
**Entrada:** Archivo CSV con formato especificado  
**Salida:** Confirmación de carga exitosa o mensaje de error  
**Validaciones:**
- Archivo debe tener extensión .csv
- Debe contener todas las columnas requeridas
- gasto_promedio debe ser numérico positivo
- riesgo debe ser: bajo, medio, o alto
- Máximo 1000 registros

---

### RF-002: Validación de Datos
**Descripción:** El sistema debe validar la integridad de los datos cargados.  
**Validaciones:**
- id_cliente único y no vacío
- nombre no vacío
- sector dentro de valores permitidos
- gasto_promedio > 0
- riesgo ∈ {bajo, medio, alto}
- red_social ∈ {instagram, facebook, linkedin, twitter}

---

### RF-003: Estado INGESTA
**Descripción:** Primer estado del agente, carga datos del cliente seleccionado.  
**Entrada:** id_cliente  
**Proceso:**
1. Buscar cliente en CSV cargado
2. Validar que existe
3. Cargar todos sus datos
4. Pasar al estado PERFIL

**Salida:** Objeto cliente completo  
**Manejo de errores:** Si cliente no existe → estado ERROR

---

### RF-004: Estado PERFIL (Mock de Señales Sociales)
**Descripción:** Genera señales sociales simuladas del cliente.  
**Entrada:** id_cliente + red_social  
**Proceso:**
1. Generar intereses basados en sector
   - retail → ["moda", "descuentos", "tendencias"]
   - tech → ["innovación", "gadgets", "software"]
   - salud → ["bienestar", "fitness", "nutrición"]
   - educacion → ["aprendizaje", "cursos", "desarrollo"]
2. Asignar tono según gasto_promedio
   - > 800 → "profesional"
   - 300-800 → "casual-amigable"
   - < 300 → "accesible"
3. Simular actividad según riesgo
   - bajo → "alta"
   - medio → "media"
   - alto → "baja"
4. Generar métricas aleatorias pero coherentes

**Salida:** JSON con señales sociales  
**Restricción:** NO realizar scraping real, todo debe ser simulado

---

### RF-005: Estado SEGMENTO
**Descripción:** Clasifica al cliente en un segmento específico.  
**Entrada:** Datos cliente + señales sociales  
**Reglas de segmentación:**

```
SI gasto_promedio > 800 Y sector == "tech" Y riesgo == "bajo"
  ENTONCES segmento = "PREMIUM_TECH"

SI gasto_promedio > 300 Y sector == "retail" Y (riesgo == "bajo" O riesgo == "medio")
  ENTONCES segmento = "VIP_RETAIL"

SI gasto_promedio >= 500 Y sector == "salud" Y riesgo == "bajo"
  ENTONCES segmento = "PREMIUM_SALUD"

SI gasto_promedio < 500 Y sector == "salud"
  ENTONCES segmento = "BASICO_SALUD"

SI sector == "educacion"
  ENTONCES segmento = "BASICO_EDUCACION"

SI riesgo == "alto"
  ENTONCES segmento = "ALTO_RIESGO"

SI ninguna regla aplica
  ENTONCES segmento = "GENERAL"
```

**Salida:** String con nombre del segmento  
**Prioridad:** Las reglas se evalúan en orden, se asigna el primer match

---

### RF-006: Estado CAMPAÑA
**Descripción:** Selecciona y personaliza la campaña según segmento.  
**Entrada:** Segmento + datos cliente  
**Proceso:**
1. Mapear segmento a plantilla de campaña
2. Personalizar mensaje con nombre del cliente
3. Asignar CTA relevante
4. Seleccionar canal óptimo

**Plantillas de Campaña (mínimo 3):**

**CAMPAÑA 1: Descuento Exclusivo VIP**
- Segmento: VIP_RETAIL, PREMIUM_TECH
- Mensaje: "¡Hola {nombre}! Como cliente VIP, tienes un {descuento}% de descuento exclusivo en {categoria}. Solo por {duracion}."
- CTA: "COMPRAR AHORA"
- Canal: Instagram DM, Email

**CAMPAÑA 2: Lanzamiento Premium**
- Segmento: PREMIUM_TECH, PREMIUM_SALUD
- Mensaje: "Estimado/a {nombre}, te invitamos a conocer nuestro nuevo {producto} antes que nadie. Incluye soporte premium y garantía extendida."
- CTA: "ACCEDER ANTICIPADAMENTE"
- Canal: LinkedIn, Email

**CAMPAÑA 3: Educación y Valor**
- Segmento: BASICO_SALUD, BASICO_EDUCACION
- Mensaje: "Hola {nombre}, hemos preparado contenido exclusivo para ti: {beneficio}. Totalmente gratuito."
- CTA: "DESCARGAR AHORA"
- Canal: Facebook, Email

**CAMPAÑA 4: Reactivación**
- Segmento: ALTO_RIESGO
- Mensaje: "¡Te extrañamos {nombre}! Vuelve y disfruta de {incentivo}. Queremos recuperar tu confianza."
- CTA: "VOLVER"
- Canal: Email, SMS

**CAMPAÑA 5: Oferta General**
- Segmento: GENERAL
- Mensaje: "Hola {nombre}, tenemos ofertas especiales que podrían interesarte. Descubre más."
- CTA: "VER OFERTAS"
- Canal: Email

**Salida:** Objeto campaña con mensaje personalizado, CTA, canal

---

### RF-007: Estado SALIDA
**Descripción:** Genera los artefactos finales para exportación.  
**Entrada:** Campaña completa + todos los datos del proceso  
**Proceso:**
1. Construir JSON estructurado con toda la información
2. Generar HTML responsive con la campaña renderizada
3. Preparar CSV con datos tabulares (opcional)
4. Calcular métricas finales y timestamps

**Salida:** 
- JSON completo
- HTML renderizado
- CSV exportable
- Logs del proceso

---

### RF-008: Manejo de Errores
**Descripción:** El sistema debe manejar errores graciosamente.  
**Estados de error:**
- Cliente no encontrado → ERROR_INGESTA
- Datos inválidos → ERROR_VALIDACION
- Falla en perfilado → ERROR_PERFIL
- Segmentación fallida → ERROR_SEGMENTO
- Error al generar campaña → ERROR_CAMPAÑA

**Acción ante error:**
1. Registrar en log el tipo de error y estado donde ocurrió
2. Guardar contexto del error
3. Transicionar a estado ERROR_LOG
4. Mostrar mensaje al usuario
5. Finalizar proceso

---

### RF-009: Ejecución por Lotes
**Descripción:** Permitir procesar múltiples clientes en una sola ejecución.  
**Entrada:** Lista de id_cliente o flag "procesar_todos"  
**Proceso:**
1. Iterar sobre cada cliente
2. Ejecutar FSM completa para cada uno
3. Acumular resultados
4. Continuar aunque uno falle (capturar error y continuar)

**Salida:** Array de resultados, uno por cliente procesado

---

### RF-010: Exportación Multi-formato
**Descripción:** Generar archivos descargables en diferentes formatos.  
**Formatos soportados:**
- **JSON:** Estructura completa con todos los metadatos
- **CSV:** Tabla con: id_cliente, nombre, segmento, campaña, canal, CTA
- **HTML:** Vista preimpresa con diseño responsive

**Nombres de archivo:**
- `campanas_generadas_{timestamp}.json`
- `campanas_generadas_{timestamp}.csv`
- `campanas_generadas_{timestamp}.html`

---

## 🤖 CADENA DE PROMPTS PARA GENAI

### Contexto de Uso de GenAI
El sistema usa GenAI de forma **interna y embebida** en dos puntos específicos:
1. **Estado CAMPAÑA:** Para mejorar la personalización del mensaje
2. **Opcional - Estado PERFIL:** Para generar señales más realistas

**IMPORTANTE:** Los prompts están embebidos en el código, NO son entrada del usuario.

---

### PROMPT 1: Personalización de Mensaje de Campaña

**Contexto:** Estado CAMPAÑA - Después de seleccionar la plantilla

**Prompt Template:**
```
Eres un experto en marketing digital y copywriting persuasivo.

DATOS DEL CLIENTE:
- Nombre: {nombre}
- Sector: {sector}
- Gasto promedio: {gasto_promedio} soles
- Intereses: {intereses}
- Tono preferido: {tono_preferido}
- Red social activa: {red_social}

SEGMENTO ASIGNADO: {segmento}

PLANTILLA BASE DE CAMPAÑA:
{plantilla_mensaje}

INSTRUCCIONES:
1. Personaliza el mensaje usando el nombre del cliente de forma natural
2. Adapta el tono según el "tono_preferido": {tono_preferido}
3. Incorpora sutilmente uno de los intereses: {intereses}
4. Mantén el mensaje conciso: máximo 2-3 oraciones
5. Asegúrate de que el CTA sea claro y accionable
6. El mensaje debe sentirse genuino, no automático

RESTRICCIONES:
- Máximo 280 caracteres (formato SMS/Twitter)
- No usar emojis a menos que tono_preferido sea "casual"
- No hacer afirmaciones que no puedas cumplir
- Evita lenguaje exagerado o spam

FORMATO DE SALIDA (JSON estricto):
{
  "mensaje_personalizado": "string - el mensaje final",
  "cta": "string - call to action de máximo 3 palabras",
  "justificacion": "string - breve explicación de por qué este mensaje funcionará"
}

Responde ÚNICAMENTE con el JSON, sin texto adicional.
```

**Ejemplo de Input:**
```json
{
  "nombre": "María López",
  "sector": "retail",
  "gasto_promedio": 350.5,
  "intereses": ["moda", "viajes", "tecnología"],
  "tono_preferido": "casual",
  "red_social": "instagram",
  "segmento": "VIP_RETAIL",
  "plantilla_mensaje": "¡Hola {nombre}! Como cliente VIP, tienes un 20% de descuento exclusivo en toda nuestra nueva colección. Solo por 48 horas."
}
```

**Ejemplo de Output Esperado:**
```json
{
  "mensaje_personalizado": "¡Hola María! 🌟 Nueva colección de moda acaba de llegar y como VIP tienes 20% OFF exclusivo. Solo 48h. ¡No te lo pierdas!",
  "cta": "COMPRAR AHORA",
  "justificacion": "Mensaje adaptado a tono casual, menciona interés en moda, usa emoji apropiado para Instagram, urgencia con tiempo limitado."
}
```

---

### PROMPT 2: Generación de Señales Sociales Realistas (Opcional)

**Contexto:** Estado PERFIL - Para enriquecer el mock con datos más coherentes

**Prompt Template:**
```
Eres un analista de datos de redes sociales experto en comportamiento del consumidor.

DATOS DEL CLIENTE:
- ID: {id_cliente}
- Sector: {sector}
- Gasto promedio mensual: {gasto_promedio} soles
- Nivel de riesgo: {riesgo}
- Red social principal: {red_social}

TAREA:
Genera un perfil simulado de señales sociales coherente con estos datos.

REGLAS DE COHERENCIA:
1. Intereses deben estar alineados con el sector:
   - retail: moda, descuentos, tendencias, compras
   - tech: innovación, gadgets, software, productividad
   - salud: bienestar, fitness, nutrición, mindfulness
   - educacion: aprendizaje, cursos, libros, desarrollo personal

2. Actividad correlacionada con gasto_promedio:
   - > 800 soles: "muy_alta" - usuario altamente engaged
   - 300-800 soles: "alta" a "media"
   - < 300 soles: "baja" a "media"

3. Tono basado en riesgo y sector:
   - riesgo bajo + tech/salud: "profesional"
   - riesgo bajo + retail: "entusiasta"
   - riesgo medio: "casual-amigable"
   - riesgo alto: "cauteloso"

4. Engagement coherente con red_social:
   - instagram: mayor engagement visual, 0.05-0.15
   - linkedin: menor volumen, mayor profesionalismo, 0.02-0.08
   - facebook: engagement medio, 0.03-0.10
   - twitter: alta frecuencia, 0.04-0.12

FORMATO DE SALIDA (JSON estricto):
{
  "id_cliente": "string",
  "intereses": ["string", "string", "string", "string"],
  "tono_preferido": "string",
  "actividad_reciente": "string - (baja|media|alta|muy_alta)",
  "frecuencia_publicacion": "string - (diaria|semanal|mensual)",
  "engagement_promedio": float - (0.0 a 1.0),
  "horario_activo": "string - rango horario",
  "dispositivo_principal": "string - (móvil|desktop|tablet)",
  "sentimiento_marca": "string - (muy_positivo|positivo|neutral|negativo)"
}

IMPORTANTE: Los datos deben ser SIMULADOS pero estadísticamente coherentes. Responde ÚNICAMENTE con el JSON.
```

**Ejemplo de Input:**
```json
{
  "id_cliente": "C002",
  "sector": "tech",
  "gasto_promedio": 1200.0,
  "riesgo": "bajo",
  "red_social": "linkedin"
}
```

**Ejemplo de Output Esperado:**
```json
{
  "id_cliente": "C002",
  "intereses": ["innovación", "inteligencia artificial", "productividad", "startups"],
  "tono_preferido": "profesional",
  "actividad_reciente": "muy_alta",
  "frecuencia_publicacion": "diaria",
  "engagement_promedio": 0.06,
  "horario_activo": "09:00-18:00",
  "dispositivo_principal": "desktop",
  "sentimiento_marca": "muy_positivo"
}
```

---

### PROMPT 3: Generación de CTA Optimizado por Segmento

**Contexto:** Estado CAMPAÑA - Optimización del Call-to-Action

**Prompt Template:**
```
Eres un especialista en optimización de conversiones y copywriting de CTAs.

CONTEXTO:
- Segmento: {segmento}
- Tipo de campaña: {tipo_campana}
- Canal de comunicación: {canal}
- Objetivo: {objetivo}

SEGMENTOS Y SUS CARACTERÍSTICAS:
- VIP_RETAIL: Buscan exclusividad, urgencia, status
- PREMIUM_TECH: Valoran innovación, anticipación, valor agregado
- BASICO_SALUD/EDUCACION: Sensibles a contenido gratuito, educación
- ALTO_RIESGO: Necesitan confianza, garantías, incentivos

TAREA:
Genera 3 opciones de CTA (Call-to-Action) optimizadas para este segmento.

REGLAS:
1. Máximo 3 palabras por CTA
2. Debe ser accionable (verbo de acción)
3. Crear urgencia o valor claro
4. Adaptado al canal (ej: LinkedIn más profesional, Instagram más casual)

FORMATO DE SALIDA (JSON estricto):
{
  "cta_opciones": [
    {
      "texto": "string - máximo 3 palabras",
      "razon": "string - por qué funcionará",
      "conversion_estimada": float - (0.0 a 1.0)
    },
    {
      "texto": "string",
      "razon": "string",
      "conversion_estimada": float
    },
    {
      "texto": "string",
      "razon": "string",
      "conversion_estimada": float
    }
  ],
  "recomendacion": "string - cuál de las 3 es la mejor y por qué"
}
```

**Ejemplo de Input:**
```json
{
  "segmento": "VIP_RETAIL",
  "tipo_campana": "promocional",
  "canal": "instagram_dm",
  "objetivo": "compra_inmediata"
}
```

**Ejemplo de Output Esperado:**
```json
{
  "cta_opciones": [
    {
      "texto": "COMPRAR AHORA",
      "razon": "Directo, crea urgencia, enfocado en acción inmediata",
      "conversion_estimada": 0.12
    },
    {
      "texto": "ACCESO VIP",
      "razon": "Refuerza exclusividad del segmento, aspiracional",
      "conversion_estimada": 0.15
    },
    {
      "texto": "SOLO 48H",
      "razon": "FOMO (fear of missing out), enfatiza urgencia temporal",
      "conversion_estimada": 0.13
    }
  ],
  "recomendacion": "ACCESO VIP - Mayor estimación de conversión (0.15) porque refuerza el status del segmento VIP y crea aspiración, clave para retail de alto valor."
}
```

---

### PROMPT 4: Validación y Mejora de Segmentación (Opcional - Avanzado)

**Contexto:** Estado SEGMENTO - Validación con GenAI de la segmentación determinística

**Prompt Template:**
```
Eres un experto en segmentación de clientes y estrategia de marketing.

CLIENTE ANALIZADO:
- Sector: {sector}
- Gasto promedio: {gasto_promedio}
- Riesgo: {riesgo}
- Intereses: {intereses}
- Actividad en redes: {actividad}

SEGMENTO ASIGNADO POR REGLAS: {segmento_reglas}

TAREA:
Valida si el segmento asignado es óptimo o sugiere un ajuste.

ANÁLISIS REQUERIDO:
1. ¿El segmento actual maximiza el potencial de conversión?
2. ¿Hay factores en los intereses/actividad que sugieran otro segmento?
3. ¿La combinación sector-gasto-riesgo está bien clasificada?

OPCIONES DE RESPUESTA:
- "CONFIRMAR" - El segmento es correcto
- "SUGERIR_ALTERNATIVO" - Hay un mejor segmento
- "CREAR_MICRO_SEGMENTO" - Merece sub-clasificación

FORMATO DE SALIDA (JSON estricto):
{
  "decision": "string - (CONFIRMAR|SUGERIR_ALTERNATIVO|CREAR_MICRO_SEGMENTO)",
  "segmento_final": "string - segmento recomendado",
  "confianza": float - (0.0 a 1.0),
  "razonamiento": "string - explicación breve de la decisión",
  "banderas_atencion": ["string"] - factores que requieren atención especial
}
```

**Ejemplo de Input:**
```json
{
  "sector": "tech",
  "gasto_promedio": 850.0,
  "riesgo": "bajo",
  "intereses": ["inteligencia artificial", "startups", "inversión"],
  "actividad": "muy_alta",
  "segmento_reglas": "PREMIUM_TECH"
}
```

**Ejemplo de Output Esperado:**
```json
{
  "decision": "CREAR_MICRO_SEGMENTO",
  "segmento_final": "PREMIUM_TECH_INVERSOR",
  "confianza": 0.87,
  "razonamiento": "Cliente muestra intereses en inversión además de tech. Gasto alto + actividad muy alta + interés en startups sugiere perfil de early adopter con poder adquisitivo. Merece micro-segmento para campañas de inversión en tech.",
  "banderas_atencion": [
    "Posible interés en productos financieros tech",
    "Candidato para programas de referidos",
    "Alto potencial de lifetime value"
  ]
}
```

---

### PROMPT 5: Generación de Métricas Estimadas

**Contexto:** Estado SALIDA - Calcular proyecciones de rendimiento de campaña

**Prompt Template:**
```
Eres un analista de marketing digital especializado en predicción de métricas.

CAMPAÑA GENERADA:
- Segmento: {segmento}
- Tipo de campaña: {tipo_campana}
- Canal: {canal}
- Mensaje: {mensaje}
- CTA: {cta}

DATOS HISTÓRICOS SIMULADOS:
- CTR promedio sector {sector}: {ctr_sector}
- Tasa apertura promedio {canal}: {tasa_apertura_canal}
- Conversión promedio {segmento}: {conversion_segmento}

TAREA:
Estima las métricas de rendimiento de esta campaña específica.

FACTORES A CONSIDERAR:
1. Calidad del mensaje (personalización, claridad)
2. Fortaleza del CTA
3. Alineación canal-segmento
4. Urgencia o incentivo presente
5. Coherencia con intereses del cliente

FORMATO DE SALIDA (JSON estricto):
{
  "metricas_estimadas": {
    "ctr_esperado": float - (0.0 a 1.0),
    "tasa_apertura": float - (0.0 a 1.0),
    "conversion_estimada": float - (0.0 a 1.0),
    "engagement_esperado": float - (0.0 a 1.0)
  },
  "factores_positivos": ["string", "string"],
  "factores_negativos": ["string", "string"],
  "recomendaciones_mejora": ["string", "string"],
  "confianza_prediccion": float - (0.0 a 1.0)
}
```

**Ejemplo de Input:**
```json
{
  "segmento": "VIP_RETAIL",
  "tipo_campana": "promocional",
  "canal": "instagram_dm",
  "mensaje": "¡Hola María! Nueva colección de moda acaba de llegar y como VIP tienes 20% OFF exclusivo. Solo 48h.",
  "cta": "ACCESO VIP",
  "sector": "retail",
  "ctr_sector": 0.08,
  "tasa_apertura_canal": 0.45,
  "conversion_segmento": 0.10
}
```

**Ejemplo de Output Esperado:**
```json
{
  "metricas_estimadas": {
    "ctr_esperado": 0.12,
    "tasa_apertura": 0.52,
    "conversion_estimada": 0.14,
    "engagement_esperado": 0.18
  },
  "factores_positivos": [
    "Personalización con nombre",
    "Urgencia clara (48h)",
    "Descuento significativo (20%)",
    "Canal alineado con segmento (Instagram para retail)",
    "CTA refuerza exclusividad VIP"
  ],
  "factores_negativos": [
    "Podría beneficiarse de emoji visual para Instagram",
    "No menciona categoría específica de moda (más genérico)"
  ],
  "recomendaciones_mejora": [
    "Agregar emoji sutil al inicio (ej: ⭐ o 👗)",
    "Especificar tipo de colección (ej: 'nueva colección primavera-verano')",
    "Considerar agregar preview visual si DM lo permite"
  ],
  "confianza_prediccion": 0.78
}
```

---

## 🛡️ CONSIDERACIONES DE ÉTICA Y CUMPLIMIENTO

### Protección de Privacidad

#### CRÍTICO - Uso de Datos Simulados
- ✅ **PERMITIDO:** Datos ficticios generados para demostración
- ❌ **PROHIBIDO:** Datos personales reales de clientes
- ❌ **PROHIBIDO:** Scraping real de Facebook, Instagram, LinkedIn
- ❌ **PROHIBIDO:** Almacenar o procesar información personal identificable (PII)

#### Datos que DEBEN ser simulados:
1. Nombres de clientes → Nombres ficticios
2. Señales sociales → Generadas algorítmicamente o con GenAI
3. Métricas de engagement → Valores estadísticamente coherentes pero inventados
4. Interacciones en redes → Mock data, no conexiones API reales

---

### Transparencia

#### Declaración Requerida en README:
```markdown
## ⚠️ AVISO IMPORTANTE

Este proyecto es una **demostración educativa** desarrollada para el Hackathon NTTDATA IActiva 2025.

- **Todos los datos de clientes son ficticios** y generados exclusivamente para fines demostrativos.
- **No se realizan consultas reales** a redes sociales (Facebook, Instagram, LinkedIn).
- **Las señales sociales son simuladas** mediante algoritmos determinísticos o GenAI.
- **Este sistema NO debe usarse con datos reales** sin implementar medidas de seguridad y cumplimiento GDPR/LGPD adecuadas.

### Uso de Inteligencia Artificial

Este proyecto utiliza modelos GenAI (Claude/GPT/Llama) para:
1. Personalización de mensajes de campaña
2. Generación de señales sociales coherentes (simuladas)
3. Optimización de CTAs

**Todos los prompts están embebidos en el código** y no aceptan entrada libre del usuario para evitar inyección de prompts maliciosos.
```

---

### Cumplimiento de Términos de Servicio

#### Redes Sociales
- ❌ NO violar ToS de Meta (Facebook/Instagram)
- ❌ NO violar ToS de LinkedIn
- ❌ NO usar técnicas de scraping no autorizadas
- ✅ Documentar claramente que el sistema es educativo y usa datos mock

#### APIs y Servicios
- Si se integran APIs reales (futuro), obtener autorización adecuada
- Respetar rate limits y políticas de uso
- Implementar autenticación segura (OAuth 2.0)

---

### Filtros de Seguridad en GenAI

#### Prompts Embebidos - Reglas de Seguridad

```python
# Ejemplo de sistema de filtros
PROMPT_SAFETY_FILTERS = {
    "content_policy": [
        "NO generar contenido discriminatorio",
        "NO usar lenguaje ofensivo o inapropiado",
        "NO hacer afirmaciones médicas o legales sin disclaimer",
        "NO crear campañas engañosas o de spam"
    ],
    "pii_protection": [
        "NO incluir emails reales en ejemplos",
        "NO usar números de teléfono reales",
        "NO referenciar direcciones físicas reales"
    ],
    "business_ethics": [
        "NO generar mensajes agresivos de venta",
        "NO crear campañas que exploten vulnerabilidades psicológicas",
        "NO prometer resultados que no se pueden cumplir"
    ]
}

def validate_campaign_message(message: str) -> bool:
    """
    Valida que el mensaje generado cumple políticas éticas
    """
    forbidden_patterns = [
        r'\b(garantizado|100% seguro|eliminar peso en días)\b',  # Afirmaciones falsas
        r'\b(último día|última oportunidad)\b'  # Urgencia falsa excesiva
    ]
    
    for pattern in forbidden_patterns:
        if re.search(pattern, message, re.IGNORECASE):
            return False
    
    return True
```

---

### Monitoreo y Auditoría

#### Log de Decisiones del Agente
Cada decisión del agente debe quedar registrada para auditoría:

```json
{
  "timestamp": "2025-11-29T14:30:00Z",
  "cliente_id": "C001",
  "decision_log": [
    {
      "estado": "SEGMENTO",
      "input": {"sector": "retail", "gasto": 350.5, "riesgo": "medio"},
      "decision": "VIP_RETAIL",
      "razonamiento": "Cumple criterios: gasto > 300 AND sector == retail AND riesgo != alto",
      "confianza": 1.0
    },
    {
      "estado": "CAMPAÑA",
      "input": {"segmento": "VIP_RETAIL"},
      "decision": "DESCUENTO_EXCLUSIVO_VIP",
      "modelo_usado": "gpt-4o-mini",
      "prompt_hash": "a3f5c2d1...",
      "razonamiento": "Plantilla óptima para segmento VIP con descuento atractivo"
    }
  ]
}
```

---

## 📊 PLAN DE EJECUCIÓN - TIMELINE (2 HORAS)

### Fase 1: Setup Inicial (0:00 - 0:15) - 15 minutos

#### Tareas:
- [ ] **0:00-0:05:** Configurar entorno de desarrollo
  - Crear repositorio Git
  - Inicializar proyecto (Python/Node.js según elección)
  - Instalar dependencias base (Flask/FastAPI o Express)
  
- [ ] **0:05-0:10:** Preparar datos de prueba
  - Crear CSV de clientes (mínimo 10 registros)
  - Diseñar esquema de segmentos
  - Definir plantillas de campaña (mínimo 3)
  
- [ ] **0:10-0:15:** Estructura de proyecto
  ```
  crm-inteligente/
  ├── data/
  │   ├── clientes.csv
  │   ├── segmentos.json
  │   └── campanas.json
  ├── src/
  │   ├── agente/
  │   │   ├── fsm.py (orquestador)
  │   │   ├── estados.py (INGESTA, PERFIL, etc)
  │   │   └── herramientas.py (PerfiladorMock, etc)
  │   ├── prompts/
  │   │   └── prompts.py (todos los prompts embebidos)
  │   └── utils/
  │       └── exportadores.py
  ├── ui/
  │   ├── app.py (Streamlit/Gradio)
  │   └── templates/
  ├── tests/
  ├── README.md
  └── requirements.txt
  ```

**Entregables:**
- ✅ Repositorio inicializado
- ✅ Datos de prueba creados
- ✅ Estructura de carpetas

---

### Fase 2: Desarrollo Core del Agente (0:15 - 1:00) - 45 minutos

#### Bloque 1: FSM y Estados Básicos (0:15 - 0:35) - 20 minutos

**Tareas:**
- [ ] **0:15-0:20:** Implementar orquestador FSM
  - Clase FSMController con estados
  - Método execute(cliente_id)
  - Transiciones entre estados
  
- [ ] **0:20-0:25:** Estado INGESTA
  - Cargar cliente desde CSV
  - Validar existencia
  - Retornar datos completos
  
- [ ] **0:25-0:30:** Estado PERFIL (Mock)
  - PerfiladorSocialMock
  - Generar señales según sector/gasto/riesgo
  - Retornar JSON de señales
  
- [ ] **0:30-0:35:** Estado SEGMENTO
  - Implementar reglas determinísticas
  - Función segmentar(cliente, señales)
  - Retornar nombre del segmento

**Código de Referencia - FSM Controller:**
```python
class EstadosFSM(Enum):
    INGESTA = "INGESTA"
    PERFIL = "PERFIL"
    SEGMENTO = "SEGMENTO"
    CAMPAÑA = "CAMPAÑA"
    SALIDA = "SALIDA"
    ERROR = "ERROR"
    FIN = "FIN"

class AgenteCRM:
    def __init__(self):
        self.estado_actual = EstadosFSM.INGESTA
        self.contexto = {}
        self.logs = []
    
    def ejecutar(self, id_cliente):
        """Ejecuta el ciclo completo del agente"""
        try:
            # INGESTA
            self.log_estado("INGESTA", "Iniciando")
            cliente = self.estado_ingesta(id_cliente)
            
            # PERFIL
            self.log_estado("PERFIL", "Generando señales")
            señales = self.estado_perfil(cliente)
            
            # SEGMENTO
            self.log_estado("SEGMENTO", "Clasificando")
            segmento = self.estado_segmento(cliente, señales)
            
            # CAMPAÑA
            self.log_estado("CAMPAÑA", "Seleccionando campaña")
            campaña = self.estado_campaña(cliente, segmento, señales)
            
            # SALIDA
            self.log_estado("SALIDA", "Generando artefactos")
            resultado = self.estado_salida(cliente, segmento, campaña)
            
            return resultado
            
        except Exception as e:
            self.log_estado("ERROR", str(e))
            return self.manejar_error(e)
```

---

#### Bloque 2: Estados Avanzados (0:35 - 1:00) - 25 minutos

**Tareas:**
- [ ] **0:35-0:45:** Estado CAMPAÑA
  - Mapeo segmento → plantilla
  - Integración con GenAI para personalización (opcional)
  - Generar mensaje + CTA
  
- [ ] **0:45-0:55:** Estado SALIDA
  - Construir JSON completo
  - Generar HTML básico
  - Preparar CSV exportable
  
- [ ] **0:55-1:00:** Manejo de errores
  - Try-catch en cada estado
  - Log de errores
  - Estado ERROR_LOG

**Código de Referencia - Estado CAMPAÑA:**
```python
def estado_campaña(self, cliente, segmento, señales):
    # 1. Seleccionar plantilla
    plantilla = self.seleccionar_plantilla(segmento)
    
    # 2. Personalizar con GenAI (opcional)
    if USAR_GENAI:
        mensaje = self.genai_personalizar(plantilla, cliente, señales)
    else:
        mensaje = plantilla['mensaje'].format(nombre=cliente['nombre'])
    
    # 3. Construir campaña
    campaña = {
        "nombre": plantilla['nombre'],
        "tipo": plantilla['tipo'],
        "mensaje_personalizado": mensaje,
        "cta": plantilla['cta'],
        "canal": self.seleccionar_canal(señales['red_social'], segmento)
    }
    
    return campaña
```

**Entregables:**
- ✅ FSM completa funcionando
- ✅ Todos los estados implementados
- ✅ Manejo básico de errores

---

### Fase 3: Interfaz de Usuario (1:00 - 1:30) - 30 minutos

#### Bloque 1: UI Básica (1:00 - 1:20) - 20 minutos

**Tareas:**
- [ ] **1:00-1:10:** Setup de Streamlit/Gradio
  - Página principal
  - Carga de CSV
  - Selector de cliente(s)
  
- [ ] **1:10-1:15:** Botón "Ejecutar Agente"
  - Llamada a FSM
  - Mostrar spinner/loading
  
- [ ] **1:15-1:20:** Panel de logs
  - Visualización en tiempo real
  - Estados con timestamps
  - Códigos de color (SUCCESS/ERROR)

**Código de Referencia - Streamlit:**
```python
import streamlit as st

st.title("🤖 CRM Inteligente - Agente Autónomo")

# Sidebar - Carga de datos
uploaded_file = st.sidebar.file_uploader("Cargar CSV de clientes", type="csv")
if uploaded_file:
    clientes_df = pd.read_csv(uploaded_file)
    st.sidebar.success(f"✅ {len(clientes_df)} clientes cargados")

# Selector de cliente
cliente_id = st.selectbox(
    "Seleccionar cliente",
    options=clientes_df['id_cliente'].tolist()
)

procesar_todos = st.checkbox("Procesar todos los clientes")

# Botón ejecutar
if st.button("🚀 Ejecutar Agente", type="primary"):
    with st.spinner("Agente trabajando..."):
        if procesar_todos:
            resultados = []
            for cid in clientes_df['id_cliente']:
                resultado = agente.ejecutar(cid)
                resultados.append(resultado)
        else:
            resultado = agente.ejecutar(cliente_id)
    
    st.success("✅ Proceso completado")
```

---

#### Bloque 2: Visualización de Resultados (1:20 - 1:30) - 10 minutos

**Tareas:**
- [ ] **1:20-1:25:** Tabla de resultados
  - Mostrar: cliente, segmento, campaña, canal
  - Expandible para ver mensaje completo
  
- [ ] **1:25-1:30:** Botones de exportación
  - Descargar JSON
  - Descargar CSV
  - Descargar HTML (vista previa)

**Código de Referencia - Resultados:**
```python
# Mostrar tabla de resultados
st.subheader("📊 Resultados")
resultados_df = pd.DataFrame([
    {
        "Cliente": r['cliente']['nombre'],
        "Segmento": r['segmento_asignado'],
        "Campaña": r['campana_seleccionada']['nombre'],
        "Canal": r['campana_seleccionada']['canal_recomendado'],
        "CTA": r['campana_seleccionada']['cta']
    }
    for r in resultados
])
st.dataframe(resultados_df)

# Exportación
col1, col2, col3 = st.columns(3)
with col1:
    st.download_button(
        "📥 Descargar JSON",
        data=json.dumps(resultados, indent=2),
        file_name="campanas_generadas.json",
        mime="application/json"
    )
with col2:
    st.download_button(
        "📥 Descargar CSV",
        data=resultados_df.to_csv(index=False),
        file_name="campanas_generadas.csv",
        mime="text/csv"
    )
```

**Entregables:**
- ✅ Interfaz funcional
- ✅ Visualización de logs
- ✅ Exportación multi-formato

---

### Fase 4: Testing y Refinamiento (1:30 - 1:50) - 20 minutos

#### Tareas:
- [ ] **1:30-1:35:** Testing de casos básicos
  - Ejecutar con 1 cliente
  - Ejecutar con todos los clientes
  - Probar cada segmento
  
- [ ] **1:35-1:40:** Testing de errores
  - Cliente inexistente
  - CSV malformado
  - Datos inválidos
  
- [ ] **1:40-1:45:** Refinamiento de UX
  - Ajustar textos
  - Mejorar mensajes de error
  - Optimizar layout
  
- [ ] **1:45-1:50:** Documentación
  - Completar README.md
  - Agregar comentarios al código
  - Documentar prompts usados

**Entregables:**
- ✅ Sistema testeado
- ✅ Errores corregidos
- ✅ README completo

---

### Fase 5: Extras Opcionales (1:50 - 2:00) - 10 minutos

**Si hay tiempo, implementar:**
- [ ] Memoria corta por cliente (persistencia en JSON)
- [ ] Métricas simuladas (CTR, conversión)
- [ ] Selector de canal automático
- [ ] Gráficos de distribución de segmentos

**Código de Referencia - Métricas:**
```python
def calcular_metricas_estimadas(segmento, campaña, canal):
    # CTR base por segmento
    ctr_base = {
        "VIP_RETAIL": 0.12,
        "PREMIUM_TECH": 0.15,
        "BASICO_SALUD": 0.08,
        "BASICO_EDUCACION": 0.09,
        "ALTO_RIESGO": 0.05
    }
    
    # Modificadores por canal
    modificador_canal = {
        "email": 1.0,
        "instagram_dm": 1.2,
        "linkedin": 0.9,
        "sms": 1.1
    }
    
    ctr = ctr_base.get(segmento, 0.07) * modificador_canal.get(canal, 1.0)
    
    return {
        "ctr_esperado": round(ctr, 3),
        "tasa_apertura": round(ctr * 3.5, 3),  # ~3.5x del CTR
        "conversion_estimada": round(ctr * 0.7, 3)  # ~70% del CTR
    }
```

**Entregables:**
- ✅ Al menos 1 funcionalidad extra implementada

---

## ✅ CRITERIOS DE ACEPTACIÓN FINAL

### Funcionalidades Mínimas Requeridas

#### ✅ Agente Autónomo
- [ ] El agente ejecuta el flujo completo sin prompts manuales del usuario
- [ ] FSM con todos los estados: INGESTA → PERFIL → SEGMENTO → CAMPAÑA → SALIDA
- [ ] UI solo permite seleccionar cliente y ejecutar

#### ✅ Segmentación
- [ ] Mínimo 2 segmentos distintos implementados
- [ ] Reglas determinísticas correctamente aplicadas
- [ ] Asignación consistente de segmento

#### ✅ Campañas
- [ ] Mínimo 3 plantillas de campaña distintas
- [ ] Mensajes personalizados con nombre del cliente
- [ ] CTA claro y accionable

#### ✅ Salidas
- [ ] Exporta JSON estructurado
- [ ] Exporta CSV tabular
- [ ] Exporta HTML legible
- [ ] Nombres de archivo con timestamp

#### ✅ Logs
- [ ] Panel de logs muestra todos los estados
- [ ] Timestamps por cada estado
- [ ] Indicadores de SUCCESS/ERROR

#### ✅ Datos Simulados
- [ ] No usa scraping real de redes sociales
- [ ] Todas las señales sociales son mock/simuladas
- [ ] Declaración clara en README de que es demo educativo

---

## 📈 CHECKLIST DE ENTREGABLES FINALES

### Documentación
- [ ] **README.md** completo con:
  - [ ] Descripción del proyecto
  - [ ] Instrucciones de instalación
  - [ ] Cómo ejecutar el sistema
  - [ ] Estructura de datos (CSV esperado)
  - [ ] Declaración de uso educativo y datos simulados
  - [ ] Screenshots/GIFs del sistema funcionando

### Código
- [ ] **Repositorio Git** con commits claros
- [ ] **Código comentado** en secciones críticas
- [ ] **Prompts embebidos documentados** (si usa GenAI)
- [ ] **Datos de ejemplo** incluidos (CSV)

### Demo
- [ ] **Video corto** (2-3 min) o **demo en vivo** mostrando:
  - [ ] Carga de datos
  - [ ] Selección de cliente
  - [ ] Ejecución del agente
  - [ ] Visualización de logs
  - [ ] Resultados finales
  - [ ] Exportación de archivos

### Exportaciones
- [ ] **Archivo JSON** de ejemplo generado
- [ ] **Archivo CSV** de ejemplo generado
- [ ] **Archivo HTML** de ejemplo generado

---

## 🎯 RÚBRICA DE EVALUACIÓN (100 PUNTOS)

| Criterio | Puntaje | Desglose |
|----------|---------|----------|
| **MVP Funcional** | 40 pts | - Agente ejecuta flujo completo sin errores (20 pts)<br>- Todos los estados implementados (10 pts)<br>- Exportaciones funcionan (10 pts) |
| **Interfaz/Claridad de Demo** | 20 pts | - UI clara e intuitiva (10 pts)<br>- Logs informativos (5 pts)<br>- Demo bien presentada (5 pts) |
| **Uso Adecuado de GenAI** | 20 pts | - Prompts bien diseñados (10 pts)<br>- Agente autónomo (no requiere intervención) (5 pts)<br>- Filtros de seguridad implementados (5 pts) |
| **Calidad Técnica Básica** | 10 pts | - Código limpio y estructurado (5 pts)<br>- Manejo de errores (3 pts)<br>- Documentación (2 pts) |
| **Creatividad y Extras** | 10 pts | - Funcionalidades adicionales (5 pts)<br>- Originalidad en implementación (3 pts)<br>- UX/UI superior (2 pts) |

---

## 🚨 ERRORES COMUNES A EVITAR

### ❌ NO HACER:
1. **Scraping real de redes sociales** → Viola ToS y ética
2. **Usar datos personales reales** → Riesgo de privacidad
3. **Prompts libres del usuario** → Inseguro y fuera de scope
4. **Código sin estructura** → Difícil de mantener
5. **No manejar errores** → Sistema frágil
6. **Exportaciones incompletas** → No cumple criterios
7. **Demo sin preparar** → Mala presentación

### ✅ SÍ HACER:
1. **Datos 100% simulados** → Ético y seguro
2. **Agente autónomo completo** → Cumple objetivo
3. **Logs detallados** → Transparencia
4. **README claro** → Facilita evaluación
5. **Código comentado** → Demuestra comprensión
6. **Demo ensayada** → Presentación profesional
7. **Backups de datos** → Prevención

---

## 🎓 RECOMENDACIONES FINALES

### Para Máximo Puntaje:
1. **Enfócate en el MVP primero** (0:00-1:30)
2. **Testea constantemente** mientras desarrollas
3. **Documenta mientras codeas**, no al final
4. **Prepara el demo** en los últimos 10 minutos
5. **Ten datos de ejemplo listos** desde el inicio

### Tecnologías Recomendadas:
- **Backend:** Python (Flask/FastAPI) o Node.js (Express)
- **FSM:** LangGraph, LangChain, o implementación custom
- **Frontend:** Streamlit (rápido) o Gradio
- **GenAI:** GPT-4o-mini, Claude Haiku, o Llama 3 (local)
- **Base de Datos:** JSON files (simple) o SQLite

### Gestión del Tiempo:
- **No te atasques** en un problema >10 min
- **Usa soluciones simples** que funcionen
- **Prioriza funcionalidad** sobre perfección
- **Deja 20 minutos** para testing y demo

---

## 📞 SOPORTE Y RECURSOS

### Documentación de Referencia:
- **LangChain:** https://python.langchain.com/docs/
- **Streamlit:** https://docs.streamlit.io/
- **Gradio:** https://gradio.app/docs/
- **Prompting Guide:** https://www.promptingguide.ai/

### Plantillas de Código:
- Ver secciones de "Código de Referencia" en este documento
- Ejemplos de prompts embebidos incluidos
- Estructura de proyecto sugerida

---

**¡ÉXITO EN EL HACKATHON! 🚀**

*Este plan está diseñado para completarse en 2 horas y cumplir todos los criterios de evaluación del Reto 1.*
