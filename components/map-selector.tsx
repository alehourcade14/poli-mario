"use client"

import type React from "react"
import type { google } from "googlemaps"

import { useState, useEffect, useCallback, useRef } from "react"
import { GoogleMap, Marker } from "@react-google-maps/api"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MapPin, Locate, Loader2, AlertTriangle, Info } from "lucide-react"

const containerStyle = {
  width: "100%",
  height: "400px",
}

const defaultCenter = {
  lat: -29.413454,
  lng: -66.856458,
}

interface MapSelectorProps {
  initialLocation?: { lat: number; lng: number } | null
  onLocationSelect: (location: { lat: number; lng: number } | null) => void
  onAddressChange?: (address: string) => void
  isOptional?: boolean
}

export default function MapSelector({
  initialLocation,
  onLocationSelect,
  onAddressChange,
  isOptional = true,
}: MapSelectorProps) {
  const { isLoaded, loadError } = useGoogleMaps()

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(() => {
    if (initialLocation && 
        typeof initialLocation.lat === 'number' && 
        typeof initialLocation.lng === 'number' &&
        !isNaN(initialLocation.lat) && 
        !isNaN(initialLocation.lng)) {
      return initialLocation
    }
    return null
  })
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [address, setAddress] = useState<string>("")
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false)
  const [geocodingAvailable, setGeocodingAvailable] = useState(true)
  const [geocodingError, setGeocodingError] = useState<string | null>(null)
  const [manualCoordinates, setManualCoordinates] = useState({
    lat: initialLocation?.lat || defaultCenter.lat,
    lng: initialLocation?.lng || defaultCenter.lng,
  })

  const markerRef = useRef<google.maps.Marker | null>(null)

  // Función para geocodificación inversa con manejo de errores
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!isLoaded || !window.google || !geocodingAvailable) return

      setIsGeocodingLoading(true)
      setGeocodingError(null)

      try {
        const geocoder = new window.google.maps.Geocoder()
        const response = await geocoder.geocode({
          location: { lat, lng },
        })

        if (response.results && response.results.length > 0) {
          const formattedAddress = response.results[0].formatted_address
          setAddress(formattedAddress)
          if (onAddressChange) {
            onAddressChange(formattedAddress)
          }
        } else {
          setAddress("Dirección no encontrada")
          if (onAddressChange) {
            onAddressChange("")
          }
        }
      } catch (error: any) {
        console.error("Error en geocodificación inversa:", error)

        // Verificar si es un error de autorización de API
        if (error.code === "REQUEST_DENIED" || error.message?.includes("not authorized")) {
          setGeocodingAvailable(false)
          setGeocodingError("Servicio de geocodificación no disponible. Las coordenadas se guardarán sin dirección.")
          setAddress("")
          if (onAddressChange) {
            onAddressChange("")
          }
        } else {
          setAddress("Error al obtener dirección")
          setGeocodingError("Error temporal al obtener la dirección. Intente nuevamente.")
          if (onAddressChange) {
            onAddressChange("")
          }
        }
      } finally {
        setIsGeocodingLoading(false)
      }
    },
    [isLoaded, onAddressChange, geocodingAvailable],
  )

  // Función para manejar el clic en el mapa
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newPosition = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        }
        setMarkerPosition(newPosition)
        setManualCoordinates(newPosition)
        onLocationSelect(newPosition)

        // Solo intentar geocodificación si está disponible
        if (geocodingAvailable) {
          reverseGeocode(newPosition.lat, newPosition.lng)
        }
      }
    },
    [onLocationSelect, reverseGeocode, geocodingAvailable],
  )

  // Función para obtener la ubicación actual del usuario
  const getCurrentLocation = useCallback(() => {
    setIsLocating(true)
    setLocationError(null)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setMarkerPosition(currentPosition)
          setManualCoordinates(currentPosition)
          onLocationSelect(currentPosition)

          // Solo intentar geocodificación si está disponible
          if (geocodingAvailable) {
            reverseGeocode(currentPosition.lat, currentPosition.lng)
          }

          if (map) {
            map.panTo(currentPosition)
            map.setZoom(15)
          }

          setIsLocating(false)
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error)
          setLocationError("No se pudo obtener su ubicación. Por favor, intente nuevamente o marque manualmente.")
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      )
    } else {
      setLocationError("La geolocalización no está soportada por este navegador.")
      setIsLocating(false)
    }
  }, [map, onLocationSelect, reverseGeocode, geocodingAvailable])

  // Función para limpiar la ubicación
  const clearLocation = useCallback(() => {
    setMarkerPosition(null)
    setAddress("")
    setGeocodingError(null)
    onLocationSelect(null)
    if (onAddressChange) {
      onAddressChange("")
    }
  }, [onLocationSelect, onAddressChange])

  // Función para manejar el arrastre del marcador
  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        
        // Asegurar que las coordenadas sean números válidos
        if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
          const newPosition = {
            lat: lat,
            lng: lng,
          }
          setMarkerPosition(newPosition)
          setManualCoordinates(newPosition)
          onLocationSelect(newPosition)
        }

        // Solo intentar geocodificación si está disponible
        if (geocodingAvailable) {
          reverseGeocode(newPosition.lat, newPosition.lng)
        }
      }
    },
    [onLocationSelect, reverseGeocode, geocodingAvailable],
  )

  // Función para cargar el mapa
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  // Función para descargar el mapa
  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Función para actualizar manualmente las coordenadas
  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>, field: "lat" | "lng") => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value)) {
      const newCoordinates = { ...manualCoordinates, [field]: value }
      setManualCoordinates(newCoordinates)
    }
  }

  const applyManualCoordinates = () => {
    setMarkerPosition(manualCoordinates)
    onLocationSelect(manualCoordinates)

    // Solo intentar geocodificación si está disponible
    if (geocodingAvailable) {
      reverseGeocode(manualCoordinates.lat, manualCoordinates.lng)
    }

    if (map) {
      map.panTo(manualCoordinates)
      map.setZoom(15)
    }
  }

  // Efecto para inicializar el marcador con la ubicación inicial
  useEffect(() => {
    if (initialLocation && !markerPosition) {
      setMarkerPosition(initialLocation)
      setManualCoordinates(initialLocation)

      // Solo intentar geocodificación si está disponible
      if (geocodingAvailable) {
        reverseGeocode(initialLocation.lat, initialLocation.lng)
      }
    }
  }, [initialLocation, markerPosition, reverseGeocode, geocodingAvailable])

  // Si hay un error al cargar la API de Google Maps, mostrar un formulario alternativo
  if (loadError) {
    const isApiKeyError = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "tu-google-maps-api-key-aqui" || 
                         !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
                         process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === ""
    
    return (
      <Card>
        <CardContent className="p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al cargar el mapa</AlertTitle>
            <AlertDescription>
              {isApiKeyError ? (
                <div>
                  <p className="mb-2">Google Maps API no está configurada correctamente.</p>
                  <p className="mb-2">Para solucionarlo:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Ejecuta el script: <code className="bg-gray-100 px-1 rounded">setup-google-maps.bat</code></li>
                    <li>O configura manualmente la variable NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local</li>
                    <li>Reinicia el servidor de desarrollo</li>
                  </ol>
                </div>
              ) : (
                "No se pudo cargar el mapa de Google. Por favor, ingrese las coordenadas manualmente o contacte al administrador."
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="latitude" className="text-sm font-medium">
                  Latitud
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={manualCoordinates.lat}
                  onChange={(e) => handleCoordinateChange(e, "lat")}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="longitude" className="text-sm font-medium">
                  Longitud
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={manualCoordinates.lng}
                  onChange={(e) => handleCoordinateChange(e, "lng")}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={applyManualCoordinates}>Guardar Coordenadas</Button>
              <Button variant="outline" onClick={getCurrentLocation} disabled={isLocating}>
                {isLocating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Obteniendo ubicación...
                  </>
                ) : (
                  <>
                    <Locate className="mr-2 h-4 w-4" />
                    Usar mi ubicación actual
                  </>
                )}
              </Button>
              {markerPosition && (
                <Button variant="outline" onClick={clearLocation}>
                  Limpiar ubicación
                </Button>
              )}
            </div>

            {locationError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}

            {markerPosition && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>
                  Coordenadas guardadas: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={getCurrentLocation} disabled={isLocating}>
            {isLocating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <Locate className="mr-2 h-4 w-4" />
                Usar mi ubicación actual
              </>
            )}
          </Button>

          {markerPosition && (
            <Button type="button" variant="outline" onClick={clearLocation}>
              Limpiar ubicación
            </Button>
          )}
        </div>

        {locationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {geocodingError && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>{geocodingError}</AlertDescription>
          </Alert>
        )}

        {!geocodingAvailable && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Información</AlertTitle>
            <AlertDescription>
              El servicio de direcciones no está disponible, pero puede marcar la ubicación usando coordenadas. Las
              coordenadas se guardarán correctamente.
            </AlertDescription>
          </Alert>
        )}

        <div className="relative">
          {!isLoaded ? (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={markerPosition || defaultCenter}
              zoom={markerPosition ? 15 : 13}
              onClick={handleMapClick}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
              }}
            >
              {markerPosition && (
                <Marker position={markerPosition} draggable={true} onDragEnd={handleMarkerDragEnd} ref={markerRef} />
              )}
            </GoogleMap>
          )}

          {!markerPosition && isOptional && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="absolute bottom-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow text-sm">
                Haga clic en el mapa para marcar la ubicación (opcional)
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="latitude" className="text-sm font-medium">
              Latitud
            </label>
            <input
              id="latitude"
              type="number"
              step="0.000001"
              value={manualCoordinates.lat}
              onChange={(e) => handleCoordinateChange(e, "lat")}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="longitude" className="text-sm font-medium">
              Longitud
            </label>
            <input
              id="longitude"
              type="number"
              step="0.000001"
              value={manualCoordinates.lng}
              onChange={(e) => handleCoordinateChange(e, "lng")}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <Button className="mt-2" onClick={applyManualCoordinates}>
          Aplicar Coordenadas
        </Button>

        {markerPosition && (
          <div className="mt-4 space-y-2">
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Coordenadas:</strong> {typeof markerPosition.lat === 'number' ? markerPosition.lat.toFixed(6) : markerPosition.lat}, {typeof markerPosition.lng === 'number' ? markerPosition.lng.toFixed(6) : markerPosition.lng}
              </p>
            </div>
            {geocodingAvailable && address && (
              <div className="text-sm">
                <p>
                  <strong>Dirección:</strong>{" "}
                  {isGeocodingLoading ? (
                    <span className="inline-flex items-center">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Obteniendo dirección...
                    </span>
                  ) : (
                    address
                  )}
                </p>
              </div>
            )}
            {!geocodingAvailable && (
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Nota:</strong> Ubicación guardada solo con coordenadas (servicio de direcciones no disponible)
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
