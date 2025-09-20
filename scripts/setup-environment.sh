#!/bin/bash

echo "🚀 Configurando entorno para Sistema de Denuncias"
echo "=================================================="

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    touch .env.local
fi

echo ""
echo "📋 Variables de entorno necesarias:"
echo ""

# Función para solicitar variable
ask_for_variable() {
    local var_name=$1
    local description=$2
    local current_value=${!var_name}
    
    echo "🔧 $var_name"
    echo "   Descripción: $description"
    
    if [ -n "$current_value" ]; then
        echo "   Valor actual: $current_value"
        read -p "   ¿Mantener valor actual? (y/n): " keep_current
        if [ "$keep_current" = "y" ] || [ "$keep_current" = "Y" ]; then
            return
        fi
    fi
    
    read -p "   Ingresa el valor: " new_value
    
    if [ -n "$new_value" ]; then
        # Remover variable existente del archivo
        sed -i "/^$var_name=/d" .env.local
        # Agregar nueva variable
        echo "$var_name=$new_value" >> .env.local
        echo "   ✅ Variable configurada"
    else
        echo "   ⚠️  Variable omitida"
    fi
    echo ""
}

# Configurar DATABASE_PROVIDER
echo "1️⃣  PROVEEDOR DE BASE DE DATOS"
echo "   Opciones disponibles:"
echo "   - supabase (Recomendado: Fácil configuración, realtime, backups automáticos)"
echo "   - neon (PostgreSQL serverless)"
echo "   - postgres (PostgreSQL tradicional)"
echo ""

current_provider=${DATABASE_PROVIDER:-"supabase"}
echo "   Proveedor actual: $current_provider"
read -p "   ¿Cambiar proveedor? (supabase/neon/postgres): " new_provider

if [ -n "$new_provider" ]; then
    sed -i "/^DATABASE_PROVIDER=/d" .env.local
    echo "DATABASE_PROVIDER=$new_provider" >> .env.local
    current_provider=$new_provider
fi

echo ""
echo "2️⃣  CONFIGURACIÓN DE $current_provider"

# Configurar según el proveedor elegido
case $current_provider in
    "supabase")
        echo "   📍 Para obtener las credenciales de Supabase:"
        echo "   1. Ve a https://supabase.com"
        echo "   2. Crea un proyecto (gratis hasta 500MB)"
        echo "   3. Ve a Settings > API"
        echo "   4. Copia los valores que se solicitan a continuación"
        echo ""
        
        ask_for_variable "NEXT_PUBLIC_SUPABASE_URL" "URL del proyecto Supabase (ej: https://abc123.supabase.co)"
        ask_for_variable "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Clave pública anónima de Supabase"
        ask_for_variable "SUPABASE_SERVICE_ROLE_KEY" "Clave de servicio de Supabase (privada)"
        ;;
        
    "neon")
        echo "   📍 Para obtener la URL de Neon:"
        echo "   1. Ve a https://neon.tech"
        echo "   2. Crea un proyecto"
        echo "   3. Copia la connection string del dashboard"
        echo ""
        
        ask_for_variable "NEON_DATABASE_URL" "URL de conexión de Neon (postgresql://...)"
        ;;
        
    "postgres")
        echo "   📍 Para PostgreSQL personalizado:"
        echo "   Necesitas la URL de conexión de tu servidor PostgreSQL"
        echo ""
        
        ask_for_variable "POSTGRES_URL_CUSTOM" "URL de PostgreSQL personalizada (postgresql://...)"
        ;;
esac

echo ""
echo "3️⃣  GOOGLE MAPS API"
echo "   📍 Para obtener la API key de Google Maps:"
echo "   1. Ve a https://console.cloud.google.com"
echo "   2. Crea un proyecto o selecciona uno existente"
echo "   3. Habilita 'Maps JavaScript API'"
echo "   4. Ve a 'Credentials' y crea una API Key"
echo "   5. Configura las restricciones de dominio"
echo ""

ask_for_variable "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "API Key de Google Maps"

echo ""
echo "4️⃣  CONFIGURACIÓN OPCIONAL"
echo ""

ask_for_variable "NEXTAUTH_SECRET" "Secreto para autenticación (genera uno aleatorio)"
ask_for_variable "NEXTAUTH_URL" "URL de tu aplicación (ej: https://tu-dominio.com)"

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📄 Tu archivo .env.local:"
echo "========================"
cat .env.local
echo "========================"
echo ""
echo "🚀 Próximos pasos:"
echo "1. Ejecuta: npm install"
echo "2. Ejecuta: npm run dev"
echo "3. Ve a http://localhost:3000"
echo ""
echo "🔍 Para verificar la configuración:"
echo "   Ve a http://localhost:3000/api/debug/env-check"
