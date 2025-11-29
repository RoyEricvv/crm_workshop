@echo off
REM Script para Windows - Iniciar backend y verificar configuración

echo ========================================
echo    INICIANDO BACKEND CRM INTELIGENTE
echo ========================================
echo.

REM Verificar directorio
if not exist "app\main.py" (
    echo Error: No estas en el directorio Backend/
    echo Ejecuta: cd Backend
    pause
    exit /b 1
)

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python no encontrado
    echo Instala Python 3.11+ desde python.org
    pause
    exit /b 1
)

echo Verificando configuracion...
python check_config.py
if errorlevel 1 (
    echo.
    echo Error en la verificacion. Lee los mensajes arriba.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Iniciando servidor en http://localhost:8000
echo Presiona Ctrl+C para detener
echo ========================================
echo.

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

