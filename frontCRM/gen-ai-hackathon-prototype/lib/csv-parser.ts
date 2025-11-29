import type { Cliente } from "./types"

/**
 * Parsea un archivo CSV y retorna un array de Clientes
 * Espera el formato: id_cliente,nombre,sector,gasto_promedio,riesgo,red_social
 */
export function parseCSV(csvContent: string): Cliente[] {
  const lines = csvContent.trim().split("\n")
  
  if (lines.length < 2) {
    throw new Error("El CSV debe tener al menos una fila de encabezados y una fila de datos")
  }

  // Obtener encabezados (primera línea)
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase())

  // Validar encabezados requeridos
  const requiredHeaders = ["id_cliente", "nombre", "sector", "gasto_promedio", "riesgo", "red_social"]
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
  
  if (missingHeaders.length > 0) {
    throw new Error(`Faltan columnas requeridas: ${missingHeaders.join(", ")}`)
  }

  // Obtener índices de las columnas
  const idIndex = headers.indexOf("id_cliente")
  const nombreIndex = headers.indexOf("nombre")
  const sectorIndex = headers.indexOf("sector")
  const gastoIndex = headers.indexOf("gasto_promedio")
  const riesgoIndex = headers.indexOf("riesgo")
  const redSocialIndex = headers.indexOf("red_social")

  // Parsear filas de datos
  const clientes: Cliente[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Saltar líneas vacías

    // Parsear CSV considerando comillas
    const values = parseCSVLine(line)

    if (values.length < requiredHeaders.length) {
      console.warn(`Fila ${i + 1} tiene menos columnas de las esperadas, saltando...`)
      continue
    }

    try {
      const cliente: Cliente = {
        id_cliente: values[idIndex]?.trim() || "",
        nombre: values[nombreIndex]?.trim() || "",
        sector: values[sectorIndex]?.trim().toLowerCase() || "",
        gasto_promedio: parseFloat(values[gastoIndex]?.trim() || "0") || 0,
        riesgo: normalizeRiesgo(values[riesgoIndex]?.trim() || ""),
        red_social: normalizeRedSocial(values[redSocialIndex]?.trim() || ""),
      }

      // Validar que tenga datos mínimos
      if (!cliente.id_cliente || !cliente.nombre) {
        console.warn(`Fila ${i + 1} tiene datos incompletos, saltando...`)
        continue
      }

      clientes.push(cliente)
    } catch (error) {
      console.error(`Error parseando fila ${i + 1}:`, error)
      continue
    }
  }

  return clientes
}

/**
 * Parsea una línea de CSV considerando comillas y valores con comas
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      values.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  // Agregar el último valor
  values.push(current.trim())

  return values
}

/**
 * Normaliza el valor de riesgo (acepta mayúsculas, minúsculas, etc.)
 */
function normalizeRiesgo(riesgo: string): "BAJO" | "MEDIO" | "ALTO" | "bajo" | "medio" | "alto" {
  const normalized = riesgo.toLowerCase()
  
  if (normalized === "bajo" || normalized === "low") {
    return "bajo"
  } else if (normalized === "medio" || normalized === "medium" || normalized === "med") {
    return "medio"
  } else if (normalized === "alto" || normalized === "high") {
    return "alto"
  }
  
  // Default
  return "medio"
}

/**
 * Normaliza el valor de red social
 */
function normalizeRedSocial(red: string): Cliente["red_social"] {
  const normalized = red.toLowerCase()
  
  const redSocialMap: Record<string, Cliente["red_social"]> = {
    instagram: "instagram",
    facebook: "facebook",
    linkedin: "linkedin",
    twitter: "twitter",
  }

  return redSocialMap[normalized] || "instagram" // Default
}

/**
 * Lee un archivo CSV desde una URL o path
 */
export async function loadCSVFromURL(url: string): Promise<Cliente[]> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error cargando CSV: ${response.statusText}`)
    }
    const csvContent = await response.text()
    return parseCSV(csvContent)
  } catch (error) {
    console.error("Error cargando CSV desde URL:", error)
    throw error
  }
}

/**
 * Lee un archivo CSV desde un File object (upload)
 */
export async function loadCSVFromFile(file: File): Promise<Cliente[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string
        const clientes = parseCSV(csvContent)
        resolve(clientes)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error("Error leyendo el archivo"))
    }
    
    reader.readAsText(file, "UTF-8")
  })
}

