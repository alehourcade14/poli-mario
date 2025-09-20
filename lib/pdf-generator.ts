import jsPDF from "jspdf"

interface PDFData {
  title: string
  subtitle: string
  date: string
  user: string
  department: string
  stats: {
    total: number
    pendientes: number
    enProceso: number
    resueltas: number
  }
  activeTab: string
  tipoGraficoEstado: string
  tipoGraficoDepartamento: string
  tipoGraficoDelito: string
  tipoGraficoTasa: string
  tasasCriminologicas?: {
    poblacion: number
    porTipo: Array<{
      tipo: string
      cantidad: number
      tasa: string
    }>
  }
}

export async function generatePDF(element: HTMLElement, data: PDFData): Promise<void> {
  try {
    console.log("Iniciando generación de PDF con gráficos...")

    // Crear un nuevo documento PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Configurar fuentes y colores
    const titleFontSize = 16
    const subtitleFontSize = 12
    const normalFontSize = 10
    const smallFontSize = 8
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = 20

    // Función para verificar si necesita nueva página
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Añadir encabezado
    pdf.setFontSize(titleFontSize)
    pdf.setFont("helvetica", "bold")
    pdf.text(data.title, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 8

    pdf.setFontSize(subtitleFontSize)
    pdf.text(data.subtitle, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6

    pdf.setFontSize(smallFontSize)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Fecha de generación: ${data.date}`, margin, yPosition)
    yPosition += 4
    pdf.text(`Usuario: ${data.user} (${data.department})`, margin, yPosition)
    yPosition += 10

    // Añadir resumen de estadísticas
    checkNewPage(40)
    pdf.setFontSize(subtitleFontSize)
    pdf.setFont("helvetica", "bold")
    pdf.text("Resumen de Estadísticas", margin, yPosition)
    yPosition += 8

    pdf.setFontSize(normalFontSize)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Total de Denuncias: ${data.stats.total}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Denuncias en Consulta: ${data.stats.pendientes}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Denuncias en Proceso: ${data.stats.enProceso}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Denuncias Resueltas: ${data.stats.resueltas}`, margin, yPosition)
    yPosition += 15

    // Esperar un momento para asegurar que los gráficos estén renderizados
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Función mejorada para capturar y añadir gráficos
    const addChartToPDF = async (canvas: HTMLCanvasElement, title: string): Promise<boolean> => {
      try {
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          console.warn(`Canvas inválido para: ${title}`)
          return false
        }

        console.log(`Procesando gráfico: ${title}`)

        checkNewPage(100)

        // Añadir título del gráfico
        pdf.setFontSize(subtitleFontSize)
        pdf.setFont("helvetica", "bold")
        pdf.text(title, margin, yPosition)
        yPosition += 10

        // Capturar imagen del canvas con mejor calidad
        const imgData = canvas.toDataURL("image/png", 1.0)

        // Calcular dimensiones manteniendo proporción
        const maxWidth = pageWidth - margin * 2
        const maxHeight = 120 // Altura máxima para gráficos

        let imgWidth = maxWidth
        let imgHeight = (canvas.height * imgWidth) / canvas.width

        // Si es muy alto, ajustar por altura
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight
          imgWidth = (canvas.width * imgHeight) / canvas.height
        }

        // Verificar si cabe en la página actual
        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
          // Repetir título en nueva página
          pdf.setFontSize(subtitleFontSize)
          pdf.setFont("helvetica", "bold")
          pdf.text(title, margin, yPosition)
          yPosition += 10
        }

        // Centrar el gráfico horizontalmente
        const xPosition = (pageWidth - imgWidth) / 2

        pdf.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight)
        yPosition += imgHeight + 15

        console.log(`✅ Gráfico agregado exitosamente: ${title}`)
        return true
      } catch (error) {
        console.error(`❌ Error al capturar gráfico ${title}:`, error)
        return false
      }
    }

    // Buscar y capturar todos los gráficos visibles
    console.log("Buscando gráficos en el elemento...")

    // Obtener todos los canvas visibles
    const allCanvases = Array.from(element.querySelectorAll("canvas")).filter((canvas) => {
      const rect = canvas.getBoundingClientRect()
      return canvas.width > 0 && canvas.height > 0 && rect.width > 0 && rect.height > 0
    })

    console.log(`📊 Total de canvas encontrados: ${allCanvases.length}`)

    let chartsAdded = 0
    const chartTitles = [
      "Distribución por Estado de Denuncias",
      "Denuncias por Departamento Policial",
      "Evolución Temporal de Denuncias",
      "Tasa de Delitos por 100,000 Habitantes",
      "Distribución por Tipo de Delito",
      "Análisis Adicional de Estadísticas",
    ]

    // Procesar cada canvas encontrado
    for (let i = 0; i < allCanvases.length; i++) {
      const canvas = allCanvases[i] as HTMLCanvasElement
      const title = chartTitles[i] || `Gráfico ${i + 1}`

      const success = await addChartToPDF(canvas, title)
      if (success) {
        chartsAdded++
      }

      // Pequeña pausa entre gráficos
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    // Si no se encontraron gráficos, buscar en pestañas específicas
    if (chartsAdded === 0) {
      console.log("No se encontraron gráficos, buscando en pestañas específicas...")

      // Buscar en la pestaña activa
      const activeTabContent = element.querySelector(`[data-state="active"]`)
      if (activeTabContent) {
        const tabCanvases = activeTabContent.querySelectorAll("canvas")
        console.log(`Canvas en pestaña activa: ${tabCanvases.length}`)

        for (let i = 0; i < tabCanvases.length; i++) {
          const canvas = tabCanvases[i] as HTMLCanvasElement
          const success = await addChartToPDF(canvas, `Gráfico de ${data.activeTab} ${i + 1}`)
          if (success) chartsAdded++
        }
      }
    }

    // Buscar gráficos por clases CSS comunes de Chart.js
    if (chartsAdded === 0) {
      console.log("Buscando por clases CSS de Chart.js...")

      const chartSelectors = [
        ".chartjs-render-monitor",
        "[data-chartjs]",
        'canvas[role="img"]',
        ".chart-container canvas",
      ]

      for (const selector of chartSelectors) {
        const charts = element.querySelectorAll(selector)
        console.log(`Encontrados ${charts.length} elementos con selector: ${selector}`)

        for (let i = 0; i < charts.length; i++) {
          const canvas = charts[i] as HTMLCanvasElement
          if (canvas.tagName === "CANVAS") {
            const success = await addChartToPDF(canvas, `Gráfico ${chartsAdded + 1}`)
            if (success) chartsAdded++
          }
        }
      }
    }

    console.log(`📈 Total de gráficos agregados al PDF: ${chartsAdded}`)

    // Si aún no hay gráficos, agregar mensaje informativo
    if (chartsAdded === 0) {
      checkNewPage(30)
      pdf.setFontSize(normalFontSize)
      pdf.setFont("helvetica", "italic")
      pdf.text("⚠️ No se pudieron capturar gráficos en este momento.", margin, yPosition)
      yPosition += 6
      pdf.text("Los gráficos pueden no estar completamente cargados.", margin, yPosition)
      yPosition += 6
      pdf.text("Intente generar el informe nuevamente en unos segundos.", margin, yPosition)
      yPosition += 15
    }

    // Añadir tasas criminológicas si están disponibles
    if (data.tasasCriminologicas && data.tasasCriminologicas.porTipo.length > 0) {
      checkNewPage(100)

      pdf.setFontSize(subtitleFontSize)
      pdf.setFont("helvetica", "bold")
      pdf.text("📊 Tasas Criminológicas Detalladas", margin, yPosition)
      yPosition += 8

      pdf.setFontSize(smallFontSize)
      pdf.setFont("helvetica", "italic")
      pdf.text(
        `Calculado por cada 100,000 habitantes (Población: ${data.tasasCriminologicas.poblacion.toLocaleString()} - Censo 2022)`,
        margin,
        yPosition,
      )
      yPosition += 10

      // Crear tabla de tasas
      pdf.setFontSize(normalFontSize)
      pdf.setFont("helvetica", "bold")

      // Encabezados de tabla
      const colWidths = [70, 25, 35]
      pdf.text("Tipo de Delito", margin, yPosition)
      pdf.text("Cant.", margin + colWidths[0], yPosition)
      pdf.text("Tasa/100k", margin + colWidths[0] + colWidths[1], yPosition)
      yPosition += 6

      // Línea separadora
      pdf.setDrawColor(100, 100, 100)
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)

      // Datos de la tabla
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(smallFontSize)

      data.tasasCriminologicas.porTipo.forEach((item: any, index: number) => {
        checkNewPage(15)

        // Alternar color de fondo para mejor legibilidad
        if (index % 2 === 0) {
          pdf.setFillColor(245, 245, 245)
          pdf.rect(margin - 2, yPosition - 4, pageWidth - margin * 2 + 4, 8, "F")
        }

        pdf.setTextColor(0, 0, 0)
        pdf.text(item.tipo.substring(0, 35), margin, yPosition) // Truncar texto largo
        pdf.text(item.cantidad.toString(), margin + colWidths[0], yPosition)
        pdf.text(item.tasa, margin + colWidths[0] + colWidths[1], yPosition)
        yPosition += 6
      })

      // Línea separadora final
      pdf.setDrawColor(100, 100, 100)
      pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)
      yPosition += 10
    }

    // Añadir información adicional
    checkNewPage(30)
    pdf.setFontSize(smallFontSize)
    pdf.setFont("helvetica", "bold")
    pdf.text("📋 Información del Informe", margin, yPosition)
    yPosition += 8

    pdf.setFont("helvetica", "normal")
    pdf.text(`• Pestaña activa: ${data.activeTab}`, margin, yPosition)
    yPosition += 5
    pdf.text(`• Gráficos incluidos: ${chartsAdded}`, margin, yPosition)
    yPosition += 5
    pdf.text(`• Fecha de generación: ${new Date().toLocaleString()}`, margin, yPosition)
    yPosition += 5

    // Añadir pie de página a todas las páginas
    const pageCount = pdf.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(smallFontSize)
      pdf.setFont("helvetica", "italic")
      pdf.setTextColor(100, 100, 100)

      // Línea superior del pie de página
      pdf.setDrawColor(200, 200, 200)
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

      pdf.text("Sistema Centralizado de Denuncias - Policía de La Rioja", pageWidth / 2, pageHeight - 10, {
        align: "center",
      })
      pdf.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 5, {
        align: "right",
      })
      pdf.text(`Generado: ${data.date}`, margin, pageHeight - 5)
    }

    // Guardar el PDF
    const fileName = `informe_estadisticas_${new Date().toISOString().split("T")[0]}_${Date.now()}.pdf`
    pdf.save(fileName)

    console.log(`✅ PDF generado exitosamente: ${fileName}`)
    console.log(`📄 Total de páginas: ${pageCount}`)
    console.log(`📊 Gráficos incluidos: ${chartsAdded}`)
  } catch (error) {
    console.error("❌ Error crítico al generar el PDF:", error)
    throw new Error(`Error al generar el informe PDF: ${error.message || "Error desconocido"}`)
  }
}
