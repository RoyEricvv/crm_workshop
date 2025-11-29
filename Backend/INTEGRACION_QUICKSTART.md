# 🚀 Guía Rápida de Integración Frontend ↔ Backend

## ⚡ Inicio Rápido (5 minutos)

### 1. Configurar Backend

```bash
cd Backend

# Verifica/edita tu archivo .env
# Debe tener:
# OPENAI_API_KEY=sk-...  (tu API key real)
# USE_GENAI=true         (true o false, NO la API key)
# CLIENTES_CSV_PATH=data/clientes.csv
# PORT=8000
# FRONTEND_URL=http://localhost:3000

# Instalar dependencias (solo primera vez)
pip install -r requirements.txt

# Ejecutar backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Deberías ver:
```
✅ Cargados 10 clientes desde data/clientes.csv
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Configurar Frontend

```bash
cd frontCRM/gen-ai-hackathon-prototype

# Crear archivo .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

# Instalar dependencias (solo primera vez si no está hecho)
npm install

# Ejecutar frontend
npm run dev
```

Deberías ver:
```
▲ Next.js 16.0.3
- Local:   http://localhost:3000
```

### 3. Probar Integración

1. Abre http://localhost:3000
2. Verás la interfaz del CRM
3. Los clientes deberían cargarse desde el backend
4. Selecciona un cliente y ejecuta el agente
5. Verás logs en tiempo real
6. Al terminar, verás los resultados
7. Exporta en JSON/CSV/HTML

---

## ✅ Checklist de Verificación

- [ ] Backend corriendo en http://localhost:8000
- [ ] Frontend corriendo en http://localhost:3000
- [ ] `curl http://localhost:8000/health` responde `{"status":"healthy"}`
- [ ] `curl http://localhost:8000/api/clientes` retorna lista de clientes
- [ ] Frontend muestra clientes en el selector
- [ ] Al ejecutar agente, aparecen logs en tiempo real
- [ ] Los resultados se muestran correctamente
- [ ] La exportación funciona (JSON/CSV/HTML)

---

## 🔧 Estructura de Archivos Importante

```
Backend/
├── .env                    ← VERIFICA ESTE ARCHIVO
├── data/
│   └── clientes.csv        ← CSV con 10 clientes
├── app/
│   ├── main.py             ← API actualizada v2.0
│   ├── models.py           ← Modelos actualizados
│   ├── session_manager.py  ← Nuevo: gestión de sesiones
│   ├── adapters.py         ← Nuevo: transformación de datos
│   └── ...                 ← Resto de módulos

frontCRM/gen-ai-hackathon-prototype/
├── .env.local              ← CREAR ESTE ARCHIVO
│   └── NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
├── lib/
│   ├── api.ts              ← Ya configurado para conectar
│   └── ...
└── ...
```

---

## 🐛 Solución de Problemas Comunes

### Error: "ModuleNotFoundError: No module named 'app'"

Estás ejecutando desde el directorio incorrecto. Asegúrate de estar en `Backend/`:
```bash
cd Backend
python -c "import app; print('✅ OK')"
```

### Error: "OPENAI_API_KEY not found"

Si NO quieres usar GenAI:
```bash
# En .env, pon:
USE_GENAI=false
```

Si SÍ quieres usar GenAI:
```bash
# En .env, pon:
OPENAI_API_KEY=sk-proj-tu_key_real_aqui
USE_GENAI=true
```

### Error: "Sesión no encontrada"

La sesión expira o no se creó correctamente:
- Verifica que el endpoint `/api/agente/ejecutar` retorne un `sessionId`
- Revisa los logs del backend
- Reinicia el backend

### Frontend muestra "Error cargando clientes"

- Verifica que el backend esté corriendo
- Verifica CORS en el backend (debe permitir `http://localhost:3000`)
- Verifica la variable `NEXT_PUBLIC_BACKEND_URL` en el frontend

### Logs no aparecen en tiempo real

- Verifica la consola del navegador (F12)
- Busca errores de EventSource
- Prueba manualmente: `curl http://localhost:8000/api/agente/logs/session_test`

---

## 📦 Paquetes Necesarios

Backend:
- fastapi
- uvicorn
- langchain / langgraph
- pandas
- python-dotenv

Frontend:
- next
- react
- tailwindcss
- shadcn/ui

---

## 🎯 Próximos Pasos

Una vez que todo funcione:
1. Prueba con diferentes clientes
2. Prueba selección múltiple
3. Exporta resultados en todos los formatos
4. Opcional: Activa GenAI para mensajes más personalizados

---

**¿Problemas? Revisa:**
1. Backend logs: en la terminal donde corre uvicorn
2. Frontend logs: en la consola del navegador (F12)
3. Variables de entorno en ambos proyectos

