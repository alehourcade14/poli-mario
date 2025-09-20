"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import DenunciasTable from "@/components/denuncias-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, BarChart2, AlertTriangle, Car, Plus } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function Dashboard() {
  const { user, loading: userLoading } = useCurrentUser()
  const [stats, setStats] = useState({
    totalDenuncias: 0,
    pendientes: 0,
    resueltas: 0,
    enProceso: 0,
    totalEntregasRodados: 0,
  })
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    if (!userLoading && !user) {
      router.push("/")
      return
    }

    // Cargar estadísticas desde la base de datos
    const loadStats = async () => {
      try {
        const [denunciasResponse, entregasResponse] = await Promise.all([
          fetch('/api/denuncias', { credentials: 'include' }),
          fetch('/api/entregas-rodados', { credentials: 'include' })
        ])

        const denuncias = denunciasResponse.ok ? await denunciasResponse.json() : []
        const entregasRodados = entregasResponse.ok ? await entregasResponse.json() : []

        setStats({
          totalDenuncias: denuncias.length,
          pendientes: denuncias.filter((d: any) => d.estado_nombre === "Consulta").length,
          resueltas: denuncias.filter((d: any) => d.estado_nombre === "Resuelta").length,
          enProceso: denuncias.filter((d: any) => d.estado_nombre === "En Proceso").length,
          totalEntregasRodados: entregasRodados.length,
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    if (user) {
      loadStats()
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
          <h1 className="text-2xl font-bold">Panel de Control</h1>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/dashboard/nueva-denuncia-formal")}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Denuncia
            </Button>
            <Button onClick={() => router.push("/dashboard/nueva-entrega-rodado")} variant="outline">
              <Car className="mr-2 h-4 w-4" />
              Nueva Entrega de Elemento/Rodados
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Denuncias</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDenuncias}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Consulta</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendientes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <BarChart2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enProceso}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resueltas</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resueltas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Entregas Rodados</CardTitle>
              <Car className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntregasRodados}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Denuncias Recientes</CardTitle>
            <CardDescription>Lista de las últimas denuncias registradas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <DenunciasTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
