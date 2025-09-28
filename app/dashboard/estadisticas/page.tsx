"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, PieChart, LineChart, DoughnutChart, RadarChart } from "@/components/charts"
import { FileText, AlertTriangle, CheckCircle, Clock, FileDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { generatePDF } from "@/lib/pdf-generator"
import { useToast } from "@/components/ui/use-toast"
import HeatMap from "@/components/heat-map"
import GeneralMap from "@/components/general-map"
import { useCurrentUser } from "@/hooks/use-current-user"

const POBLACION_LA_RIOJA = 383865 // Población total de La Rioja (Censo 2022)

export default function Estadisticas() {
  const { user, loading: userLoading } = useCurrentUser()
  const [denuncias, setDenuncias] = useState<any[]>([])
  const [filtroTiempo, setFiltroTiempo] = useState("todos")
  const [tipoGraficoEstado, setTipoGraficoEstado] = useState<"pie" | "doughnut">("doughnut")
  const [tipoGraficoDepartamento, setTipoGraficoDepartamento] = useState<"bar" | "radar">("bar")
  const [tipoGraficoDelito, setTipoGraficoDelito] = useState<"bar" | "radar">("bar")
  const [tipoGraficoTasa, setTipoGraficoTasa] = useState<"bar" | "pie" | "doughnut">("bar")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [activeTab, setActiveTab] = useState("estado")
  const statsContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [stats, setStats] = useState({
    total: 0,
    consulta: 0,
    enProceso: 0,
    resueltas: 0,
    porDepartamento: {} as Record<string, number>,
    porTipo: {} as Record<string, number>,
    porMes: {} as Record<string, number>,
  })

  useEffect(() => {
    // Verificar autenticación
    if (!userLoading && !user) {
      router.push("/")
      return
    }
  }, [user, userLoading, router])

  useEffect(() => {
    const fetchDenuncias = async () => {
      if (!user) return
      
      try {
        console.log("🔍 Cargando denuncias para estadísticas...")
        
        const [denunciasResponse, denunciasFormalesResponse] = await Promise.all([
          fetch('/api/denuncias', { credentials: 'include' }),
          fetch('/api/denuncias-formales', { credentials: 'include' })
        ])

        const denuncias = denunciasResponse.ok ? await denunciasResponse.json() : []
        const denunciasFormales = denunciasFormalesResponse.ok ? await denunciasFormalesResponse.json() : []

        console.log("📊 Datos recibidos para estadísticas:", {
          denuncias: denuncias.length,
          denunciasFormales: denunciasFormales.length
        })

        // Combinar ambas tablas de denuncias como en el panel de control
        const todasLasDenuncias = [...denuncias, ...denunciasFormales]
        setDenuncias(todasLasDenuncias)
      } catch (error) {
        console.error('Error fetching denuncias:', error)
      }
    }

    fetchDenuncias()
  }, [user])

  useEffect(() => {
    if (!denuncias.length) return

    // Filtrar denuncias por tiempo si es necesario
    let filteredDenuncias = [...denuncias]

    if (filtroTiempo !== "todos") {
      const now = new Date()
      const startDate = new Date()

      switch (filtroTiempo) {
        case "7dias":
          startDate.setDate(now.getDate() - 7)
          break
        case "30dias":
          startDate.setDate(now.getDate() - 30)
          break
        case "90dias":
          startDate.setDate(now.getDate() - 90)
          break
        case "anual":
          startDate.setFullYear(now.getFullYear(), 0, 1) // Inicio del año actual
          break
      }

      filteredDenuncias = denuncias.filter((d) => {
        const fecha = new Date(d.fecha_denuncia || d.fecha_hecho || d.created_at || d.fecha)
        return !isNaN(fecha.getTime()) && fecha >= startDate
      })
    }

    // Calcular estadísticas usando los mismos campos que el panel de control
    const consulta = filteredDenuncias.filter((d) => d.estado_nombre === "Consulta").length
    const enProceso = filteredDenuncias.filter((d) => d.estado_nombre === "En Proceso").length
    const resueltas = filteredDenuncias.filter((d) => d.estado_nombre === "Resuelta").length

    // Agrupar por departamento usando el campo correcto de la API
    const porDepartamento: Record<string, number> = {}
    filteredDenuncias.forEach((d) => {
      const departamento = d.departamento_nombre || d.departamento || 'Sin departamento'
      porDepartamento[departamento] = (porDepartamento[departamento] || 0) + 1
    })

    // Agrupar por tipo usando el campo correcto de la API
    const porTipo: Record<string, number> = {}
    filteredDenuncias.forEach((d) => {
      const tipo = d.tipo_delito || d.tipo || 'Sin especificar'
      porTipo[tipo] = (porTipo[tipo] || 0) + 1
    })

    // Agrupar por mes usando el campo correcto de fecha
    const porMes: Record<string, number> = {}
    filteredDenuncias.forEach((d) => {
      const fecha = new Date(d.fecha_denuncia || d.fecha_hecho || d.created_at || d.fecha)
      if (!isNaN(fecha.getTime())) {
        const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
        porMes[mes] = (porMes[mes] || 0) + 1
      }
    })

    // Ordenar meses cronológicamente
    const porMesOrdenado: Record<string, number> = {}
    Object.keys(porMes)
      .sort()
      .forEach((key) => {
        porMesOrdenado[key] = porMes[key]
      })

    console.log("📊 Estadísticas calculadas:", {
      total: filteredDenuncias.length,
      consulta,
      enProceso,
      resueltas,
      porDepartamento,
      porTipo,
      porMes: porMesOrdenado,
    })

    setStats({
      total: filteredDenuncias.length,
      consulta,
      enProceso,
      resueltas,
      porDepartamento,
      porTipo,
      porMes: porMesOrdenado,
    })
  }, [denuncias, filtroTiempo])

  const handleGeneratePDF = async () => {
    if (!statsContainerRef.current) return

    setIsGeneratingPDF(true)

    try {
      // Obtener el período de tiempo seleccionado
      const periodoTexto = {
        todos: "Todo el tiempo",
        "7dias": "Últimos 7 días",
        "30dias": "Últimos 30 días",
        "90dias": "Últimos 90 días",
        anual: "Año actual",
      }[filtroTiempo]

      // Preparar datos para el PDF
      const pdfData = {
        title: "Informe de Estadísticas de Denuncias",
        subtitle: `Período: ${periodoTexto}`,
        date: new Date().toLocaleDateString(),
        user: user?.nombre || 'Usuario',
        department: user?.departamento || 'Sin departamento',
        stats: {
          total: stats.total,
          pendientes: stats.consulta,
          enProceso: stats.enProceso,
          resueltas: stats.resueltas,
        },
        activeTab,
        tipoGraficoEstado,
        tipoGraficoDepartamento,
        tipoGraficoDelito,
        tipoGraficoTasa,
        // Agregar datos de tasas criminológicas
        tasasCriminologicas: {
          poblacion: POBLACION_LA_RIOJA,
          porTipo: Object.entries(stats.porTipo)
            .map(([tipo, cantidad]) => ({
              tipo,
              cantidad,
              tasa: ((cantidad / POBLACION_LA_RIOJA) * 100000).toFixed(2),
            }))
            .sort((a, b) => b.cantidad - a.cantidad),
        },
      }

      // Generar y descargar el PDF
      await generatePDF(statsContainerRef.current, pdfData)

      toast({
        title: "Informe generado",
        description: "El informe PDF se ha generado y descargado correctamente.",
        duration: 5000,
      })
    } catch (error) {
      console.error("Error al generar el PDF:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el informe PDF.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsGeneratingPDF(false)
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Estadísticas</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={filtroTiempo} onValueChange={setFiltroTiempo}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Período de tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo el tiempo</SelectItem>
                <SelectItem value="7dias">Últimos 7 días</SelectItem>
                <SelectItem value="30dias">Últimos 30 días</SelectItem>
                <SelectItem value="90dias">Últimos 90 días</SelectItem>
                <SelectItem value="anual">Año actual</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="w-full sm:w-auto">
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Generar Informe PDF
                </>
              )}
            </Button>
          </div>
        </div>

        <div ref={statsContainerRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Denuncias</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Consulta</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.consulta}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? `${Math.round((stats.consulta / stats.total) * 100)}%` : "0%"} del total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.enProceso}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? `${Math.round((stats.enProceso / stats.total) * 100)}%` : "0%"} del total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Resueltas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resueltas}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? `${Math.round((stats.resueltas / stats.total) * 100)}%` : "0%"} del total
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="estado" className="w-full mt-6" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="estado">Por Estado</TabsTrigger>
              <TabsTrigger value="departamento">Por Departamento</TabsTrigger>
              <TabsTrigger value="tiempo">Evolución Temporal</TabsTrigger>
              <TabsTrigger value="tasa">Tasa de Delitos</TabsTrigger>
              <TabsTrigger value="mapa">Mapa de Calor</TabsTrigger>
              <TabsTrigger value="general">Mapa del Delito</TabsTrigger>
            </TabsList>
            <TabsContent value="estado">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Distribución por Estado</CardTitle>
                    <CardDescription>Visualización de denuncias según su estado actual</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={tipoGraficoEstado === "pie" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoGraficoEstado("pie")}
                    >
                      Pastel
                    </Button>
                    <Button
                      variant={tipoGraficoEstado === "doughnut" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoGraficoEstado("doughnut")}
                    >
                      Dona
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-full max-w-md h-80">
                    {tipoGraficoEstado === "pie" ? (
                      <PieChart
                        labels={["Consulta", "En Proceso", "Resueltas"]}
                        data={[stats.consulta, stats.enProceso, stats.resueltas]}
                        backgroundColor={["#f59e0b", "#3b82f6", "#10b981"]}
                      />
                    ) : (
                      <DoughnutChart
                        labels={["Consulta", "En Proceso", "Resueltas"]}
                        data={[stats.consulta, stats.enProceso, stats.resueltas]}
                        backgroundColor={["#f59e0b", "#3b82f6", "#10b981"]}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="departamento">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Denuncias por Departamento</CardTitle>
                    <CardDescription>Distribución de denuncias por departamento policial</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={tipoGraficoDepartamento === "bar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoGraficoDepartamento("bar")}
                    >
                      Barras
                    </Button>
                    <Button
                      variant={tipoGraficoDepartamento === "radar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoGraficoDepartamento("radar")}
                    >
                      Radar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-full h-80">
                    {tipoGraficoDepartamento === "bar" ? (
                      <BarChart
                        labels={Object.keys(stats.porDepartamento)}
                        data={Object.values(stats.porDepartamento)}
                        label="Denuncias"
                        backgroundColor="#3b82f6"
                      />
                    ) : (
                      <RadarChart
                        labels={Object.keys(stats.porDepartamento)}
                        datasets={[
                          {
                            label: "Denuncias",
                            data: Object.values(stats.porDepartamento),
                            backgroundColor: "rgba(59, 130, 246, 0.2)",
                            borderColor: "rgba(59, 130, 246, 1)",
                          },
                        ]}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tiempo">
              <Card>
                <CardHeader>
                  <CardTitle>Evolución Temporal</CardTitle>
                  <CardDescription>Tendencia de denuncias a lo largo del tiempo</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-full h-80">
                    <LineChart
                      labels={Object.keys(stats.porMes).map((mes) => {
                        const [year, month] = mes.split("-")
                        return `${month}/${year.slice(2)}`
                      })}
                      data={Object.values(stats.porMes)}
                      label="Denuncias"
                      borderColor="#3b82f6"
                      backgroundColor="rgba(59, 130, 246, 0.1)"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tasa">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Tasa de Delitos por cada 100,000 habitantes</CardTitle>
                    <CardDescription>
                      Tasa criminológica de cada tipo de delito en La Rioja (Población:{" "}
                      {POBLACION_LA_RIOJA.toLocaleString()} habitantes - Censo 2022)
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={tipoGraficoTasa === "bar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoGraficoTasa("bar")}
                    >
                      Barras
                    </Button>
                    <Button
                      variant={tipoGraficoTasa === "pie" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoGraficoTasa("pie")}
                    >
                      Pastel
                    </Button>
                    <Button
                      variant={tipoGraficoTasa === "doughnut" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoGraficoTasa("doughnut")}
                    >
                      Dona
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-full h-80">
                    {tipoGraficoTasa === "bar" ? (
                      <BarChart
                        labels={Object.keys(stats.porTipo).map((tipo) => tipo)}
                        data={Object.keys(stats.porTipo).map((tipo) =>
                          Math.round((stats.porTipo[tipo] / POBLACION_LA_RIOJA) * 100000),
                        )}
                        label="Tasa por 100,000 hab."
                        backgroundColor="#8b5cf6"
                      />
                    ) : tipoGraficoTasa === "pie" ? (
                      <PieChart
                        labels={Object.keys(stats.porTipo).map(
                          (tipo) =>
                            `${tipo} (${Math.round((stats.porTipo[tipo] / POBLACION_LA_RIOJA) * 100000)} por 100k)`,
                        )}
                        data={Object.values(stats.porTipo)}
                        backgroundColor={[
                          "#ef4444",
                          "#f97316",
                          "#eab308",
                          "#22c55e",
                          "#06b6d4",
                          "#3b82f6",
                          "#8b5cf6",
                          "#ec4899",
                          "#f43f5e",
                          "#84cc16",
                        ]}
                      />
                    ) : (
                      <DoughnutChart
                        labels={Object.keys(stats.porTipo).map(
                          (tipo) =>
                            `${tipo} (${Math.round((stats.porTipo[tipo] / POBLACION_LA_RIOJA) * 100000)} por 100k)`,
                        )}
                        data={Object.values(stats.porTipo)}
                        backgroundColor={[
                          "#ef4444",
                          "#f97316",
                          "#eab308",
                          "#22c55e",
                          "#06b6d4",
                          "#3b82f6",
                          "#8b5cf6",
                          "#ec4899",
                          "#f43f5e",
                          "#84cc16",
                        ]}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tabla de tasas detallada */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Detalle de Tasas Criminológicas por Tipo de Delito</CardTitle>
                  <CardDescription>Tasa de delitos por cada 100,000 habitantes en La Rioja</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-semibold">Tipo de Delito</th>
                          <th className="text-right p-2 font-semibold">Cantidad</th>
                          <th className="text-right p-2 font-semibold">Tasa por 100,000 hab.</th>
                          <th className="text-center p-2 font-semibold">Barra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats.porTipo)
                          .sort(([, a], [, b]) => b - a)
                          .map(([tipo, cantidad]) => {
                            const tasa = (cantidad / POBLACION_LA_RIOJA) * 100000
                            const maxTasa = Math.max(
                              ...Object.values(stats.porTipo).map((c) => (c / POBLACION_LA_RIOJA) * 100000),
                            )
                            const porcentajeBarra = maxTasa > 0 ? (tasa / maxTasa) * 100 : 0
                            return (
                              <tr key={tipo} className="border-b hover:bg-muted/50">
                                <td className="p-2">{tipo}</td>
                                <td className="text-right p-2">{cantidad}</td>
                                <td className="text-right p-2">{tasa.toFixed(2)}</td>
                                <td className="p-2">
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${porcentajeBarra}%` }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="mapa">
              <HeatMap denuncias={denuncias} />
            </TabsContent>
            <TabsContent value="general">
              <GeneralMap denuncias={denuncias} />
            </TabsContent>
          </Tabs>

          <Card className="mt-6">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Distribución por Tipo de Delito</CardTitle>
                <CardDescription>Cantidad de denuncias según el tipo de delito</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={tipoGraficoDelito === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTipoGraficoDelito("bar")}
                >
                  Barras
                </Button>
                <Button
                  variant={tipoGraficoDelito === "radar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTipoGraficoDelito("radar")}
                >
                  Radar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full h-80">
                {tipoGraficoDelito === "bar" ? (
                  <BarChart
                    labels={Object.keys(stats.porTipo)}
                    data={Object.values(stats.porTipo)}
                    label="Denuncias"
                    backgroundColor="#f59e0b"
                    horizontal={true}
                  />
                ) : (
                  <RadarChart
                    labels={Object.keys(stats.porTipo)}
                    datasets={[
                      {
                        label: "Denuncias",
                        data: Object.values(stats.porTipo),
                        backgroundColor: "rgba(245, 158, 11, 0.2)",
                        borderColor: "rgba(245, 158, 11, 1)",
                      },
                    ]}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
