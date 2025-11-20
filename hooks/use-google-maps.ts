import { useJsApiLoader } from "@react-google-maps/api"

// Configuración centralizada de Google Maps
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

const GOOGLE_MAPS_CONFIG = {
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: ["visualization", "maps", "places"] as const,
}

/**
 * Hook personalizado para cargar Google Maps API
 * Centraliza la configuración para evitar conflictos entre componentes
 */
export function useGoogleMaps() {
  const result = useJsApiLoader(GOOGLE_MAPS_CONFIG)
  
  // Mejorar el mensaje de error si la API key no está configurada
  if (result.loadError && !GOOGLE_MAPS_API_KEY) {
    console.error("❌ Google Maps API Key no configurada. Verifica que NEXT_PUBLIC_GOOGLE_MAPS_API_KEY esté en .env.local")
  } else if (result.loadError) {
    console.error("❌ Error al cargar Google Maps:", result.loadError)
    // Verificar tipos comunes de errores
    if (result.loadError.message?.includes("REQUEST_DENIED")) {
      console.error("⚠️ La API key puede estar restringida o las APIs no están habilitadas")
    } else if (result.loadError.message?.includes("OVER_QUERY_LIMIT")) {
      console.error("⚠️ Se ha excedido el límite de consultas de la API")
    } else if (result.loadError.message?.includes("INVALID_KEY")) {
      console.error("⚠️ La API key no es válida o ha expirado")
    }
  }
  
  return result
}

export default useGoogleMaps
