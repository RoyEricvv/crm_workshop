"use client"

import type { FSMState } from "@/lib/types"
import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

const ESTADOS: FSMState[] = ["INGESTA", "PERFIL", "SEGMENTO", "CAMPAÑA", "SALIDA", "FIN"]

const ESTADO_LABELS: Record<FSMState, string> = {
  INGESTA: "Ingesta",
  PERFIL: "Perfil",
  SEGMENTO: "Segmento",
  CAMPAÑA: "Campaña",
  SALIDA: "Salida",
  FIN: "Finalizado",
}

interface StateStepperProps {
  currentState: FSMState | null
  completedStates: FSMState[]
  className?: string
}

export function StateStepper({ currentState, completedStates, className }: StateStepperProps) {
  const getStateStatus = (estado: FSMState) => {
    if (completedStates.includes(estado)) {
      return "completed"
    }
    if (currentState === estado) {
      return "active"
    }
    return "pending"
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {ESTADOS.map((estado, index) => {
          const status = getStateStatus(estado)
          const isLast = index === ESTADOS.length - 1

          return (
            <div key={estado} className="flex items-center flex-1">
              {/* Estado */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    status === "completed" && "bg-green-500 border-green-500 text-white",
                    status === "active" && "bg-blue-500 border-blue-500 text-white animate-pulse",
                    status === "pending" && "bg-gray-200 border-gray-300 text-gray-500"
                  )}
                >
                  {status === "completed" ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center",
                    status === "completed" && "text-green-600",
                    status === "active" && "text-blue-600 font-bold",
                    status === "pending" && "text-gray-400"
                  )}
                >
                  {ESTADO_LABELS[estado]}
                </span>
              </div>

              {/* Línea conectora */}
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    status === "completed" ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

