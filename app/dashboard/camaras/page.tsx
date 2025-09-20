"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import CamarasMap from "@/components/camaras-map"

export default function CamarasPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
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
