Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CREANDO ARCHIVO .env.local" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Creando archivo .env.local con la API Key de Google Maps..." -ForegroundColor Yellow
Write-Host ""

$envContent = @"
# ============================================
# CONFIGURACION DEL SISTEMA DE GESTION OPERATIVA
# ============================================

# ============================================
# CONFIGURACION DE POSTGRESQL
# ============================================
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sistema_denuncias
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password_aqui

# ============================================
# GOOGLE MAPS PLATFORM API
# ============================================
# API Key configurada para Google Maps Platform
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCbZKl06drMng0-sPZmEJqHJCUdY-N8Vjs

# ============================================
# CONFIGURACION DE AUTENTICACION
# ============================================
JWT_SECRET=tu-secreto-super-seguro-para-jwt-cambiar-en-produccion
NEXTAUTH_URL=http://localhost:3000

# ============================================
# CONFIGURACION DE DESARROLLO
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Archivo .env.local creado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "La API Key de Google Maps ha sido configurada:" -ForegroundColor Yellow
Write-Host "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCbZKl06drMng0-sPZmEJqHJCUdY-N8Vjs" -ForegroundColor White
Write-Host ""
Write-Host "Ahora puedes:" -ForegroundColor Green
Write-Host "1. Reiniciar el servidor de desarrollo: npm run dev" -ForegroundColor White
Write-Host "2. Los mapas deberian funcionar correctamente" -ForegroundColor White
Write-Host ""
Read-Host "Presiona Enter para continuar"
