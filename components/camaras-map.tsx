"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, Camera, Plus, Edit, Trash2, Upload, FileText } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

// Verificar si la API key está disponible
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Componente de fallback cuando no hay API key válida
const MapFallback = () => (
  <div className="flex items-center justify-center h-[700px] bg-gray-100 dark:bg-gray-800 rounded-md border-2 border-dashed border-gray-300">
    <div className="text-center p-8">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Mapa no disponible</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        La API key de Google Maps no está configurada o no es válida para este dominio.
      </p>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-left">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Para configurar:</h4>
        <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>1. Ve a Google Cloud Console</li>
          <li>2. Habilita Maps JavaScript API</li>
          <li>3. Crea una API key</li>
          <li>4. Configura las restricciones de referrer</li>
          <li>5. Agrega la variable NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
        </ol>
      </div>
    </div>
  </div>
)

const containerStyle = {
  width: "100%",
  height: "700px",
}

const defaultCenter = {
  lat: -29.413454,
  lng: -66.856458,
}

interface CamaraMapProps {
  user: any
}

interface Camara {
  id: number
  nombre: string
  ubicacion: string
  jurisdiccion: string
  comisaria: string
  tipo: "F" | "D" // F = Fija, D = Domo
  estado: "Operativa" | "Fuera de Servicio" | "Mantenimiento"
  lat: number
  lng: number
  descripcion?: string
  fechaInstalacion?: string
  ultimaRevision?: string
}

interface KMZCamara {
  name: string
  description?: string
  coordinates: {
    lat: number
    lng: number
  }
}

export default function CamarasMap({ user }: CamaraMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["visualization", "maps"],
  })

  const [camaras, setCamaras] = useState<Camara[]>([])
  const [filteredCamaras, setFilteredCamaras] = useState<Camara[]>([])
  const [filtroComisaria, setFiltroComisaria] = useState<string>("todas")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [selectedCamara, setSelectedCamara] = useState<Camara | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    ubicacion: "",
    jurisdiccion: "La Rioja Capital",
    comisaria: "",
    tipo: "F" as "F" | "D",
    estado: "Operativa" as "Operativa" | "Fuera de Servicio" | "Mantenimiento",
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
    descripcion: "",
    fechaInstalacion: new Date().toISOString().split("T")[0],
    ultimaRevision: new Date().toISOString().split("T")[0],
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const { toast } = useToast()
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Datos iniciales de cámaras basados en el PDF
  const camarasIniciales: Omit<Camara, "id">[] = []

  useEffect(() => {
    const fetchCamaras = async () => {
      try {
        const response = await fetch('/api/camaras', {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Error al cargar cámaras')
        }

        const data = await response.json()
        setCamaras(data)
      } catch (error) {
        console.error('Error fetching camaras:', error)
        // Fallback a datos iniciales si hay error
        const camarasConId = camarasIniciales.map((camara, index) => ({
          ...camara,
          id: index + 1,
          fechaInstalacion: "2024-01-01",
          ultimaRevision: "2024-12-01",
          descripcion: `Cámara ${camara.tipo === "F" ? "Fija" : "Domo"} ubicada en ${camara.ubicacion}`,
        }))
        setCamaras(camarasConId)
      }
    }

    fetchCamaras()
  }, [])

  useEffect(() => {
    // Filtrar cámaras
    let filtered = [...camaras]

    if (filtroComisaria !== "todas") {
      filtered = filtered.filter((c) => c.comisaria === filtroComisaria)
    }

    if (filtroTipo !== "todos") {
      filtered = filtered.filter((c) => c.tipo === filtroTipo)
    }

    if (filtroEstado !== "todos") {
      filtered = filtered.filter((c) => c.estado === filtroEstado)
    }

    setFilteredCamaras(filtered)
  }, [camaras, filtroComisaria, filtroTipo, filtroEstado])

  const comisarias = Array.from(new Set(camaras.map((c) => c.comisaria)))

  const handleMarkerClick = useCallback((camara: Camara) => {
    setSelectedCamara(camara)
  }, [])

  const getMarkerIcon = (camara: Camara) => {
    const color = camara.estado === "Operativa" ? "#10b981" : camara.estado === "Mantenimiento" ? "#f59e0b" : "#ef4444"
    const symbol = camara.tipo === "F" ? "📹" : "🎥"

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" strokeWidth="2"/>
        <text x="15" y="20" textAnchor="middle" fontSize="12" fill="white">${symbol}</text>
      </svg>`,
      )}`,
      scaledSize: window.google?.maps ? new window.google.maps.Size(30, 30) : undefined,
    }
  }

  const parseKMLContent = (kmlContent: string): KMZCamara[] => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(kmlContent, "application/xml")

      // Check for parsing errors
      const parseError = xmlDoc.querySelector("parsererror")
      if (parseError) {
        throw new Error("Error al parsear el archivo XML/KML")
      }

      const cameras: KMZCamara[] = []

      // Try different possible KML structures
      const placemarks = xmlDoc.getElementsByTagName("Placemark")

      for (let i = 0; i < placemarks.length; i++) {
        const placemark = placemarks[i]

        // Extract name
        const nameElement = placemark.getElementsByTagName("name")[0]
        const name = nameElement?.textContent?.trim() || `Cámara ${i + 1}`

        // Extract description
        const descElement = placemark.getElementsByTagName("description")[0]
        const description = descElement?.textContent?.trim() || ""

        // Extract coordinates - try different possible structures
        let coordinates = ""

        // Try Point > coordinates
        const pointElement = placemark.getElementsByTagName("Point")[0]
        if (pointElement) {
          const coordElement = pointElement.getElementsByTagName("coordinates")[0]
          coordinates = coordElement?.textContent?.trim() || ""
        }

        // If no Point, try direct coordinates
        if (!coordinates) {
          const coordElement = placemark.getElementsByTagName("coordinates")[0]
          coordinates = coordElement?.textContent?.trim() || ""
        }

        if (coordinates) {
          // KML coordinates format: longitude,latitude[,altitude]
          // Split by whitespace and commas to handle different formats
          const coordParts = coordinates.split(/[\s,]+/).filter((part) => part.length > 0)

          if (coordParts.length >= 2) {
            const lng = Number.parseFloat(coordParts[0])
            const lat = Number.parseFloat(coordParts[1])

            // Validate coordinates
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              cameras.push({
                name,
                description,
                coordinates: { lat, lng },
              })
            } else {
              console.warn(`Coordenadas inválidas para ${name}: lat=${lat}, lng=${lng}`)
            }
          } else {
            console.warn(`Formato de coordenadas inválido para ${name}: ${coordinates}`)
          }
        } else {
          console.warn(`No se encontraron coordenadas para ${name}`)
        }
      }

      return cameras
    } catch (error) {
      console.error("Error parsing KML:", error)
      throw new Error("Error al procesar el contenido del archivo KML")
    }
  }

  const parseKMZ = async (file: File): Promise<KMZCamara[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const result = e.target?.result

          if (!result) {
            throw new Error("No se pudo leer el archivo")
          }

          let kmlContent = ""

          if (file.name.toLowerCase().endsWith(".kmz")) {
            // For KMZ files, we need to handle them as ZIP files
            // Since we can't use external libraries, we'll inform the user
            throw new Error(
              "Los archivos KMZ no están soportados directamente. Por favor, extraiga el archivo KML del KMZ y súbalo directamente, o exporte como KML desde Google Earth.",
            )
          } else if (file.name.toLowerCase().endsWith(".kml")) {
            // Handle KML files
            if (typeof result === "string") {
              kmlContent = result
            } else {
              // Convert ArrayBuffer to string
              const decoder = new TextDecoder("utf-8")
              kmlContent = decoder.decode(result as ArrayBuffer)
            }
          } else {
            throw new Error("Formato de archivo no soportado. Use archivos .kml")
          }

          // Parse the KML content
          const cameras = parseKMLContent(kmlContent)

          if (cameras.length === 0) {
            throw new Error("No se encontraron puntos válidos en el archivo KML")
          }

          resolve(cameras)
        } catch (error) {
          console.error("Error processing file:", error)
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"))
      }

      // Read the file
      if (file.name.toLowerCase().endsWith(".kml")) {
        reader.readAsText(file, "utf-8")
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "Error",
        description: "Por favor seleccione un archivo",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const kmzCameras = await parseKMZ(uploadFile)

      if (kmzCameras.length === 0) {
        toast({
          title: "Advertencia",
          description: "No se encontraron puntos válidos en el archivo",
          variant: "destructive",
        })
        return
      }

      // Convert KMZ cameras to our camera format
      const newCameras: Camara[] = kmzCameras.map((kmzCam, index) => {
        // Generate a unique ID
        const newId = Math.max(...camaras.map((c) => c.id), 0) + index + 1

        // Try to determine camera type from name or description
        const nameUpper = kmzCam.name.toUpperCase()
        const descUpper = (kmzCam.description || "").toUpperCase()
        let tipo: "F" | "D" = "F" // Default to Fija

        if (nameUpper.includes("DOMO") || nameUpper.includes("D") || descUpper.includes("DOMO")) {
          tipo = "D"
        }

        // Try to determine comisaria from name or description
        let comisaria = "IMPORTADO KML"
        if (nameUpper.includes("COMISARIA") || descUpper.includes("COMISARIA")) {
          const match = (kmzCam.name + " " + kmzCam.description).match(/COMISARIA\s*(\d+)/i)
          if (match) {
            comisaria = `COMISARIA ${match[1]}`
          }
        }

        return {
          id: newId,
          nombre: kmzCam.name || `Cámara ${index + 1}`,
          ubicacion: kmzCam.description || "Importado desde KML",
          jurisdiccion: "La Rioja Capital",
          comisaria,
          tipo,
          estado: "Operativa" as const,
          lat: kmzCam.coordinates.lat,
          lng: kmzCam.coordinates.lng,
          descripcion: kmzCam.description,
          fechaInstalacion: new Date().toISOString().split("T")[0],
          ultimaRevision: new Date().toISOString().split("T")[0],
        }
      })

      const updatedCamaras = [...camaras, ...newCameras]
      setCamaras(updatedCamaras)
      localStorage.setItem("camaras", JSON.stringify(updatedCamaras))

      toast({
        title: "Importación exitosa",
        description: `Se importaron ${newCameras.length} cámaras desde el archivo KML`,
      })

      setIsUploadDialogOpen(false)
      setUploadFile(null)
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Error en la importación",
        description: error instanceof Error ? error.message : "Error desconocido al procesar el archivo",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.ubicacion || !formData.comisaria) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const nuevaCamara: Camara = {
      id: isEditMode ? editingId! : Math.max(...camaras.map((c) => c.id), 0) + 1,
      ...formData,
    }

    let updatedCamaras: Camara[]
    if (isEditMode) {
      updatedCamaras = camaras.map((c) => (c.id === editingId ? nuevaCamara : c))
    } else {
      updatedCamaras = [...camaras, nuevaCamara]
    }

    setCamaras(updatedCamaras)
    localStorage.setItem("camaras", JSON.stringify(updatedCamaras))

    toast({
      title: isEditMode ? "Cámara actualizada" : "Cámara agregada",
      description: `La cámara ${formData.nombre} ha sido ${isEditMode ? "actualizada" : "agregada"} correctamente`,
    })

    // Resetear formulario
    setFormData({
      nombre: "",
      ubicacion: "",
      jurisdiccion: "La Rioja Capital",
      comisaria: "",
      tipo: "F",
      estado: "Operativa",
      lat: defaultCenter.lat,
      lng: defaultCenter.lng,
      descripcion: "",
      fechaInstalacion: new Date().toISOString().split("T")[0],
      ultimaRevision: new Date().toISOString().split("T")[0],
    })
    setIsDialogOpen(false)
    setIsEditMode(false)
    setEditingId(null)
  }

  const handleEdit = (camara: Camara) => {
    setFormData({
      nombre: camara.nombre,
      ubicacion: camara.ubicacion,
      jurisdiccion: camara.jurisdiccion,
      comisaria: camara.comisaria,
      tipo: camara.tipo,
      estado: camara.estado,
      lat: camara.lat,
      lng: camara.lng,
      descripcion: camara.descripcion || "",
      fechaInstalacion: camara.fechaInstalacion || new Date().toISOString().split("T")[0],
      ultimaRevision: camara.ultimaRevision || new Date().toISOString().split("T")[0],
    })
    setEditingId(camara.id)
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta cámara?")) {
      const updatedCamaras = camaras.filter((c) => c.id !== id)
      setCamaras(updatedCamaras)
      localStorage.setItem("camaras", JSON.stringify(updatedCamaras))

      toast({
        title: "Cámara eliminada",
        description: "La cámara ha sido eliminada correctamente",
      })
    }
  }

  const handleMapClick = (e: any) => {
    if (e.latLng && isDialogOpen) {
      setFormData((prev) => ({
        ...prev,
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }))
    }
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar el mapa</AlertTitle>
        <AlertDescription>
          No se pudo cargar el mapa de Google. Por favor, verifique su conexión a internet o contacte al administrador.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Cámaras de Seguridad de la Ciudad</CardTitle>
            <CardDescription>Monitoreo y gestión de cámaras de seguridad en La Rioja Capital</CardDescription>
          </div>
          <div className="flex gap-2">
            {(user?.role === "admin" || user?.role === "usuario" || user?.role === "operador") && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setIsEditMode(false)
                      setEditingId(null)
                      setFormData({
                        nombre: "",
                        ubicacion: "",
                        jurisdiccion: "La Rioja Capital",
                        comisaria: "",
                        tipo: "F",
                        estado: "Operativa",
                        lat: defaultCenter.lat,
                        lng: defaultCenter.lng,
                        descripcion: "",
                        fechaInstalacion: new Date().toISOString().split("T")[0],
                        ultimaRevision: new Date().toISOString().split("T")[0],
                      })
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Cámara
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isEditMode ? "Editar Cámara" : "Agregar Nueva Cámara"}</DialogTitle>
                    <DialogDescription>
                      {isEditMode
                        ? "Modifique los datos de la cámara"
                        : "Complete los datos de la nueva cámara de seguridad"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombre">Nombre/Código</Label>
                          <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                            placeholder="Ej: 1F, 2D, etc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="tipo">Tipo</Label>
                          <Select
                            value={formData.tipo}
                            onValueChange={(value: "F" | "D") => setFormData((prev) => ({ ...prev, tipo: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="F">Fija (F)</SelectItem>
                              <SelectItem value="D">Domo (D)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="ubicacion">Ubicación</Label>
                        <Input
                          id="ubicacion"
                          value={formData.ubicacion}
                          onChange={(e) => setFormData((prev) => ({ ...prev, ubicacion: e.target.value }))}
                          placeholder="Descripción de la ubicación"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="comisaria">Tipo de Ubicación</Label>
                          <Select
                            value={formData.comisaria}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, comisaria: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DOMICILIOS PRIVADOS">DOMICILIOS PRIVADOS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="estado">Estado</Label>
                          <Select
                            value={formData.estado}
                            onValueChange={(value: "Operativa" | "Fuera de Servicio" | "Mantenimiento") =>
                              setFormData((prev) => ({ ...prev, estado: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Operativa">Operativa</SelectItem>
                              <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                              <SelectItem value="Fuera de Servicio">Fuera de Servicio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="lat">Latitud (Opcional)</Label>
                          <Input
                            id="lat"
                            type="number"
                            step="0.000001"
                            value={formData.lat}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, lat: Number.parseFloat(e.target.value) }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="lng">Longitud (Opcional)</Label>
                          <Input
                            id="lng"
                            type="number"
                            step="0.000001"
                            value={formData.lng}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, lng: Number.parseFloat(e.target.value) }))
                            }
                          />
                        </div>
                      </div>

                      {/* Agregar el mapa interactivo aquí */}
                      <div className="space-y-2">
                        <Label>Ubicación en el Mapa</Label>
                        <div className="border rounded-md overflow-hidden">
                          {isLoaded && GOOGLE_MAPS_API_KEY ? (
                            <GoogleMap
                              mapContainerStyle={{ width: "100%", height: "300px" }}
                              center={{ lat: formData.lat, lng: formData.lng }}
                              zoom={15}
                              onClick={handleMapClick}
                              options={{
                                streetViewControl: false,
                                mapTypeControl: true,
                                fullscreenControl: false,
                                zoomControl: true,
                              }}
                            >
                              <Marker
                                position={{ lat: formData.lat, lng: formData.lng }}
                                draggable={true}
                                onDragEnd={(e) => {
                                  if (e.latLng) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      lat: e.latLng!.lat(),
                                      lng: e.latLng!.lng(),
                                    }))
                                  }
                                }}
                              />
                            </GoogleMap>
                          ) : (
                            <div className="flex items-center justify-center h-[300px] bg-gray-100 dark:bg-gray-800">
                              {!GOOGLE_MAPS_API_KEY ? (
                                <p className="text-sm text-muted-foreground">API key de Google Maps no configurada</p>
                              ) : (
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>💡 Haga clic en el mapa o arrastre el marcador para establecer las coordenadas exactas</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="fechaInstalacion">Fecha de Instalación</Label>
                          <Input
                            id="fechaInstalacion"
                            type="date"
                            value={formData.fechaInstalacion}
                            onChange={(e) => setFormData((prev) => ({ ...prev, fechaInstalacion: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">{isEditMode ? "Actualizar" : "Agregar"} Cámara</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            {(user?.role === "admin" || user?.role === "usuario" || user?.role === "operador") && (
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Importar KML
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Importar Cámaras desde KML</DialogTitle>
                    <DialogDescription>
                      Suba un archivo KML exportado desde Google Earth para importar múltiples ubicaciones de cámaras
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="kml-file">Archivo KML</Label>
                      <Input
                        id="kml-file"
                        type="file"
                        accept=".kml"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-2">Solo archivos .kml</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-800 dark:text-blue-200">Instrucciones:</p>
                          <ul className="mt-1 text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Exporte desde Google Earth como KML</li>
                            <li>• Para archivos KMZ, extraiga el KML primero</li>
                            <li>• Cada punto se importará como una cámara</li>
                            <li>• El nombre del punto será el código de la cámara</li>
                            <li>• La descripción se usará como ubicación</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800 dark:text-amber-200">Nota sobre KMZ:</p>
                          <p className="mt-1 text-amber-700 dark:text-amber-300">
                            Los archivos KMZ no están soportados directamente. Extraiga el archivo KML del KMZ o exporte
                            directamente como KML desde Google Earth.
                          </p>
                        </div>
                      </div>
                    </div>

                    {uploadFile && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <p className="text-sm">
                          <strong>Archivo seleccionado:</strong> {uploadFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tamaño: {(uploadFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsUploadDialogOpen(false)
                        setUploadFile(null)
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleFileUpload} disabled={!uploadFile || isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Importar
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Cámaras Domicilios Privados</label>
            <Select value={filtroComisaria} onValueChange={setFiltroComisaria}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los domicilios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los domicilios</SelectItem>
                <SelectItem value="DOMICILIOS PRIVADOS">DOMICILIOS PRIVADOS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tipo</label>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="F">Fija (F)</SelectItem>
                <SelectItem value="D">Domo (D)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Estado</label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Operativa">Operativa</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="Fuera de Servicio">Fuera de Servicio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <div className="text-sm">
              <p>
                <strong>Total:</strong> {filteredCamaras.length} cámaras
              </p>
              <p>
                <strong>Operativas:</strong> {filteredCamaras.filter((c) => c.estado === "Operativa").length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              {!isLoaded || !GOOGLE_MAPS_API_KEY ? (
                !GOOGLE_MAPS_API_KEY ? (
                  <MapFallback />
                ) : (
                  <div className="flex items-center justify-center h-[700px] bg-gray-100 dark:bg-gray-800 rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )
              ) : (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={defaultCenter}
                  zoom={13}
                  onClick={handleMapClick}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                  }}
                >
                  {filteredCamaras.map((camara) => (
                    <Marker
                      key={camara.id}
                      position={{ lat: camara.lat, lng: camara.lng }}
                      icon={getMarkerIcon(camara)}
                      onClick={() => handleMarkerClick(camara)}
                    />
                  ))}

                  {selectedCamara && (
                    <InfoWindow
                      position={{ lat: selectedCamara.lat, lng: selectedCamara.lng }}
                      onCloseClick={() => setSelectedCamara(null)}
                    >
                      <div className="p-2">
                        <h3 className="font-semibold">{selectedCamara.nombre}</h3>
                        <p className="text-sm">{selectedCamara.ubicacion}</p>
                        <p className="text-sm text-muted-foreground">{selectedCamara.comisaria}</p>
                        <div className="mt-2">
                          <Badge variant={selectedCamara.estado === "Operativa" ? "default" : "destructive"}>
                            {selectedCamara.estado}
                          </Badge>
                          <Badge variant="outline" className="ml-2">
                            {selectedCamara.tipo === "F" ? "Fija" : "Domo"}
                          </Badge>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Leyenda</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Operativa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span>Mantenimiento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Fuera de Servicio</span>
                </div>
                <div className="mt-4">
                  <p>
                    <strong>📹</strong> Cámara Fija
                  </p>
                  <p>
                    <strong>🎥</strong> Cámara Domo
                  </p>
                </div>
              </div>
            </div>

            {selectedCamara && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    {selectedCamara.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong>Ubicación:</strong> {selectedCamara.ubicacion}
                  </div>
                  <div>
                    <strong>Comisaría:</strong> {selectedCamara.comisaria}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {selectedCamara.tipo === "F" ? "Fija" : "Domo"}
                  </div>
                  <div>
                    <strong>Estado:</strong>
                    <Badge variant={selectedCamara.estado === "Operativa" ? "default" : "destructive"} className="ml-2">
                      {selectedCamara.estado}
                    </Badge>
                  </div>
                  {selectedCamara.descripcion && (
                    <div>
                      <strong>Descripción:</strong> {selectedCamara.descripcion}
                    </div>
                  )}
                  {selectedCamara.fechaInstalacion && (
                    <div>
                      <strong>Instalación:</strong> {new Date(selectedCamara.fechaInstalacion).toLocaleDateString()}
                    </div>
                  )}
                  {selectedCamara.ultimaRevision && (
                    <div>
                      <strong>Última Revisión:</strong> {new Date(selectedCamara.ultimaRevision).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <strong>Coordenadas:</strong> {selectedCamara.lat.toFixed(6)}, {selectedCamara.lng.toFixed(6)}
                  </div>

                  {user?.role === "admin" && (
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => handleEdit(selectedCamara)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedCamara.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="text-sm text-muted-foreground">
              <p>Total de cámaras en el mapa: {filteredCamaras.length}</p>
              <p className="mt-1">
                <strong>Nota:</strong> Haga clic en una cámara para ver más detalles.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
