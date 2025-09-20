"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import MapSelector from "@/components/map-selector"
import { FileText } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function NuevaDenunciaFormal() {
  const { user, loading: userLoading } = useCurrentUser()
  const [formData, setFormData] = useState({
    denunciante: "",
    dni: "",
    nacionalidad: "Argentina",
    estadoCivil: "",
    instruccion: "",
    edad: "",
    profesion: "",
    domicilio: "",
    barrio: "",
    sexo: "",
    tipo: "",
    departamento: "",
    division: "",
    descripcion: "",
    estado: "Consulta",
    fechaDenuncia: new Date().toISOString().split("T")[0],
    horaDenuncia: new Date().toTimeString().slice(0, 5),
    fechaHecho: new Date().toISOString().split("T")[0],
    horaHecho: new Date().toTimeString().slice(0, 5),
    barrioHecho: "",
    numExpediente: "",
    ubicacion: null as { lat: number; lng: number } | null,
    direccion: "",
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationSelect = (location: { lat: number; lng: number } | null) => {
    setFormData((prev) => ({ ...prev, ubicacion: location }))
  }

  const handleAddressChange = (address: string) => {
    setFormData((prev) => ({ ...prev, direccion: address }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validar campos obligatorios
    if (
      !formData.denunciante ||
      !formData.dni ||
      !formData.nacionalidad ||
      !formData.estadoCivil ||
      !formData.instruccion ||
      !formData.edad ||
      !formData.profesion ||
      !formData.domicilio ||
      !formData.barrio ||
      !formData.sexo ||
      !formData.tipo ||
      !formData.departamento ||
      !formData.division ||
      !formData.descripcion ||
      !formData.fechaHecho ||
      !formData.horaHecho ||
      !formData.barrioHecho ||
      !formData.numExpediente
    ) {
      setError("Todos los campos son obligatorios (excepto la ubicación)")
      return
    }

    try {
      // Crear nueva denuncia formal en la base de datos
      const response = await fetch('/api/denuncias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          numero_expediente: formData.numExpediente || `EXP-FORMAL-${Date.now()}`,
          denunciante_nombre: formData.denunciante.split(' ')[0] || formData.denunciante,
          denunciante_apellido: formData.denunciante.split(' ').slice(1).join(' ') || '',
          denunciante_dni: formData.dni,
          denunciante_telefono: '',
          denunciante_email: '',
          denunciante_direccion: formData.domicilio,
          fecha_hecho: formData.fechaHecho,
          hora_hecho: formData.horaHecho,
          lugar_hecho: formData.barrioHecho,
          departamento_hecho: formData.barrio,
          latitud: formData.ubicacion?.lat || null,
          longitud: formData.ubicacion?.lng || null,
          descripcion: formData.descripcion,
          tipo_delito: formData.tipo,
          // Campos adicionales para denuncia formal
          nacionalidad: formData.nacionalidad,
          estado_civil: formData.estadoCivil,
          instruccion: formData.instruccion,
          edad: formData.edad,
          sexo: formData.sexo,
          profesion: formData.profesion,
          tipo_formulario: "formal"
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear denuncia formal')
      }

      const nuevaDenuncia = await response.json()

      // Generar PDF con formato formal
      try {
        const { exportDenunciaFormalToPDF } = await import("@/lib/pdf-denuncia-formal")
        await exportDenunciaFormalToPDF(nuevaDenuncia)
      } catch (pdfError) {
        console.error("Error al generar PDF:", pdfError)
        // No fallar el guardado si hay error en PDF
      }

      setSuccess(true)

      // Limpiar formulario
      setFormData({
        denunciante: "",
        dni: "",
        nacionalidad: "Argentina",
        estadoCivil: "",
        instruccion: "",
        edad: "",
        profesion: "",
        domicilio: "",
        barrio: "",
        sexo: "",
        tipo: "",
        departamento: "",
        division: "",
        descripcion: "",
        estado: "Consulta",
        fechaDenuncia: new Date().toISOString().split("T")[0],
        horaDenuncia: new Date().toTimeString().slice(0, 5),
        fechaHecho: new Date().toISOString().split("T")[0],
        horaHecho: new Date().toTimeString().slice(0, 5),
        barrioHecho: "",
        numExpediente: "",
        ubicacion: null,
        direccion: "",
      })

      // Redireccionar después de 3 segundos
      setTimeout(() => {
        router.push("/dashboard/denuncias")
      }, 3000)
    } catch (err) {
      setError("Error al guardar la denuncia")
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
          <h1 className="text-2xl font-bold">Nueva Denuncia Formal</h1>
          <p className="text-muted-foreground">Complete el formulario para registrar una nueva denuncia formal</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Formulario de Denuncia Formal</CardTitle>
            <CardDescription>Ingrese todos los datos requeridos para la denuncia formal</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>Denuncia registrada correctamente y PDF generado. Redirigiendo...</AlertDescription>
                </Alert>
              )}

              {/* Datos Personales del Denunciante */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Datos Personales del Denunciante</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="denunciante">Apellido y Nombre Completo</Label>
                    <Input id="denunciante" name="denunciante" value={formData.denunciante} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dni">DNI</Label>
                    <Input id="dni" name="dni" value={formData.dni} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nacionalidad">Nacionalidad</Label>
                    <Input
                      id="nacionalidad"
                      name="nacionalidad"
                      value={formData.nacionalidad}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estadoCivil">Estado Civil</Label>
                    <Select
                      value={formData.estadoCivil}
                      onValueChange={(value) => handleSelectChange("estadoCivil", value)}
                    >
                      <SelectTrigger id="estadoCivil">
                        <SelectValue placeholder="Seleccionar estado civil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                        <SelectItem value="Casado/a">Casado/a</SelectItem>
                        <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                        <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                        <SelectItem value="Concubino/a">Concubino/a</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instruccion">Instrucción</Label>
                    <Select
                      value={formData.instruccion}
                      onValueChange={(value) => handleSelectChange("instruccion", value)}
                    >
                      <SelectTrigger id="instruccion">
                        <SelectValue placeholder="Seleccionar instrucción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sin instrucción">Sin instrucción</SelectItem>
                        <SelectItem value="Primaria incompleta">Primaria incompleta</SelectItem>
                        <SelectItem value="Primaria completa">Primaria completa</SelectItem>
                        <SelectItem value="Secundaria incompleta">Secundaria incompleta</SelectItem>
                        <SelectItem value="Secundaria completa">Secundaria completa</SelectItem>
                        <SelectItem value="Terciaria incompleta">Terciaria incompleta</SelectItem>
                        <SelectItem value="Terciaria completa">Terciaria completa</SelectItem>
                        <SelectItem value="Universitaria incompleta">Universitaria incompleta</SelectItem>
                        <SelectItem value="Universitaria completa">Universitaria completa</SelectItem>
                        <SelectItem value="Instruida">Instruida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edad">Edad</Label>
                    <Input id="edad" name="edad" type="number" value={formData.edad} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select value={formData.sexo} onValueChange={(value) => handleSelectChange("sexo", value)}>
                      <SelectTrigger id="sexo">
                        <SelectValue placeholder="Seleccionar sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profesion">Profesión</Label>
                    <Input id="profesion" name="profesion" value={formData.profesion} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="domicilio">Domicilio</Label>
                    <Input id="domicilio" name="domicilio" value={formData.domicilio} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barrio">Barrio</Label>
                    <Input id="barrio" name="barrio" value={formData.barrio} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Datos de la Denuncia */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Datos de la Denuncia</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Delito</Label>
                    <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                      <SelectTrigger id="tipo">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Robo">Robo</SelectItem>
                        <SelectItem value="Hurto">Hurto</SelectItem>
                        <SelectItem value="Defraudación">Defraudación</SelectItem>
                        <SelectItem value="Paradero">Paradero</SelectItem>
                        <SelectItem value="Sustracción de Automotor">Sustracción de Automotor</SelectItem>
                        <SelectItem value="Estafa">Estafa</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Select
                      value={formData.departamento}
                      onValueChange={(value) => handleSelectChange("departamento", value)}
                    >
                      <SelectTrigger id="departamento">
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Departamento Cibercrimen">Departamento Cibercrimen</SelectItem>
                        <SelectItem value="Departamento Sustracción de Automotores">
                          Departamento Sustracción de Automotores
                        </SelectItem>
                        <SelectItem value="Departamento Delitos Contra la Propiedad">
                          Departamento Delitos Contra la Propiedad
                        </SelectItem>
                        <SelectItem value="Departamento Delitos contra las Personas">
                          Departamento Delitos contra las Personas
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="division">División</Label>
                  <Select value={formData.division} onValueChange={(value) => handleSelectChange("division", value)}>
                    <SelectTrigger id="division">
                      <SelectValue placeholder="Seleccionar división" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="División Delito Económico">División Delito Económico</SelectItem>
                      <SelectItem value="División de Sustracción de Automotores">
                        División de Sustracción de Automotores
                      </SelectItem>
                      <SelectItem value="División de Homicidio">División de Homicidio</SelectItem>
                      <SelectItem value="División de Robos y Hurtos">División de Robos y Hurtos</SelectItem>
                      <SelectItem value="División de Seguridad Personal">División de Seguridad Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaHecho">Fecha de la Denuncia</Label>
                    <Input
                      id="fechaHecho"
                      name="fechaHecho"
                      type="date"
                      value={formData.fechaHecho}
                      onChange={handleChange}
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Fecha establecida automáticamente al día actual
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horaHecho">Hora de la Denuncia</Label>
                    <Input
                      id="horaHecho"
                      name="horaHecho"
                      type="time"
                      value={formData.horaHecho}
                      onChange={handleChange}
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Hora establecida automáticamente al momento actual
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="barrioHecho">Barrio del Hecho</Label>
                    <Input
                      id="barrioHecho"
                      name="barrioHecho"
                      value={formData.barrioHecho}
                      onChange={handleChange}
                      placeholder="Ingrese el barrio donde ocurrió el hecho"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numExpediente">Nº Expediente</Label>
                    <Input
                      id="numExpediente"
                      name="numExpediente"
                      value={formData.numExpediente}
                      onChange={handleChange}
                      placeholder="Ingrese el número de expediente"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción de la Denuncia</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    rows={12}
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describa detalladamente los hechos denunciados..."
                    className="min-h-[300px] resize-y p-4 border-2 border-gray-300 rounded-md text-justify leading-relaxed font-serif"
                    style={{ textAlign: "justify" }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ubicación del Hecho (Opcional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Puede marcar la ubicación exacta del hecho en el mapa. Haga clic para colocar un marcador o use su
                    ubicación actual.
                  </p>
                  <MapSelector
                    initialLocation={formData.ubicacion}
                    onLocationSelect={handleLocationSelect}
                    onAddressChange={handleAddressChange}
                    isOptional={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleSelectChange("estado", value)}>
                    <SelectTrigger id="estado">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="En Proceso">En Proceso</SelectItem>
                      <SelectItem value="Resuelta">Resuelta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={success}>
                <FileText className="mr-2 h-4 w-4" />
                Registrar y Generar Denuncia
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
