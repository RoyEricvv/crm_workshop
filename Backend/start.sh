#!/bin/bash
# Script para Linux/Mac - Iniciar backend y verificar configuración

echo "========================================"
echo "   INICIANDO BACKEND CRM INTELIGENTE"
echo "========================================"
echo ""

# Verificar directorio
if [ ! -f "app/main.py" ]; then
    echo "❌ Error: No estás en el directorio Backend/"
    echo "💡 Ejecuta: cd Backend"
    exit 1
fi

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python no encontrado"
    echo "💡 Instala Python 3.11+ desde python.org"
    exit 1
fi

# Verificar configuración
echo "🔍 Verificando configuración..."
python3 check_config.py
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error en la verificación. Lee los mensajes arriba."
    exit 1
fi

echo ""
echo "========================================"
echo "🚀 Iniciando servidor en http://localhost:8000"
echo "   Presiona Ctrl+C para detener"
echo "========================================"
echo ""

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

