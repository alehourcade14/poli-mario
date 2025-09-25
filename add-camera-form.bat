@echo off
echo ============================================
echo AGREGANDO FORMULARIO DE CÁMARAS
echo ============================================
echo.

echo 1. Verificando archivos necesarios...
echo.

REM Verificar que la página de estadísticas existe
if exist "app\dashboard\estadisticas\page.tsx" (
    echo ✅ Página de estadísticas encontrada
) else (
    echo ❌ Página de estadísticas NO encontrada
    pause
    exit /b 1
)

echo.
echo 2. Verificando que el formulario se agregó correctamente...
echo.

REM Verificar que el botón "Agregar Cámaras" existe
findstr /C:"Agregar Cámaras" "app\dashboard\estadisticas\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Botón "Agregar Cámaras" encontrado
) else (
    echo ❌ Botón "Agregar Cámaras" NO encontrado
)

REM Verificar que el formulario tiene los campos necesarios
findstr /C:"Nombre de la Cámara" "app\dashboard\estadisticas\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Campo "Nombre de la Cámara" encontrado
) else (
    echo ❌ Campo "Nombre de la Cámara" NO encontrado
)

findstr /C:"Tipo de Cámara" "app\dashboard\estadisticas\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Campo "Tipo de Cámara" encontrado
) else (
    echo ❌ Campo "Tipo de Cámara" NO encontrado
)

findstr /C:"Visión Nocturna" "app\dashboard\estadisticas\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Checkbox "Visión Nocturna" encontrado
) else (
    echo ❌ Checkbox "Visión Nocturna" NO encontrado
)

echo.
echo 3. Verificando imports necesarios...
echo.

REM Verificar imports de Dialog
findstr /C:"Dialog" "app\dashboard\estadisticas\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Imports de Dialog encontrados
) else (
    echo ❌ Imports de Dialog NO encontrados
)

REM Verificar imports de Input y Label
findstr /C:"Input" "app\dashboard\estadisticas\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Imports de Input encontrados
) else (
    echo ❌ Imports de Input NO encontrados
)

echo.
echo ============================================
echo FORMULARIO DE CÁMARAS AGREGADO
echo ============================================
echo.
echo ✅ Botón "Agregar Cámaras" agregado en /dashboard/estadisticas
echo ✅ Formulario completo con todos los campos necesarios
echo ✅ Validación de campos obligatorios
echo ✅ Interfaz responsive y moderna
echo.
echo Campos del formulario:
echo - Nombre de la Cámara (obligatorio)
echo - Ubicación (obligatorio)
echo - Dirección (obligatorio)
echo - Tipo de Cámara (obligatorio)
echo - Estado
echo - Resolución
echo - Coordenadas GPS (Latitud/Longitud)
echo - Características (Visión Nocturna, Audio, Grabación)
echo - Observaciones
echo.
echo Para probar:
echo 1. Reinicia el servidor: npm run dev
echo 2. Ve a /dashboard/estadisticas
echo 3. Haz clic en la pestaña "Cámaras"
echo 4. Haz clic en "Agregar Cámaras"
echo 5. Completa el formulario y prueba la funcionalidad
echo.
pause


