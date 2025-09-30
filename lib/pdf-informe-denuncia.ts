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
    addText(`Fecha de Registro: ${denuncia.created_at ? new Date(denuncia.created_at).toLocaleDateString() : denuncia.fecha ? new Date(denuncia.fecha).toLocaleDateString() : "No registrada"}`)
    addText(`Estado Actual: ${toSafeString(denuncia.estado_nombre || denuncia.estado)}`)
    addText(`Tipo de Delito: ${toSafeString(denuncia.tipo_delito_nombre || denuncia.tipo_delito || denuncia.tipo)}`)

    if (denuncia.numero_expediente) {
      addText(`Número de Expediente: ${toSafeString(denuncia.numero_expediente)}`)
    }

    yPosition += 5

    // Información del denunciante
    addText("DATOS DEL DENUNCIANTE", 14, true)
    addSeparator()

    const nombreCompleto = `${toSafeString(denuncia.denunciante_nombre || denuncia.denunciante)} ${toSafeString(denuncia.denunciante_apellido || "")}`.trim()
    addText(`Nombre: ${nombreCompleto}`, 11, true)
    addText(`DNI: ${toSafeString(denuncia.denunciante_dni || denuncia.dni)}`)

    if (denuncia.lugar_hecho) {
      addText(`Lugar del Hecho: ${toSafeString(denuncia.lugar_hecho)}`)
    }

    yPosition += 5

    // Información del departamento
    addText("DEPARTAMENTO ASIGNADO", 14, true)
    addSeparator()

    addText(`Departamento: ${toSafeString(denuncia.departamento_nombre || denuncia.departamento)}`)
    if (denuncia.division) {
      addText(`División: ${toSafeString(denuncia.division)}`)
    }

    yPosition += 5

    // Fechas importantes
    addText("CRONOLOGÍA", 14, true)
    addSeparator()

    if (denuncia.fecha_hecho && denuncia.hora_hecho) {
      addText(`Fecha del Hecho: ${toSafeString(denuncia.fecha_hecho)} a las ${toSafeString(denuncia.hora_hecho)}`)
    }

    if (denuncia.fecha_denuncia && denuncia.hora_denuncia) {
      addText(`Fecha de Denuncia: ${toSafeString(denuncia.fecha_denuncia)} a las ${toSafeString(denuncia.hora_denuncia)}`)
    } else if (denuncia.created_at) {
      addText(`Fecha de Registro: ${new Date(denuncia.created_at).toLocaleString()}`)
    }

    if (denuncia.updated_at) {
      addText(`Última Actualización: ${new Date(denuncia.updated_at).toLocaleString()}`)
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
    if ((denuncia.latitud && denuncia.longitud) || (denuncia.ubicacion && denuncia.ubicacion.lat && denuncia.ubicacion.lng)) {
      addText("UBICACIÓN", 14, true)
      addSeparator()
      if (denuncia.latitud && denuncia.longitud) {
        addText(`Coordenadas: ${Number(denuncia.latitud).toFixed(6)}, ${Number(denuncia.longitud).toFixed(6)}`)
      } else if (denuncia.ubicacion) {
        addText(`Coordenadas: ${denuncia.ubicacion.lat.toFixed(6)}, ${denuncia.ubicacion.lng.toFixed(6)}`)
      }
      yPosition += 5
    }

    // Información del funcionario que creó la denuncia
    addText("FUNCIONARIO RESPONSABLE", 14, true)
    addSeparator()

    addText(`Creado por: ${toSafeString(denuncia.usuario_nombre || denuncia.creadorNombre || 'Usuario del Sistema')}`, 11, true)
    addText(`Departamento: ${toSafeString(denuncia.departamento_nombre || denuncia.creadorDepartamento || denuncia.departamento || 'Departamento Cibercrimen')}`)
    addText(`Fecha de Creación: ${denuncia.created_at ? new Date(denuncia.created_at).toLocaleString() : denuncia.fecha ? new Date(denuncia.fecha).toLocaleString() : "No registrada"}`)

    // Si hay funcionario editor (quien exporta el informe)
    if (funcionarioEditor && funcionarioEditor.username !== denuncia.usuario_id) {
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
