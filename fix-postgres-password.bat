@echo off
echo ================================================
echo    CORRIGIENDO CONTRASEÑA DE POSTGRESQL
echo ================================================
echo.

echo 🔍 Verificando conexión a PostgreSQL...
echo.

set /p postgres_password="Ingresa la contraseña correcta del usuario postgres: "

echo.
echo 🧪 Probando conexión...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "SELECT 'Conexión exitosa' as status;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ La contraseña es incorrecta. Intenta de nuevo.
    pause
    exit /b 1
)

echo ✅ Conexión exitosa!
echo.

echo 🔧 Actualizando .env.local...

REM Crear nuevo .env.local con la contraseña correcta
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
echo POSTGRES_PASSWORD=%postgres_password%
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

echo ✅ Archivo .env.local actualizado con la contraseña correcta
echo.
echo 🚀 Ahora puedes reiniciar el servidor con: npm run dev
echo.
pause
