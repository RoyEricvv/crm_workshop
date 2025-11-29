#!/bin/bash
# Script para levantar el backend con Docker en Linux/Mac

echo "========================================"
echo "  LEVANTANDO BACKEND CRM CON DOCKER"
echo "========================================"
echo ""

# Verificar si Docker está corriendo
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo ""
    echo "Soluciones:"
    echo "1. Instala Docker: https://docs.docker.com/get-docker/"
    echo "2. Inicia el servicio Docker"
    echo ""
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: No estás en el directorio Backend/"
    echo ""
    echo "Ejecuta: cd Backend"
    echo ""
    exit 1
fi

# Verificar que existe el archivo CSV
if [ ! -f "data/clientes.csv" ]; then
    echo "⚠️ Advertencia: No se encuentra data/clientes.csv"
    echo "El backend podría no funcionar correctamente."
    echo ""
    read -p "Presiona Enter para continuar..."
fi

# Verificar archivo .env
echo "🔍 Verificando archivo .env..."
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 No se encuentra .env, creando desde env.example..."
    cp env.example .env
    echo "✅ Archivo .env creado."
    echo "⚠️ IMPORTANTE: Edita .env si quieres usar GenAI"
    echo ""
    sleep 3
fi

echo ""
echo "========================================"
echo "🐳 Construyendo e iniciando contenedor..."
echo "========================================"
echo ""
echo "Esto puede tardar unos minutos la primera vez."
echo "Presiona Ctrl+C para detener el servidor."
echo ""

# Trap para cleanup
trap cleanup EXIT INT TERM

cleanup() {
    echo ""
    echo "========================================"
    echo "🛑 Deteniendo contenedor..."
    echo "========================================"
    docker-compose down
    echo ""
    echo "✅ Backend detenido."
    echo ""
}

# Levantar con docker-compose
docker-compose up --build

