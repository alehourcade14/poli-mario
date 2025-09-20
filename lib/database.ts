import { createClient } from "@supabase/supabase-js"
import { Pool } from "pg"

// Configuración para Supabase (Opción recomendada)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Configuración alternativa para PostgreSQL directo
export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Función para verificar conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("usuarios").select("count").single()
    if (error) throw error
    console.log("✅ Conexión a base de datos exitosa")
    return true
  } catch (error) {
    console.error("❌ Error de conexión:", error)
    return false
  }
}
