"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, FilePlus, Edit, Trash2, Award } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function DenunciasTable() {
  const [denuncias, setDenuncias] = useState<any[]>([])
  const [filteredDenuncias, setFilteredDenuncias] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoDenuncia, setTipoDenuncia] = useState("")
  const [departamento, setDepartamento] = useState("")
  const [division, setDivision] = useState("")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user: currentUser } = useCurrentUser()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDenuncias = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/denuncias', {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Error al cargar denuncias')
        }

        const data = await response.json()
        setDenuncias(data)
        setFilteredDenuncias(data)
      } catch (error) {
        console.error('Error fetching denuncias:', error)
        toast({
          title: "Error",
          description: "Error al cargar las denuncias",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDenuncias()
  }, [toast])

  useEffect(() => {
    // Filtrar denuncias
    let filtered = denuncias

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.denunciante_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.denunciante_apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (d.denunciante_dni && d.denunciante_dni.includes(searchTerm)) ||
          d.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.id?.toString().includes(searchTerm) ||
          (d.lugar_hecho && d.lugar_hecho.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (tipoDenuncia && tipoDenuncia !== "todos") {
      filtered = filtered.filter((d) => d.tipo_delito === tipoDenuncia)
    }

    if (departamento && departamento !== "todos") {
      filtered = filtered.filter((d) => d.departamento_nombre === departamento)
    }

    if (division && division !== "todas") {
      filtered = filtered.filter((d) => d.division === division)
    }

    setFilteredDenuncias(filtered)
  }, [searchTerm, tipoDenuncia, departamento, division, denuncias])

  const getStatusBadge = (estado: string) => {
    if (!estado) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Sin Estado
        </Badge>
      )
    }
    
    switch (estado) {
      case "Consulta":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Consulta
          </Badge>
        )
      case "En Proceso":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            En Proceso
          </Badge>
        )
      case "Resuelta":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Resuelta
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const handleDeleteDenuncia = (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta denuncia? Esta acción no se puede deshacer.")) {
      const updatedDenuncias = denuncias.filter((d) => d.id !== id)
      localStorage.setItem("denuncias", JSON.stringify(updatedDenuncias))
      setDenuncias(updatedDenuncias)
      setFilteredDenuncias(
        updatedDenuncias.filter((d) => {
          // Aplicar los mismos filtros actuales
          let filtered = [d]
          if (searchTerm) {
            filtered = filtered.filter(
              (d) =>
                d.denunciante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (d.dni && d.dni.includes(searchTerm)) ||
                d.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.id?.toString().includes(searchTerm),
            )
          }
          if (tipoDenuncia && tipoDenuncia !== "todos") {
            filtered = filtered.filter((d) => d.tipo === tipoDenuncia)
          }
          if (departamento && departamento !== "todos") {
            filtered = filtered.filter((d) => d.departamento === departamento)
          }
          if (division && division !== "todas") {
            filtered = filtered.filter((d) => d.division === division)
          }
          return filtered.length > 0
        }),
      )
    }
  }

  const handleGenerateCertificate = async (denuncia: any) => {
    if (isGeneratingPDF) return

    try {
      setIsGeneratingPDF(true)
      toast({
        title: "Generando certificado",
        description: "Por favor espere mientras se genera el certificado...",
      })

      const { exportCertificadoDenuncia } = await import("@/lib/pdf-certificado-denuncia")
      await exportCertificadoDenuncia(denuncia)

      toast({
        title: "Certificado generado",
        description: "El certificado se ha generado correctamente.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error al generar certificado:", error)
      toast({
        title: "Error al generar certificado",
        description: "Ocurrió un error al generar el certificado. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por denunciante, DNI, descripción, ID o datos del elemento/rodado..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={tipoDenuncia} onValueChange={setTipoDenuncia}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo de delito" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
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
          <Select value={departamento} onValueChange={setDepartamento}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Departamento Cibercrimen">Cibercrimen</SelectItem>
              <SelectItem value="Departamento Sustracción de Automotores">Sustracción de Automotores</SelectItem>
              <SelectItem value="Departamento Delitos Contra la Propiedad">Delitos Contra la Propiedad</SelectItem>
              <SelectItem value="Departamento Delitos contra las Personas">Delitos contra las Personas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="División" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="División Delito Económico">Delito Económico</SelectItem>
              <SelectItem value="División de Sustracción de Automotores">Sustracción de Automotores</SelectItem>
              <SelectItem value="División de Homicidio">Homicidio</SelectItem>
              <SelectItem value="División de Robos y Hurtos">Robos y Hurtos</SelectItem>
              <SelectItem value="División de Seguridad Personal">Seguridad Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>Denunciante</TableHead>
              <TableHead className="hidden md:table-cell">DNI</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">División</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDenuncias.length > 0 ? (
              filteredDenuncias.map((denuncia) => (
                <TableRow key={denuncia.id}>
                  <TableCell className="font-medium">#{denuncia.id}</TableCell>
                  <TableCell>
                    {denuncia.denunciante_nombre && denuncia.denunciante_apellido 
                      ? `${denuncia.denunciante_nombre} ${denuncia.denunciante_apellido}`
                      : denuncia.denunciante_nombre || "-"
                    }
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{denuncia.denunciante_dni || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{denuncia.tipo_delito || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">{denuncia.division || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {denuncia.created_at ? new Date(denuncia.created_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(denuncia.estado_nombre || denuncia.estado)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/denuncia/${denuncia.id}/ampliacion`)}
                      >
                        <FilePlus className="h-4 w-4 mr-2" />
                        Ampliación
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/denuncia/${denuncia.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateCertificate(denuncia)}
                        title="Generar Certificado de Denuncia"
                        disabled={isGeneratingPDF}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        {isGeneratingPDF ? "Generando..." : "Certificado"}
                      </Button>
                      {currentUser?.role === "admin" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/denuncia/${denuncia.id}?edit=true`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDenuncia(denuncia.id)}
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
                <TableCell colSpan={8} className="text-center py-4">
                  No se encontraron denuncias
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
