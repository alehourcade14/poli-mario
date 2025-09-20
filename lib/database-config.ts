import { createClient } from "@supabase/supabase-js"
import { neon } from "@neondatabase/serverless"

// Tipo para configuración de base de datos
type DatabaseProvider = "supabase" | "neon" | "postgres"

// Configuración dinámica basada en variables disponibles
export function getDatabaseConfig() {
  const provider = (process.env.DATABASE_PROVIDER as DatabaseProvider) || "supabase"

  switch (provider) {
    case "supabase":
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Variables de Supabase no configuradas")
      }
      return {
        type: "supabase",
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      }

    case "neon":
      if (!process.env.NEON_DATABASE_URL) {
        throw new Error("NEON_DATABASE_URL no configurada")
      }
      return {
        type: "neon",
        url: process.env.NEON_DATABASE_URL,
      }

    case "postgres":
      if (!process.env.POSTGRES_URL_CUSTOM) {
        throw new Error("POSTGRES_URL_CUSTOM no configurada")
      }
      return {
        type: "postgres",
        url: process.env.POSTGRES_URL_CUSTOM,
      }

    default:
      throw new Error(`Proveedor de base de datos no soportado: ${provider}`)
  }
}

// Cliente Supabase
export const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    : null

// Cliente Neon
export const neonClient = process.env.NEON_DATABASE_URL ? neon(process.env.NEON_DATABASE_URL) : null

// Función para obtener el cliente activo
export function getDatabaseClient() {
  const config = getDatabaseConfig()

  switch (config.type) {
    case "supabase":
      if (!supabase) throw new Error("Cliente Supabase no inicializado")
      return supabase

    case "neon":
      if (!neonClient) throw new Error("Cliente Neon no inicializado")
      return neonClient

    default:
      throw new Error(`Cliente no disponible para: ${config.type}`)
  }
}

// Función para verificar conexión
export async function testDatabaseConnection() {
  try {
    const config = getDatabaseConfig()
    console.log(`Probando conexión con: ${config.type}`)

    if (config.type === "supabase" && supabase) {
      const { data, error } = await supabase.from("usuarios").select("count").limit(1)
      return {
        success: !error,
        provider: "supabase",
        error: error?.message,
        message: "Conexión a Supabase exitosa",
      }
    }

    if (config.type === "neon" && neonClient) {
      const result = await neonClient`SELECT 1 as test`
      return {
        success: true,
        provider: "neon",
        message: "Conexión a Neon exitosa",
      }
    }

    return { success: false, error: "No hay cliente disponible" }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      provider: process.env.DATABASE_PROVIDER || "no configurado",
    }
  }
}
