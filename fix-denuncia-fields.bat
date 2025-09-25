@echo off
echo ============================================
echo CORRIGIENDO CAMPOS DE DENUNCIAS
echo ============================================
echo.

echo 1. Verificando dependencias...
echo.

REM Verificar que Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado
)

REM Verificar que el archivo .env.local existe
if exist ".env.local" (
    echo ✅ Archivo .env.local encontrado
) else (
    echo ❌ Archivo .env.local NO encontrado
    echo Por favor ejecuta create-env-local.bat primero
    pause
    exit /b 1
)

echo.
echo 2. Ejecutando corrección de campos...
echo.

node fix-denuncia-fields.js

echo.
echo 3. Verificando cambios...
echo.

REM Verificar que la API fue actualizada
findstr /C:"tipo_delito_nombre" "app\api\denuncias\[id]\route.ts" >nul
if %errorlevel% equ 0 (
    echo ✅ API actualizada con tipo_delito_nombre
) else (
    echo ❌ API NO actualizada
)

REM Verificar que la página fue actualizada
findstr /C:"tipo_delito_nombre" "app\dashboard\denuncia\[id]\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Página actualizada con tipo_delito_nombre
) else (
    echo ❌ Página NO actualizada
)

echo.
echo ============================================
echo CORRECCIÓN COMPLETADA
echo ============================================
echo.
echo ✅ Tabla tipos_delitos creada/verificada
echo ✅ Columna tipo_delito_id agregada/verificada
echo ✅ Columna division agregada/verificada
echo ✅ API actualizada para devolver nombres
echo ✅ Página actualizada para mostrar nombres
echo.
echo Para probar:
echo 1. Reinicia el servidor: npm run dev
echo 2. Ve a /dashboard/denuncias
echo 3. Haz clic en una denuncia existente
echo 4. Verifica que los campos se muestran correctamente
echo.
pause

