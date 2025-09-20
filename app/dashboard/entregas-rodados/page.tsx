"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Plus, FileDown, Eye, Edit, Trash2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function EntregasRodados() {
  const { user, loading: userLoading } = useCurrentUser()
  const [entregas, setEntregas] = useState<any[]>([])
  const [filteredEntregas, setFilteredEntregas] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    if (!userLoading && !user) {
      router.push("/")
      return
    }
  }, [user, userLoading, router])

  useEffect(() => {
    const fetchEntregas = async () => {
      if (!user) return
      
      try {
        const response = await fetch('/api/entregas-rodados', {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Error al cargar entregas de rodados')
        }

        const data = await response.json()
        setEntregas(data)
        setFilteredEntregas(data)
      } catch (error) {
        console.error('Error fetching entregas:', error)
      }
    }

    fetchEntregas()
  }, [user])

  useEffect(() => {
    // Filtrar entregas
    if (searchTerm) {
      const filtered = entregas.filter(
        (e) =>
          `${e.propietario_nombre} ${e.propietario_apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.propietario_dni.includes(searchTerm) ||
          e.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.numero_acta.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.tipo_vehiculo && e.tipo_vehiculo.toLowerCase().includes(searchTerm.toLowerCase())) ||
          e.id.toString().includes(searchTerm),
      )
      setFilteredEntregas(filtered)
    } else {
      setFilteredEntregas(entregas)
    }
  }, [searchTerm, entregas])

  const handleExportPDF = async (entrega: any) => {
    try {
      const { exportEntregaRodadoToPDF } = await import("@/lib/pdf-entrega-rodado")
      await exportEntregaRodadoToPDF(entrega)
    } catch (error) {
      console.error("Error al generar PDF:", error)
      alert("Error al generar el PDF. Por favor, intente nuevamente.")
    }
  }

  const handleDeleteEntrega = (id: number) => {
    if (
      window.confirm("¿Está seguro de que desea eliminar esta entrega de rodado? Esta acción no se puede deshacer.")
    ) {
      const updatedEntregas = entregas.filter((e) => e.id !== id)
      localStorage.setItem("entregasRodados", JSON.stringify(updatedEntregas))
      setEntregas(updatedEntregas)
      setFilteredEntregas(
        updatedEntregas.filter((e) => {
          // Aplicar los mismos filtros actuales
          if (searchTerm) {
            return (
              e.nombreApellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
              e.dni.includes(searchTerm) ||
              e.dominio.toLowerCase().includes(searchTerm.toLowerCase()) ||
              e.numExpediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (e.datosRodado && e.datosRodado.toLowerCase().includes(searchTerm.toLowerCase())) ||
              e.id.toString().includes(searchTerm)
            )
          }
          return true
        }),
      )
    }
  }

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
          <h1 className="text-2xl font-bold">Entregas de Rodados</h1>
          <Button onClick={() => router.push("/dashboard/nueva-entrega-rodado")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Entrega de Elementos/Rodados
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Entregas de Rodados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, DNI, dominio, expediente, datos de elementos/rodados o ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>Nombre y Apellido</TableHead>
                    <TableHead className="hidden md:table-cell">DNI</TableHead>
                    <TableHead className="hidden md:table-cell">Dominio</TableHead>
                    <TableHead className="hidden md:table-cell">Expediente</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha Entrega</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntregas.length > 0 ? (
                    filteredEntregas.map((entrega) => (
                      <TableRow key={entrega.id}>
                        <TableCell className="font-medium">{entrega.id.slice(0, 8)}...</TableCell>
                        <TableCell>{entrega.propietario_nombre} {entrega.propietario_apellido}</TableCell>
                        <TableCell className="hidden md:table-cell">{entrega.propietario_dni}</TableCell>
                        <TableCell className="hidden md:table-cell">{entrega.patente}</TableCell>
                        <TableCell className="hidden md:table-cell">{entrega.numero_acta}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(entrega.fecha_entrega).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/entrega-rodado/${entrega.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleExportPDF(entrega)}>
                              <FileDown className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                            {user?.role === "admin" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/entrega-rodado/${entrega.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEntrega(entrega.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No se encontraron entregas de rodados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
