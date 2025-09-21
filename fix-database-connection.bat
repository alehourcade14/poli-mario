@echo off
echo ============================================
echo SOLUCIONAR ERROR DE BASE DE DATOS
echo ============================================
echo.

echo Verificando configuracion de PostgreSQL...
echo.

echo 1. Verificando si PostgreSQL esta ejecutandose...
sc query postgresql >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL no esta ejecutandose
    echo.
    echo Para solucionarlo:
    echo 1. Abre "Servicios" de Windows
    echo 2. Busca "postgresql" o "PostgreSQL"
    echo 3. Haz clic derecho y selecciona "Iniciar"
    echo.
    pause
    exit /b 1
) else (
    echo ✅ PostgreSQL esta ejecutandose
)

echo.
echo 2. Verificando configuracion de base de datos...
echo.

echo Creando archivo .env.local con configuracion de base de datos...
echo.

(
echo # ============================================
echo # CONFIGURACION DEL SISTEMA DE GESTION OPERATIVA
echo # ============================================
echo.
echo # ============================================
echo # CONFIGURACION DE POSTGRESQL
echo # ============================================
echo POSTGRES_HOST=localhost
echo POSTGRES_PORT=5432
echo POSTGRES_DB=sistema_denuncias
echo POSTGRES_USER=postgres
echo POSTGRES_PASSWORD=password
echo.
echo # ============================================
echo # GOOGLE MAPS PLATFORM API
echo # ============================================
echo NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCbZKl06drMng0-sPZmEJqHJCUdY-N8Vjs
echo.
echo # ============================================
echo # CONFIGURACION DE AUTENTICACION
echo # ============================================
echo JWT_SECRET=tu-secreto-super-seguro-para-jwt-cambiar-en-produccion
echo NEXTAUTH_URL=http://localhost:3000
echo.
echo # ============================================
echo # CONFIGURACION DE DESARROLLO
echo # ============================================
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
echo NODE_ENV=development
echo PORT=3000
echo LOG_LEVEL=debug
) > .env.local

echo ✅ Archivo .env.local creado con configuracion de base de datos
echo.

echo 3. Instrucciones para configurar PostgreSQL:
echo.
echo Si no tienes PostgreSQL instalado:
echo 1. Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/
echo 2. Instala con la contraseña: password
echo 3. Ejecuta este script nuevamente
echo.
echo Si ya tienes PostgreSQL instalado:
echo 1. Abre pgAdmin o psql
echo 2. Crea una base de datos llamada: sistema_denuncias
echo 3. Asegurate de que el usuario postgres tenga acceso
echo.

echo 4. Para crear las tablas necesarias:
echo Ejecuta: setup-database.ps1
echo.

echo ✅ Configuracion completada!
echo.
echo Ahora puedes:
echo 1. Ejecutar: setup-database.ps1
echo 2. Reiniciar el servidor: npm run dev
echo.
pause
