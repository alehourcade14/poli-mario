import jsPDF from "jspdf"

export async function exportEntregaRodadoToPDF(entrega: any) {
  // Crear un nuevo documento PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Función para convertir una imagen a base64 con mejor manejo de errores
  const getBase64Image = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            const dataURL = canvas.toDataURL("image/png")
            resolve(dataURL)
          } else {
            resolve(null)
          }
        } catch (error) {
          console.warn("Error al procesar imagen:", error)
          resolve(null)
        }
      }

      img.onerror = (error) => {
        console.warn("Error al cargar imagen:", url, error)
        resolve(null)
      }

      // Timeout para evitar que se cuelgue
      setTimeout(() => {
        resolve(null)
      }, 5000)

      img.src = url
    })
  }

  try {
    // Intentar cargar las imágenes de los escudos
    const escudoAmarilloUrl = "/images/escudo-amarillo.png"
    const escudoAzulUrl = "/images/escudo-azul.png"

    const [escudoAmarilloBase64, escudoAzulBase64] = await Promise.all([
      getBase64Image(escudoAmarilloUrl),
      getBase64Image(escudoAzulUrl),
    ])

    // Configurar fuentes y colores
    const titleFontSize = 16
    const subtitleFontSize = 12
    const normalFontSize = 10
    const smallFontSize = 8
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = 40

    // Añadir los escudos solo si se cargaron correctamente
    const escudoSize = 25
    if (escudoAmarilloBase64) {
      try {
        pdf.addImage(escudoAmarilloBase64, "PNG", margin, 10, escudoSize, escudoSize)
      } catch (error) {
        console.warn("Error al agregar escudo amarillo:", error)
      }
    }

    if (escudoAzulBase64) {
      try {
        pdf.addImage(escudoAzulBase64, "PNG", pageWidth - margin - escudoSize, 10, escudoSize, escudoSize)
      } catch (error) {
        console.warn("Error al agregar escudo azul:", error)
      }
    }

    // Añadir encabezado
    pdf.setFontSize(titleFontSize)
    pdf.setFont("helvetica", "bold")
    pdf.text("SISTEMA DE GESTION OPERATIVA", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 8

    pdf.setFontSize(subtitleFontSize)
    pdf.text("ACTA DE ENTREGA DE ELEMENTO/RODADO", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6

    pdf.setFontSize(smallFontSize)
    pdf.setFont("helvetica", "normal")
    pdf.text(
      `Fecha de generación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      margin,
      yPosition,
    )
    yPosition += 15

    // Título del acta
    pdf.setFontSize(normalFontSize)
    pdf.setFont("helvetica", "bold")
    pdf.text(`ACTA DE ENTREGA DE ELEMENTO/RODADO #${entrega.id}`, margin, yPosition)
    yPosition += 10

    // Línea separadora
    pdf.setDrawColor(200, 200, 200)
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Datos de la entrega
    pdf.setFontSize(smallFontSize)
    pdf.setFont("helvetica", "normal")

    const addField = (label: string, value: string) => {
      pdf.setFont("helvetica", "bold")
      pdf.text(`${label}: `, margin, yPosition)
      pdf.setFont("helvetica", "normal")
      const labelWidth = pdf.getTextWidth(`${label}: `)

      // Manejar texto largo dividiéndolo en líneas si es necesario
      const maxWidth = pageWidth - margin * 2 - labelWidth
      const textLines = pdf.splitTextToSize(value || "No registrado", maxWidth)

      if (textLines.length === 1) {
        pdf.text(textLines[0], margin + labelWidth, yPosition)
        yPosition += 6
      } else {
        // Para texto multilínea, colocar el valor en la siguiente línea
        yPosition += 6
        textLines.forEach((line: string) => {
          pdf.text(line, margin + 10, yPosition)
          yPosition += 5
        })
        yPosition += 2
      }
    }

    addField("Fecha de Entrega", new Date(entrega.fechaEntrega).toLocaleDateString())
    addField("Hora de Entrega", entrega.horaEntrega)
    addField("Nº de Expediente", entrega.numExpediente)
    addField("Juzgado Interviniente", entrega.juzgadoInterviniente)

    yPosition += 5
    pdf.setFont("helvetica", "bold")
    pdf.text("DATOS DEL ELEMENTO/RODADO:", margin, yPosition)
    yPosition += 6
    pdf.setFont("helvetica", "normal")
    const datosRodadoLines = pdf.splitTextToSize(entrega.datosRodado, pageWidth - margin * 2 - 10)
    datosRodadoLines.forEach((line: string) => {
      pdf.text(line, margin + 10, yPosition)
      yPosition += 5
    })
    yPosition += 5

    // Solo mostrar dominio si existe
    if (entrega.dominio && entrega.dominio.trim() !== "") {
      addField("Dominio", entrega.dominio)
    }

    addField("Nombre y Apellido del Receptor", entrega.nombreApellido)
    addField("DNI", entrega.dni)
    addField("Funcionario Actuante", entrega.funcionarioActuante)
    addField("Registrado por", `${entrega.creadorNombre} (${entrega.creadorDepartamento})`)

    // Espacio para firmas
    yPosition += 20

    pdf.setFont("helvetica", "bold")
    pdf.text("FIRMAS:", margin, yPosition)
    yPosition += 15

    // Líneas para firmas
    const firmaWidth = 60
    const firmaY = yPosition + 20

    // Firma del receptor
    pdf.line(margin, firmaY, margin + firmaWidth, firmaY)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(smallFontSize)
    pdf.text("Firma del Receptor", margin, firmaY + 5)
    pdf.text(`${entrega.nombreApellido}`, margin, firmaY + 10)
    pdf.text(`DNI: ${entrega.dni}`, margin, firmaY + 15)

    // Firma del funcionario
    const funcionarioX = pageWidth - margin - firmaWidth
    pdf.line(funcionarioX, firmaY, funcionarioX + firmaWidth, firmaY)
    pdf.text("Firma del Funcionario", funcionarioX, firmaY + 5)
    pdf.text(`${entrega.funcionarioActuante}`, funcionarioX, firmaY + 10)

    // Observaciones
    yPosition = firmaY + 30
    pdf.setFont("helvetica", "bold")
    pdf.text("OBSERVACIONES:", margin, yPosition)
    yPosition += 10

    // Líneas para observaciones
    for (let i = 0; i < 3; i++) {
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 8
    }

    // Añadir pie de página
    pdf.setFontSize(smallFontSize)
    pdf.setFont("helvetica", "italic")
    pdf.text(
      "Este documento fue generado automáticamente por el Sistema de Gestión Operativa.",
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 15,
      { align: "center" },
    )
    pdf.text(
      "Policía de la Provincia de La Rioja - Dirección Gral. de Investigaciones",
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: "center" },
    )
    pdf.text("Página 1", pageWidth - margin, pdf.internal.pageSize.getHeight() - 5, { align: "right" })

    // Guardar el PDF
    pdf.save(`entrega_elemento_rodado_${entrega.id}_${new Date().toISOString().split("T")[0]}.pdf`)
  } catch (error) {
    console.error("Error al generar el PDF:", error)
    throw new Error("Error al generar el PDF. Por favor, intente nuevamente.")
  }
}
