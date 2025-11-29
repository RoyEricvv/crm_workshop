import { AgentExecutor } from "@/components/agent-executor"

export const metadata = {
  title: "GenAI Hackathon - Agente FSM",
  description: "Prototipo del Reto 1: Agente autónomo con FSM para campañas personalizadas",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">🤖 Agente FSM GenAI</h1>
          <p className="text-muted-foreground mt-2">
            Reto 1 Hackathon 2025: Orquestador autónomo con flujo determinista
          </p>
        </div>

        <AgentExecutor />

        <footer className="text-xs text-muted-foreground border-t border-border pt-4">
          <p>Prototipo de demostración - Datos totalmente simulados</p>
        </footer>
      </div>
    </main>
  )
}
