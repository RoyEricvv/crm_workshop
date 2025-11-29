"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { loadCSVFromFile, loadCSVFromURL, parseCSV } from "@/lib/csv-parser"
import type { Cliente } from "@/lib/types"

interface CSVLoaderProps {
  onClientesLoaded: (clientes: Cliente[]) => void
  currentCount?: number
}

export function CSVLoader({ onClientesLoaded, currentCount = 0 }: CSVLoaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [csvUrl, setCsvUrl] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  
  // Evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar extensión
    if (!file.name.endsWith(".csv")) {
      setError("Por favor, selecciona un archivo CSV")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const clientes = await loadCSVFromFile(file)
      
      if (clientes.length === 0) {
        throw new Error("El CSV no contiene clientes válidos")
      }

      onClientesLoaded(clientes)
      setSuccess(`✅ ${clientes.length} cliente(s) cargado(s) exitosamente`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando el CSV")
    } finally {
      setIsLoading(false)
      // Resetear input
      event.target.value = ""
    }
  }

  const handleLoadFromURL = async () => {
    if (!csvUrl.trim()) {
      setError("Por favor, ingresa una URL válida")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const clientes = await loadCSVFromURL(csvUrl.trim())
      
      if (clientes.length === 0) {
        throw new Error("El CSV no contiene clientes válidos")
      }

      onClientesLoaded(clientes)
      setSuccess(`✅ ${clientes.length} cliente(s) cargado(s) desde URL`)
      setCsvUrl("") // Limpiar URL
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando el CSV desde URL")
    } finally {
      setIsLoading(false)
    }
  }

  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false)
  const [csvText, setCsvText] = useState("")

  const handlePasteCSV = () => {
    try {
      const csvContent = csvText.trim()
      if (!csvContent) {
        setError("Por favor, pega el contenido del CSV")
        return
      }

      const clientes = parseCSV(csvContent)
      if (clientes.length === 0) {
        throw new Error("El CSV no contiene clientes válidos")
      }

      onClientesLoaded(clientes)
      setSuccess(`✅ ${clientes.length} cliente(s) cargado(s) desde texto`)
      setCsvText("")
      setIsPasteDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error parseando CSV")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Cargar Clientes desde CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentCount > 0 && (
          <div className="text-sm text-muted-foreground">
            Actualmente cargados: <span className="font-semibold">{currentCount} cliente(s)</span>
          </div>
        )}

        {/* Opción 1: Subir archivo */}
        <div className="space-y-2">
          <Label htmlFor="csv-file">Subir archivo CSV</Label>
          <div className="flex items-center gap-2">
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isMounted) {
                  document.getElementById("csv-file")?.click()
                }
              }}
              disabled={isLoading || !isMounted}
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar
            </Button>
          </div>
        </div>

        {/* Opción 2: Cargar desde URL */}
        <div className="space-y-2">
          <Label htmlFor="csv-url">Cargar desde URL</Label>
          <div className="flex items-center gap-2">
            <Input
              id="csv-url"
              type="url"
              placeholder="https://ejemplo.com/clientes.csv"
              value={csvUrl}
              onChange={(e) => setCsvUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleLoadFromURL}
              disabled={isLoading || !csvUrl.trim()}
              size="sm"
            >
              Cargar
            </Button>
          </div>
        </div>

        {/* Opción 3: Pegar CSV */}
        <div className="space-y-2">
          <Label>Pegar contenido CSV</Label>
          {isMounted ? (
            <Dialog open={isPasteDialogOpen} onOpenChange={setIsPasteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Pegar CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Pegar Contenido CSV</DialogTitle>
                  <DialogDescription>
                    Pega aquí el contenido completo del archivo CSV con los clientes
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder={`id_cliente,nombre,sector,gasto_promedio,riesgo,red_social\nC001,María López,retail,350.5,bajo,instagram\nC002,TechCorp,tecnología,50000,bajo,linkedin`}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPasteDialogOpen(false)
                      setCsvText("")
                      setError(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handlePasteCSV} disabled={!csvText.trim()}>
                    Cargar CSV
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              variant="outline"
              disabled
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Pegar CSV
            </Button>
          )}
        </div>

        {/* Ejemplo de formato */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <p className="font-semibold mb-1">Formato esperado:</p>
          <code className="block whitespace-pre-wrap">
{`id_cliente,nombre,sector,gasto_promedio,riesgo,red_social
C001,María López,retail,350.5,bajo,instagram
C002,TechCorp,tecnología,50000,bajo,linkedin`}
          </code>
        </div>

        {/* Mensajes de estado */}
        {isLoading && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Cargando CSV...
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

