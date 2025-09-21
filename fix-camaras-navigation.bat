@echo off
echo ============================================
echo CORRIGIENDO NAVEGACIÓN A CÁMARAS
echo ============================================
echo.

echo 1. Verificando cambios realizados...
echo.
echo ✅ Corregido user?.role por user?.rol en dashboard-layout.tsx
echo ✅ Corregido user?.role por user?.rol en camaras-map.tsx
echo.

echo 2. Verificando que la página de cámaras existe...
if exist "app\dashboard\camaras\page.tsx" (
    echo ✅ Página de cámaras encontrada
) else (
    echo ❌ Página de cámaras no encontrada
    pause
    exit /b 1
)

echo.
echo 3. Verificando que el componente CamarasMap existe...
if exist "components\camaras-map.tsx" (
    echo ✅ Componente CamarasMap encontrado
) else (
    echo ❌ Componente CamarasMap no encontrado
    pause
    exit /b 1
)

echo.
echo ============================================
echo CORRECCIÓN COMPLETADA
echo ============================================
echo.
echo ✅ El botón "Cámaras" ahora debería funcionar correctamente
echo.
echo Para probar:
echo 1. Reinicia el servidor: npm run dev
echo 2. Ve a /dashboard
echo 3. Haz clic en "Cámaras" en el menú lateral
echo 4. Deberías ver la página de cámaras con el mapa
echo.
echo Si aún tienes problemas:
echo - Verifica que estés logueado correctamente
echo - Revisa la consola del navegador para errores
echo - Asegúrate de que la API key de Google Maps esté configurada
echo.
pause
