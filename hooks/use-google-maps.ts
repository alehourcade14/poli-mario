import { useJsApiLoader } from "@react-google-maps/api"

// Configuración centralizada de Google Maps
const GOOGLE_MAPS_CONFIG = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  libraries: ["visualization", "maps", "places"] as const,
}

/**
 * Hook personalizado para cargar Google Maps API
 * Centraliza la configuración para evitar conflictos entre componentes
 */
export function useGoogleMaps() {
  return useJsApiLoader(GOOGLE_MAPS_CONFIG)
}

export default useGoogleMaps
