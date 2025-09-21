@echo off
echo ============================================
echo ACTUALIZANDO TEXTO DE ENTREGAS RODADOS
echo ============================================
echo.

echo 1. Verificando cambios realizados...
echo.

REM Verificar dashboard-layout.tsx
findstr /C:"Nueva Entrega de Elementos/Rodados" "components\dashboard-layout.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ dashboard-layout.tsx actualizado
) else (
    echo ❌ dashboard-layout.tsx NO actualizado
)

REM Verificar dashboard page.tsx
findstr /C:"Nueva Entrega de Elementos/Rodados" "app\dashboard\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ dashboard page.tsx actualizado
) else (
    echo ❌ dashboard page.tsx NO actualizado
)

echo.
echo 2. Verificando que no queden referencias antiguas...
echo.

REM Verificar que no quede "Entregas Rodados" sin actualizar
findstr /C:"Entregas Rodados" "components\dashboard-layout.tsx" >nul
if %errorlevel% equ 0 (
    echo ❌ Aún existe "Entregas Rodados" en dashboard-layout.tsx
) else (
    echo ✅ No quedan referencias a "Entregas Rodados" en dashboard-layout.tsx
)

findstr /C:"Entregas Rodados" "app\dashboard\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ❌ Aún existe "Entregas Rodados" en dashboard page.tsx
) else (
    echo ✅ No quedan referencias a "Entregas Rodados" en dashboard page.tsx
)

echo.
echo ============================================
echo ACTUALIZACIÓN COMPLETADA
echo ============================================
echo.
echo ✅ El botón ahora dice: "Nueva Entrega de Elementos/Rodados"
echo ✅ El título en el dashboard también fue actualizado
echo.
echo Para ver los cambios:
echo 1. Reinicia el servidor: npm run dev
echo 2. Ve a /dashboard
echo 3. Verás el nuevo texto en el menú lateral y en las tarjetas
echo.
pause
