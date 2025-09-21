"use client"

import { useState, useEffect, useCallback } from "react"
import { GoogleMap, HeatmapLayer } from "@react-google-maps/api"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

  // Preparar datos para el mapa de calor
  useEffect(() => {
    if (!denuncias.length || !isLoaded) return

    // Extraer tipos de delitos únicos
    const tipos = Array.from(new Set(denuncias.map((d) => d.tipo)))
    setTipoDelitos(tipos)

    // Extraer departamentos únicos
    const deptos = Array.from(new Set(denuncias.map((d) => d.departamento)))
    setDepartamentos(deptos)

    // Filtrar denuncias según los criterios seleccionados
    let filteredDenuncias = [...denuncias]

    if (filtroTipo !== "todos") {
      filteredDenuncias = filteredDenuncias.filter((d) => d.tipo === filtroTipo)
    }

    if (filtroDepartamento !== "todos") {
      filteredDenuncias = filteredDenuncias.filter((d) => d.departamento === filtroDepartamento)
    }

    if (filtroEstado !== "todos") {
      filteredDenuncias = filteredDenuncias.filter((d) => d.estado === filtroEstado)
    }

    // Crear datos para el mapa de calor
    const heatmapPoints = filteredDenuncias
      .filter((d) => d.ubicacion && d.ubicacion.lat && d.ubicacion.lng)
      .map((d) => {
        // Usar la API de Google Maps cargada en window
        return new window.google.maps.LatLng(d.ubicacion.lat, d.ubicacion.lng)
      })

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

        <div className="relative">
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
                <p className="text-center">No hay datos de ubicación disponibles para los filtros seleccionados.</p>
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
