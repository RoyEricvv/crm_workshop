# 🔍 Cómo Verificar que GenAI está Funcionando

## ✅ Verificación Rápida

### 1. Script de Prueba (Recomendado)

Ejecuta el script de prueba que muestra claramente si GenAI está activo:

```bash
python3 test_genai.py
```

**Salida esperada cuando GenAI está activo:**
```
✅ [SEGMENTO] Aplicando segmentación usando GenAI (OpenAI)...
✅ [SEGMENTO] GenAI sugirió: medio_conservador
🤖 Modo: GenAI (OpenAI) - Decisiones inteligentes
```

**Salida cuando solo usa reglas:**
```
✅ [SEGMENTO] Aplicando segmentación usando Reglas determinísticas...
📐 Modo: Reglas determinísticas - Lógica predefinida
```

### 2. Verificar Configuración

```bash
# Verificar variables de entorno
cat .env | grep -E "(OPENAI_API_KEY|USE_GENAI)"

# Debe mostrar:
# OPENAI_API_KEY=sk-proj-...
# USE_GENAI=true
```

### 3. Probar desde la API

```bash
# Ejecutar agente y ver logs
curl -X POST http://localhost:8000/api/ejecutar \
  -H "Content-Type: application/json" \
  -d '{"id_cliente": "C001"}' | python3 -m json.tool
```

Busca en los logs:
- `"Aplicando segmentación usando GenAI (OpenAI)"` → ✅ GenAI activo
- `"Aplicando segmentación usando Reglas determinísticas"` → ❌ Solo reglas

### 4. Desde la Interfaz Web

1. Abre http://localhost:8000
2. Selecciona un cliente
3. Ejecuta el agente
4. Revisa los logs en la sección "Logs de Ejecución"
5. Busca el mensaje: **"Aplicando segmentación usando GenAI (OpenAI)"**

## 🔧 Cómo Activar GenAI

Si no está activo, edita el archivo `.env`:

```env
OPENAI_API_KEY=sk-tu-api-key-aqui
USE_GENAI=true
```

Luego reinicia el servidor (si está corriendo).

## 📊 Diferencias entre Modos

### Con GenAI (USE_GENAI=true)
- ✅ Usa OpenAI para decisiones de segmentación
- ✅ Logs muestran: "Aplicando segmentación usando GenAI (OpenAI)"
- ✅ Logs muestran: "GenAI sugirió: [segmento]"
- ✅ Puede tomar decisiones más inteligentes basadas en contexto

### Sin GenAI (USE_GENAI=false)
- ✅ Usa solo reglas determinísticas predefinidas
- ✅ Logs muestran: "Aplicando segmentación usando Reglas determinísticas"
- ✅ Más rápido (no hace llamadas a API)
- ✅ No consume créditos de OpenAI

## 🐛 Troubleshooting

### Problema: "USE_GENAI=true pero no se pudo inicializar LLM"
- Verifica que `OPENAI_API_KEY` esté correctamente configurada
- Verifica que la API key sea válida
- Verifica conexión a internet

### Problema: "Error en GenAI, usando reglas determinísticas"
- La API de OpenAI puede estar temporalmente no disponible
- Verifica tu saldo/créditos de OpenAI
- El sistema automáticamente usa reglas como fallback

### Problema: No veo mensajes de GenAI en los logs
- Verifica que `USE_GENAI=true` en `.env`
- Reinicia el servidor después de cambiar `.env`
- Verifica que el archivo `.env` esté en la raíz del proyecto

## 💡 Notas

- El grafo de estados (LangGraph) funciona igual en ambos modos
- GenAI solo se usa en el nodo de **SEGMENTACIÓN** actualmente
- Si GenAI falla, automáticamente usa reglas determinísticas (fallback seguro)
- Los otros nodos (PERFIL, CAMPAÑA, SALIDA) funcionan igual en ambos modos

