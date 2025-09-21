@echo off
echo ============================================
echo PRUEBA COMPLETA DE NAVEGACIÓN A CÁMARAS
echo ============================================
echo.

echo 1. Ejecutando diagnóstico...
node debug-camaras-navigation.js
echo.

echo 2. Aplicando correcciones automáticas...
echo.

REM Corregir dashboard-layout.tsx
if exist "components\dashboard-layout.tsx" (
    echo Corrigiendo dashboard-layout.tsx...
    powershell -Command "(Get-Content 'components\dashboard-layout.tsx') -replace 'user\?\.role', 'user?.rol' | Set-Content 'components\dashboard-layout.tsx'"
    echo ✅ Corregido
) else (
    echo ❌ dashboard-layout.tsx no encontrado
)

REM Corregir camaras-map.tsx
if exist "components\camaras-map.tsx" (
    echo Corrigiendo camaras-map.tsx...
    powershell -Command "(Get-Content 'components\camaras-map.tsx') -replace 'user\?\.role', 'user?.rol' | Set-Content 'components\camaras-map.tsx'"
    echo ✅ Corregido
) else (
    echo ❌ camaras-map.tsx no encontrado
)

echo.
echo 3. Verificando que la página de cámaras existe...
if not exist "app\dashboard\camaras\page.tsx" (
    echo ❌ Página de cámaras no existe, creándola...
    mkdir "app\dashboard\camaras" 2>nul
    
    echo "use client" > "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo import { useEffect, useState } from "react" >> "app\dashboard\camaras\page.tsx"
    echo import { useRouter } from "next/navigation" >> "app\dashboard\camaras\page.tsx"
    echo import DashboardLayout from "@/components/dashboard-layout" >> "app\dashboard\camaras\page.tsx"
    echo import CamarasMap from "@/components/camaras-map" >> "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo export default function CamarasPage() { >> "app\dashboard\camaras\page.tsx"
    echo   const [user, setUser] = useState(null) >> "app\dashboard\camaras\page.tsx"
    echo   const router = useRouter() >> "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo   useEffect(() => { >> "app\dashboard\camaras\page.tsx"
    echo     const currentUser = localStorage.getItem("currentUser") >> "app\dashboard\camaras\page.tsx"
    echo     if (!currentUser) { >> "app\dashboard\camaras\page.tsx"
    echo       router.push("/") >> "app\dashboard\camaras\page.tsx"
    echo       return >> "app\dashboard\camaras\page.tsx"
    echo     } >> "app\dashboard\camaras\page.tsx"
    echo     setUser(JSON.parse(currentUser)) >> "app\dashboard\camaras\page.tsx"
    echo   }, [router]) >> "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo   if (!user) return null >> "app\dashboard\camaras\page.tsx"
    echo. >> "app\dashboard\camaras\page.tsx"
    echo   return ( >> "app\dashboard\camaras\page.tsx"
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
    echo   ) >> "app\dashboard\camaras\page.tsx"
    echo } >> "app\dashboard\camaras\page.tsx"
    echo ✅ Página creada
) else (
    echo ✅ Página de cámaras existe
)

echo.
echo 4. Verificando correcciones finales...
node debug-camaras-navigation.js
echo.

echo ============================================
echo PRUEBA COMPLETADA
echo ============================================
echo.
echo Ahora:
echo 1. Reinicia el servidor: npm run dev
echo 2. Ve a http://localhost:3000
echo 3. Haz login
echo 4. Ve a /dashboard
echo 5. Haz clic en "Cámaras"
echo.
echo Si sigue sin funcionar:
echo - Abre las herramientas de desarrollador (F12)
echo - Ve a la pestaña Console
echo - Busca errores en rojo
echo - Comparte los errores que veas
echo.
pause
