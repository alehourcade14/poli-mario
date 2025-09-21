@echo off
echo ============================================
echo CONFIGURACION DE GOOGLE MAPS API
echo ============================================
echo.
echo Este script te ayudara a configurar Google Maps API
echo.
echo PASOS NECESARIOS:
echo 1. Ve a https://console.cloud.google.com
echo 2. Crea un proyecto o selecciona uno existente
echo 3. Habilita las siguientes APIs:
echo    - Maps JavaScript API
echo    - Places API  
echo    - Geocoding API
echo 4. Ve a 'Credentials' y crea una API Key
echo 5. Copia la API Key generada
echo.
echo.
set /p API_KEY="Ingresa tu Google Maps API Key: "

if "%API_KEY%"=="" (
    echo.
    echo ERROR: No se ingreso ninguna API Key
    echo.
    pause
    exit /b 1
)

echo.
echo Configurando API Key en el archivo .env.local...

echo # Configuracion de Google Maps API > .env.local
echo NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=%API_KEY% >> .env.local

echo.
echo ✅ API Key configurada correctamente!
echo.
echo Archivo .env.local creado con la siguiente configuracion:
echo NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=%API_KEY%
echo.
echo Ahora puedes reiniciar el servidor de desarrollo:
echo npm run dev
echo.
pause
