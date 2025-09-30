"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, FileDown, FileText } from "lucide-react"
import MapSelector from "@/components/map-selector"
import { useCurrentUser } from "@/hooks/use-current-user"
// Importar las funciones de PDF
import { exportInformeDenuncia } from "@/lib/pdf-informe-denuncia"
import { exportDenunciaFormalToPDF } from "@/lib/pdf-denuncia-formal"

export default function DetalleDenuncia() {
  const { user, loading } = useCurrentUser()
  const [denuncia, setDenuncia] = useState<any>(null)
  const [formData, setFormData] = useState({
    denunciante_nombre: "",
    denunciante_apellido: "",
    denunciante_dni: "",
    tipo_delito: "",
    departamento_nombre: "",
    division: "",
    descripcion: "",
    estado_nombre: "",
    fecha_hecho: "",
    hora_hecho: "",
    lugar_hecho: "",
    numero_expediente: "",
    ubicacion: null as { lat: number; lng: number } | null,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loadingDenuncia, setLoadingDenuncia] = useState(true)
  const [isGeneratingFormalPDF, setIsGeneratingFormalPDF] = useState(false)
  const router = useRouter()
  const params = useParams()
  const id = params.id

  useEffect(() => {
    console.log(`🔍 useEffect ejecutado - user:`, user, `loading:`, loading, `id:`, id)
    
    if (loading) {
      console.log(`⏳ Aún cargando...`)
      return
    }

    if (!user) {
      console.log(`❌ No hay usuario, redirigiendo a login`)
      router.push("/")
      return
    }

    // Verificar si viene con parámetro de edición y es admin
    const urlParams = new URLSearchParams(window.location.search)
    const editParam = urlParams.get("edit")
    if (editParam === "true" && user.rol === "admin") {
      setIsEditing(true)
    }

    // Cargar denuncia desde la API
    const fetchDenuncia = async () => {
      try {
        console.log(`🔍 Intentando cargar denuncia con ID: ${id}`)
        
        // Intentar primero con denuncias normales
        let response = await fetch(`/api/denuncias/${id}`, {
          method: 'GET',
          credentials: 'include'
        })

        console.log(`📡 Respuesta de denuncias normales: ${response.status} ${response.statusText}`)

        // Si no se encuentra en denuncias normales, intentar con denuncias formales
        if (!response.ok) {
          console.log(`🔄 No encontrada en denuncias normales, intentando con denuncias formales...`)
          response = await fetch(`/api/denuncias-formales/${id}`, {
            method: 'GET',
            credentials: 'include'
          })
          console.log(`📡 Respuesta de denuncias formales: ${response.status} ${response.statusText}`)
        }

        if (!response.ok) {
          const errorData = await response.json()
          console.error(`❌ Error de la API:`, errorData)
          throw new Error(errorData.error || 'Denuncia no encontrada')
        }

        const data = await response.json()
        console.log(`✅ Datos de la denuncia cargados:`, data)
        console.log(`📋 tipo_delito_nombre:`, data.tipo_delito_nombre)
        console.log(`📋 tipo_delito:`, data.tipo_delito)
        console.log(`📋 division:`, data.division)
        console.log(`📋 departamento_nombre:`, data.departamento_nombre)
        setDenuncia(data)
        
        // Mapear los datos de la API a los campos del formulario
        const formDataMapped = {
          denunciante_nombre: data.denunciante_nombre || "",
          denunciante_apellido: data.denunciante_apellido || "",
          denunciante_dni: data.denunciante_dni || "",
          tipo_delito: data.tipo_delito_nombre || data.tipo_delito || "",
          departamento_nombre: data.departamento_nombre || "",
          division: data.division || "",
          descripcion: data.descripcion || "",
          estado_nombre: data.estado_nombre || "",
          fecha_hecho: data.fecha_hecho || "",
          hora_hecho: data.hora_hecho || "",
          lugar_hecho: data.lugar_hecho || "",
          numero_expediente: data.numero_expediente || "",
          ubicacion: data.latitud && data.longitud && !isNaN(Number(data.latitud)) && !isNaN(Number(data.longitud)) ? { lat: Number(data.latitud), lng: Number(data.longitud) } : null,
        }
        
        console.log(`📋 Datos mapeados al formulario:`, formDataMapped)
        console.log(`📋 tipo_delito mapeado:`, formDataMapped.tipo_delito)
        console.log(`📋 division mapeada:`, formDataMapped.division)
        
        setFormData(formDataMapped)
      } catch (error) {
        console.error("Error al cargar denuncia:", error)
        setError("Error al cargar la denuncia")
        router.push("/dashboard/denuncias")
      } finally {
        setLoadingDenuncia(false)
      }
    }

    fetchDenuncia()
  }, [id, router, user, loading])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Verificar que el usuario sea administrador
    if (user.rol !== "admin") {
      setError("No tienes permisos para editar denuncias")
      return
    }

    // Validar campos (la ubicación es opcional)
    if (
      !formData.denunciante_nombre ||
      !formData.denunciante_apellido ||
      !formData.denunciante_dni ||
      !formData.tipo_delito ||
      !formData.departamento_nombre ||
      !formData.division ||
      !formData.descripcion ||
      !formData.fecha_hecho ||
      !formData.hora_hecho ||
      !formData.lugar_hecho ||
      !formData.numero_expediente
    ) {
      setError("Todos los campos son obligatorios (excepto la ubicación)")
      return
    }

    try {
      const response = await fetch(`/api/denuncias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          denunciante_nombre: formData.denunciante_nombre,
          denunciante_apellido: formData.denunciante_apellido,
          denunciante_dni: formData.denunciante_dni,
          tipo_delito: formData.tipo_delito,
          departamento_nombre: formData.departamento_nombre,
          division: formData.division,
          descripcion: formData.descripcion,
          fecha_hecho: formData.fecha_hecho,
          hora_hecho: formData.hora_hecho,
          lugar_hecho: formData.lugar_hecho,
          numero_expediente: formData.numero_expediente,
          latitud: formData.ubicacion?.lat || null,
          longitud: formData.ubicacion?.lng || null,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar la denuncia')
      }

      const updatedDenuncia = await response.json()
      setDenuncia(updatedDenuncia)
      setSuccess(true)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || "Error al actualizar la denuncia")
      console.error(err)
    }
  }

  const handleExportPDF = async () => {
    if (!denuncia) return

    try {
      // Si hay cambios pendientes y el usuario está editando, guardar primero
      if (isEditing) { 
        // Validar campos antes de guardar
        if (
          !formData.denunciante_nombre ||
          !formData.denunciante_apellido ||
          !formData.denunciante_dni ||
          !formData.tipo_delito ||
          !formData.departamento_nombre ||
          !formData.division ||
          !formData.descripcion ||
          !formData.fecha_hecho ||
          !formData.hora_hecho ||
          !formData.lugar_hecho ||
          !formData.numero_expediente
        ) {
          setError("Complete todos los campos antes de generar el informe")
          return
        }

        // Guardar cambios primero
        const response = await fetch(`/api/denuncias/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            denunciante_nombre: formData.denunciante_nombre,
            denunciante_apellido: formData.denunciante_apellido,
            denunciante_dni: formData.denunciante_dni,
            tipo_delito: formData.tipo_delito,
            departamento_nombre: formData.departamento_nombre,
            division: formData.division,
            descripcion: formData.descripcion,
            fecha_hecho: formData.fecha_hecho,
            hora_hecho: formData.hora_hecho,
            lugar_hecho: formData.lugar_hecho,
            numero_expediente: formData.numero_expediente,
            latitud: formData.ubicacion?.lat || null,
            longitud: formData.ubicacion?.lng || null,
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al actualizar la denuncia')
        }

        const updatedDenuncia = await response.json()
        setDenuncia(updatedDenuncia)
        setSuccess(true)
        setIsEditing(false)

        // Generar informe con datos actualizados
        await exportInformeDenuncia(updatedDenuncia, user)
      } else {
        // Generar informe con datos actuales
        await exportInformeDenuncia(denuncia, user)
      }
    } catch (error) {
      console.error("Error al generar informe:", error)
      setError("Error al generar el informe PDF")
    }
  }

  const handleExportFormalPDF = async () => {
    if (!denuncia) return

    setIsGeneratingFormalPDF(true)
    setError("")

    try {
      console.log("📋 Generando PDF de denuncia formal para denuncia:", denuncia.id)
      
      // Preparar los datos de la denuncia para el formato formal
      const denunciaFormalData = {
        ...denuncia,
        // Asegurar que los campos estén en el formato esperado por la función de PDF formal
        denunciante: `${denuncia.denunciante_nombre || ''} ${denuncia.denunciante_apellido || ''}`.trim(),
        dni: denuncia.denunciante_dni || denuncia.dni,
        tipo_delito: denuncia.tipo_delito_nombre || denuncia.tipo_delito,
        departamento: denuncia.departamento_nombre || denuncia.departamento,
        numero_expediente: denuncia.numero_expediente,
        descripcion: denuncia.descripcion,
        lugar_hecho: denuncia.lugar_hecho,
        fecha_hecho: denuncia.fecha_hecho,
        hora_hecho: denuncia.hora_hecho,
        latitud: denuncia.latitud,
        longitud: denuncia.longitud,
        // Agregar campos adicionales que podrían estar en observaciones
        observaciones: denuncia.observaciones || `División: ${denuncia.division || 'No especificada'}`
      }

      await exportDenunciaFormalToPDF(denunciaFormalData)
      
      console.log("✅ PDF de denuncia formal generado exitosamente")
    } catch (error) {
      console.error("❌ Error al generar PDF de denuncia formal:", error)
      setError("Error al generar el PDF de denuncia formal")
    } finally {
      setIsGeneratingFormalPDF(false)
    }
  }

  if (loading || loadingDenuncia) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Cargando denuncia...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !denuncia) return null

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard/denuncias")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Denuncia #{denuncia.id}</h1>
          <div className="ml-auto flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportPDF} 
              disabled={isGeneratingFormalPDF}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportFormalPDF}
              disabled={isGeneratingFormalPDF}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isGeneratingFormalPDF ? "Generando..." : "Denuncia Formal PDF"}
            </Button>
            {!isEditing && user.rol === "admin" && <Button onClick={() => setIsEditing(true)}>Editar</Button>}
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{isEditing ? "Editar Denuncia" : "Detalles de la Denuncia"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Modifique los datos de la denuncia"
                : `Registrada el ${new Date(denuncia.created_at).toLocaleDateString()} por ${denuncia.usuario_nombre || 'Usuario'}`}
            </CardDescription>
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
                  <AlertDescription>Denuncia actualizada correctamente.</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="denunciante_nombre">Nombre del Denunciante</Label>
                  <Input
                    id="denunciante_nombre"
                    name="denunciante_nombre"
                    value={formData.denunciante_nombre}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="denunciante_apellido">Apellido del Denunciante</Label>
                  <Input 
                    id="denunciante_apellido" 
                    name="denunciante_apellido" 
                    value={formData.denunciante_apellido} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="denunciante_dni">DNI del Denunciante</Label>
                  <Input 
                    id="denunciante_dni" 
                    name="denunciante_dni" 
                    value={formData.denunciante_dni} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_expediente">Nº Expediente</Label>
                  <Input
                    id="numero_expediente"
                    name="numero_expediente"
                    value={formData.numero_expediente}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Ingrese el número de expediente"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_delito">Tipo de Delito</Label>
                  {isEditing ? (
                    <Select value={formData.tipo_delito} onValueChange={(value) => handleSelectChange("tipo_delito", value)}>
                      <SelectTrigger id="tipo_delito">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Robo">Robo</SelectItem>
                        <SelectItem value="Hurto">Hurto</SelectItem>
                        <SelectItem value="Defraudación">Defraudación</SelectItem>
                        <SelectItem value="Paradero">Paradero</SelectItem>
                        <SelectItem value="Sustracción de Automotor">Sustracción de Automotor</SelectItem>
                        <SelectItem value="Estafa">Estafa</SelectItem>
                        <SelectItem value="Homicidio">Homicidio</SelectItem>
                        <SelectItem value="Suicidio">Suicidio</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={formData.tipo_delito} disabled />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departamento_nombre">Departamento</Label>
                  {isEditing ? (
                    <Select
                      value={formData.departamento_nombre}
                      onValueChange={(value) => handleSelectChange("departamento_nombre", value)}
                    >
                      <SelectTrigger id="departamento_nombre">
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ComisarÃ­a Central">ComisarÃ­a Central</SelectItem>
                        <SelectItem value="ComisarÃ­a Norte">ComisarÃ­a Norte</SelectItem>
                        <SelectItem value="ComisarÃ­a Sur">ComisarÃ­a Sur</SelectItem>
                        <SelectItem value="ComisarÃ­a Este">ComisarÃ­a Este</SelectItem>
                        <SelectItem value="ComisarÃ­a Oeste">ComisarÃ­a Oeste</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={formData.departamento_nombre} disabled />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="division">División</Label>
                {isEditing ? (
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
                ) : (
                  <Input value={formData.division} disabled />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_hecho">Fecha del Hecho</Label>
                  {isEditing ? (
                    <Input
                      id="fecha_hecho"
                      name="fecha_hecho"
                      type="date"
                      value={formData.fecha_hecho}
                      onChange={handleChange}
                    />
                  ) : (
                    <Input value={formData.fecha_hecho} disabled />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora_hecho">Hora del Hecho</Label>
                  {isEditing ? (
                    <Input
                      id="hora_hecho"
                      name="hora_hecho"
                      type="time"
                      value={formData.hora_hecho}
                      onChange={handleChange}
                    />
                  ) : (
                    <Input value={formData.hora_hecho} disabled />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lugar_hecho">Lugar del Hecho</Label>
                  {isEditing ? (
                    <Input
                      id="lugar_hecho"
                      name="lugar_hecho"
                      value={formData.lugar_hecho}
                      onChange={handleChange}
                      placeholder="Ingrese el lugar donde ocurrió el hecho"
                    />
                  ) : (
                    <Input value={formData.lugar_hecho} disabled />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_expediente">Nº Expediente</Label>
                  <Input
                    id="numero_expediente"
                    name="numero_expediente"
                    value={formData.numero_expediente}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Número de denuncia"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción de la Denuncia</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  rows={5}
                  value={formData.descripcion}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Ubicación del Hecho {!formData.ubicacion && "(No registrada)"}</Label>
                {formData.ubicacion || isEditing ? (
                  <MapSelector
                    initialLocation={formData.ubicacion}
                    onLocationSelect={handleLocationSelect}
                    isOptional={true}
                  />
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 text-center text-muted-foreground">
                    No se registró ubicación para esta denuncia
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado_nombre">Estado</Label>
                {isEditing ? (
                  <Select value={formData.estado_nombre} onValueChange={(value) => handleSelectChange("estado_nombre", value)}>
                    <SelectTrigger id="estado_nombre">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="En Proceso">En Proceso</SelectItem>
                      <SelectItem value="Resuelta">Resuelta</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={formData.estado_nombre} disabled />
                )}
              </div>
            </CardContent>
            {isEditing && user.rol === "admin" && (
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </CardFooter>
            )}
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
