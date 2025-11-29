import { agent } from "@/lib/agent"
import { MOCK_CLIENTES } from "@/lib/mock-data"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { clienteId } = await request.json()

    const cliente = MOCK_CLIENTES.find((c) => c.id_cliente === clienteId)
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    const result = await agent.execute(cliente)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Agent execution error:", error)
    return NextResponse.json({ error: "Error ejecutando agente" }, { status: 500 })
  }
}
