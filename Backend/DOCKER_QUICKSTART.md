# 🐳 Guía Rápida para Docker

## 🚀 Opción 1: Docker Compose (Recomendado)

### Paso 1: Configurar Variables de Entorno

Edita tu archivo `.env` o crea uno nuevo:

```bash
# Backend/.env
OPENAI_API_KEY=tu_api_key_aqui
USE_GENAI=false
CLIENTES_CSV_PATH=/app/data/clientes.csv
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### Paso 2: Levantar el Backend

```bash
cd Backend

# Construir e iniciar
docker-compose up --build

# O en modo detached (segundo plano)
docker-compose up -d --build
```

### Paso 3: Verificar

```bash
# Ver logs
docker-compose logs -f backend

# Verificar que está corriendo
curl http://localhost:8000/health

# Ver clientes
curl http://localhost:8000/api/clientes
```

### Paso 4: Detener

```bash
# Detener
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar y limpiar volúmenes
docker-compose down -v
```

---

## 🐋 Opción 2: Docker Manual

### Construir la Imagen

```bash
cd Backend
docker build -t crm-backend:latest .
```

### Ejecutar el Contenedor

**Sin GenAI (más simple):**
```bash
docker run -d \
  --name crm-backend \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e CLIENTES_CSV_PATH=/app/data/clientes.csv \
  -e USE_GENAI=false \
  -e PORT=8000 \
  -e FRONTEND_URL=http://localhost:3000 \
  crm-backend:latest
```

**Con GenAI:**
```bash
docker run -d \
  --name crm-backend \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e CLIENTES_CSV_PATH=/app/data/clientes.csv \
  -e OPENAI_API_KEY=tu_api_key_aqui \
  -e USE_GENAI=true \
  -e PORT=8000 \
  -e FRONTEND_URL=http://localhost:3000 \
  crm-backend:latest
```

### Ver Logs

```bash
docker logs -f crm-backend
```

### Detener y Eliminar

```bash
docker stop crm-backend
docker rm crm-backend
```

---

## 📋 Comandos Útiles

### Ver Contenedores Activos
```bash
docker ps
```

### Entrar al Contenedor
```bash
docker exec -it crm-backend bash
```

### Ver Logs en Tiempo Real
```bash
# Con docker-compose
docker-compose logs -f

# Con docker
docker logs -f crm-backend
```

### Reconstruir (cuando cambias código)
```bash
# Con docker-compose
docker-compose up --build

# Con docker
docker build -t crm-backend:latest .
docker stop crm-backend
docker rm crm-backend
# Luego vuelve a ejecutar el docker run
```

---

## 🧪 Verificar que Funciona

### 1. Health Check
```bash
curl http://localhost:8000/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "clientes_loaded": 10,
  "use_genai": false
}
```

### 2. Obtener Clientes
```bash
curl http://localhost:8000/api/clientes
```

### 3. Ejecutar Agente
```bash
curl -X POST http://localhost:8000/api/agente/ejecutar \
  -H "Content-Type: application/json" \
  -d '{"clienteIds":["C001"]}'
```

### 4. Ver Documentación
Abre en el navegador: http://localhost:8000/docs

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to Docker daemon"
```bash
# Inicia Docker Desktop (Windows/Mac)
# O inicia el servicio Docker (Linux)
sudo systemctl start docker
```

### Error: "Port 8000 is already in use"
```bash
# Opción 1: Detén el proceso en el puerto 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9

# Opción 2: Usa otro puerto
docker-compose up  # Edita docker-compose.yml para cambiar el puerto
```

### Error: "Cannot find clientes.csv"
```bash
# Verifica que el archivo existe
ls -la Backend/data/clientes.csv

# Si no existe, créalo usando el ejemplo
```

### Contenedor se detiene inmediatamente
```bash
# Ver logs para identificar el error
docker-compose logs backend

# O con docker
docker logs crm-backend
```

### Cambios en el código no se reflejan
```bash
# Reconstruye la imagen
docker-compose up --build

# O fuerza la reconstrucción
docker-compose build --no-cache
docker-compose up
```

---

## 🌐 Conectar con el Frontend

Una vez que el backend esté corriendo:

```bash
# En otra terminal
cd frontCRM/gen-ai-hackathon-prototype

# Configura la URL del backend
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

# Inicia el frontend
npm run dev
```

Abre http://localhost:3000 y verás el sistema completo funcionando.

---

## 🎯 Comandos Rápidos (Cheat Sheet)

```bash
# INICIAR
cd Backend
docker-compose up -d --build

# VER LOGS
docker-compose logs -f

# VERIFICAR
curl http://localhost:8000/health

# DETENER
docker-compose down

# REINICIAR
docker-compose restart

# RECONSTRUIR
docker-compose up --build

# LIMPIAR TODO
docker-compose down -v
docker system prune -a
```

---

## 📊 Arquitectura Docker

```
┌─────────────────────────────────┐
│   Docker Container (Backend)    │
│                                  │
│  ┌───────────────────────────┐  │
│  │   FastAPI App (Port 8000) │  │
│  │   • /api/clientes         │  │
│  │   • /api/agente/ejecutar  │  │
│  │   • /api/agente/logs/:id  │  │
│  │   • /api/resultados/:id   │  │
│  │   • /api/export/:id/:fmt  │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │   Volumen: /app/data      │  │
│  │   → Backend/data (host)   │  │
│  └───────────────────────────┘  │
│                                  │
└──────────────┬──────────────────┘
               │ Port 8000
               ▼
         Host: localhost:8000
               │
               ▼
     Frontend (localhost:3000)
```

---

## ✅ Checklist

Antes de levantar Docker:

- [ ] Docker instalado y corriendo
- [ ] Archivo `.env` configurado (opcional, pero recomendado)
- [ ] Archivo `data/clientes.csv` existe
- [ ] Puerto 8000 está libre
- [ ] Estás en el directorio `Backend/`

Después de levantar:

- [ ] `docker ps` muestra el contenedor corriendo
- [ ] `curl http://localhost:8000/health` responde
- [ ] `curl http://localhost:8000/api/clientes` retorna datos
- [ ] Frontend puede conectarse al backend

---

**¡Listo! Tu backend está corriendo en Docker.** 🚀

