"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DenunciasTable from "@/components/denuncias-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function Denuncias() {
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
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Denuncias</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/dashboard/nueva-denuncia")}>
              <Plus className="mr-2 h-4 w-4" />
              Cargar Denuncia
            </Button>
            <Button onClick={() => router.push("/dashboard/nueva-denuncia-formal")} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Denuncia
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Denuncias</CardTitle>
          </CardHeader>
          <CardContent>
            <DenunciasTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
