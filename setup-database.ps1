# ================================================
# SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS
# Sistema de Gestión Policial
# ================================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   CONFIGURACIÓN DEL SISTEMA DE DENUNCIAS" -ForegroundColor Cyan
Write-Host "   CON POSTGRESQL" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si PostgreSQL está instalado
Write-Host "Paso 1: Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL encontrado: $psqlVersion" -ForegroundColor Green
    } else {
        throw "PostgreSQL no encontrado"
    }
} catch {
    Write-Host "❌ PostgreSQL no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Para instalar PostgreSQL:" -ForegroundColor Yellow
    Write-Host "1. Ve a https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. Descarga e instala PostgreSQL" -ForegroundColor White
    Write-Host "3. Asegúrate de recordar la contraseña del usuario postgres" -ForegroundColor White
    Write-Host "4. Reinicia este script después de la instalación" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para continuar después de instalar PostgreSQL"
    exit 1
}

Write-Host ""

# Verificar archivo .env.local
Write-Host "Paso 2: Verificando configuración..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ Archivo .env.local encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host "Creando archivo .env.local desde template..." -ForegroundColor Yellow
    Copy-Item "env-template.txt" ".env.local"
    Write-Host "✅ Archivo .env.local creado" -ForegroundColor Green
}

Write-Host ""

# Solicitar contraseña de PostgreSQL
Write-Host "Paso 3: Configurando base de datos..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Necesitarás configurar la contraseña de PostgreSQL" -ForegroundColor Yellow
Write-Host ""
$postgresPassword = Read-Host "Ingresa la contraseña del usuario postgres" -AsSecureString
$postgresPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($postgresPassword))

Write-Host ""
Write-Host "Creando base de datos..." -ForegroundColor Yellow

# Crear base de datos
try {
    $env:PGPASSWORD = $postgresPasswordPlain
    psql -U postgres -c "CREATE DATABASE sistema_denuncias;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de datos 'sistema_denuncias' creada exitosamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️  La base de datos ya existe o hubo un error" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error creando la base de datos: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Ejecutar scripts SQL
Write-Host "Paso 4: Ejecutando scripts SQL..." -ForegroundColor Yellow

# Lista de scripts a ejecutar en orden
$scripts = @(
    "scripts/database-complete-setup.sql"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "Ejecutando $script..." -ForegroundColor Cyan
        try {
            psql -U postgres -d sistema_denuncias -f $script
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $script ejecutado exitosamente" -ForegroundColor Green
            } else {
                Write-Host "❌ Error ejecutando $script" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error ejecutando $script: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Script no encontrado: $script" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Actualizar .env.local con la contraseña
Write-Host "Paso 5: Actualizando configuración..." -ForegroundColor Yellow
$envContent = Get-Content ".env.local" -Raw
$envContent = $envContent -replace "POSTGRES_PASSWORD=tu_password_aqui", "POSTGRES_PASSWORD=$postgresPasswordPlain"
Set-Content ".env.local" $envContent
Write-Host "✅ Archivo .env.local actualizado" -ForegroundColor Green

Write-Host ""

# Instalar dependencias
Write-Host "Paso 6: Instalando dependencias..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
    } else {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error instalando dependencias: $_" -ForegroundColor Red
}

Write-Host ""

Write-Host "✅ CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para ejecutar el proyecto:" -ForegroundColor Cyan
Write-Host "1. Ejecuta: npm run dev" -ForegroundColor White
Write-Host "2. Ve a http://localhost:3000" -ForegroundColor White
Write-Host "3. Usa estas credenciales:" -ForegroundColor White
Write-Host "   Email: admin@policia.gob.ar" -ForegroundColor White
Write-Host "   Contraseña: admin123" -ForegroundColor White
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "- Configura tu API Key de Google Maps en .env.local" -ForegroundColor White
Write-Host "- Cambia la contraseña del administrador" -ForegroundColor White
Write-Host "- Crea usuarios adicionales desde el panel de administración" -ForegroundColor White
Write-Host ""

# Limpiar variable de entorno sensible
Remove-Variable postgresPasswordPlain
$env:PGPASSWORD = ""

Read-Host "Presiona Enter para continuar"


