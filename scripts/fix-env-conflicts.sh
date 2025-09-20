#!/bin/bash

# Script para resolver conflictos de variables de entorno

echo "🔍 Detectando conflictos de variables de entorno..."

# Función para verificar si una variable existe
check_var() {
    if [ -n "${!1}" ]; then
        echo "✅ $1 está configurada"
        return 0
    else
        echo "❌ $1 no está configurada"
        return 1
    fi
}

# Función para renombrar variables
rename_var() {
    local old_name=$1
    local new_name=$2
    
    if [ -n "${!old_name}" ]; then
        echo "📝 Renombrando $old_name a $new_name"
        # En Vercel/Netlify, usar el dashboard para renombrar
        # En VPS, modificar .env directamente
        echo "Valor a migrar: ${!old_name}"
    fi
}

echo "🔍 Variables actuales detectadas:"
env | grep -E "(POSTGRES|DATABASE|SUPABASE|NEON)" | sort

echo ""
echo "📋 Recomendaciones para resolver conflictos:"

# Opción 1: Usar solo Supabase (Recomendado)
echo ""
echo "🎯 OPCIÓN 1: Configuración Solo Supabase (Recomendado)"
echo "Variables necesarias:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Variables a eliminar/renombrar:"
echo "  - POSTGRES_URL → POSTGRES_URL_BACKUP (por si acaso)"
echo "  - DATABASE_URL → DATABASE_URL_BACKUP"
echo "  - POSTGRES_PRISMA_URL → (eliminar)"

# Opción 2: Usar PostgreSQL directo
echo ""
echo "🎯 OPCIÓN 2: PostgreSQL Directo"
echo "Variables necesarias:"
echo "  - DATABASE_URL (PostgreSQL connection string)"
echo ""
echo "Variables a eliminar:"
echo "  - POSTGRES_URL (conflicto con DATABASE_URL)"
echo "  - POSTGRES_PRISMA_URL"
echo "  - SUPABASE_* (si no se usa)"

# Opción 3: Configuración híbrida
echo ""
echo "🎯 OPCIÓN 3: Configuración Híbrida"
echo "Variables necesarias:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - POSTGRES_URL_CUSTOM (para conexiones directas)"

echo ""
echo "💡 Para aplicar los cambios:"
echo "1. Ve al dashboard de tu plataforma (Vercel/Netlify)"
echo "2. Sección Environment Variables"
echo "3. Renombra o elimina las variables conflictivas"
echo "4. Redespliega la aplicación"
