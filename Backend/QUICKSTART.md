# 🚀 Guía Rápida de Inicio

## Opción 1: Docker (Recomendado)

```bash
# Construir y ejecutar
docker-compose up --build

# Acceder a http://localhost:8000
```

## Opción 2: Local con Python

```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Acceder a http://localhost:8000
```

## Opción 3: Probar sin servidor web

```bash
# Ejecutar script de prueba
python test_agente.py
```

## Configuración de OpenAI (Opcional)

Si quieres usar GenAI para decisiones más inteligentes:

1. Crear archivo `.env`:
```bash
OPENAI_API_KEY=tu_api_key_aqui
USE_GENAI=true
```

2. La aplicación usará OpenAI solo si `USE_GENAI=true` y `OPENAI_API_KEY` está configurado.

## Estructura de Datos

El archivo `data/clientes.csv` debe tener estas columnas:
- `id_cliente`: Identificador único
- `nombre`: Nombre del cliente
- `sector`: retail, tech, salud, educación, gastronomía
- `gasto_promedio`: Número decimal
- `riesgo`: bajo, medio, alto
- `red_social`: instagram, facebook, twitter, linkedin

## Uso de la API

### Obtener clientes
```bash
curl http://localhost:8000/api/clientes
```

### Ejecutar agente para un cliente
```bash
curl -X POST http://localhost:8000/api/ejecutar \
  -H "Content-Type: application/json" \
  -d '{"id_cliente": "C001"}'
```

### Ejecutar para todos los clientes
```bash
curl -X POST http://localhost:8000/api/ejecutar \
  -H "Content-Type: application/json" \
  -d '{"procesar_todos": true}'
```

## Deployment en AWS Lambda

1. Instalar dependencias:
```bash
mkdir package
pip install -r requirements.txt -t package/
cp -r app package/
cp app/lambda_handler.py package/
```

2. Crear ZIP:
```bash
cd package
zip -r ../lambda-deployment.zip .
```

3. Subir a Lambda:
   - Runtime: Python 3.11
   - Handler: `lambda_handler.handler`
   - Variables de entorno: `CLIENTES_CSV_PATH`, `OPENAI_API_KEY` (opcional)

## Troubleshooting

- **Error al cargar clientes**: Verifica que `data/clientes.csv` existe
- **Error de importación**: Asegúrate de estar en el directorio raíz y que el entorno virtual esté activado
- **Puerto ocupado**: Cambia el puerto en `uvicorn` o `docker-compose.yml`

