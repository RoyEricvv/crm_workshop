@echo off
chcp 65001 >nul
echo ========================================
echo   Configurando Backend CRM Workshop
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Creando entorno virtual...
if exist venv (
    echo   -^> El entorno virtual ya existe, saltando creacion...
) else (
    python -m venv venv
    if errorlevel 1 (
        echo   -^> Error al crear el entorno virtual
        pause
        exit /b 1
    )
    echo   -^> Entorno virtual creado exitosamente!
)

echo.
echo [2/3] Activando entorno e instalando dependencias...
call venv\Scripts\activate.bat

echo   -^> Actualizando pip...
python -m pip install --upgrade pip --quiet

echo   -^> Instalando requirements.txt...
pip install -r requirements.txt
if errorlevel 1 (
    echo   -^> Error al instalar dependencias
    pause
    exit /b 1
)
echo   -^> Dependencias instaladas exitosamente!

echo.
echo [3/3] Iniciando el servidor backend...
echo.
echo ========================================
echo   Backend corriendo en: http://localhost:8000
echo   Documentacion API: http://localhost:8000/docs
echo   Presiona Ctrl+C para detener
echo ========================================
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
