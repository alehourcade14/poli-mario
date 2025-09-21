Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SOLUCIONAR ERROR DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Verificando configuracion de PostgreSQL..." -ForegroundColor Yellow
Write-Host ""

# Verificar si PostgreSQL está ejecutándose
Write-Host "1. Verificando si PostgreSQL esta ejecutandose..." -ForegroundColor Green
$postgresService = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue

if ($postgresService) {
    if ($postgresService.Status -eq "Running") {
        Write-Host "✅ PostgreSQL esta ejecutandose" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL no esta ejecutandose" -ForegroundColor Red
        Write-Host "Iniciando servicio de PostgreSQL..." -ForegroundColor Yellow
        Start-Service -Name $postgresService.Name
        Start-Sleep -Seconds 3
        
        if ((Get-Service -Name $postgresService.Name).Status -eq "Running") {
            Write-Host "✅ PostgreSQL iniciado correctamente" -ForegroundColor Green
        } else {
            Write-Host "❌ No se pudo iniciar PostgreSQL" -ForegroundColor Red
            Write-Host "Inicia PostgreSQL manualmente desde Servicios de Windows" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ Servicio de PostgreSQL no encontrado" -ForegroundColor Red
    Write-Host "Instala PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2. Creando archivo .env.local con configuracion de base de datos..." -ForegroundColor Green

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

Write-Host "✅ Archivo .env.local creado" -ForegroundColor Green
Write-Host ""

Write-Host "3. Probando conexion a la base de datos..." -ForegroundColor Green

# Instalar dotenv si no está instalado
if (!(Test-Path "node_modules/dotenv")) {
    Write-Host "Instalando dotenv..." -ForegroundColor Yellow
    npm install dotenv
}

# Ejecutar test de conexión
Write-Host "Ejecutando test de conexion..." -ForegroundColor Yellow
node test-database-connection.js

Write-Host ""
Write-Host "4. Instrucciones adicionales:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si el test falla:" -ForegroundColor Yellow
Write-Host "1. Instala PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor White
Write-Host "2. Usa la contraseña: password" -ForegroundColor White
Write-Host "3. Ejecuta: setup-database.ps1" -ForegroundColor White
Write-Host "4. Reinicia el servidor: npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "✅ Configuracion completada!" -ForegroundColor Green
Write-Host ""
Read-Host "Presiona Enter para continuar"
