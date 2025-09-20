"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function NuevaEntregaRodado() {
  const { user, loading: userLoading } = useCurrentUser()
  const [formData, setFormData] = useState({
    fechaEntrega: new Date().toISOString().split("T")[0],
    horaEntrega: new Date().toTimeString().slice(0, 5),
    numExpediente: "",
    juzgadoInterviniente: "",
    datosRodado: "",
    dominio: "",
    nombreApellido: "",
    dni: "",
    funcionarioActuante: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    if (!userLoading && !user) {
      router.push("/")
      return
    }
  }, [user, userLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validar campos obligatorios
    if (
      !formData.fechaEntrega ||
      !formData.horaEntrega ||
      !formData.numExpediente ||
      !formData.juzgadoInterviniente ||
      !formData.datosRodado ||
      !formData.nombreApellido ||
      !formData.dni ||
      !formData.funcionarioActuante
    ) {
      setError("Todos los campos son obligatorios")
      return
    }

    try {
      // Crear nueva entrega de rodado en la base de datos
      const response = await fetch('/api/entregas-rodados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          numero_acta: formData.numExpediente || `ACT-${Date.now()}`,
          propietario_nombre: formData.nombreApellido.split(' ')[0] || formData.nombreApellido,
          propietario_apellido: formData.nombreApellido.split(' ').slice(1).join(' ') || '',
          propietario_dni: formData.dni,
          propietario_telefono: '',
          propietario_direccion: '',
          tipo_vehiculo: formData.datosRodado.split(' ')[0] || 'Vehiculo',
          marca: '',
          modelo: '',
          año: null,
          color: '',
          patente: formData.dominio,
          numero_motor: '',
          numero_chasis: '',
          fecha_entrega: formData.fechaEntrega,
          hora_entrega: formData.horaEntrega,
          lugar_entrega: 'Comisaría',
          motivo_entrega: 'Entrega por orden judicial',
          estado_vehiculo: '',
          observaciones: '',
          funcionario_entrega: formData.funcionarioActuante,
          rango_funcionario: 'Oficial'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear entrega de rodado')
      }

      const nuevaEntrega = await response.json()

      // Generar PDF automáticamente
      try {
        const { exportEntregaRodadoToPDF } = await import("@/lib/pdf-entrega-rodado")
        await exportEntregaRodadoToPDF(nuevaEntrega)
      } catch (pdfError) {
        console.error("Error al generar PDF:", pdfError)
        // No fallar el guardado si hay error en PDF
      }

      setSuccess(true)

      // Limpiar formulario
      setFormData({
        fechaEntrega: new Date().toISOString().split("T")[0],
        horaEntrega: new Date().toTimeString().slice(0, 5),
        numExpediente: "",
        juzgadoInterviniente: "",
        datosRodado: "",
        dominio: "",
        nombreApellido: "",
        dni: "",
        funcionarioActuante: "",
      })

      // Redireccionar después de 3 segundos
      setTimeout(() => {
        router.push("/dashboard/entregas-rodados")
      }, 3000)
    } catch (err) {
      setError("Error al guardar la entrega de rodado")
      console.error(err)
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
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Nueva Entrega de Rodado</h1>
          <p className="text-muted-foreground">Complete el formulario para registrar una nueva entrega de rodado</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Formulario de Entrega de Rodado</CardTitle>
            <CardDescription>Ingrese los datos de la entrega de rodado a registrar</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>
                    Entrega de rodado registrada correctamente y PDF generado. Redirigiendo...
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaEntrega">Fecha de Entrega</Label>
                  <Input
                    id="fechaEntrega"
                    name="fechaEntrega"
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horaEntrega">Hora de Entrega</Label>
                  <Input
                    id="horaEntrega"
                    name="horaEntrega"
                    type="time"
                    value={formData.horaEntrega}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numExpediente">Nº de Expte.</Label>
                <Input
                  id="numExpediente"
                  name="numExpediente"
                  value={formData.numExpediente}
                  onChange={handleChange}
                  placeholder="Ingrese el número de expediente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="juzgadoInterviniente">Juzgado Interviniente</Label>
                <Input
                  id="juzgadoInterviniente"
                  name="juzgadoInterviniente"
                  value={formData.juzgadoInterviniente}
                  onChange={handleChange}
                  placeholder="Ingrese el juzgado interviniente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="datosRodado">Datos del Elemento/Rodado</Label>
                <Textarea
                  id="datosRodado"
                  name="datosRodado"
                  rows={4}
                  value={formData.datosRodado}
                  onChange={handleChange}
                  placeholder="Ingrese los datos del elemento/rodado (marca, modelo, año, color, etc.)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dominio">Dominio (opcional)</Label>
                <Input
                  id="dominio"
                  name="dominio"
                  value={formData.dominio}
                  onChange={handleChange}
                  placeholder="Ingrese el dominio del rodado (opcional)"
                  style={{ textTransform: "uppercase" }}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement
                    target.value = target.value.toUpperCase()
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreApellido">Nombre y Apellido</Label>
                  <Input
                    id="nombreApellido"
                    name="nombreApellido"
                    value={formData.nombreApellido}
                    onChange={handleChange}
                    placeholder="Ingrese nombre y apellido del receptor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    placeholder="Ingrese el DNI"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="funcionarioActuante">Funcionario Actuante</Label>
                <Input
                  id="funcionarioActuante"
                  name="funcionarioActuante"
                  value={formData.funcionarioActuante}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del funcionario actuante"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={success}>
                <FileText className="mr-2 h-4 w-4" />
                Guardar y Generar PDF
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
