"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DenunciasTable from "@/components/denuncias-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function Denuncias() {
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
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Denuncias</h1>
          <div className="flex gap-2">
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
