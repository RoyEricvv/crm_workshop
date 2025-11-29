# 🔐 Configuración de Variables de Entorno (.env)

## Cómo configurar tu API Key de OpenAI

### Paso 1: Crear el archivo `.env`

En la raíz del proyecto, crea un archivo llamado `.env` (sin extensión):

```bash
# En la raíz del proyecto
touch .env
```

### Paso 2: Agregar tu API Key

Abre el archivo `.env` y agrega tu API key de OpenAI:

```env
OPENAI_API_KEY=sk-tu-api-key-aqui
USE_GENAI=true
CLIENTES_CSV_PATH=data/clientes.csv
```

### Ejemplo completo del archivo `.env`:

```env
# API Key de OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Activar uso de GenAI (true para usar OpenAI, false para solo reglas)
USE_GENAI=true

# Ruta al archivo CSV de clientes
CLIENTES_CSV_PATH=data/clientes.csv
```

### Paso 3: Verificar que funciona

El código carga automáticamente el archivo `.env` al iniciar. Para verificar:

```bash
# Probar que carga correctamente
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('API Key cargada:', 'Sí' if os.getenv('OPENAI_API_KEY') else 'No')"
```

## ⚙️ Variables de Entorno Disponibles

| Variable | Descripción | Requerido | Default |
|----------|-------------|-----------|---------|
| `OPENAI_API_KEY` | Tu API key de OpenAI | Solo si `USE_GENAI=true` | - |
| `USE_GENAI` | Activar uso de GenAI | No | `false` |
| `CLIENTES_CSV_PATH` | Ruta al CSV de clientes | No | `data/clientes.csv` |

## 🔒 Seguridad

**IMPORTANTE**: 
- ✅ El archivo `.env` está en `.gitignore` (no se sube a Git)
- ✅ Nunca compartas tu API key
- ✅ Usa `.env.example` como plantilla (sin datos reales)

## 🐳 Uso con Docker

Si usas Docker, puedes pasar las variables de dos formas:

### Opción 1: Archivo .env (recomendado)
Docker Compose carga automáticamente el `.env`:

```yaml
# docker-compose.yml ya está configurado para leer .env
```

### Opción 2: Variables de entorno directas
```bash
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=sk-tu-key \
  -e USE_GENAI=true \
  agente-campanas
```

## ☁️ Uso en AWS Lambda

En AWS Lambda, configura las variables de entorno en la consola:

1. Ve a tu función Lambda
2. Configuration → Environment variables
3. Agrega:
   - `OPENAI_API_KEY`: tu API key
   - `USE_GENAI`: `true` o `false`
   - `CLIENTES_CSV_PATH`: ruta al CSV (si está en S3, usa la ruta completa)

## 🧪 Probar sin API Key

Si no tienes API key o no quieres usar GenAI, simplemente:

```env
# .env
USE_GENAI=false
```

El agente funcionará perfectamente usando solo reglas determinísticas.

