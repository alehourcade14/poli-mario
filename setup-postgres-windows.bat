@echo off
echo ================================================
echo    CONFIGURACION DEL SISTEMA DE DENUNCIAS
echo    CON POSTGRESQL
echo ================================================
echo.

echo Paso 1: Verificando PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL no está instalado o no está en el PATH
    echo.
    echo 📥 Para instalar PostgreSQL:
    echo 1. Ve a https://www.postgresql.org/download/windows/
    echo 2. Descarga e instala PostgreSQL
    echo 3. Asegúrate de recordar la contraseña del usuario postgres
    echo 4. Reinicia este script después de la instalación
    echo.
    pause
    exit /b 1
)
echo ✅ PostgreSQL encontrado
echo.

echo Paso 2: Creando archivo .env.local...
if not exist .env.local (
    copy env-template.txt .env.local
    echo ✅ Archivo .env.local creado
) else (
    echo ⚠️  El archivo .env.local ya existe
)
echo.

echo Paso 3: Configurando base de datos...
echo.
echo 🔧 Necesitarás configurar la contraseña de PostgreSQL
echo.
set /p postgres_password="Ingresa la contraseña del usuario postgres: "

echo.
echo Creando base de datos...
psql -U postgres -c "CREATE DATABASE sistema_denuncias;" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  La base de datos ya existe o hubo un error
)

echo.
echo Ejecutando scripts SQL...
echo Ejecutando 01-create-base-tables.sql...
psql -U postgres -d sistema_denuncias -f scripts\01-create-base-tables.sql

echo Ejecutando 02-create-users-table.sql...
psql -U postgres -d sistema_denuncias -f scripts\02-create-users-table.sql

echo Ejecutando 03-create-denuncias-table.sql...
psql -U postgres -d sistema_denuncias -f scripts\03-create-denuncias-table.sql

echo Ejecutando 04-create-denuncias-formales-table.sql...
psql -U postgres -d sistema_denuncias -f scripts\04-create-denuncias-formales-table.sql

echo Ejecutando 05-create-entregas-rodados-table.sql...
psql -U postgres -d sistema_denuncias -f scripts\05-create-entregas-rodados-table.sql

echo Ejecutando 06-create-camaras-table.sql...
psql -U postgres -d sistema_denuncias -f scripts\06-create-camaras-table.sql

echo Ejecutando 07-create-ampliaciones-table.sql...
psql -U postgres -d sistema_denuncias -f scripts\07-create-ampliaciones-table.sql

echo Ejecutando 08-create-functions-triggers.sql...
psql -U postgres -d sistema_denuncias -f scripts\08-create-functions-triggers.sql

echo Ejecutando 09-create-rls-policies.sql...
psql -U postgres -d sistema_denuncias -f scripts\09-create-rls-policies.sql

echo Ejecutando 10-create-views.sql...
psql -U postgres -d sistema_denuncias -f scripts\10-create-views.sql

echo.
echo ✅ Base de datos configurada exitosamente
echo.

echo Paso 4: Actualizando .env.local...
echo POSTGRES_PASSWORD=%postgres_password% >> .env.local

echo.
echo Paso 5: Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas
echo.

echo ✅ CONFIGURACION COMPLETADA
echo.
echo 🚀 Para ejecutar el proyecto:
echo 1. Ejecuta: npm run dev
echo 2. Ve a http://localhost:3000
echo 3. Usa estas credenciales:
echo    Email: admin@policia.gob.ar
echo    Contraseña: admin123
echo.
echo 📋 Próximos pasos:
echo - Configura tu API Key de Google Maps en .env.local
echo - Cambia la contraseña del administrador
echo - Crea usuarios adicionales desde el panel de administración
echo.
pause
