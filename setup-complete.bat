@echo off
echo ============================================
echo CONFIGURACION COMPLETA DEL SISTEMA
echo ============================================
echo.

echo 1. Solucionando error de next.config.mjs...
echo ✅ Error de i18n.localeDetection corregido
echo.

echo 2. Configurando PostgreSQL...
echo.
set /p POSTGRES_PASSWORD="Ingresa la contraseña de PostgreSQL (o presiona Enter para usar 'password'): "

if "%POSTGRES_PASSWORD%"=="" (
    set POSTGRES_PASSWORD=password
)

echo.
echo Creando archivo .env.local con la contraseña: %POSTGRES_PASSWORD%
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
echo POSTGRES_PASSWORD=%POSTGRES_PASSWORD%
echo.
echo # ============================================
echo # GOOGLE MAPS PLATFORM API
echo # ============================================
echo NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCbZKl06drMng0-sPZmEJqHJCUdY-N8Vjs
echo.
echo # ============================================
echo # CONFIGURACION DE AUTENTICACION
echo # ============================================
echo JWT_SECRET=mi-secreto-super-seguro-para-jwt-2024
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

echo ✅ Archivo .env.local creado
echo.

echo 3. Instalando dependencias...
echo.
npm install pg bcryptjs jsonwebtoken dotenv
echo.

echo 4. Creando usuario admin...
echo.
node create-admin-user.js
echo.

echo 5. Configuracion completada!
echo.
echo ============================================
echo CREDENCIALES DE ACCESO
echo ============================================
echo Email: admin@policia.gob.ar
echo Contraseña: admin123
echo ============================================
echo.
echo Ahora puedes:
echo 1. Reiniciar el servidor: npm run dev
echo 2. Ir a: http://localhost:3000
echo 3. Hacer login con las credenciales de arriba
echo.
pause
