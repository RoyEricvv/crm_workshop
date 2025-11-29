"use client"

import { useState } from "react"
import type { AgentResult } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Download } from "lucide-react"

interface ResultsTableProps {
  results: AgentResult[]
  onViewResult: (result: AgentResult) => void
  onExportResult: (result: AgentResult, formato: "json" | "csv" | "html") => void
}

export function ResultsTable({ results, onViewResult, onExportResult }: ResultsTableProps) {
  if (results.length === 0) {
    return null
  }

  const getSegmentoBadgeColor = (tipo: string) => {
    if (tipo.includes("ALTO_VALOR") || tipo.includes("PREMIUM")) {
      return "bg-purple-100 text-purple-800"
    }
    if (tipo.includes("ESTANDAR") || tipo.includes("ESTÁNDAR")) {
      return "bg-blue-100 text-blue-800"
    }
    if (tipo.includes("BASICO") || tipo.includes("CRECIMIENTO")) {
      return "bg-green-100 text-green-800"
    }
    return "bg-red-100 text-red-800"
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 font-bold"
    if (score >= 60) return "text-blue-600 font-semibold"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados de Campañas ({results.length} cliente{results.length > 1 ? "s" : ""})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Campaña</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={`${result.cliente.id_cliente}-${index}`}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{result.cliente.nombre}</div>
                      <div className="text-xs text-muted-foreground">{result.cliente.id_cliente}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{result.cliente.sector}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSegmentoBadgeColor(result.segmento.tipo)}>
                      {result.segmento.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={getScoreColor(result.segmento.score)}>
                      {result.segmento.score}/100
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{result.campaña.plantilla}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {result.campaña.titulo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {result.campaña.canal_sugerido || result.cliente.red_social}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewResult(result)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
                          <div className="bg-white border rounded-md shadow-lg p-1 min-w-[120px]">
                            <button
                              onClick={() => onExportResult(result, "json")}
                              className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                            >
                              📋 JSON
                            </button>
                            <button
                              onClick={() => onExportResult(result, "csv")}
                              className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                            >
                              📊 CSV
                            </button>
                            <button
                              onClick={() => onExportResult(result, "html")}
                              className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                            >
                              📄 HTML
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

