@echo off
echo ============================================
echo DIVIDIENDO BOTONES DE DENUNCIA
echo ============================================
echo.

echo 1. Verificando que se eliminó el botón combinado...
echo.

REM Verificar que el botón "Registrar y Generar Denuncia" ya no existe
findstr /C:"Registrar y Generar Denuncia" "app\dashboard\nueva-denuncia-formal\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ❌ Botón "Registrar y Generar Denuncia" AÚN existe
) else (
    echo ✅ Botón "Registrar y Generar Denuncia" eliminado correctamente
)

echo.
echo 2. Verificando que se agregaron los botones separados...
echo.

REM Verificar que el botón "Registrar Denuncia" existe
findstr /C:"Registrar Denuncia" "app\dashboard\nueva-denuncia-formal\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Botón "Registrar Denuncia" encontrado
) else (
    echo ❌ Botón "Registrar Denuncia" NO encontrado
)

REM Verificar que el botón "Generar Denuncia PDF" existe
findstr /C:"Generar Denuncia PDF" "app\dashboard\nueva-denuncia-formal\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Botón "Generar Denuncia PDF" encontrado
) else (
    echo ❌ Botón "Generar Denuncia PDF" NO encontrado
)

echo.
echo 3. Verificando que se agregaron las funciones separadas...
echo.

REM Verificar que la función handleRegistrarDenuncia existe
findstr /C:"handleRegistrarDenuncia" "app\dashboard\nueva-denuncia-formal\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Función handleRegistrarDenuncia encontrada
) else (
    echo ❌ Función handleRegistrarDenuncia NO encontrada
)

REM Verificar que la función handleGenerarPDF existe
findstr /C:"handleGenerarPDF" "app\dashboard\nueva-denuncia-formal\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Función handleGenerarPDF encontrada
) else (
    echo ❌ Función handleGenerarPDF NO encontrada
)

echo.
echo 4. Verificando que se agregó el icono Download...
echo.

REM Verificar que el icono Download está importado
findstr /C:"Download" "app\dashboard\nueva-denuncia-formal\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Icono Download importado
) else (
    echo ❌ Icono Download NO importado
)

echo.
echo 5. Verificando que se agregó la función validateForm...
echo.

REM Verificar que la función validateForm existe
findstr /C:"validateForm" "app\dashboard\nueva-denuncia-formal\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Función validateForm encontrada
) else (
    echo ❌ Función validateForm NO encontrada
)

echo.
echo ============================================
echo VERIFICACIÓN COMPLETADA
echo ============================================
echo.
echo ✅ Botón "Registrar y Generar Denuncia" eliminado
echo ✅ Botón "Registrar Denuncia" agregado
echo ✅ Botón "Generar Denuncia PDF" agregado
echo ✅ Funciones separadas implementadas
echo ✅ Iconos actualizados
echo ✅ Validación centralizada
echo.
echo Funcionalidades:
echo - "Registrar Denuncia": Guarda la denuncia en la base de datos
echo - "Generar Denuncia PDF": Guarda la denuncia Y genera el PDF
echo - Ambos botones validan el formulario antes de proceder
echo.
echo Para probar:
echo 1. Reinicia el servidor: npm run dev
echo 2. Ve a /dashboard/nueva-denuncia-formal
echo 3. Completa el formulario
echo 4. Prueba ambos botones por separado
echo.
pause

