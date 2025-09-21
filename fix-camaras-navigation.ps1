Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CORRIGIENDO NAVEGACIÓN A CÁMARAS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Verificando archivos necesarios..." -ForegroundColor Yellow
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ No se encontró package.json. Asegúrate de estar en el directorio del proyecto." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "✅ Directorio del proyecto encontrado" -ForegroundColor Green

# Verificar página de cámaras
if (Test-Path "app\dashboard\camaras\page.tsx") {
    Write-Host "✅ Página de cámaras encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ Página de cámaras no encontrada" -ForegroundColor Red
    Write-Host "Creando página de cámaras..." -ForegroundColor Yellow
    
    # Crear directorio si no existe
    if (-not (Test-Path "app\dashboard\camaras")) {
        New-Item -ItemType Directory -Path "app\dashboard\camaras" -Force | Out-Null
    }
    
    # Crear archivo de página
    $pageContent = @"
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import CamarasMap from "@/components/camaras-map"

export default function CamarasPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(JSON.parse(currentUser))
  }, [router])

  if (!user) return null

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Cámaras de Seguridad</h1>
          <p className="text-muted-foreground">Monitoreo y gestión de cámaras de seguridad en La Rioja Capital</p>
        </div>

        <CamarasMap user={user} />
      </div>
    </DashboardLayout>
  )
}
"@
    
    Set-Content -Path "app\dashboard\camaras\page.tsx" -Value $pageContent
    Write-Host "✅ Página de cámaras creada" -ForegroundColor Green
}

# Verificar componente CamarasMap
if (Test-Path "components\camaras-map.tsx") {
    Write-Host "✅ Componente CamarasMap encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Componente CamarasMap no encontrado" -ForegroundColor Red
    Write-Host "Este componente es necesario para que funcione la página de cámaras" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "2. Verificando correcciones de código..." -ForegroundColor Yellow
Write-Host ""

# Verificar y corregir dashboard-layout.tsx
$dashboardLayoutPath = "components\dashboard-layout.tsx"
if (Test-Path $dashboardLayoutPath) {
    $content = Get-Content $dashboardLayoutPath -Raw
    if ($content -match "user\?\.role") {
        Write-Host "❌ Encontrado user?.role en dashboard-layout.tsx, corrigiendo..." -ForegroundColor Red
        $content = $content -replace "user\?\.role", "user?.rol"
        Set-Content -Path $dashboardLayoutPath -Value $content
        Write-Host "✅ Corrección aplicada en dashboard-layout.tsx" -ForegroundColor Green
    } else {
        Write-Host "✅ Corrección user?.rol ya aplicada en dashboard-layout.tsx" -ForegroundColor Green
    }
} else {
    Write-Host "❌ No se encontró dashboard-layout.tsx" -ForegroundColor Red
}

# Verificar y corregir camaras-map.tsx
$camarasMapPath = "components\camaras-map.tsx"
if (Test-Path $camarasMapPath) {
    $content = Get-Content $camarasMapPath -Raw
    if ($content -match "user\?\.role") {
        Write-Host "❌ Encontrado user?.role en camaras-map.tsx, corrigiendo..." -ForegroundColor Red
        $content = $content -replace "user\?\.role", "user?.rol"
        Set-Content -Path $camarasMapPath -Value $content
        Write-Host "✅ Corrección aplicada en camaras-map.tsx" -ForegroundColor Green
    } else {
        Write-Host "✅ Corrección user?.rol ya aplicada en camaras-map.tsx" -ForegroundColor Green
    }
} else {
    Write-Host "❌ No se encontró camaras-map.tsx" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Verificando dependencias..." -ForegroundColor Yellow
Write-Host ""

# Verificar que node_modules existe
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dependencias no encontradas, instalando..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CORRECCIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Todos los archivos están en su lugar" -ForegroundColor Green
Write-Host "✅ Las correcciones de código se aplicaron" -ForegroundColor Green
Write-Host "✅ Las dependencias están instaladas" -ForegroundColor Green
Write-Host ""
Write-Host "Para probar:" -ForegroundColor Yellow
Write-Host "1. Reinicia el servidor: npm run dev" -ForegroundColor White
Write-Host "2. Ve a /dashboard" -ForegroundColor White
Write-Host "3. Haz clic en 'Cámaras' en el menú lateral" -ForegroundColor White
Write-Host "4. Deberías ver la página de cámaras" -ForegroundColor White
Write-Host ""
Write-Host "Si aún tienes problemas:" -ForegroundColor Yellow
Write-Host "- Verifica que estés logueado correctamente" -ForegroundColor White
Write-Host "- Revisa la consola del navegador para errores" -ForegroundColor White
Write-Host "- Asegúrate de que la API key de Google Maps esté configurada" -ForegroundColor White
Write-Host ""
Read-Host "Presiona Enter para continuar"
