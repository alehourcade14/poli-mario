"use client"

import { useState, useEffect, useCallback } from "react"
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, Camera } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Agregar después de las importaciones
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

const MapFallback = () => (
  <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-md border-2 border-dashed border-gray-300">
    <div className="text-center p-8">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Mapa no disponible</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Configure la API key de Google Maps para ver el mapa de cámaras.
      </p>
    </div>
  </div>
)

const containerStyle = {
  width: "100%",
  height: "600px",
}

const defaultCenter = {
  lat: -29.413454,
  lng: -66.856458,
}

interface CamaraMapReadonlyProps {
  user: any
}

interface Camara {
  id: number
  nombre: string
  ubicacion: string
  jurisdiccion: string
  comisaria: string
  tipo: "F" | "D" // F = Fija, D = Domo
  estado: "Operativa" | "Fuera de Servicio" | "Mantenimiento"
  lat: number
  lng: number
  descripcion?: string
  fechaInstalacion?: string
  ultimaRevision?: string
}

export default function CamarasMapReadonly({ user }: CamaraMapReadonlyProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["visualization", "maps"],
  })

  const [camaras, setCamaras] = useState<Camara[]>([])
  const [filteredCamaras, setFilteredCamaras] = useState<Camara[]>([])
  const [filtroComisaria, setFiltroComisaria] = useState<string>("todas")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [selectedCamara, setSelectedCamara] = useState<Camara | null>(null)

  useEffect(() => {
    // Cargar cámaras desde localStorage
    const storedCamaras = localStorage.getItem("camaras")
    if (storedCamaras) {
      setCamaras(JSON.parse(storedCamaras))
    }
  }, [])

  useEffect(() => {
    // Filtrar cámaras
    let filtered = [...camaras]

    if (filtroComisaria !== "todas") {
      filtered = filtered.filter((c) => c.comisaria === filtroComisaria)
    }

    if (filtroTipo !== "todos") {
      filtered = filtered.filter((c) => c.tipo === filtroTipo)
    }

    if (filtroEstado !== "todos") {
      filtered = filtered.filter((c) => c.estado === filtroEstado)
    }

    setFilteredCamaras(filtered)
  }, [camaras, filtroComisaria, filtroTipo, filtroEstado])

  const handleMarkerClick = useCallback((camara: Camara) => {
    setSelectedCamara(camara)
  }, [])

  const getMarkerIcon = (camara: Camara) => {
    const color = camara.estado === "Operativa" ? "#10b981" : camara.estado === "Mantenimiento" ? "#f59e0b" : "#ef4444"
    const symbol = camara.tipo === "F" ? "📹" : "🎥"

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" strokeWidth="2"/>
        <text x="15" y="20" textAnchor="middle" fontSize="12" fill="white">${symbol}</text>
      </svg>`,
      )}`,
      scaledSize: window.google?.maps ? new window.google.maps.Size(30, 30) : undefined,
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
        <CardTitle>Cámaras de Seguridad - Vista de Campo</CardTitle>
        <CardDescription>Visualización de cámaras de seguridad para trabajo de campo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Filtrar por Ubicación</label>
            <Select value={filtroComisaria} onValueChange={setFiltroComisaria}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las ubicaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las ubicaciones</SelectItem>
                <SelectItem value="DOMICILIOS PRIVADOS">DOMICILIOS PRIVADOS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tipo</label>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="F">Fija (F)</SelectItem>
                <SelectItem value="D">Domo (D)</SelectItem>
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
                <SelectItem value="Operativa">Operativa</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="Fuera de Servicio">Fuera de Servicio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <div className="text-sm">
              <p>
                <strong>Total:</strong> {filteredCamaras.length} cámaras
              </p>
              <p>
                <strong>Operativas:</strong> {filteredCamaras.filter((c) => c.estado === "Operativa").length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              {!isLoaded || !GOOGLE_MAPS_API_KEY ? (
                !GOOGLE_MAPS_API_KEY ? (
                  <MapFallback />
                ) : (
                  <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )
              ) : (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={defaultCenter}
                  zoom={13}
                  options={{
                    streetViewControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                  }}
                >
                  {filteredCamaras.map((camara) => (
                    <Marker
                      key={camara.id}
                      position={{ lat: camara.lat, lng: camara.lng }}
                      icon={getMarkerIcon(camara)}
                      onClick={() => handleMarkerClick(camara)}
                    />
                  ))}

                  {selectedCamara && (
                    <InfoWindow
                      position={{ lat: selectedCamara.lat, lng: selectedCamara.lng }}
                      onCloseClick={() => setSelectedCamara(null)}
                    >
                      <div className="p-2">
                        <h3 className="font-semibold">{selectedCamara.nombre}</h3>
                        <p className="text-sm">{selectedCamara.ubicacion}</p>
                        <p className="text-sm text-muted-foreground">{selectedCamara.comisaria}</p>
                        <div className="mt-2">
                          <Badge variant={selectedCamara.estado === "Operativa" ? "default" : "destructive"}>
                            {selectedCamara.estado}
                          </Badge>
                          <Badge variant="outline" className="ml-2">
                            {selectedCamara.tipo === "F" ? "Fija" : "Domo"}
                          </Badge>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Leyenda</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Operativa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span>Mantenimiento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Fuera de Servicio</span>
                </div>
                <div className="mt-4">
                  <p>
                    <strong>📹</strong> Cámara Fija
                  </p>
                  <p>
                    <strong>🎥</strong> Cámara Domo
                  </p>
                </div>
              </div>
            </div>

            {selectedCamara && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    {selectedCamara.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong>Ubicación:</strong> {selectedCamara.ubicacion}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {selectedCamara.tipo === "F" ? "Fija" : "Domo"}
                  </div>
                  <div>
                    <strong>Estado:</strong>
                    <Badge variant={selectedCamara.estado === "Operativa" ? "default" : "destructive"} className="ml-2">
                      {selectedCamara.estado}
                    </Badge>
                  </div>
                  {selectedCamara.descripcion && (
                    <div>
                      <strong>Descripción:</strong> {selectedCamara.descripcion}
                    </div>
                  )}
                  {selectedCamara.fechaInstalacion && (
                    <div>
                      <strong>Instalación:</strong> {new Date(selectedCamara.fechaInstalacion).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <strong>Coordenadas:</strong> {selectedCamara.lat.toFixed(6)}, {selectedCamara.lng.toFixed(6)}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Modo de Campo:</strong> Vista de solo lectura para trabajo de campo
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Total de cámaras en el mapa: {filteredCamaras.length}</p>
              <p className="mt-1">
                <strong>Nota:</strong> Haga clic en una cámara para ver más detalles.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
