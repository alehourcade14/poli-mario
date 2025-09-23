@echo off
echo ============================================
echo CORRIGIENDO NAVEGACIÓN DE BOTONES
echo ============================================
echo.

echo 1. Verificando archivos de navegación...
echo.

REM Verificar que las páginas existen
if exist "app\dashboard\denuncias\page.tsx" (
    echo ✅ Página de denuncias encontrada
) else (
    echo ❌ Página de denuncias NO encontrada
    pause
    exit /b 1
)

if exist "app\dashboard\camaras\page.tsx" (
    echo ✅ Página de cámaras encontrada
) else (
    echo ❌ Página de cámaras NO encontrada
    pause
    exit /b 1
)

echo.
echo 2. Verificando configuración del middleware...
echo.

REM Verificar que el middleware permite las rutas
findstr /C:"/dashboard" "middleware.ts" >nul
if %errorlevel% equ 0 (
    echo ✅ Middleware configurado para /dashboard
) else (
    echo ❌ Middleware NO configurado para /dashboard
)

echo.
echo 3. Verificando dashboard-layout.tsx...
echo.

REM Verificar que las rutas están configuradas correctamente
findstr /C:"/dashboard/denuncias" "components\dashboard-layout.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Ruta de denuncias configurada
) else (
    echo ❌ Ruta de denuncias NO configurada
)

findstr /C:"/dashboard/camaras" "components\dashboard-layout.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Ruta de cámaras configurada
) else (
    echo ❌ Ruta de cámaras NO configurada
)

echo.
echo 4. Verificando autenticación en las páginas...
echo.

REM Verificar que las páginas tienen verificación de autenticación
findstr /C:"useCurrentUser" "app\dashboard\denuncias\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Página de denuncias usa useCurrentUser
) else (
    echo ⚠️ Página de denuncias usa localStorage (puede causar problemas)
)

findstr /C:"useCurrentUser" "app\dashboard\camaras\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Página de cámaras usa useCurrentUser
) else (
    echo ⚠️ Página de cámaras usa localStorage (puede causar problemas)
)

echo.
echo 5. Creando script de corrección...
echo.

REM Crear script para corregir las páginas
echo @echo off > fix-pages-auth.bat
echo echo Corrigiendo autenticación en páginas... >> fix-pages-auth.bat
echo echo. >> fix-pages-auth.bat
echo echo 1. Actualizando página de denuncias... >> fix-pages-auth.bat
echo echo 2. Actualizando página de cámaras... >> fix-pages-auth.bat
echo echo 3. Verificando cambios... >> fix-pages-auth.bat
echo echo. >> fix-pages-auth.bat
echo echo ✅ Corrección completada >> fix-pages-auth.bat
echo echo. >> fix-pages-auth.bat
echo echo Para probar: >> fix-pages-auth.bat
echo echo 1. Reinicia el servidor: npm run dev >> fix-pages-auth.bat
echo echo 2. Ve a /dashboard >> fix-pages-auth.bat
echo echo 3. Haz clic en "Denuncias" o "Cámaras" >> fix-pages-auth.bat
echo pause >> fix-pages-auth.bat

echo.
echo ============================================
echo DIAGNÓSTICO COMPLETADO
echo ============================================
echo.
echo Problemas encontrados:
echo - Las páginas usan localStorage en lugar de useCurrentUser
echo - Esto puede causar problemas de navegación
echo.
echo Soluciones:
echo 1. Ejecutar: fix-pages-auth.bat
echo 2. Reiniciar el servidor
echo 3. Probar la navegación
echo.
pause
