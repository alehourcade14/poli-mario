"use client"

import { useState, useEffect, useCallback } from "react"
import { GoogleMap, Marker, useJsApiLoader, MarkerClusterer } from "@react-google-maps/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, Eye, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

const containerStyle = {
  width: "100%",
  height: "600px",
}

const defaultCenter = {
  lat: -29.413454,
  lng: -66.856458,
}

interface GeneralMapProps {
  denuncias: any[]
}

export default function GeneralMap({ denuncias }: GeneralMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["visualization", "maps"],
  })

  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [selectedDenuncia, setSelectedDenuncia] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [tipoDelitos, setTipoDelitos] = useState<string[]>([])
  const [departamentos, setDepartamentos] = useState<string[]>([])
  const [showClusters, setShowClusters] = useState(true)

  const router = useRouter()

  // Preparar marcadores para el mapa
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

    // Crear marcadores para las denuncias con ubicación
    const newMarkers = filteredDenuncias
      .filter((d) => d.ubicacion && d.ubicacion.lat && d.ubicacion.lng)
      .map((denuncia) => ({
        id: denuncia.id,
        position: {
          lat: denuncia.ubicacion.lat,
          lng: denuncia.ubicacion.lng,
        },
        denuncia,
        icon: getMarkerIcon(denuncia.estado, denuncia.tipo),
      }))

    setMarkers(newMarkers)
  }, [denuncias, filtroTipo, filtroDepartamento, filtroEstado, isLoaded])

  // Función para obtener el icono del marcador según el estado y tipo
  const getMarkerIcon = (estado: string, tipo: string | undefined | null) => {
    // Verificar si Google Maps está disponible antes de usar SymbolPath
    if (!window.google?.maps?.SymbolPath) {
      // Fallback: usar iconos de URL o colores simples
      return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" fill="${filtroTipo !== "todos" ? getColorForTipoDelito(tipo) : getColorByStatus(estado)}" stroke="white" strokeWidth="2"/>
        </svg>`,
        )}`,
        scaledSize: new window.google.maps.Size(20, 20),
      }
    }

    const baseIcon = {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      strokeWeight: 2,
      strokeColor: "#ffffff",
    }

    // Si hay un filtro de tipo activo, usamos el color del tipo
    if (filtroTipo !== "todos") {
      return { ...baseIcon, fillColor: getColorForTipoDelito(tipo), fillOpacity: 0.8 }
    }

    // Si no, usamos el color del estado
    switch (estado) {
      case "Consulta":
        return { ...baseIcon, fillColor: "#f59e0b", fillOpacity: 0.8 }
      case "En Proceso":
        return { ...baseIcon, fillColor: "#3b82f6", fillOpacity: 0.8 }
      case "Resuelta":
        return { ...baseIcon, fillColor: "#10b981", fillOpacity: 0.8 }
      default:
        return { ...baseIcon, fillColor: "#6b7280", fillOpacity: 0.8 }
    }
  }

  // Función auxiliar para obtener colores por estado
  const getColorByStatus = (estado: string) => {
    switch (estado) {
      case "Consulta":
        return "#f59e0b"
      case "En Proceso":
        return "#3b82f6"
      case "Resuelta":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  // Función para generar un color consistente basado en el tipo de delito
  const getColorForTipoDelito = (tipo: string | undefined | null) => {
    // Si el tipo es undefined, null o vacío, usar un color por defecto
    if (!tipo || tipo.trim() === '') {
      return '#6B7280' // Color gris por defecto
    }

    // Usamos una función hash simple para convertir el string en un número
    let hash = 0
    for (let i = 0; i < tipo.length; i++) {
      hash = tipo.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Convertimos el hash a un color HSL con saturación y luminosidad fijas
    // para asegurar colores distinguibles pero no demasiado claros u oscuros
    const h = Math.abs(hash % 360)
    return `hsl(${h}, 70%, 50%)`
  }

  // Función para manejar clic en marcador
  const handleMarkerClick = useCallback((marker: any) => {
    setSelectedDenuncia(marker.denuncia)
  }, [])

  // Función para obtener el badge de estado
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Consulta":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Consulta
          </Badge>
        )
      case "En Proceso":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            En Proceso
          </Badge>
        )
      case "Resuelta":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Resuelta
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar el mapa</AlertTitle>
        <AlertDescription>
          No se pudo cargar el mapa de Google. Por favor, verifique su conexión a internet o contacte al administrador.
          <br />
          <strong>Error:</strong> {loadError.message}
        </AlertDescription>
      </Alert>
    )
  }

  // Si no hay API key, mostrar mensaje informativo
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Configuración requerida</AlertTitle>
        <AlertDescription>
          Para utilizar el mapa general, es necesario configurar una API key de Google Maps válida con los servicios de
          Maps JavaScript API habilitados.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mapa General de Denuncias</CardTitle>
        <CardDescription>Visualización de todas las denuncias con ubicación registrada</CardDescription>
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
            <label className="text-sm font-medium mb-1 block">Agrupación</label>
            <Button
              variant={showClusters ? "default" : "outline"}
              onClick={() => setShowClusters(!showClusters)}
              className="w-full"
            >
              {showClusters ? "Desactivar" : "Activar"} Clusters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              {!isLoaded ? (
                <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-md">
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
                  {showClusters && window.google?.maps ? (
                    <MarkerClusterer>
                      {(clusterer) =>
                        markers.map((marker) => (
                          <Marker
                            key={marker.id}
                            position={marker.position}
                            icon={marker.icon}
                            clusterer={clusterer}
                            onClick={() => handleMarkerClick(marker)}
                          />
                        ))
                      }
                    </MarkerClusterer>
                  ) : (
                    markers.map((marker) => (
                      <Marker
                        key={marker.id}
                        position={marker.position}
                        icon={marker.icon}
                        onClick={() => handleMarkerClick(marker)}
                      />
                    ))
                  )}
                </GoogleMap>
              )}

              {isLoaded && markers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
                    <p className="text-center">No hay denuncias con ubicación para los filtros seleccionados.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Leyenda</h3>

              {/* Estados de denuncias */}
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Estados:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                    <span>Consulta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span>En Proceso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span>Resuelta</span>
                  </div>
                </div>
              </div>

              {/* Tipos de delitos */}
              <div>
                <h4 className="text-sm font-medium mb-1">Tipos de delitos:</h4>
                <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-1">
                  {tipoDelitos.map((tipo) => (
                    <div key={tipo} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getColorForTipoDelito(tipo) }}
                      ></div>
                      <span>{tipo}</span>
                    </div>
                  ))}
                  {tipoDelitos.length === 0 && (
                    <div className="text-muted-foreground italic">No hay tipos de delitos disponibles</div>
                  )}
                </div>
              </div>
            </div>

            {selectedDenuncia && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Denuncia #{selectedDenuncia.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong>Denunciante:</strong> {selectedDenuncia.denunciante}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {selectedDenuncia.tipo}
                  </div>
                  <div>
                    <strong>Estado:</strong> {getStatusBadge(selectedDenuncia.estado)}
                  </div>
                  <div>
                    <strong>Fecha:</strong> {new Date(selectedDenuncia.fecha).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Departamento:</strong> {selectedDenuncia.departamento}
                  </div>
                  {selectedDenuncia.direccion && (
                    <div>
                      <strong>Dirección:</strong> {selectedDenuncia.direccion}
                    </div>
                  )}
                  <div>
                    <strong>Descripción:</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDenuncia.descripcion.length > 100
                        ? `${selectedDenuncia.descripcion.substring(0, 100)}...`
                        : selectedDenuncia.descripcion}
                    </p>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => router.push(`/dashboard/denuncia/${selectedDenuncia.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Total de denuncias en el mapa: {markers.length}</p>
              <p className="mt-1">
                <strong>Nota:</strong> Solo se muestran las denuncias que tienen coordenadas geográficas registradas.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
