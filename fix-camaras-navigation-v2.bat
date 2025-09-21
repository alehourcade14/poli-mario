@echo off
echo ============================================
echo CORRIGIENDO NAVEGACIÓN A CÁMARAS V2
echo ============================================
echo.

echo 1. Verificando archivos necesarios...
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ No se encontró package.json. Asegúrate de estar en el directorio del proyecto.
    pause
    exit /b 1
)

echo ✅ Directorio del proyecto encontrado

REM Verificar página de cámaras
if exist "app\dashboard\camaras\page.tsx" (
    echo ✅ Página de cámaras encontrada
) else (
    echo ❌ Página de cámaras no encontrada
    echo Creando página de cámaras...
    mkdir "app\dashboard\camaras" 2>nul
    echo "use client" > "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo import { useEffect, useState } from "react" >> "app\dashboard\camaras\page.tsx"
    echo import { useRouter } from "next/navigation" >> "app\dashboard\camaras\page.tsx"
    echo import DashboardLayout from "@/components/dashboard-layout" >> "app\dashboard\camaras\page.tsx"
    echo import CamarasMap from "@/components/camaras-map" >> "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo export default function CamarasPage() { >> "app\dashboard\camaras\page.tsx"
    echo   const [user, setUser] = useState^(null^) >> "app\dashboard\camaras\page.tsx"
    echo   const router = useRouter^(^) >> "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo   useEffect^(^(^) => { >> "app\dashboard\camaras\page.tsx"
    echo     const currentUser = localStorage.getItem^("currentUser"^) >> "app\dashboard\camaras\page.tsx"
    echo     if ^(!currentUser^) { >> "app\dashboard\camaras\page.tsx"
    echo       router.push^("/"^) >> "app\dashboard\camaras\page.tsx"
    echo       return >> "app\dashboard\camaras\page.tsx"
    echo     } >> "app\dashboard\camaras\page.tsx"
    echo     setUser^(JSON.parse^(currentUser^)^) >> "app\dashboard\camaras\page.tsx"
    echo   }, [router]^) >> "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo   if ^(!user^) return null >> "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo   return ^( >> "app\dashboard\camaras\page.tsx"
    echo     ^<DashboardLayout user={user}^> >> "app\dashboard\camaras\page.tsx"
    echo       ^<div className="p-6"^> >> "app\dashboard\camaras\page.tsx"
    echo         ^<div className="mb-6"^> >> "app\dashboard\camaras\page.tsx"
    echo           ^<h1 className="text-2xl font-bold"^>Cámaras de Seguridad^</h1^> >> "app\dashboard\camaras\page.tsx"
    echo           ^<p className="text-muted-foreground"^>Monitoreo y gestión de cámaras de seguridad en La Rioja Capital^</p^> >> "app\dashboard\camaras\page.tsx"
    echo         ^</div^> >> "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo         ^<CamarasMap user={user} /^> >> "app\dashboard\camaras\page.tsx"
    echo       ^</div^> >> "app\dashboard\camaras\page.tsx"
    echo     ^</DashboardLayout^> >> "app\dashboard\camaras\page.tsx"
    echo   ^) >> "app\dashboard\camaras\page.tsx"
    echo } >> "app\dashboard\camaras\page.tsx"
    echo ✅ Página de cámaras creada
)

REM Verificar componente CamarasMap
if exist "components\camaras-map.tsx" (
    echo ✅ Componente CamarasMap encontrado
) else (
    echo ❌ Componente CamarasMap no encontrado
    echo Este componente es necesario para que funcione la página de cámaras
    pause
    exit /b 1
)

echo.
echo 2. Verificando correcciones de código...
echo.

REM Verificar que se corrigió user?.role por user?.rol en dashboard-layout.tsx
findstr /C:"user?.rol" "components\dashboard-layout.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Corrección user?.rol encontrada en dashboard-layout.tsx
) else (
    echo ❌ No se encontró la corrección user?.rol en dashboard-layout.tsx
    echo Aplicando corrección...
    powershell -Command "(Get-Content 'components\dashboard-layout.tsx') -replace 'user\?\.role', 'user?.rol' | Set-Content 'components\dashboard-layout.tsx'"
    echo ✅ Corrección aplicada
)

REM Verificar que se corrigió user?.role por user?.rol en camaras-map.tsx
findstr /C:"user?.rol" "components\camaras-map.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Corrección user?.rol encontrada en camaras-map.tsx
) else (
    echo ❌ No se encontró la corrección user?.rol en camaras-map.tsx
    echo Aplicando corrección...
    powershell -Command "(Get-Content 'components\camaras-map.tsx') -replace 'user\?\.role', 'user?.rol' | Set-Content 'components\camaras-map.tsx'"
    echo ✅ Corrección aplicada
)

echo.
echo 3. Verificando dependencias...
echo.

REM Verificar que node_modules existe
if exist "node_modules" (
    echo ✅ Dependencias instaladas
) else (
    echo ⚠️  Dependencias no encontradas, instalando...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas
)

echo.
echo ============================================
echo CORRECCIÓN COMPLETADA
echo ============================================
echo.
echo ✅ Todos los archivos están en su lugar
echo ✅ Las correcciones de código se aplicaron
echo ✅ Las dependencias están instaladas
echo.
echo Para probar:
echo 1. Reinicia el servidor: npm run dev
echo 2. Ve a /dashboard
echo 3. Haz clic en "Cámaras" en el menú lateral
echo 4. Deberías ver la página de cámaras
echo.
echo Si aún tienes problemas:
echo - Verifica que estés logueado correctamente
echo - Revisa la consola del navegador para errores
echo - Asegúrate de que la API key de Google Maps esté configurada
echo.
echo Presiona cualquier tecla para continuar...
pause >nul
