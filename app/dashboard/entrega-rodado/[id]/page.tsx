"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileDown, Edit } from "lucide-react"

export default function DetalleEntregaRodado() {
  const [user, setUser] = useState<any>(null)
  const [entrega, setEntrega] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const id = params.id

  useEffect(() => {
    // Verificar autenticación
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(JSON.parse(currentUser))

    // Cargar entrega
    const entregas = JSON.parse(localStorage.getItem("entregasRodados") || "[]")
    const found = entregas.find((e: any) => e.id.toString() === id)

    if (found) {
      setEntrega(found)
    } else {
      router.push("/dashboard/entregas-rodados")
    }
  }, [id, router])

  const handleExportPDF = async () => {
    if (entrega) {
      try {
        const { exportEntregaRodadoToPDF } = await import("@/lib/pdf-entrega-rodado")
        await exportEntregaRodadoToPDF(entrega)
      } catch (error) {
        console.error("Error al generar PDF:", error)
        alert("Error al generar el PDF. Por favor, intente nuevamente.")
      }
    }
  }

  if (!user || !entrega) return null

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard/entregas-rodados")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Entrega de Rodado #{entrega.id}</h1>
          <div className="ml-auto">
            <Button variant="outline" onClick={handleExportPDF} className="mr-2">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            {user.role === "admin" && (
              <Button onClick={() => router.push(`/dashboard/entrega-rodado/${entrega.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Detalles de la Entrega de Rodado</CardTitle>
            <CardDescription>
              Registrada el {new Date(entrega.fechaRegistro).toLocaleDateString()} por {entrega.creadorNombre}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Fecha de Entrega:</strong>
                <p>{new Date(entrega.fechaEntrega).toLocaleDateString()}</p>
              </div>
              <div>
                <strong>Hora de Entrega:</strong>
                <p>{entrega.horaEntrega}</p>
              </div>
            </div>

            <div>
              <strong>Nº de Expediente:</strong>
              <p>{entrega.numExpediente}</p>
            </div>

            <div>
              <strong>Juzgado Interviniente:</strong>
              <p>{entrega.juzgadoInterviniente}</p>
            </div>

            <div>
              <strong>Datos del Rodado:</strong>
              <p className="whitespace-pre-wrap">{entrega.datosRodado}</p>
            </div>

            <div>
              <strong>Dominio:</strong>
              <p>{entrega.dominio}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Nombre y Apellido:</strong>
                <p>{entrega.nombreApellido}</p>
              </div>
              <div>
                <strong>DNI:</strong>
                <p>{entrega.dni}</p>
              </div>
            </div>

            <div>
              <strong>Funcionario Actuante:</strong>
              <p>{entrega.funcionarioActuante}</p>
            </div>

            <div>
              <strong>Registrado por:</strong>
              <p>
                {entrega.creadorNombre} ({entrega.creadorDepartamento})
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
