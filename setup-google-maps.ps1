Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CONFIGURACION DE GOOGLE MAPS API" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script te ayudara a configurar Google Maps API" -ForegroundColor Yellow
Write-Host ""
Write-Host "PASOS NECESARIOS:" -ForegroundColor Green
Write-Host "1. Ve a https://console.cloud.google.com" -ForegroundColor White
Write-Host "2. Crea un proyecto o selecciona uno existente" -ForegroundColor White
Write-Host "3. Habilita las siguientes APIs:" -ForegroundColor White
Write-Host "   - Maps JavaScript API" -ForegroundColor White
Write-Host "   - Places API" -ForegroundColor White
Write-Host "   - Geocoding API" -ForegroundColor White
Write-Host "4. Ve a 'Credentials' y crea una API Key" -ForegroundColor White
Write-Host "5. Copia la API Key generada" -ForegroundColor White
Write-Host ""
Write-Host ""

$apiKey = Read-Host "Ingresa tu Google Maps API Key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host ""
    Write-Host "ERROR: No se ingreso ninguna API Key" -ForegroundColor Red
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "Configurando API Key en el archivo .env.local..." -ForegroundColor Yellow

$envContent = @"
# Configuracion de Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$apiKey
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ""
Write-Host "✅ API Key configurada correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Archivo .env.local creado con la siguiente configuracion:" -ForegroundColor Yellow
Write-Host "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$apiKey" -ForegroundColor White
Write-Host ""
Write-Host "Ahora puedes reiniciar el servidor de desarrollo:" -ForegroundColor Green
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Read-Host "Presiona Enter para continuar"
