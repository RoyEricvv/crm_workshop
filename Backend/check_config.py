#!/usr/bin/env python3
"""
Script para verificar la configuración y comenzar el backend
"""
import os
import sys
from pathlib import Path


def verificar_archivos():
    """Verifica que existan los archivos necesarios"""
    print("🔍 Verificando archivos...")
    
    archivos_requeridos = [
        ("data/clientes.csv", "CSV de clientes"),
        ("app/main.py", "API principal"),
        ("requirements.txt", "Dependencias"),
    ]
    
    errores = []
    for archivo, descripcion in archivos_requeridos:
        if not Path(archivo).exists():
            errores.append(f"  ❌ Falta: {archivo} ({descripcion})")
        else:
            print(f"  ✅ {archivo}")
    
    if errores:
        print("\n❌ Faltan archivos:")
        for error in errores:
            print(error)
        return False
    
    return True


def verificar_env():
    """Verifica configuración del .env"""
    print("\n🔍 Verificando configuración...")
    
    if not Path(".env").exists():
        print("  ⚠️ Archivo .env no encontrado")
        print("  📝 Copiando .env.example a .env...")
        
        if Path("env.example").exists():
            import shutil
            shutil.copy("env.example", ".env")
            print("  ✅ Archivo .env creado")
            print("  ⚠️ IMPORTANTE: Edita .env y configura tus variables")
            return False
        else:
            print("  ❌ No se encontró env.example")
            return False
    
    # Leer .env
    from dotenv import load_dotenv
    load_dotenv()
    
    # Verificar variables importantes
    use_genai = os.getenv("USE_GENAI", "false")
    openai_key = os.getenv("OPENAI_API_KEY", "")
    csv_path = os.getenv("CLIENTES_CSV_PATH", "data/clientes.csv")
    
    print(f"  USE_GENAI: {use_genai}")
    print(f"  CLIENTES_CSV_PATH: {csv_path}")
    print(f"  OPENAI_API_KEY: {'configurado' if openai_key and len(openai_key) > 20 else 'no configurado'}")
    
    # Verificar si USE_GENAI tiene valor incorrecto
    if use_genai not in ["true", "false", "True", "False"]:
        print(f"\n  ⚠️ WARNING: USE_GENAI tiene valor incorrecto: '{use_genai}'")
        print(f"  Debe ser 'true' o 'false'")
        print(f"  Si pusiste la API key aquí, muévela a OPENAI_API_KEY")
        return False
    
    # Si USE_GENAI=true, verificar que haya API key
    if use_genai.lower() == "true" and (not openai_key or len(openai_key) < 20):
        print("\n  ⚠️ WARNING: USE_GENAI=true pero no hay OPENAI_API_KEY válida")
        print("  El sistema funcionará solo con reglas determinísticas")
    
    return True


def verificar_dependencias():
    """Verifica que las dependencias estén instaladas"""
    print("\n🔍 Verificando dependencias...")
    
    dependencias = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("pandas", "Pandas"),
        ("langchain", "LangChain"),
        ("langgraph", "LangGraph"),
    ]
    
    errores = []
    for modulo, nombre in dependencias:
        try:
            __import__(modulo)
            print(f"  ✅ {nombre}")
        except ImportError:
            errores.append(f"  ❌ {nombre} no instalado")
    
    if errores:
        print("\n❌ Faltan dependencias:")
        for error in errores:
            print(error)
        print("\n💡 Ejecuta: pip install -r requirements.txt")
        return False
    
    return True


def main():
    """Función principal"""
    print("=" * 60)
    print("🤖 VERIFICACIÓN DE CONFIGURACIÓN - CRM INTELIGENTE")
    print("=" * 60)
    
    # Verificar directorio
    if not Path("app").exists():
        print("\n❌ Error: No estás en el directorio Backend/")
        print("💡 Ejecuta: cd Backend")
        sys.exit(1)
    
    # Verificaciones
    if not verificar_archivos():
        sys.exit(1)
    
    if not verificar_env():
        sys.exit(1)
    
    if not verificar_dependencias():
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ TODAS LAS VERIFICACIONES PASARON")
    print("=" * 60)
    
    print("\n🚀 Listo para iniciar el servidor!")
    print("\n📝 Comandos:")
    print("  • Desarrollo:  uvicorn app.main:app --reload")
    print("  • Producción:  uvicorn app.main:app --host 0.0.0.0 --port 8000")
    print("  • Docker:      docker-compose up")
    
    print("\n📡 Endpoints disponibles:")
    print("  • GET  /api/clientes")
    print("  • POST /api/agente/ejecutar")
    print("  • GET  /api/agente/logs/:sessionId (SSE)")
    print("  • GET  /api/resultados/:sessionId")
    print("  • GET  /api/export/:sessionId/:formato")
    
    print("\n🌐 Después de iniciar:")
    print("  • Backend:  http://localhost:8000")
    print("  • Docs:     http://localhost:8000/docs")
    print("  • Health:   http://localhost:8000/health")
    
    print("\n💡 Recuerda configurar el frontend:")
    print("  cd frontCRM/gen-ai-hackathon-prototype")
    print("  echo 'NEXT_PUBLIC_BACKEND_URL=http://localhost:8000' > .env.local")
    print("  npm run dev")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()

