"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import CamarasMap from "@/components/camaras-map"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Camera } from "lucide-react"
import MapSelector from "@/components/map-selector"

export default function CamarasPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isAddCameraDialogOpen, setIsAddCameraDialogOpen] = useState(false)
  const [cameraForm, setCameraForm] = useState({
    nombre: "",
    ubicacion: "",
    direccion: "",
    tipo: "",
    estado: "Activa",
    visionNocturna: false,
    audio: false,
    grabacion: false,
    lat: "",
    lng: "",
    observaciones: ""
  })
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    // Verificar autenticación
    if (!userLoading && !user) {
      router.push("/")
      return
    }
  }, [user, userLoading, router])

  const handleCameraFormChange = (field: string, value: any) => {
    setCameraForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLocationSelect = (location: { lat: number; lng: number } | null) => {
    setMapLocation(location)
    if (location) {
      setCameraForm(prev => ({
        ...prev,
        lat: location.lat.toString(),
        lng: location.lng.toString()
      }))
    }
  }

  const handleAddressChange = (address: string) => {
    setCameraForm(prev => ({
      ...prev,
      direccion: address
    }))
  }

  const handleAddCamera = async () => {
    try {
      // Validar campos obligatorios
      if (!cameraForm.nombre || !cameraForm.ubicacion || !cameraForm.direccion || !cameraForm.tipo) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive"
        })
        return
      }

      // Validar que se haya seleccionado una ubicación en el mapa
      if (!mapLocation || !cameraForm.lat || !cameraForm.lng) {
        toast({
          title: "Error",
          description: "Por favor selecciona una ubicación en el mapa",
          variant: "destructive"
        })
        return
      }

      // Enviar datos a la API
      const response = await fetch('/api/camaras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          numeroCamara: cameraForm.nombre,
          tipo: cameraForm.tipo,
          ubicacion: cameraForm.ubicacion,
          direccion: cameraForm.direccion,
          lat: parseFloat(cameraForm.lat),
          lng: parseFloat(cameraForm.lng),
          estado: cameraForm.estado,
          descripcion: cameraForm.observaciones || `Cámara ${cameraForm.tipo} ubicada en ${cameraForm.ubicacion}`,
          comisaria: "DOMICILIOS PRIVADOS",
          fechaInstalacion: new Date().toISOString().split('T')[0],
          ultimaRevision: new Date().toISOString().split('T')[0]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la cámara')
      }

      const nuevaCamara = await response.json()
      console.log("Cámara creada:", nuevaCamara)
      
      toast({
        title: "Cámara agregada",
        description: "La cámara se ha agregado correctamente",
      })

      // Limpiar formulario y cerrar diálogo
      setCameraForm({
        nombre: "",
        ubicacion: "",
        direccion: "",
        tipo: "",
        estado: "Activa",
        visionNocturna: false,
        audio: false,
        grabacion: false,
        lat: "",
        lng: "",
        observaciones: ""
      })
      setMapLocation(null)
      setIsAddCameraDialogOpen(false)

      // Recargar la página para mostrar la nueva cámara en el mapa
      window.location.reload()

    } catch (error) {
      console.error("Error al agregar cámara:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al agregar la cámara",
        variant: "destructive"
      })
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
          <h1 className="text-2xl font-bold">Cámaras de Seguridad</h1>
          <p className="text-muted-foreground">Monitoreo y gestión de cámaras de seguridad en La Rioja Capital</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Dialog open={isAddCameraDialogOpen} onOpenChange={setIsAddCameraDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Cámaras
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Camera className="mr-2 h-5 w-5" />
                    Agregar Nueva Cámara
                  </DialogTitle>
                  <DialogDescription>
                    Complete la información de la nueva cámara de seguridad
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre de la Cámara *</Label>
                      <Input
                        id="nombre"
                        value={cameraForm.nombre}
                        onChange={(e) => handleCameraFormChange("nombre", e.target.value)}
                        placeholder="Ej: Cámara 001 - Plaza Principal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ubicacion">Ubicación *</Label>
                      <Input
                        id="ubicacion"
                        value={cameraForm.ubicacion}
                        onChange={(e) => handleCameraFormChange("ubicacion", e.target.value)}
                        placeholder="Ej: Plaza Principal"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input
                      id="direccion"
                      value={cameraForm.direccion}
                      onChange={(e) => handleCameraFormChange("direccion", e.target.value)}
                      placeholder="Ej: Av. San Martín 123, La Rioja"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Cámara *</Label>
                      <Select value={cameraForm.tipo} onValueChange={(value) => handleCameraFormChange("tipo", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fija">Cámara Fija</SelectItem>
                          <SelectItem value="ptz">Cámara PTZ</SelectItem>
                          <SelectItem value="dome">Cámara Dome</SelectItem>
                          <SelectItem value="bullet">Cámara Bullet</SelectItem>
                          <SelectItem value="covert">Cámara Oculta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select value={cameraForm.estado} onValueChange={(value) => handleCameraFormChange("estado", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Activa">Activa</SelectItem>
                          <SelectItem value="Inactiva">Inactiva</SelectItem>
                          <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                          <SelectItem value="Fuera de Servicio">Fuera de Servicio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ubicación en el Mapa</Label>
                    <MapSelector
                      initialLocation={mapLocation}
                      onLocationSelect={handleLocationSelect}
                      onAddressChange={handleAddressChange}
                      isOptional={false}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Características</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="visionNocturna"
                          checked={cameraForm.visionNocturna}
                          onChange={(e) => handleCameraFormChange("visionNocturna", e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="visionNocturna" className="text-sm">Visión Nocturna</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="audio"
                          checked={cameraForm.audio}
                          onChange={(e) => handleCameraFormChange("audio", e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="audio" className="text-sm">Audio</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="grabacion"
                          checked={cameraForm.grabacion}
                          onChange={(e) => handleCameraFormChange("grabacion", e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="grabacion" className="text-sm">Grabación</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      value={cameraForm.observaciones}
                      onChange={(e) => handleCameraFormChange("observaciones", e.target.value)}
                      placeholder="Información adicional sobre la cámara..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCameraDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCamera}>
                    Agregar Cámara
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <CamarasMap user={user} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
