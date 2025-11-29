"""
Script de prueba para verificar que el agente está usando OpenAI/GenAI
"""
import sys
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

from app.models import Cliente
from app.orquestador import OrquestadorAgente
from app.utils import cargar_clientes_csv

def main():
    print("🔍 Verificando Configuración de OpenAI\n")
    print("=" * 60)
    
    # Verificar variables de entorno
    api_key = os.getenv("OPENAI_API_KEY")
    use_genai = os.getenv("USE_GENAI", "false").lower() == "true"
    
    print(f"📋 Configuración:")
    print(f"   OPENAI_API_KEY: {'✅ Configurada' if api_key and api_key != 'tu_api_key_de_openai_aqui' else '❌ No configurada'}")
    if api_key and api_key != 'tu_api_key_de_openai_aqui':
        print(f"   API Key (primeros 10 chars): {api_key[:10]}...")
    print(f"   USE_GENAI: {use_genai}")
    print()
    
    if not api_key or api_key == 'tu_api_key_de_openai_aqui':
        print("⚠️  ADVERTENCIA: No hay API key configurada")
        print("   El agente usará solo reglas determinísticas\n")
    elif not use_genai:
        print("⚠️  ADVERTENCIA: USE_GENAI=false")
        print("   El agente usará solo reglas determinísticas")
        print("   Para usar GenAI, cambia USE_GENAI=true en el .env\n")
    else:
        print("✅ Configuración correcta para usar GenAI\n")
    
    print("=" * 60)
    print("\n🎯 Probando Agente de Campañas\n")
    
    # Cargar clientes
    try:
        clientes = cargar_clientes_csv("data/clientes.csv")
        print(f"✅ Cargados {len(clientes)} clientes\n")
    except Exception as e:
        print(f"❌ Error cargando clientes: {e}")
        return
    
    # Inicializar orquestador
    print(f"🔧 Inicializando orquestador (use_genai={use_genai})...")
    orquestador = OrquestadorAgente(use_genai=use_genai)
    
    if use_genai and orquestador.llm:
        print("✅ Orquestador con GenAI inicializado\n")
    elif use_genai and not orquestador.llm:
        print("⚠️  USE_GENAI=true pero no se pudo inicializar LLM")
        print("   Verifica tu API key\n")
    else:
        print("✅ Orquestador con reglas determinísticas inicializado\n")
    
    # Procesar primer cliente como ejemplo
    cliente = clientes[0]
    print(f"📋 Procesando cliente: {cliente.nombre} ({cliente.id_cliente})")
    print(f"   Sector: {cliente.sector}")
    print(f"   Gasto promedio: ${cliente.gasto_promedio}")
    print(f"   Riesgo: {cliente.riesgo}")
    print(f"   Red social: {cliente.red_social}\n")
    
    # Ejecutar agente
    print("🚀 Ejecutando agente...")
    print("-" * 60)
    resultado = orquestador.ejecutar(cliente)
    print("-" * 60)
    
    # Mostrar logs
    print("\n📊 Logs de ejecución:")
    for log in resultado.logs:
        estado_icon = "✅" if log['estado'] != "ERROR" else "❌"
        print(f"   {estado_icon} [{log['estado']}] {log['mensaje']}")
    
    print(f"\n✅ Estado final: {resultado.estado_actual.value}\n")
    
    # Mostrar resultado
    if resultado.resultado:
        print("🎉 Resultado:")
        print(f"   Segmento: {resultado.resultado.segmento}")
        print(f"   Campaña: {resultado.resultado.campaña.nombre}")
        print(f"   Canal: {resultado.resultado.campaña.canal}")
        print(f"   CTA: {resultado.resultado.campaña.cta}")
        
        if resultado.resultado.métricas_simuladas:
            print(f"\n📈 Métricas simuladas:")
            print(f"   CTR estimado: {resultado.resultado.métricas_simuladas.get('ctr_estimado', 'N/A')}")
            print(f"   Tasa de apertura: {resultado.resultado.métricas_simuladas.get('tasa_apertura_estimada', 'N/A')}")
        
        # Verificar si se usó GenAI
        if use_genai and orquestador.llm:
            print(f"\n🤖 Modo: GenAI (OpenAI) - Decisiones inteligentes")
        else:
            print(f"\n📐 Modo: Reglas determinísticas - Lógica predefinida")
    else:
        print("❌ No se generó resultado")
        if resultado.error:
            print(f"   Error: {resultado.error}")
    
    print("\n" + "=" * 60)
    print("\n💡 Nota: Para usar GenAI, asegúrate de tener:")
    print("   1. OPENAI_API_KEY configurada en .env")
    print("   2. USE_GENAI=true en .env")
    print("   3. Conexión a internet para llamar a la API de OpenAI")

if __name__ == "__main__":
    main()

