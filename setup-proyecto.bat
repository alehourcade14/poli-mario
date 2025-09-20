@echo off
echo ================================================
echo    CONFIGURACION DEL SISTEMA DE DENUNCIAS
echo ================================================
echo.

echo Paso 1: Creando archivo .env.local...
if not exist .env.local (
    copy env-template.txt .env.local
    echo ✅ Archivo .env.local creado desde template
) else (
    echo ⚠️  El archivo .env.local ya existe
)
echo.

echo Paso 2: Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas correctamente
echo.

echo Paso 3: Verificando configuración...
echo.
echo ⚠️  IMPORTANTE: Debes configurar las siguientes variables en .env.local:
echo.
echo 1. SUPABASE:
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY  
echo    - SUPABASE_SERVICE_ROLE_KEY
echo.
echo 2. GOOGLE MAPS:
echo    - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
echo.
echo 3. AUTENTICACION:
echo    - NEXTAUTH_SECRET (genera uno aleatorio)
echo.
echo 📋 INSTRUCCIONES:
echo.
echo Para Supabase:
echo 1. Ve a https://supabase.com
echo 2. Crea un proyecto (gratis)
echo 3. Ve a Settings ^> API
echo 4. Copia las credenciales a .env.local
echo.
echo Para Google Maps:
echo 1. Ve a https://console.cloud.google.com
echo 2. Habilita Maps JavaScript API
echo 3. Crea una API Key
echo 4. Configura restricciones de dominio
echo.
echo Para NEXTAUTH_SECRET:
echo 1. Genera un string aleatorio de 32+ caracteres
echo 2. Puedes usar: https://generate-secret.vercel.app/32
echo.
echo ⚠️  DESPUES DE CONFIGURAR LAS VARIABLES:
echo 1. Ejecuta los scripts SQL en Supabase (carpeta scripts/)
echo 2. Ejecuta: npm run dev
echo 3. Ve a http://localhost:3000
echo.
pause
