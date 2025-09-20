"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, Camera, User, MapPin } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MapSelector from "@/components/map-selector"
import CamarasMapReadonly from "@/components/camaras-map-readonly"

export default function OperadorPage() {
  const [user, setUser] = useState<any>(null)
  const [activeView, setActiveView] = useState<"form" | "map">("form")
  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    tipo: "",
    estado: "Activa",
    coordenadas: { lat: -29.4133, lng: -66.8567 }, // Centro de La Rioja
    descripcion: "",
    responsable: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(currentUser)
    setUser(parsedUser)

    // Verificar si es operador
    if (parsedUser.role !== "operador") {
      router.push("/dashboard")
      return
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validar campos obligatorios
    if (!formData.nombre || !formData.ubicacion || !formData.tipo || !formData.responsable) {
      setError("Todos los campos marcados con * son obligatorios")
      return
    }

    try {
      // Obtener cámaras existentes
      const camaras = JSON.parse(localStorage.getItem("camaras") || "[]")

      // Crear nueva cámara
      const nuevaCamara = {
        id: camaras.length > 0 ? Math.max(...camaras.map((c: any) => c.id)) + 1 : 1,
        nombre: formData.nombre,
        ubicacion: formData.ubicacion,
        jurisdiccion: "La Rioja Capital",
        comisaria: "DOMICILIOS PRIVADOS",
        tipo: formData.tipo === "Fija" ? "F" : "D",
        estado: "Operativa" as const,
        lat: formData.coordenadas.lat,
        lng: formData.coordenadas.lng,
        descripcion: formData.descripcion,
        fechaInstalacion: new Date().toISOString().split("T")[0],
        ultimaRevision: new Date().toISOString().split("T")[0],
        creadoPor: user.username,
        fechaCreacion: new Date().toISOString(),
      }

      // Guardar cámara
      const camarasActualizadas = [...camaras, nuevaCamara]
      localStorage.setItem("camaras", JSON.stringify(camarasActualizadas))

      setSuccess(true)

      // Limpiar formulario
      setFormData({
        nombre: "",
        ubicacion: "",
        tipo: "",
        estado: "Activa",
        coordenadas: { lat: -29.4133, lng: -66.8567 },
        descripcion: "",
        responsable: "",
      })

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Error al guardar la cámara")
      console.error(err)
    }
  }

  if (!user || user.role !== "operador") return null

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image
                src="/images/logo-policia-investigaciones.png"
                alt="Logo Policía Investigaciones"
                width={40}
                height={40}
                className="mr-3"
              />
              <div>
                <h1 className="text-xl font-bold">Sistema de Gestión de Cámaras</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Panel de Operador - Trabajo de Campo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user?.nombre}
                    <p className="text-xs text-muted-foreground">Operador de Campo</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="mr-2 h-5 w-5" />
              {activeView === "form" ? "Agregar Nueva Cámara de Seguridad" : "Cámaras de Seguridad - Vista de Campo"}
            </CardTitle>
            <CardDescription>
              {activeView === "form"
                ? "Complete el formulario para registrar una nueva cámara en el sistema"
                : "Visualice las cámaras existentes para trabajo de campo"}
            </CardDescription>

            {/* Navegación entre vistas */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mt-4">
              <Button
                variant={activeView === "form" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("form")}
                className="flex-1"
              >
                <Camera className="mr-2 h-4 w-4" />
                Agregar Cámara
              </Button>
              <Button
                variant={activeView === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("map")}
                className="flex-1"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Ver Cámaras
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeView === "form" ? (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200 mb-4">
                    <AlertDescription>Cámara agregada correctamente</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre de la Cámara *</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Cámara Plaza Principal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ubicacion">Ubicación *</Label>
                      <Input
                        id="ubicacion"
                        name="ubicacion"
                        value={formData.ubicacion}
                        onChange={handleChange}
                        placeholder="Ej: Av. San Nicolás y 25 de Mayo"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Cámara *</Label>
                      <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fija">Fija</SelectItem>
                          <SelectItem value="PTZ">PTZ (Pan-Tilt-Zoom)</SelectItem>
                          <SelectItem value="Domo">Domo</SelectItem>
                          <SelectItem value="Bullet">Bullet</SelectItem>
                          <SelectItem value="Térmica">Térmica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsable">Responsable *</Label>
                      <Input
                        id="responsable"
                        name="responsable"
                        value={formData.responsable}
                        onChange={handleChange}
                        placeholder="Nombre del responsable"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Descripción adicional de la cámara..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ubicación en el Mapa</Label>
                    <MapSelector
                      initialLocation={formData.coordenadas}
                      onLocationSelect={(location) => {
                        if (location) {
                          setFormData((prev) => ({ ...prev, coordenadas: location }))
                        }
                      }}
                      onAddressChange={(address) => {
                        if (address) {
                          setFormData((prev) => ({ ...prev, ubicacion: address }))
                        }
                      }}
                      isOptional={false}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="px-8">
                      <Camera className="mr-2 h-4 w-4" />
                      Agregar Cámara
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="mt-4">
                <CamarasMapReadonly user={user} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
