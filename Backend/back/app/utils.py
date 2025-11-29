"""
Utilidades para carga de datos y exportación
"""
import pandas as pd
import json
from typing import List, Dict
from pathlib import Path
from app.models import Cliente, ResultadoCampaña


def cargar_clientes_csv(ruta_csv: str) -> List[Cliente]:
    """
    Carga clientes desde un archivo CSV
    
    Args:
        ruta_csv: Ruta al archivo CSV
        
    Returns:
        Lista de clientes
    """
    df = pd.read_csv(ruta_csv)
    clientes = []
    
    for _, row in df.iterrows():
        cliente = Cliente(
            id_cliente=str(row["id_cliente"]),
            nombre=str(row["nombre"]),
            sector=str(row["sector"]),
            gasto_promedio=float(row["gasto_promedio"]),
            riesgo=str(row["riesgo"]),
            red_social=str(row["red_social"])
        )
        clientes.append(cliente)
    
    return clientes


def exportar_resultados_json(resultados: List[ResultadoCampaña]) -> str:
    """
    Exporta resultados a formato JSON
    
    Args:
        resultados: Lista de resultados de campaña
        
    Returns:
        JSON string
    """
    datos = []
    for resultado in resultados:
        datos.append(resultado.mensaje_json)
    
    return json.dumps(datos, indent=2, ensure_ascii=False)


def exportar_resultados_csv(resultados: List[ResultadoCampaña]) -> str:
    """
    Exporta resultados a formato CSV
    
    Args:
        resultados: Lista de resultados de campaña
        
    Returns:
        CSV string
    """
    datos = []
    for resultado in resultados:
        datos.append({
            "id_cliente": resultado.id_cliente,
            "nombre": resultado.nombre,
            "segmento": resultado.segmento,
            "id_campaña": resultado.campaña.id_campaña,
            "nombre_campaña": resultado.campaña.nombre,
            "canal": resultado.campaña.canal,
            "cta": resultado.campaña.cta,
            "ctr_estimado": resultado.métricas_simuladas.get("ctr_estimado") if resultado.métricas_simuladas else None,
            "tasa_apertura": resultado.métricas_simuladas.get("tasa_apertura_estimada") if resultado.métricas_simuladas else None
        })
    
    df = pd.DataFrame(datos)
    return df.to_csv(index=False)


def exportar_resultados_html(resultados: List[ResultadoCampaña]) -> str:
    """
    Exporta resultados a formato HTML (tabla)
    
    Args:
        resultados: Lista de resultados de campaña
        
    Returns:
        HTML string
    """
    html = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resultados de Campañas</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: bold;
        }
        .segmento-premium { background-color: #FFD700; color: #333; }
        .segmento-medio { background-color: #87CEEB; color: #333; }
        .segmento-basico { background-color: #98FB98; color: #333; }
        .segmento-riesgo { background-color: #FFB6C1; color: #333; }
    </style>
</head>
<body>
    <h1>Resultados de Campañas</h1>
    <table>
        <thead>
            <tr>
                <th>ID Cliente</th>
                <th>Nombre</th>
                <th>Segmento</th>
                <th>Campaña</th>
                <th>Canal</th>
                <th>CTR Estimado</th>
                <th>Tasa Apertura</th>
            </tr>
        </thead>
        <tbody>
    """
    
    for resultado in resultados:
        segmento_class = f"segmento-{resultado.segmento.split('_')[0]}"
        html += f"""
            <tr>
                <td>{resultado.id_cliente}</td>
                <td>{resultado.nombre}</td>
                <td><span class="badge {segmento_class}">{resultado.segmento}</span></td>
                <td>{resultado.campaña.nombre}</td>
                <td>{resultado.campaña.canal}</td>
                <td>{resultado.métricas_simuladas.get('ctr_estimado', 'N/A') if resultado.métricas_simuladas else 'N/A'}</td>
                <td>{resultado.métricas_simuladas.get('tasa_apertura_estimada', 'N/A') if resultado.métricas_simuladas else 'N/A'}</td>
            </tr>
        """
    
    html += """
        </tbody>
    </table>
</body>
</html>
    """
    
    return html

