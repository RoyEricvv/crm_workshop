import type { Cliente } from "./types"

export const MOCK_CLIENTES: Cliente[] = [
  {
    id_cliente: "C001",
    nombre: "María López",
    sector: "retail",
    gasto_promedio: 350.5,
    riesgo: "bajo",
    red_social: "instagram",
  },
  {
    id_cliente: "C002",
    nombre: "TechCorp Solutions",
    sector: "tecnología",
    gasto_promedio: 50000,
    riesgo: "bajo",
    red_social: "linkedin",
  },
  {
    id_cliente: "C003",
    nombre: "RetailHub SPA",
    sector: "retail",
    gasto_promedio: 25000,
    riesgo: "medio",
    red_social: "instagram",
  },
  {
    id_cliente: "C004",
    nombre: "FinanceWave Ltd",
    sector: "finanzas",
    gasto_promedio: 75000,
    riesgo: "bajo",
    red_social: "linkedin",
  },
  {
    id_cliente: "C005",
    nombre: "MediaStream Inc",
    sector: "medios",
    gasto_promedio: 15000,
    riesgo: "alto",
    red_social: "twitter",
  },
  {
    id_cliente: "C006",
    nombre: "HealthPlus Clinics",
    sector: "salud",
    gasto_promedio: 30000,
    riesgo: "bajo",
    red_social: "facebook",
  },
  {
    id_cliente: "C007",
    nombre: "EduTech Academy",
    sector: "educación",
    gasto_promedio: 12000,
    riesgo: "medio",
    red_social: "facebook",
  },
  {
    id_cliente: "C008",
    nombre: "GreenEnergy Corp",
    sector: "energía",
    gasto_promedio: 45000,
    riesgo: "bajo",
    red_social: "linkedin",
  },
]

export const downloadCSV = (): string => {
  const headers = ["id_cliente", "nombre", "sector", "gasto_promedio", "riesgo", "red_social"]
  const rows = MOCK_CLIENTES.map((c) => [c.id_cliente, c.nombre, c.sector, c.gasto_promedio, c.riesgo, c.red_social])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return csv
}
