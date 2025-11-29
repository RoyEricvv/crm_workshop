@echo off
REM Script para levantar el backend con Docker en Windows

echo ========================================
echo   LEVANTANDO BACKEND CRM CON DOCKER
echo ========================================
echo.

REM Verificar si Docker está corriendo
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker no esta instalado o no esta corriendo
    echo.
    echo Soluciones:
    echo 1. Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    echo 2. Abre Docker Desktop y espera a que inicie
    echo.
    pause
    exit /b 1
)

REM Verificar que estamos en el directorio correcto
if not exist "docker-compose.yml" (
    echo Error: No estas en el directorio Backend/
    echo.
    echo Ejecuta: cd Backend
    echo.
    pause
    exit /b 1
)

REM Verificar que existe el archivo CSV
if not exist "data\clientes.csv" (
    echo Advertencia: No se encuentra data\clientes.csv
    echo El backend podria no funcionar correctamente.
    echo.
    pause
)

echo Verificando archivo .env...
if not exist ".env" (
    echo.
    echo No se encuentra .env, creando desde env.example...
    copy env.example .env >nul
    echo Archivo .env creado.
    echo IMPORTANTE: Edita .env si quieres usar GenAI
    echo.
    timeout /t 3 >nul
)

echo.
echo ========================================
echo Construyendo e iniciando contenedor...
echo ========================================
echo.
echo Esto puede tardar unos minutos la primera vez.
echo.

REM Levantar con docker-compose
docker-compose up --build

REM Si el usuario presiona Ctrl+C, ejecutar cleanup
:cleanup
echo.
echo ========================================
echo Deteniendo contenedor...
echo ========================================
docker-compose down

echo.
echo Backend detenido.
echo.
pause

