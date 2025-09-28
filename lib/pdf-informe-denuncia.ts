import jsPDF from "jspdf"

export async function exportInformeDenuncia(denuncia: any, funcionarioEditor?: any) {
  try {
    // Crear un nuevo documento PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Configurar márgenes y dimensiones
    const marginTop = 20
    const marginSide = 20
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const contentWidth = pageWidth - marginSide * 2
    let yPosition = marginTop

    // Función para convertir cualquier valor a string seguro
    const toSafeString = (value: any): string => {
      if (value === null || value === undefined) return "No registrado"
      if (typeof value === "string") return value
      if (typeof value === "number") return value.toString()
      if (typeof value === "boolean") return value ? "Sí" : "No"
      if (typeof value === "object") {
        if (value.lat && value.lng) {
          return `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`
        }
        return JSON.stringify(value)
      }
      return String(value)
    }

    // Función para agregar texto con salto de línea automático
    const addText = (text: string, fontSize = 10, isBold = false) => {
      pdf.setFontSize(fontSize)
      pdf.setFont("helvetica", isBold ? "bold" : "normal")

      const safeText = toSafeString(text)
      const lines = pdf.splitTextToSize(safeText, contentWidth)

      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage()
          yPosition = marginTop
        }
        pdf.text(line, marginSide, yPosition)
        yPosition += fontSize * 0.5
      })
      yPosition += 3
    }

    // Función para agregar línea separadora
    const addSeparator = () => {
      yPosition += 5
      pdf.setDrawColor(200, 200, 200)
      pdf.line(marginSide, yPosition, pageWidth - marginSide, yPosition)
      yPosition += 8
    }

    // Encabezado del informe
    pdf.setFillColor(41, 128, 185)
    pdf.rect(0, 0, pageWidth, 25, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("INFORME RESUMIDO DE DENUNCIA", pageWidth / 2, 15, { align: "center" })

    pdf.setTextColor(0, 0, 0)
    yPosition = 35

    // Información básica de la denuncia
    addText("INFORMACIÓN GENERAL", 14, true)
    addSeparator()

    addText(`Número de Denuncia: #${toSafeString(denuncia.id)}`, 11, true)
    addText(`Fecha de Registro: ${denuncia.fecha ? new Date(denuncia.fecha).toLocaleDateString() : "No registrada"}`)
    addText(`Estado Actual: ${toSafeString(denuncia.estado)}`)
    addText(`Tipo de Delito: ${toSafeString(denuncia.tipo)}`)

    if (denuncia.numExpediente) {
      addText(`Número de Expediente: ${toSafeString(denuncia.numExpediente)}`)
    }

    yPosition += 5

    // Información del denunciante
    addText("DATOS DEL DENUNCIANTE", 14, true)
    addSeparator()

    addText(`Nombre: ${toSafeString(denuncia.denunciante)}`, 11, true)
    addText(`DNI: ${toSafeString(denuncia.dni)}`)

    if (denuncia.barrioHecho) {
      addText(`Barrio del Hecho: ${toSafeString(denuncia.barrioHecho)}`)
    }

    yPosition += 5

    // Información del departamento
    addText("DEPARTAMENTO ASIGNADO", 14, true)
    addSeparator()

    addText(`Departamento: ${toSafeString(denuncia.departamento)}`)
    if (denuncia.division) {
      addText(`División: ${toSafeString(denuncia.division)}`)
    }

    yPosition += 5

    // Fechas importantes
    addText("CRONOLOGÍA", 14, true)
    addSeparator()

    if (denuncia.fechaHecho && denuncia.horaHecho) {
      addText(`Fecha del Hecho: ${toSafeString(denuncia.fechaHecho)} a las ${toSafeString(denuncia.horaHecho)}`)
    }

    if (denuncia.fechaDenuncia && denuncia.horaDenuncia) {
      addText(`Fecha de Denuncia: ${toSafeString(denuncia.fechaDenuncia)} a las ${toSafeString(denuncia.horaDenuncia)}`)
    }

    if (denuncia.ultimaActualizacion) {
      addText(`Última Actualización: ${new Date(denuncia.ultimaActualizacion).toLocaleString()}`)
    }

    yPosition += 5

    // Descripción de la denuncia
    addText("DESCRIPCIÓN DEL HECHO", 14, true)
    addSeparator()

    const descripcion = toSafeString(denuncia.descripcion)
    const descripcionLimitada = descripcion.length > 500 ? descripcion.substring(0, 500) + "..." : descripcion

    addText(descripcionLimitada, 10)

    yPosition += 5

    // Ubicación si existe
    if (denuncia.ubicacion && denuncia.ubicacion.lat && denuncia.ubicacion.lng) {
      addText("UBICACIÓN", 14, true)
      addSeparator()
      addText(`Coordenadas: ${denuncia.ubicacion.lat.toFixed(6)}, ${denuncia.ubicacion.lng.toFixed(6)}`)
      yPosition += 5
    }

    // Información del funcionario que creó la denuncia
    addText("FUNCIONARIO RESPONSABLE", 14, true)
    addSeparator()

    addText(`Creado por: ${toSafeString(denuncia.creadorNombre)}`, 11, true)
    addText(`Departamento: ${toSafeString(denuncia.creadorDepartamento || denuncia.departamento || 'Departamento Cibercrimen')}`)
    addText(`Fecha de Creación: ${denuncia.fecha ? new Date(denuncia.fecha).toLocaleString() : "No registrada"}`)

    // Si hay funcionario editor (quien exporta el informe)
    if (funcionarioEditor && funcionarioEditor.username !== denuncia.creador) {
      yPosition += 3
      addText(`Informe generado por: ${toSafeString(funcionarioEditor.nombre || funcionarioEditor.username)}`, 10)
      if (denuncia.actualizadoPor) {
        addText(`Última modificación por: ${toSafeString(denuncia.actualizadoPor)}`, 10)
      }
    }

    // Pie de página
    const fechaGeneracion = new Date()
    yPosition = pageHeight - 25

    pdf.setFontSize(8)
    pdf.setFont("helvetica", "italic")
    pdf.setTextColor(100, 100, 100)

    pdf.text("Sistema de Gestión Operativa - Policía de La Rioja", pageWidth / 2, yPosition, { align: "center" })

    pdf.text(`Informe generado el: ${fechaGeneracion.toLocaleString()}`, pageWidth / 2, yPosition + 5, {
      align: "center",
    })

    // Agregar número de página
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Página ${i} de ${pageCount}`, pageWidth - marginSide, pageHeight - 10, { align: "right" })
    }

    // Guardar el PDF
    const fileName = `informe_denuncia_${denuncia.id}_${fechaGeneracion.toISOString().split("T")[0]}.pdf`
    pdf.save(fileName)

    console.log("Informe PDF generado exitosamente:", fileName)
    return true
  } catch (error) {
    console.error("Error al generar el informe PDF:", error)

    let errorMessage = "Error desconocido al generar el informe"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    alert(`Error al generar el informe: ${errorMessage}`)
    return false
  }
}
