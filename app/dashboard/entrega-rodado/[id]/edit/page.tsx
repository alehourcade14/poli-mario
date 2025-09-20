"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save } from "lucide-react"

export default function EditarEntregaRodado() {
  const [user, setUser] = useState<any>(null)
  const [entrega, setEntrega] = useState<any>(null)
  const [formData, setFormData] = useState({
    fechaEntrega: "",
    horaEntrega: "",
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
  const params = useParams()
  const id = params.id

  useEffect(() => {
    // Verificar autenticación
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/")
      return
    }
    const userData = JSON.parse(currentUser)
    setUser(userData)

    // Verificar que sea administrador
    if (userData.role !== "admin") {
      router.push("/dashboard/entregas-rodados")
      return
    }

    // Cargar entrega
    const entregas = JSON.parse(localStorage.getItem("entregasRodados") || "[]")
    const found = entregas.find((e: any) => e.id.toString() === id)

    if (found) {
      setEntrega(found)
      setFormData({
        fechaEntrega: found.fechaEntrega,
        horaEntrega: found.horaEntrega,
        numExpediente: found.numExpediente,
        juzgadoInterviniente: found.juzgadoInterviniente,
        datosRodado: found.datosRodado,
        dominio: found.dominio,
        nombreApellido: found.nombreApellido,
        dni: found.dni,
        funcionarioActuante: found.funcionarioActuante,
      })
    } else {
      router.push("/dashboard/entregas-rodados")
    }
  }, [id, router])

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
      !formData.dominio ||
      !formData.nombreApellido ||
      !formData.dni ||
      !formData.funcionarioActuante
    ) {
      setError("Todos los campos son obligatorios")
      return
    }

    try {
      // Obtener entregas existentes
      const entregas = JSON.parse(localStorage.getItem("entregasRodados") || "[]")

      // Actualizar entrega
      const index = entregas.findIndex((e: any) => e.id.toString() === id)
      if (index !== -1) {
        entregas[index] = {
          ...entregas[index],
          ...formData,
          ultimaActualizacion: new Date().toISOString(),
          actualizadoPor: user.username,
        }

        localStorage.setItem("entregasRodados", JSON.stringify(entregas))
        setEntrega(entregas[index])
        setSuccess(true)

        // Redireccionar después de 2 segundos
        setTimeout(() => {
          router.push(`/dashboard/entrega-rodado/${id}`)
        }, 2000)
      }
    } catch (err) {
      setError("Error al actualizar la entrega de rodado")
      console.error(err)
    }
  }

  if (!user || !entrega || user.role !== "admin") return null

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => router.push(`/dashboard/entrega-rodado/${id}`)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Editar Entrega de Rodado #{entrega.id}</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Editar Entrega de Rodado</CardTitle>
            <CardDescription>Modifique los datos de la entrega de rodado</CardDescription>
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
                  <AlertDescription>Entrega de rodado actualizada correctamente. Redirigiendo...</AlertDescription>
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
                <Label htmlFor="datosRodado">Datos del Rodado</Label>
                <Textarea
                  id="datosRodado"
                  name="datosRodado"
                  rows={4}
                  value={formData.datosRodado}
                  onChange={handleChange}
                  placeholder="Ingrese los datos del rodado (marca, modelo, año, color, etc.)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dominio">Dominio</Label>
                <Input
                  id="dominio"
                  name="dominio"
                  value={formData.dominio}
                  onChange={handleChange}
                  placeholder="Ingrese el dominio del rodado"
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
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/entrega-rodado/${id}`)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={success}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
