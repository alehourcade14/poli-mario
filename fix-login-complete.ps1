Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SOLUCIONAR ERROR DE LOGIN COMPLETO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Instalando dependencias necesarias..." -ForegroundColor Green
Write-Host ""

# Instalar dependencias si no están instaladas
if (!(Test-Path "node_modules/pg")) {
    Write-Host "Instalando pg (PostgreSQL client)..." -ForegroundColor Yellow
    npm install pg
}

if (!(Test-Path "node_modules/bcryptjs")) {
    Write-Host "Instalando bcryptjs..." -ForegroundColor Yellow
    npm install bcryptjs
}

if (!(Test-Path "node_modules/jsonwebtoken")) {
    Write-Host "Instalando jsonwebtoken..." -ForegroundColor Yellow
    npm install jsonwebtoken
}

if (!(Test-Path "node_modules/dotenv")) {
    Write-Host "Instalando dotenv..." -ForegroundColor Yellow
    npm install dotenv
}

Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
Write-Host ""

Write-Host "2. Creando archivo .env.local con configuracion completa..." -ForegroundColor Green

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
POSTGRES_PASSWORD=password

# ============================================
# GOOGLE MAPS PLATFORM API
# ============================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCbZKl06drMng0-sPZmEJqHJCUdY-N8Vjs

# ============================================
# CONFIGURACION DE AUTENTICACION
# ============================================
JWT_SECRET=mi-secreto-super-seguro-para-jwt-2024
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

Write-Host "✅ Archivo .env.local creado" -ForegroundColor Green
Write-Host ""

Write-Host "3. Verificando PostgreSQL..." -ForegroundColor Green

# Verificar si PostgreSQL está ejecutándose
$postgresService = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue

if ($postgresService) {
    if ($postgresService.Status -ne "Running") {
        Write-Host "Iniciando PostgreSQL..." -ForegroundColor Yellow
        Start-Service -Name $postgresService.Name
        Start-Sleep -Seconds 5
    }
    
    if ((Get-Service -Name $postgresService.Name).Status -eq "Running") {
        Write-Host "✅ PostgreSQL esta ejecutandose" -ForegroundColor Green
    } else {
        Write-Host "❌ No se pudo iniciar PostgreSQL" -ForegroundColor Red
        Write-Host "Inicia PostgreSQL manualmente desde Servicios de Windows" -ForegroundColor Yellow
        Write-Host "O instala PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ PostgreSQL no esta instalado" -ForegroundColor Red
    Write-Host "Instala PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Usa la contraseña: password" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "4. Ejecutando diagnostico completo..." -ForegroundColor Green
Write-Host ""

# Ejecutar diagnóstico
node debug-login-error.js

Write-Host ""
Write-Host "5. Creando base de datos y tablas..." -ForegroundColor Green

# Verificar si setup-database.ps1 existe
if (Test-Path "setup-database.ps1") {
    Write-Host "Ejecutando setup-database.ps1..." -ForegroundColor Yellow
    & .\setup-database.ps1
} else {
    Write-Host "⚠️  setup-database.ps1 no encontrado" -ForegroundColor Yellow
    Write-Host "Ejecuta manualmente: npm run setup-db" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTICO COMPLETADO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora puedes:" -ForegroundColor Green
Write-Host "1. Reiniciar el servidor: npm run dev" -ForegroundColor White
Write-Host "2. Ir a: http://localhost:3000" -ForegroundColor White
Write-Host "3. Hacer login con:" -ForegroundColor White
Write-Host "   📧 Email: admin@policia.gob.ar" -ForegroundColor Yellow
Write-Host "   🔑 Contraseña: admin123" -ForegroundColor Yellow
Write-Host ""
Read-Host "Presiona Enter para continuar"
