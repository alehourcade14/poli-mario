"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { GoogleMap, HeatmapLayer } from "@react-google-maps/api"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import html2canvas from "html2canvas"

// Estilo del contenedor del mapa
const containerStyle = {
  width: "100%",
  height: "500px",
}

// Centro predeterminado (La Rioja, Argentina)
const defaultCenter = {
  lat: -29.413454,
  lng: -66.856458,
}

interface HeatMapProps {
  denuncias: any[]
}

export default function HeatMap({ denuncias }: HeatMapProps) {
  const { isLoaded, loadError } = useGoogleMaps()

  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [tipoDelitos, setTipoDelitos] = useState<string[]>([])
  const [departamentos, setDepartamentos] = useState<string[]>([])
  const [intensidad, setIntensidad] = useState<string>("media")
  const [isExporting, setIsExporting] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Preparar datos para el mapa de calor
  useEffect(() => {
    if (!denuncias.length || !isLoaded) return

    console.log("🗺️ HeatMap - Denuncias recibidas:", denuncias.length)
    console.log("🗺️ HeatMap - Primeras 3 denuncias:", denuncias.slice(0, 3))
    console.log("🗺️ HeatMap - Campos de coordenadas en primeras 3:", denuncias.slice(0, 3).map(d => ({ 
      id: d.id, 
      latitud: d.latitud, 
      longitud: d.longitud, 
      ubicacion: d.ubicacion 
    })))

    // Extraer tipos de delitos únicos usando el campo correcto de la API
    const tipos = Array.from(new Set(denuncias.map((d) => d.tipo_delito || d.tipo || 'Sin especificar')))
    setTipoDelitos(tipos)

    // Extraer departamentos únicos usando el campo correcto de la API
    const deptos = Array.from(new Set(denuncias.map((d) => d.departamento_nombre || d.departamento || 'Sin departamento')))
    setDepartamentos(deptos)

    console.log("🗺️ HeatMap - Tipos encontrados:", tipos)
    console.log("🗺️ HeatMap - Departamentos encontrados:", deptos)

    // Filtrar denuncias según los criterios seleccionados
    let filteredDenuncias = [...denuncias]

    if (filtroTipo !== "todos") {
      filteredDenuncias = filteredDenuncias.filter((d) => (d.tipo_delito || d.tipo) === filtroTipo)
    }

    if (filtroDepartamento !== "todos") {
      filteredDenuncias = filteredDenuncias.filter((d) => (d.departamento_nombre || d.departamento) === filtroDepartamento)
    }

    if (filtroEstado !== "todos") {
      filteredDenuncias = filteredDenuncias.filter((d) => (d.estado_nombre || d.estado) === filtroEstado)
    }

    // Crear datos para el mapa de calor usando latitud y longitud de la API
    const denunciasConUbicacion = filteredDenuncias.filter((d) => d.latitud && d.longitud && !isNaN(d.latitud) && !isNaN(d.longitud))
    console.log("🗺️ HeatMap - Denuncias con ubicación:", denunciasConUbicacion.length)
    console.log("🗺️ HeatMap - Primeras 3 denuncias con coordenadas:", denunciasConUbicacion.slice(0, 3).map(d => ({ id: d.id, lat: d.latitud, lng: d.longitud })))
    
    const heatmapPoints = denunciasConUbicacion.map((d) => {
      // Usar la API de Google Maps cargada en window
      return new window.google.maps.LatLng(parseFloat(d.latitud), parseFloat(d.longitud))
    })

    console.log("🗺️ HeatMap - Puntos de calor generados:", heatmapPoints.length)
    setHeatmapData(heatmapPoints)
  }, [denuncias, filtroTipo, filtroDepartamento, filtroEstado, isLoaded])

  // Configurar opciones del mapa de calor según la intensidad seleccionada
  const getHeatmapOptions = useCallback(() => {
    const options: any = {
      radius: 20,
      opacity: 0.7,
    }

    switch (intensidad) {
      case "baja":
        options.radius = 15
        options.opacity = 0.5
        break
      case "alta":
        options.radius = 25
        options.opacity = 0.9
        break
      default: // media
        options.radius = 20
        options.opacity = 0.7
    }

    return options
  }, [intensidad])

  // Función para exportar captura del mapa
  const handleExportMap = async () => {
    if (!mapContainerRef.current || !isLoaded) {
      console.error("Mapa no está listo para exportar")
      return
    }

    setIsExporting(true)
    try {
      console.log("Iniciando exportación del mapa de calor...")
      
      // Buscar el contenedor del mapa de Google Maps de múltiples formas
      let mapDiv: HTMLElement | null = null
      
      // Intentar diferentes selectores
      const selectors = [
        'div[style*="position: relative"]',
        'div[class*="gm-style"]',
        'div[style*="width: 100%"]',
        'div[style*="height: 500px"]',
        'div[style*="height: 600px"]'
      ]
      
      for (const selector of selectors) {
        const found = mapContainerRef.current.querySelector(selector) as HTMLElement
        if (found && found.offsetWidth > 0 && found.offsetHeight > 0) {
          // Verificar que contiene elementos de Google Maps
          if (found.querySelector('[class*="gm-"]') || found.querySelector('canvas')) {
            mapDiv = found
            console.log(`Mapa encontrado con selector: ${selector}`)
            break
          }
        }
      }
      
      // Si no se encontró, usar el contenedor principal
      if (!mapDiv) {
        mapDiv = mapContainerRef.current
        console.log("Usando contenedor principal como fallback")
      }

      if (!mapDiv || mapDiv.offsetWidth === 0 || mapDiv.offsetHeight === 0) {
        console.error("No se pudo encontrar un contenedor válido del mapa")
        alert("No se pudo encontrar el mapa. Por favor, asegúrate de que el mapa esté completamente cargado.")
        return
      }

      console.log(`Dimensiones del mapa: ${mapDiv.offsetWidth}x${mapDiv.offsetHeight}`)

      // Ocultar el botón de exportar temporalmente
      const exportButton = mapContainerRef.current.querySelector('button') as HTMLElement
      const originalButtonDisplay = exportButton?.style.display || ''
      if (exportButton) {
        exportButton.style.display = 'none'
      }

      // Esperar un momento para que los cambios se apliquen
      await new Promise(resolve => setTimeout(resolve, 300))

      // Capturar el mapa usando html2canvas
      console.log("Capturando con html2canvas...")
      const canvas = await html2canvas(mapDiv, {
        scale: 1.5,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        width: mapDiv.offsetWidth,
        height: mapDiv.offsetHeight,
        allowTaint: false,
        foreignObjectRendering: true,
        ignoreElements: (element) => {
          // Ignorar el botón de exportar y otros elementos de UI
          if (element === exportButton) return true
          const htmlElement = element as HTMLElement
          const className = typeof htmlElement.className === 'string' ? htmlElement.className : (htmlElement.className?.baseVal || '')
          const id = typeof htmlElement.id === 'string' ? htmlElement.id : ''
          if (typeof className === 'string' && className.includes('absolute')) {
            return className.includes('top-2') || className.includes('right-2') || (id && id.includes('export'))
          }
          return false
        }
      })

      console.log(`Canvas creado: ${canvas.width}x${canvas.height}`)

      // Restaurar el botón
      if (exportButton) {
        exportButton.style.display = originalButtonDisplay
      }

      // Convertir a imagen y descargar
      const imgData = canvas.toDataURL('image/png', 1.0)
      const link = document.createElement('a')
      link.download = 'mapa-de-calor.png'
      link.href = imgData
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log("Exportación completada exitosamente")
    } catch (error) {
      console.error('Error al exportar el mapa:', error)
      alert(`Error al exportar el mapa: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsExporting(false)
    }
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar el mapa</AlertTitle>
        <AlertDescription>
          No se pudo cargar el mapa de Google. Por favor, verifique su conexión a internet o contacte al administrador.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mapa de Calor de Denuncias</CardTitle>
        <CardDescription>Visualización de zonas con mayor incidencia de denuncias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Tipo de Delito</label>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {tipoDelitos.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Departamento</label>
            <Select value={filtroDepartamento} onValueChange={setFiltroDepartamento}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los departamentos</SelectItem>
                {departamentos.map((depto) => (
                  <SelectItem key={depto} value={depto}>
                    {depto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Estado</label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Consulta">Consulta</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Resuelta">Resuelta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Intensidad</label>
            <Select value={intensidad} onValueChange={setIntensidad}>
              <SelectTrigger>
                <SelectValue placeholder="Intensidad media" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative" ref={mapContainerRef}>
          {/* Botón Exportar Captura */}
          {isLoaded && (
            <div className="absolute top-2 right-2 z-10">
              <Button
                onClick={handleExportMap}
                disabled={isExporting}
                size="sm"
                variant="default"
                className="bg-white hover:bg-gray-100 text-gray-800 shadow-md"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Captura
                  </>
                )}
              </Button>
            </div>
          )}
          {!isLoaded ? (
            <div className="flex items-center justify-center h-[500px] bg-gray-100 dark:bg-gray-800 rounded-md">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={defaultCenter}
              zoom={13}
              options={{
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: true,
              }}
            >
              {heatmapData.length > 0 ? <HeatmapLayer data={heatmapData} options={getHeatmapOptions()} /> : null}
            </GoogleMap>
          )}

          {isLoaded && heatmapData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
                <p className="text-center">
                  {denuncias.length === 0 
                    ? "No hay denuncias cargadas." 
                    : `No hay denuncias con coordenadas para los filtros seleccionados. Total de denuncias: ${denuncias.length}`
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Total de puntos en el mapa: {heatmapData.length}</p>
          <p className="mt-1">
            <strong>Nota:</strong> Solo se muestran las denuncias que tienen coordenadas geográficas registradas.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
