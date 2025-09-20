@echo off
echo ================================================
echo    CONFIGURANDO VARIABLES DE ENTORNO
echo ================================================
echo.

echo Configurando .env.local...
(
echo # ============================================
echo # CONFIGURACION DEL SISTEMA DE DENUNCIAS
echo # ============================================
echo.
echo # ============================================
echo # CONFIGURACION DE POSTGRESQL
echo # ============================================
echo POSTGRES_HOST=localhost
echo POSTGRES_PORT=5432
echo POSTGRES_DB=sistema_denuncias
echo POSTGRES_USER=postgres
echo POSTGRES_PASSWORD=admin123
echo.
echo # ============================================
echo # GOOGLE MAPS API
echo # ============================================
echo NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-google-maps-api-key-aqui
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
) > .env.local

echo ✅ Archivo .env.local configurado
echo.
echo ⚠️  IMPORTANTE: 
echo - La contraseña de PostgreSQL está configurada como 'admin123'
echo - Cambia el JWT_SECRET por uno más seguro
echo - Configura tu API Key de Google Maps
echo.
pause
