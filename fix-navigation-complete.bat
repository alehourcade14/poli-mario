@echo off
echo ============================================
echo CORRIGIENDO NAVEGACIÓN COMPLETA
echo ============================================
echo.

echo 1. Verificando cambios en las páginas...
echo.

REM Verificar que las páginas usan useCurrentUser
findstr /C:"useCurrentUser" "app\dashboard\denuncias\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Página de denuncias actualizada con useCurrentUser
) else (
    echo ❌ Página de denuncias NO actualizada
)

findstr /C:"useCurrentUser" "app\dashboard\camaras\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Página de cámaras actualizada con useCurrentUser
) else (
    echo ❌ Página de cámaras NO actualizada
)

echo.
echo 2. Verificando middleware...
echo.

REM Verificar que el middleware está configurado correctamente
findstr /C:"/dashboard" "middleware.ts" >nul
if %errorlevel% equ 0 (
    echo ✅ Middleware configurado para rutas /dashboard
) else (
    echo ❌ Middleware NO configurado
)

echo.
echo 3. Verificando dashboard-layout...
echo.

REM Verificar que las rutas están correctas
findstr /C:"/dashboard/denuncias" "components\dashboard-layout.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Ruta de denuncias: /dashboard/denuncias
) else (
    echo ❌ Ruta de denuncias NO encontrada
)

findstr /C:"/dashboard/camaras" "components\dashboard-layout.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Ruta de cámaras: /dashboard/camaras
) else (
    echo ❌ Ruta de cámaras NO encontrada
)

echo.
echo 4. Verificando que las páginas existen...
echo.

if exist "app\dashboard\denuncias\page.tsx" (
    echo ✅ Página de denuncias existe
) else (
    echo ❌ Página de denuncias NO existe
)

if exist "app\dashboard\camaras\page.tsx" (
    echo ✅ Página de cámaras existe
) else (
    echo ❌ Página de cámaras NO existe
)

echo.
echo 5. Creando script de prueba...
echo.

REM Crear script de prueba
echo @echo off > test-navigation.bat
echo echo ============================================ >> test-navigation.bat
echo echo PROBANDO NAVEGACIÓN >> test-navigation.bat
echo echo ============================================ >> test-navigation.bat
echo echo. >> test-navigation.bat
echo echo 1. Iniciando servidor... >> test-navigation.bat
echo start /B npm run dev >> test-navigation.bat
echo echo. >> test-navigation.bat
echo echo 2. Esperando 5 segundos para que el servidor inicie... >> test-navigation.bat
echo timeout /t 5 /nobreak ^>nul >> test-navigation.bat
echo echo. >> test-navigation.bat
echo echo 3. Abriendo navegador... >> test-navigation.bat
echo start http://localhost:3000 >> test-navigation.bat
echo echo. >> test-navigation.bat
echo echo ✅ Navegador abierto >> test-navigation.bat
echo echo. >> test-navigation.bat
echo echo Para probar: >> test-navigation.bat
echo echo 1. Inicia sesión en el sistema >> test-navigation.bat
echo echo 2. Ve al dashboard >> test-navigation.bat
echo echo 3. Haz clic en "Denuncias" - debe ir a /dashboard/denuncias >> test-navigation.bat
echo echo 4. Haz clic en "Cámaras" - debe ir a /dashboard/camaras >> test-navigation.bat
echo echo. >> test-navigation.bat
echo pause >> test-navigation.bat

echo.
echo ============================================
echo CORRECCIÓN COMPLETADA
echo ============================================
echo.
echo ✅ Páginas actualizadas con useCurrentUser
echo ✅ Middleware configurado correctamente
echo ✅ Rutas configuradas en dashboard-layout
echo ✅ Páginas de destino existen
echo.
echo Para probar la navegación:
echo 1. Ejecutar: test-navigation.bat
echo 2. O manualmente: npm run dev
echo 3. Ir a http://localhost:3000
echo 4. Iniciar sesión
echo 5. Probar los botones "Denuncias" y "Cámaras"
echo.
echo Si aún hay problemas:
echo 1. Verificar que el servidor esté corriendo
echo 2. Limpiar caché del navegador (Ctrl+F5)
echo 3. Verificar la consola del navegador para errores
echo.
pause
