@echo off
echo ============================================
echo ELIMINANDO BOTÓN "CARGAR DENUNCIA"
echo ============================================
echo.

echo 1. Verificando que el botón se eliminó...
echo.

REM Verificar que el botón "Cargar Denuncia" ya no existe
findstr /C:"Cargar Denuncia" "app\dashboard\denuncias\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ❌ Botón "Cargar Denuncia" AÚN existe
) else (
    echo ✅ Botón "Cargar Denuncia" eliminado correctamente
)

echo.
echo 2. Verificando que el botón "Nueva Denuncia" sigue existiendo...
echo.

REM Verificar que el botón "Nueva Denuncia" sigue existiendo
findstr /C:"Nueva Denuncia" "app\dashboard\denuncias\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Botón "Nueva Denuncia" sigue existiendo
) else (
    echo ❌ Botón "Nueva Denuncia" NO encontrado
)

echo.
echo 3. Verificando que la ruta /dashboard/nueva-denuncia ya no se usa...
echo.

REM Verificar que la ruta /dashboard/nueva-denuncia ya no se usa
findstr /C:"/dashboard/nueva-denuncia" "app\dashboard\denuncias\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ❌ Ruta /dashboard/nueva-denuncia AÚN se usa
) else (
    echo ✅ Ruta /dashboard/nueva-denuncia eliminada correctamente
)

echo.
echo 4. Verificando que la ruta /dashboard/nueva-denuncia-formal sigue existiendo...
echo.

REM Verificar que la ruta /dashboard/nueva-denuncia-formal sigue existiendo
findstr /C:"/dashboard/nueva-denuncia-formal" "app\dashboard\denuncias\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Ruta /dashboard/nueva-denuncia-formal sigue existiendo
) else (
    echo ❌ Ruta /dashboard/nueva-denuncia-formal NO encontrada
)

echo.
echo ============================================
echo VERIFICACIÓN COMPLETADA
echo ============================================
echo.
echo ✅ Botón "Cargar Denuncia" eliminado
echo ✅ Botón "Nueva Denuncia" mantenido
echo ✅ Ruta /dashboard/nueva-denuncia eliminada
echo ✅ Ruta /dashboard/nueva-denuncia-formal mantenida
echo.
echo Para probar:
echo 1. Reinicia el servidor: npm run dev
echo 2. Ve a /dashboard/denuncias
echo 3. Verifica que solo aparece el botón "Nueva Denuncia"
echo.
pause

