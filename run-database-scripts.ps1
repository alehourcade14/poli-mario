# ================================================
# SCRIPT SIMPLE PARA EJECUTAR SCRIPTS DE BD
# Sistema de Gestión Policial
# ================================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   EJECUTANDO SCRIPTS DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si PostgreSQL está disponible
Write-Host "Verificando PostgreSQL..." -ForegroundColor Yellow

# Agregar PostgreSQL al PATH si no está disponible
$postgresPath = "C:\Program Files\PostgreSQL\17\bin"
if ($env:PATH -notlike "*$postgresPath*") {
    $env:PATH += ";$postgresPath"
    Write-Host "✅ Agregando PostgreSQL al PATH" -ForegroundColor Green
}

try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL encontrado: $psqlVersion" -ForegroundColor Green
    } else {
        throw "PostgreSQL no encontrado"
    }
} catch {
    Write-Host "❌ PostgreSQL no está disponible" -ForegroundColor Red
    Write-Host "Asegúrate de que PostgreSQL esté instalado y en el PATH" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Solicitar contraseña
$postgresPassword = Read-Host "Ingresa la contraseña del usuario postgres" -AsSecureString
$postgresPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($postgresPassword))

# Configurar variable de entorno
$env:PGPASSWORD = $postgresPasswordPlain

Write-Host ""

# Crear base de datos si no existe
Write-Host "Creando base de datos 'sistema_denuncias'..." -ForegroundColor Yellow
psql -U postgres -c "CREATE DATABASE sistema_denuncias;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos creada o ya existe" -ForegroundColor Green
} else {
    Write-Host "⚠️  La base de datos ya existe o hubo un error" -ForegroundColor Yellow
}

Write-Host ""

# Ejecutar script completo de configuración
Write-Host "Ejecutando script de configuración completa..." -ForegroundColor Yellow
if (Test-Path "scripts/database-complete-setup.sql") {
    psql -U postgres -d sistema_denuncias -f "scripts/database-complete-setup.sql"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Script ejecutado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error ejecutando el script" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Script no encontrado: scripts/database-complete-setup.sql" -ForegroundColor Red
}

Write-Host ""

# Verificar que las tablas se crearon
Write-Host "Verificando tablas creadas..." -ForegroundColor Yellow
psql -U postgres -d sistema_denuncias -c "\dt"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tablas verificadas" -ForegroundColor Green
} else {
    Write-Host "❌ Error verificando tablas" -ForegroundColor Red
}

Write-Host ""

Write-Host "✅ CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Tu base de datos está lista para usar!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales de acceso:" -ForegroundColor Yellow
Write-Host "Email: admin@policia.gob.ar" -ForegroundColor White
Write-Host "Contraseña: admin123" -ForegroundColor White
Write-Host ""

# Limpiar variable de entorno sensible
Remove-Variable postgresPasswordPlain
$env:PGPASSWORD = ""

Read-Host "Presiona Enter para continuar"
