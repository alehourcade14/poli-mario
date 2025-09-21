@echo off
echo ============================================
echo CREANDO ARCHIVO .env.local
echo ============================================
echo.

echo Creando archivo .env.local con la API Key de Google Maps...
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
echo POSTGRES_PASSWORD=tu_password_aqui
echo.
echo # ============================================
echo # GOOGLE MAPS PLATFORM API
echo # ============================================
echo # API Key configurada para Google Maps Platform
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

echo ✅ Archivo .env.local creado exitosamente!
echo.
echo La API Key de Google Maps ha sido configurada:
echo NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCbZKl06drMng0-sPZmEJqHJCUdY-N8Vjs
echo.
echo Ahora puedes:
echo 1. Reiniciar el servidor de desarrollo: npm run dev
echo 2. Los mapas deberian funcionar correctamente
echo.
pause
