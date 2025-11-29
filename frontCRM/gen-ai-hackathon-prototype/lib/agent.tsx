import type { Cliente, PerfilSocial, Segmento, Campaña, LogEntry, FSMState, AgentResult } from "./types"

class PerfiladorSocialMock {
  profile(cliente: Cliente): PerfilSocial {
    // Normalizar red social
    const redSocialNormalizada = cliente.red_social.toLowerCase()
    
    // Generar señales simuladas basadas en la red social
    // Cada red social tiene características diferentes
    let baseEngagement = 0.02
    let baseFollowers = 1000
    let avgLikes = 100
    let sentimentRange = { min: -0.5, max: 0.8 }
    
    switch (redSocialNormalizada) {
      case "instagram":
        baseEngagement = Math.random() * 0.12 + 0.03 // 3-15% típico en Instagram
        baseFollowers = Math.floor(Math.random() * 50000) + 5000
        avgLikes = Math.floor(Math.random() * 3000) + 200
        sentimentRange = { min: -0.3, max: 0.9 } // Instagram suele ser más positivo
        break
      case "facebook":
        baseEngagement = Math.random() * 0.08 + 0.02 // 2-10% en Facebook
        baseFollowers = Math.floor(Math.random() * 100000) + 10000
        avgLikes = Math.floor(Math.random() * 2000) + 150
        sentimentRange = { min: -0.4, max: 0.7 }
        break
      case "linkedin":
        baseEngagement = Math.random() * 0.06 + 0.01 // 1-7% en LinkedIn (más profesional)
        baseFollowers = Math.floor(Math.random() * 20000) + 2000
        avgLikes = Math.floor(Math.random() * 500) + 50
        sentimentRange = { min: -0.2, max: 0.6 } // LinkedIn más neutral
        break
      case "twitter":
        baseEngagement = Math.random() * 0.10 + 0.02 // 2-12% en Twitter
        baseFollowers = Math.floor(Math.random() * 30000) + 3000
        avgLikes = Math.floor(Math.random() * 1000) + 100
        sentimentRange = { min: -0.8, max: 0.8 } // Twitter puede ser más polarizado
        break
      default:
        baseEngagement = Math.random() * 0.10 + 0.02
        baseFollowers = Math.floor(Math.random() * 50000) + 5000
        avgLikes = Math.floor(Math.random() * 2000) + 100
    }

    // Generar frecuencia de actividad basada en engagement
    let activityFreq: "BAJA" | "MEDIA" | "ALTA" = "MEDIA"
    if (baseEngagement > 0.08) {
      activityFreq = "ALTA"
    } else if (baseEngagement < 0.04) {
      activityFreq = "BAJA"
    }

    // Generar sentiment score dentro del rango de la red social
    const sentimentScore = 
      Math.random() * (sentimentRange.max - sentimentRange.min) + sentimentRange.min

    return {
      engagement_rate: Math.min(baseEngagement, 0.15),
      followers: baseFollowers,
      avg_likes: avgLikes,
      sentiment_score: Math.max(-1, Math.min(1, sentimentScore)),
      activity_freq: activityFreq,
    }
  }
}

class Segmentador {
  segment(cliente: Cliente, perfil: PerfilSocial): Segmento {
    let score = 0
    let tipo: "ALTO_VALOR" | "ESTANDAR" | "BASICO" = "ESTANDAR"
    let rationale = ""

    // Normalizar valores (aceptar mayúsculas y minúsculas)
    const sectorNormalizado = cliente.sector.toLowerCase()
    const riesgoNormalizado = cliente.riesgo.toLowerCase()

    // Lógica de segmentación basada en sector, riesgo, gasto y señales sociales
    // Sector de alto valor
    if (sectorNormalizado === "tecnología" || sectorNormalizado === "finanzas" || sectorNormalizado === "energía") {
      score += 30
      rationale += "Sector de alto valor. "
    }

    // Gasto promedio
    if (cliente.gasto_promedio > 50000) {
      score += 35
      rationale += "Alto gasto promedio. "
      tipo = "ALTO_VALOR"
    } else if (cliente.gasto_promedio > 25000) {
      score += 20
      rationale += "Gasto medio-alto. "
      tipo = "ESTANDAR"
    } else {
      score += 10
      rationale += "Gasto básico. "
      tipo = "BASICO"
    }

    // Riesgo crediticio
    if (riesgoNormalizado === "alto") {
      score -= 20
      rationale += "Alto riesgo crediticio. "
      if (tipo === "ALTO_VALOR") {
        tipo = "ESTANDAR" // Degradar segmento por riesgo
      } else if (tipo === "ESTANDAR") {
        tipo = "BASICO"
      }
    } else if (riesgoNormalizado === "medio") {
      score -= 5
      rationale += "Riesgo medio. "
    } else {
      score += 10
      rationale += "Bajo riesgo crediticio. "
    }

    // Señales sociales del perfil
    if (perfil.engagement_rate > 0.10) {
      score += 15
      rationale += "Alto engagement en redes. "
    } else if (perfil.engagement_rate > 0.05) {
      score += 8
      rationale += "Engagement moderado. "
    }

    if (perfil.sentiment_score > 0.5) {
      score += 10
      rationale += "Sentiment positivo en redes. "
    } else if (perfil.sentiment_score < -0.3) {
      score -= 10
      rationale += "Sentiment negativo detectado. "
    }

    if (perfil.followers > 50000) {
      score += 5
      rationale += "Audiencia amplia. "
    }

    if (perfil.activity_freq === "ALTA") {
      score += 8
      rationale += "Alta frecuencia de actividad. "
    }

    return {
      tipo,
      score: Math.max(0, Math.min(100, score)),
      rationale: rationale.trim() || "Segmentación estándar aplicada.",
    }
  }
}

class DecorCampaña {
  private templates = {
    PREMIUM_GROWTH: {
      titulo: "🚀 Solución Premium para tu Crecimiento",
      mensaje: "Diseñada exclusivamente para líderes del mercado como {{nombre}}.",
      cta: "Solicitar Demo Premium",
      color_tema: "#1E40AF", // Azul profundo
    },
    VALUE_FOCUSED: {
      titulo: "💼 Valor Real para tu Negocio",
      mensaje: "Descubre cómo {{nombre}} puede optimizar su operación.",
      cta: "Explorar Opciones",
      color_tema: "#059669", // Verde
    },
    RISK_MITIGATION: {
      titulo: "🛡️ Protege tu Operación",
      mensaje: "Soluciones robustas para {{nombre}} con garantías de éxito.",
      cta: "Contactar Especialista",
      color_tema: "#DC2626", // Rojo
    },
  }

  decideCampaign(segmento: Segmento): Campaña {
    let plantilla: "PREMIUM_GROWTH" | "VALUE_FOCUSED" | "RISK_MITIGATION"
    let canalSugerido = "email" // Default

    // Mapear segmentos a plantillas (soporta ambos formatos)
    switch (segmento.tipo) {
      case "ALTO_VALOR":
      case "PREMIUM":
        plantilla = "PREMIUM_GROWTH"
        canalSugerido = "linkedin"
        break
      case "ESTANDAR":
      case "ESTÁNDAR":
        plantilla = "VALUE_FOCUSED"
        canalSugerido = "email"
        break
      case "BASICO":
      case "CRECIMIENTO":
        plantilla = "VALUE_FOCUSED"
        canalSugerido = "email"
        break
      case "RIESGO":
        plantilla = "RISK_MITIGATION"
        canalSugerido = "email"
        break
      default:
        plantilla = "VALUE_FOCUSED"
        canalSugerido = "email"
    }

    return {
      plantilla,
      titulo: this.templates[plantilla].titulo,
      mensaje: this.templates[plantilla].mensaje,
      cta: this.templates[plantilla].cta,
      color_tema: this.templates[plantilla].color_tema,
      canal_sugerido: canalSugerido,
    }
  }
}

class Compositor {
  compose(cliente: Cliente, campaña: Campaña): string {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaña para ${cliente.nombre}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: ${campaña.color_tema}; color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .content { padding: 40px 20px; }
    .content p { font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px; }
    .cta-button { display: inline-block; background: ${campaña.color_tema}; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .meta { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${campaña.titulo}</h1>
    </div>
    <div class="content">
      <p>${campaña.mensaje.replace("{{nombre}}", cliente.nombre)}</p>
      <a href="#" class="cta-button">${campaña.cta}</a>
      <div class="meta">
        <p><strong>Sector:</strong> ${cliente.sector}</p>
        <p><strong>Categoría:</strong> Premium</p>
        <p><strong>Generada:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 GenAI Campaign Platform. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `.trim()
    return html
  }
}

class Orquestador {
  private perfilador = new PerfiladorSocialMock()
  private segmentador = new Segmentador()
  private decisor = new DecorCampaña()
  private compositor = new Compositor()
  private logs: LogEntry[] = []

  private addLog(state: FSMState, message: string, data?: Record<string, any>) {
    this.logs.push({
      state,
      timestamp: new Date().toISOString(),
      message,
      data,
    })
  }

  async execute(cliente: Cliente): Promise<AgentResult> {
    this.logs = []

    // INGESTA
    this.addLog("INGESTA", `Cliente cargado: ${cliente.nombre}`, { cliente })

    // PERFIL
    const perfil = this.perfilador.profile(cliente)
    this.addLog("PERFIL", `Perfil social generado`, { perfil })

    // SEGMENTO
    const segmento = this.segmentador.segment(cliente, perfil)
    this.addLog("SEGMENTO", `Segmentación completada: ${segmento.tipo}`, { segmento })

    // CAMPAÑA
    const campaña = this.decisor.decideCampaign(segmento)
    this.addLog("CAMPAÑA", `Campaña seleccionada: ${campaña.plantilla}`, { campaña })

    // SALIDA
    const htmlOutput = this.compositor.compose(cliente, campaña)
    this.addLog("SALIDA", `HTML generado exitosamente`)

    // FIN
    this.addLog("FIN", `Proceso completado exitosamente para ${cliente.nombre}`)

    return {
      cliente,
      perfil,
      segmento,
      campaña,
      logs: this.logs,
      htmlOutput,
    }
  }
}

export const agent = new Orquestador()
