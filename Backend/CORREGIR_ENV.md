# ⚠️ IMPORTANTE: Cómo Configurar tu Archivo .env

## 🚨 Error Común Detectado

Si tu archivo `.env` tiene una línea como esta:
```
USE_GENAI=sk-proj-R0FJJddA75oNCOF1_8tU5EcGI8dzJztgqi7AEKLQ8U...
```

**Esto está MAL**. La API key está en el lugar equivocado.

---

## ✅ Configuración Correcta

Tu archivo `.env` debe tener EXACTAMENTE este formato:

```env
# API Key de OpenAI (SI quieres usar GenAI)
OPENAI_API_KEY=sk-proj-TU_API_KEY_AQUI_REEMPLAZAR

# Activar GenAI (DEBE ser "true" o "false")
USE_GENAI=true

# Ruta al CSV
CLIENTES_CSV_PATH=data/clientes.csv

# Puerto del servidor
PORT=8000

# URL del frontend
FRONTEND_URL=http://localhost:3000
```

---

## 🎯 Dos Modos de Operación

### Modo 1: Solo Reglas Determinísticas (SIN GenAI)
```env
OPENAI_API_KEY=tu_key_aqui  # Puede estar vacía o con cualquier valor
USE_GENAI=false             # ← LO IMPORTANTE
CLIENTES_CSV_PATH=data/clientes.csv
PORT=8000
FRONTEND_URL=http://localhost:3000
```

**Ventajas:**
- ✅ No necesitas API key de OpenAI
- ✅ Es gratis
- ✅ Funciona inmediatamente
- ✅ Respuestas instantáneas

**Desventajas:**
- ❌ Segmentación menos "inteligente" (pero funcional)
- ❌ Mensajes menos personalizados

---

### Modo 2: Con GenAI (OpenAI)
```env
OPENAI_API_KEY=sk-proj-tu_key_real_aqui  # ← API key válida
USE_GENAI=true                             # ← Activado
CLIENTES_CSV_PATH=data/clientes.csv
PORT=8000
FRONTEND_URL=http://localhost:3000
```

**Ventajas:**
- ✅ Segmentación más inteligente
- ✅ Mensajes más personalizados
- ✅ Puede adaptar decisiones según contexto

**Desventajas:**
- ❌ Necesitas API key de OpenAI (cuesta dinero)
- ❌ Más lento (llamadas a API)
- ❌ Depende de servicio externo

---

## 🔧 Cómo Corregir tu .env Actual

### Paso 1: Identifica tu API key

Si tu `.env` tiene esto:
```
USE_GENAI=sk-proj-R0FJJddA75oN...
```

Tu API key es: `sk-proj-R0FJJddA75oN...`

### Paso 2: Edita el archivo `.env`

Abre `Backend/.env` con un editor de texto y déjalo así:

```env
OPENAI_API_KEY=sk-proj-TU_API_KEY_AQUI_REEMPLAZAR
USE_GENAI=true
CLIENTES_CSV_PATH=data/clientes.csv
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### Paso 3: Guarda y reinicia

```bash
# Reinicia el backend
# Windows: start.bat
# Linux/Mac: ./start.sh
```

---

## 🧪 Verificar que Funciona

### Opción 1: Script automático
```bash
python check_config.py
```

### Opción 2: Manual
```bash
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('USE_GENAI:', os.getenv('USE_GENAI')); print('API_KEY:', 'OK' if os.getenv('OPENAI_API_KEY') else 'NO')"
```

Deberías ver:
```
USE_GENAI: true
API_KEY: OK
```

---

## 💡 Recomendación

Si es tu primera vez, **usa modo sin GenAI**:

```env
USE_GENAI=false
```

Así el sistema funciona inmediatamente y sin costos. Luego, si quieres, activa GenAI.

---

## ❓ Preguntas Frecuentes

**P: ¿Necesito GenAI obligatoriamente?**
R: No. El sistema funciona perfectamente con reglas determinísticas.

**P: ¿Cómo obtengo una API key de OpenAI?**
R: Ve a https://platform.openai.com/api-keys y crea una.

**P: ¿Cuánto cuesta usar GenAI?**
R: Depende del uso. GPT-3.5-turbo cuesta ~$0.0005 por 1000 tokens. Para este proyecto, probablemente <$1 al mes.

**P: Mi .env está bien pero no funciona**
R: Asegúrate de no tener espacios extra, comillas, o caracteres especiales. El formato debe ser exactamente: `VARIABLE=valor`

---

## 📝 Plantilla .env Completa

```env
# =======================================
# BACKEND CRM - CONFIGURACIÓN
# =======================================

# OpenAI (opcional)
OPENAI_API_KEY=sk-proj-tu_key_aqui_o_dejalo_vacio
USE_GENAI=false

# Datos
CLIENTES_CSV_PATH=data/clientes.csv

# Servidor
PORT=8000
FRONTEND_URL=http://localhost:3000
```

Copia esto, pégalo en `Backend/.env`, ajusta los valores, y listo.

