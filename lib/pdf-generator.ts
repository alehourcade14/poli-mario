import jsPDF from "jspdf"
import html2canvas from "html2canvas"

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
    console.log("📄 Iniciando generación de PDF completo con todos los gráficos...")

    // Crear un nuevo documento PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Configurar fuentes y colores
    const titleFontSize = 18
    const subtitleFontSize = 14
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

    // ========== PORTADA ==========
    pdf.setFontSize(titleFontSize + 4)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(0, 0, 0)
    
    // Título principal
    const portadaTitle = "Informe Estadístico – Sistema de Denuncias"
    pdf.text(portadaTitle, pageWidth / 2, pageHeight / 2 - 30, { align: "center" })
    
    // Fecha
    pdf.setFontSize(subtitleFontSize)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, pageWidth / 2, pageHeight / 2 - 10, { align: "center" })
    
    // Información adicional
    pdf.setFontSize(normalFontSize)
    pdf.text(`Período: ${data.subtitle}`, pageWidth / 2, pageHeight / 2 + 5, { align: "center" })
    pdf.text(`Usuario: ${data.user}`, pageWidth / 2, pageHeight / 2 + 15, { align: "center" })
    pdf.text(`Departamento: ${data.department}`, pageWidth / 2, pageHeight / 2 + 25, { align: "center" })
    
    // Línea decorativa
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.5)
    pdf.line(margin, pageHeight / 2 + 35, pageWidth - margin, pageHeight / 2 + 35)
    
    pdf.addPage()
    yPosition = margin

    // ========== RESUMEN DE ESTADÍSTICAS ==========
    checkNewPage(50)
    pdf.setFontSize(subtitleFontSize)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(0, 0, 0)
    pdf.text("Resumen de Estadísticas", margin, yPosition)
    yPosition += 10

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
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // ========== FUNCIÓN PARA CAPTURAR GRÁFICOS CHART.JS ==========
    const addChartToPDF = async (canvas: HTMLCanvasElement, title: string): Promise<boolean> => {
      try {
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
          console.warn(`⚠️ Canvas inválido para: ${title}`)
          return false
        }

        console.log(`📊 Procesando gráfico: ${title}`)

        checkNewPage(120)

        // Añadir título del gráfico
        pdf.setFontSize(subtitleFontSize)
        pdf.setFont("helvetica", "bold")
        pdf.text(title, margin, yPosition)
        yPosition += 10

        // Capturar imagen del canvas con alta calidad
        const imgData = canvas.toDataURL("image/png", 1.0)

        // Calcular dimensiones manteniendo proporción
        const maxWidth = pageWidth - margin * 2
        const maxHeight = 100 // Altura máxima para gráficos

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

        console.log(`✅ Gráfico agregado: ${title}`)
        return true
      } catch (error) {
        console.error(`❌ Error al capturar gráfico ${title}:`, error)
        return false
      }
    }

    // ========== FUNCIÓN PARA CAPTURAR MAPAS ==========
    const addMapToPDF = async (mapElement: HTMLElement, title: string): Promise<boolean> => {
      try {
        if (!mapElement) {
          console.warn(`⚠️ Elemento de mapa no encontrado: ${title}`)
          return false
        }

        console.log(`🗺️ Capturando mapa: ${title}`)

        checkNewPage(150)

        // Añadir título del mapa
        pdf.setFontSize(subtitleFontSize)
        pdf.setFont("helvetica", "bold")
        pdf.text(title, margin, yPosition)
        yPosition += 10

        // Capturar el mapa usando html2canvas
        const canvas = await html2canvas(mapElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: mapElement.offsetWidth,
          height: mapElement.offsetHeight,
        })

        // Calcular dimensiones manteniendo proporción
        const maxWidth = pageWidth - margin * 2
        const maxHeight = 120 // Altura máxima para mapas

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

        // Convertir canvas a imagen
        const imgData = canvas.toDataURL("image/png", 1.0)

        // Centrar el mapa horizontalmente
        const xPosition = (pageWidth - imgWidth) / 2

        pdf.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight)
        yPosition += imgHeight + 15

        console.log(`✅ Mapa agregado: ${title}`)
        return true
      } catch (error) {
        console.error(`❌ Error al capturar mapa ${title}:`, error)
        return false
      }
    }

    // ========== CAPTURAR TODOS LOS GRÁFICOS CHART.JS ==========
    console.log("🔍 Buscando gráficos Chart.js...")

    // Buscar todos los canvas (gráficos Chart.js)
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
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    // Si no se encontraron gráficos, buscar en todas las pestañas
    if (chartsAdded === 0) {
      console.log("🔍 Buscando gráficos en todas las pestañas...")

      // Buscar en todas las pestañas (no solo la activa)
      const allTabContents = element.querySelectorAll('[role="tabpanel"], [data-state]')
      console.log(`📑 Pestañas encontradas: ${allTabContents.length}`)

      for (const tabContent of allTabContents) {
        const tabCanvases = tabContent.querySelectorAll("canvas")
        console.log(`📊 Canvas en pestaña: ${tabCanvases.length}`)

        for (let i = 0; i < tabCanvases.length; i++) {
          const canvas = tabCanvases[i] as HTMLCanvasElement
          if (canvas.width > 0 && canvas.height > 0) {
            const success = await addChartToPDF(canvas, `Gráfico ${chartsAdded + 1}`)
            if (success) chartsAdded++
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
        }
      }
    }

    console.log(`📈 Total de gráficos Chart.js agregados: ${chartsAdded}`)

    // ========== CAPTURAR MAPAS DE GOOGLE MAPS ==========
    console.log("🗺️ Buscando mapas de Google Maps...")

    let mapsAdded = 0

    // Buscar todos los contenedores de mapas de Google Maps
    // Los mapas de Google Maps tienen elementos con clases que empiezan con "gm-"
    const allMapContainers: HTMLElement[] = []
    
    // Buscar por diferentes selectores
    const selectors = [
      'div[class*="map"]',
      'div[style*="position: relative"]',
      '[class*="HeatMap"]',
      '[class*="GeneralMap"]',
      '[class*="heat"]',
      '[class*="general"]',
    ]

    for (const selector of selectors) {
      const elements = element.querySelectorAll(selector)
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement
        // Verificar si contiene elementos de Google Maps
        if (htmlEl.querySelector('[class*="gm-"]') || 
            htmlEl.querySelector('iframe[src*="maps"]') ||
            htmlEl.querySelector('[class*="google-map"]')) {
          // Verificar que no esté ya en la lista
          if (!allMapContainers.includes(htmlEl)) {
            allMapContainers.push(htmlEl)
          }
        }
      })
    }

    // También buscar directamente los contenedores de Google Maps
    const googleMapDivs = element.querySelectorAll('div[class*="gm-"], div[style*="width: 100%"]')
    googleMapDivs.forEach((div) => {
      const parent = div.closest('div[style*="position"], div[class*="map"], div[class*="Map"]')
      if (parent && !allMapContainers.includes(parent as HTMLElement)) {
        allMapContainers.push(parent as HTMLElement)
      }
    })

    console.log(`🗺️ Contenedores de mapas encontrados: ${allMapContainers.length}`)

    // Capturar cada mapa encontrado
    for (let i = 0; i < allMapContainers.length; i++) {
      const mapContainer = allMapContainers[i]
      
      // Determinar el título según el orden o contenido
      let mapTitle = "Mapa de Denuncias"
      if (i === 0) {
        mapTitle = "Mapa de Calor de Denuncias"
      } else if (i === 1) {
        mapTitle = "Mapa General del Delito"
      } else {
        mapTitle = `Mapa ${i + 1}`
      }

      // Asegurar que el contenedor sea visible
      const originalDisplay = mapContainer.style.display
      const originalVisibility = mapContainer.style.visibility
      const originalOpacity = mapContainer.style.opacity
      
      mapContainer.style.display = 'block'
      mapContainer.style.visibility = 'visible'
      mapContainer.style.opacity = '1'

      // Esperar un momento para que el mapa se renderice
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const success = await addMapToPDF(mapContainer, mapTitle)
      if (success) {
        mapsAdded++
      }

      // Restaurar estilos originales
      mapContainer.style.display = originalDisplay
      mapContainer.style.visibility = originalVisibility
      mapContainer.style.opacity = originalOpacity

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    console.log(`🗺️ Total de mapas agregados: ${mapsAdded}`)

    // ========== TABLA DE TASAS CRIMINOLÓGICAS ==========
    if (data.tasasCriminologicas && data.tasasCriminologicas.porTipo.length > 0) {
      checkNewPage(100)

      pdf.setFontSize(subtitleFontSize)
      pdf.setFont("helvetica", "bold")
      pdf.text("Tasas Criminológicas Detalladas", margin, yPosition)
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

    // ========== INFORMACIÓN ADICIONAL ==========
    checkNewPage(30)
    pdf.setFontSize(smallFontSize)
    pdf.setFont("helvetica", "bold")
    pdf.text("Información del Informe", margin, yPosition)
    yPosition += 8

    pdf.setFont("helvetica", "normal")
    pdf.text(`• Gráficos incluidos: ${chartsAdded}`, margin, yPosition)
    yPosition += 5
    pdf.text(`• Mapas incluidos: ${mapsAdded}`, margin, yPosition)
    yPosition += 5
    pdf.text(`• Fecha de generación: ${new Date().toLocaleString('es-AR')}`, margin, yPosition)
    yPosition += 5

    // ========== PIE DE PÁGINA ==========
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(smallFontSize)
      pdf.setFont("helvetica", "italic")
      pdf.setTextColor(100, 100, 100)

      // Línea superior del pie de página
      pdf.setDrawColor(200, 200, 200)
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

      pdf.text("Sistema de Gestión Operativa - Policía de La Rioja", pageWidth / 2, pageHeight - 10, {
        align: "center",
      })
      pdf.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 5, {
        align: "right",
      })
      pdf.text(`Generado: ${data.date}`, margin, pageHeight - 5)
    }

    // ========== GUARDAR PDF ==========
    const fileName = `informe_estadisticas_${new Date().toISOString().split("T")[0]}_${Date.now()}.pdf`
    pdf.save(fileName)

    console.log(`✅ PDF generado exitosamente: ${fileName}`)
    console.log(`📄 Total de páginas: ${pageCount}`)
    console.log(`📊 Gráficos incluidos: ${chartsAdded}`)
    console.log(`🗺️ Mapas incluidos: ${mapsAdded}`)
  } catch (error) {
    console.error("❌ Error crítico al generar el PDF:", error)
    throw new Error(`Error al generar el informe PDF: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

