@echo off
echo Corrigiendo navegacion a camaras...
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo Error: No se encontro package.json
    echo Asegurate de estar en el directorio del proyecto
    pause
    exit /b 1
)

echo 1. Verificando archivos...

REM Verificar dashboard-layout.tsx
if not exist "components\dashboard-layout.tsx" (
    echo Error: No se encontro dashboard-layout.tsx
    pause
    exit /b 1
)

REM Verificar camaras-map.tsx
if not exist "components\camaras-map.tsx" (
    echo Error: No se encontro camaras-map.tsx
    pause
    exit /b 1
)

REM Verificar pagina de camaras
if not exist "app\dashboard\camaras\page.tsx" (
    echo Error: No se encontro la pagina de camaras
    pause
    exit /b 1
)

echo 2. Aplicando correcciones...

REM Corregir dashboard-layout.tsx
powershell -Command "(Get-Content 'components\dashboard-layout.tsx') -replace 'user\?\.role', 'user?.rol' | Set-Content 'components\dashboard-layout.tsx'"

REM Corregir camaras-map.tsx
powershell -Command "(Get-Content 'components\camaras-map.tsx') -replace 'user\?\.role', 'user?.rol' | Set-Content 'components\camaras-map.tsx'"

echo 3. Verificando correcciones...

REM Verificar que se aplicaron las correcciones
findstr /C:"user?.rol" "components\dashboard-layout.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ dashboard-layout.tsx corregido
) else (
    echo ❌ Error en dashboard-layout.tsx
)

findstr /C:"user?.rol" "components\camaras-map.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ camaras-map.tsx corregido
) else (
    echo ❌ Error en camaras-map.tsx
)

echo.
echo Correccion completada!
echo.
echo Ahora:
echo 1. Reinicia el servidor: npm run dev
echo 2. Ve a /dashboard
echo 3. Haz clic en "Camaras"
echo.
pause
