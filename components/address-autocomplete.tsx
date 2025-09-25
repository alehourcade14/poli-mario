"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { MapPin, Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string) => void
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
  label?: string
  id?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Ingrese una dirección...",
  label,
  id,
  required = false,
  disabled = false,
  className = "",
}: AddressAutocompleteProps) {
  const { isLoaded, loadError } = useGoogleMaps()

  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [service, setService] = useState<google.maps.places.AutocompleteService | null>(null)
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Inicializar servicios de Google Places
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
      try {
        const autocompleteService = new window.google.maps.places.AutocompleteService()
        const placesService = new window.google.maps.places.PlacesService(
          document.createElement("div")
        )
        setService(autocompleteService)
        setPlacesService(placesService)
        setError(null) // Limpiar errores previos
      } catch (err) {
        console.error("Error inicializando servicios de Google Places:", err)
        setError("Error al inicializar servicios de mapas")
      }
    }
  }, [isLoaded])

  // Función para obtener sugerencias de direcciones
  const getSuggestions = useCallback(
    async (input: string) => {
      if (!service || !input.trim()) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      // Verificar que la API esté disponible
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setError("API de Google Maps no disponible")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const request = {
          input: input,
          types: ["address"],
          componentRestrictions: { country: "ar" }
        }

        // Usar callback en lugar de async/await para mejor compatibilidad
        service.getPlacePredictions(request, (predictions, status) => {
          setIsLoading(false)
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions)
            setShowSuggestions(true)
            setError(null)
          } else {
            console.warn("Error en getPlacePredictions:", status)
            setSuggestions([])
            setShowSuggestions(false)
            if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              setError(null) // No es un error, simplemente no hay resultados
            } else {
              setError("No se pudieron obtener sugerencias de direcciones")
            }
          }
        })
      } catch (err: any) {
        console.error("Error obteniendo sugerencias:", err)
        setError("Error al obtener sugerencias de direcciones")
        setSuggestions([])
        setShowSuggestions(false)
        setIsLoading(false)
      }
    },
    [service]
  )

  // Función para manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue)

    // Limpiar timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Debounce para evitar demasiadas llamadas a la API
    const newTimeoutId = setTimeout(() => {
      getSuggestions(inputValue)
    }, 300)
    
    setTimeoutId(newTimeoutId)
  }

  // Función para seleccionar una sugerencia
  const handleSuggestionSelect = useCallback(
    async (prediction: google.maps.places.AutocompletePrediction) => {
      if (!placesService) return

      setIsLoading(true)
      setError(null)

      try {
        const request: google.maps.places.PlaceDetailsRequest = {
          placeId: prediction.place_id,
          fields: ["formatted_address", "geometry", "address_components"],
        }

        placesService.getDetails(request, (place, status) => {
          setIsLoading(false)

          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            onChange(place.formatted_address || prediction.description)
            setShowSuggestions(false)
            setSuggestions([])

            if (onPlaceSelect) {
              onPlaceSelect(place)
            }
          } else {
            setError("Error al obtener detalles de la dirección")
          }
        })
      } catch (err: any) {
        console.error("Error obteniendo detalles:", err)
        setError("Error al obtener detalles de la dirección")
        setIsLoading(false)
      }
    },
    [placesService, onChange, onPlaceSelect]
  )

  // Función para limpiar sugerencias
  const clearSuggestions = () => {
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      // Limpiar timeout al desmontar
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      clearSuggestions()
    }
  }

  // Si hay error al cargar la API o no hay API key, mostrar input normal
  if (loadError || 
      !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'tu-google-maps-api-key-aqui' ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === '' ||
      error === "API de Google Maps no disponible" ||
      error === "Error al inicializar servicios de mapas") {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={className}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Ingrese la dirección manualmente
        </p>
      </div>
    )
  }

  // Si la API no está cargada, mostrar input con loading
  if (!isLoaded) {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={className}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={className}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Lista de sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {suggestion.structured_formatting.main_text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {suggestion.structured_formatting.secondary_text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
