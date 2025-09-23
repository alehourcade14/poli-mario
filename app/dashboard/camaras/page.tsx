"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import CamarasMap from "@/components/camaras-map"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function CamarasPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    if (!userLoading && !user) {
      router.push("/")
      return
    }
  }, [user, userLoading, router])

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

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
