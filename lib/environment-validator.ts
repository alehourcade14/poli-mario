interface EnvironmentConfig {
  required: string[]
  optional: string[]
  conflicts: string[][]
}

const environmentConfigs: Record<string, EnvironmentConfig> = {
  supabase: {
    required: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    optional: ["SUPABASE_JWT_SECRET"],
    conflicts: [
      ["POSTGRES_URL", "NEON_DATABASE_URL"],
      ["POSTGRES_PRISMA_URL", "DATABASE_URL"],
    ],
  },
  neon: {
    required: ["NEON_DATABASE_URL"],
    optional: ["DATABASE_URL"],
    conflicts: [
      ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"],
      ["POSTGRES_URL", "POSTGRES_PRISMA_URL"],
    ],
  },
  postgres: {
    required: ["POSTGRES_URL_CUSTOM"],
    optional: ["DATABASE_URL", "POSTGRES_PRISMA_URL"],
    conflicts: [["SUPABASE_URL", "NEON_DATABASE_URL"]],
  },
}

export function validateEnvironment(provider = "supabase") {
  const config = environmentConfigs[provider]
  if (!config) {
    throw new Error(`Proveedor desconocido: ${provider}`)
  }

  const errors: string[] = []
  const warnings: string[] = []

  // Verificar variables requeridas
  for (const variable of config.required) {
    if (!process.env[variable]) {
      errors.push(`Variable requerida faltante: ${variable}`)
    }
  }

  // Verificar conflictos
  for (const conflictGroup of config.conflicts) {
    const presentVariables = conflictGroup.filter((v) => process.env[v])
    if (presentVariables.length > 1) {
      warnings.push(`Conflicto de variables: ${presentVariables.join(", ")}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions: generateSuggestions(errors, warnings, provider),
  }
}

function generateSuggestions(errors: string[], warnings: string[], provider: string): string[] {
  const suggestions: string[] = []

  if (provider === "supabase" && errors.some((e) => e.includes("SUPABASE"))) {
    suggestions.push("1. Ve a https://supabase.com y crea un proyecto")
    suggestions.push("2. Copia la URL y las keys desde Settings > API")
    suggestions.push("3. Configura las variables en tu archivo .env.local")
  }

  if (provider === "neon" && errors.some((e) => e.includes("NEON"))) {
    suggestions.push("1. Ve a https://neon.tech y crea un proyecto")
    suggestions.push("2. Copia la connection string desde el dashboard")
    suggestions.push("3. Configura NEON_DATABASE_URL en tu .env.local")
  }

  if (warnings.some((w) => w.includes("POSTGRES_URL"))) {
    suggestions.push("Renombrar POSTGRES_URL a POSTGRES_URL_CUSTOM para evitar conflictos")
  }

  return suggestions
}

// Función para obtener estado actual del entorno
export function getEnvironmentStatus() {
  const currentVars = Object.keys(process.env).filter(
    (key) =>
      key.includes("POSTGRES") ||
      key.includes("DATABASE") ||
      key.includes("SUPABASE") ||
      key.includes("NEON") ||
      key.includes("GOOGLE_MAPS"),
  )

  const provider = process.env.DATABASE_PROVIDER || "supabase"
  const validation = validateEnvironment(provider)

  return {
    currentProvider: provider,
    availableVariables: currentVars,
    validation,
    recommendations: {
      supabase: {
        required: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
        howToGet: "Crear proyecto en https://supabase.com",
      },
      neon: {
        required: ["NEON_DATABASE_URL"],
        howToGet: "Crear proyecto en https://neon.tech",
      },
      googleMaps: {
        required: ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"],
        howToGet: "Crear API key en https://console.cloud.google.com",
      },
    },
  }
}
