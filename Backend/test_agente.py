"""
Script de prueba para el agente de campañas
Ejecuta el agente localmente sin necesidad del servidor web
"""
import sys
from app.models import Cliente
from app.orquestador import OrquestadorAgente
from app.utils import cargar_clientes_csv

def main():
    print("🎯 Probando Agente de Campañas\n")
    
    # Cargar clientes
    try:
        clientes = cargar_clientes_csv("data/clientes.csv")
        print(f"✅ Cargados {len(clientes)} clientes\n")
    except Exception as e:
        print(f"❌ Error cargando clientes: {e}")
        return
    
    # Inicializar orquestador
    orquestador = OrquestadorAgente(use_genai=False)
    print("✅ Orquestador inicializado\n")
    
    # Procesar primer cliente como ejemplo
    cliente = clientes[0]
    print(f"📋 Procesando cliente: {cliente.nombre} ({cliente.id_cliente})")
    print(f"   Sector: {cliente.sector}")
    print(f"   Gasto promedio: ${cliente.gasto_promedio}")
    print(f"   Riesgo: {cliente.riesgo}")
    print(f"   Red social: {cliente.red_social}\n")
    
    # Ejecutar agente
    resultado = orquestador.ejecutar(cliente)
    
    # Mostrar logs
    print("📊 Logs de ejecución:")
    for log in resultado.logs:
        print(f"   [{log['estado']}] {log['mensaje']}")
    
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
    else:
        print("❌ No se generó resultado")
        if resultado.error:
            print(f"   Error: {resultado.error}")

if __name__ == "__main__":
    main()

