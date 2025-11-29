import { MOCK_CLIENTES } from "@/lib/mock-data"
import { NextResponse } from "next/server"
import type { ClienteListResponse } from "@/lib/types"

export async function GET() {
  try {
    // Intentar obtener clientes del backend externo primero
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ""
    
    if (BACKEND_URL) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/clientes`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store"  // No cachear para obtener datos frescos
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Clientes obtenidos del backend: ${data.clientes?.length || 0}`)
          return NextResponse.json(data)
        }
      } catch (backendError) {
        console.warn("Backend no disponible, usando mock local:", backendError)
      }
    }

    // Fallback a mock local
    const responseData: ClienteListResponse = {
      clientes: MOCK_CLIENTES,
      total: MOCK_CLIENTES.length,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error obteniendo clientes:", error)
    return NextResponse.json(
      { error: "Error obteniendo clientes" },
      { status: 500 }
    )
  }
}

