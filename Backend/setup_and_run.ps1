# =======================================
# Script para configurar y ejecutar el Backend CRM
# =======================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurando Backend CRM Workshop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ir al directorio del Backend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Paso 1: Crear entorno virtual
Write-Host "[1/3] Creando entorno virtual..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "  -> El entorno virtual ya existe, saltando creacion..." -ForegroundColor Gray
} else {
    python -m venv venv
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  -> Entorno virtual creado exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "  -> Error al crear el entorno virtual" -ForegroundColor Red
        exit 1
    }
}

# Paso 2: Activar entorno virtual e instalar dependencias
Write-Host ""
Write-Host "[2/3] Activando entorno e instalando dependencias..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host "  -> Actualizando pip..." -ForegroundColor Gray
python -m pip install --upgrade pip --quiet

Write-Host "  -> Instalando requirements.txt..." -ForegroundColor Gray
pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "  -> Dependencias instaladas exitosamente!" -ForegroundColor Green
} else {
    Write-Host "  -> Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

# Paso 3: Ejecutar el backend
Write-Host ""
Write-Host "[3/3] Iniciando el servidor backend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend corriendo en: http://localhost:8000" -ForegroundColor Green
Write-Host "  Documentacion API: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Presiona Ctrl+C para detener" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
