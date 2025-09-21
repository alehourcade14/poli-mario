import jsPDF from "jspdf"

const fechaATexto = (fecha: string): string => {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const date = new Date(fecha)
  const dia = numeroATexto(date.getDate())
  const mes = meses[date.getMonth()]
  const año = date.getFullYear()

  // Convertir año a texto
  const añoTexto = año === 2025 ? "dos mil Veinticinco" : año.toString()

  return `${dia} días del mes de ${mes} del año ${añoTexto}`
}

const numeroATexto = (num: number): string => {
  const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"]
  const decenas = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"]
  const especiales = [
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ]

  if (num < 10) return unidades[num]
  if (num >= 10 && num < 20) return especiales[num - 10]
  if (num >= 20 && num < 100) {
    const dec = Math.floor(num / 10)
    const uni = num % 10
    return uni === 0 ? decenas[dec] : `${decenas[dec]} y ${unidades[uni]}`
  }
  return num.toString()
}

export async function exportDenunciaFormalToPDF(denuncia: any) {
  try {
    // Usar fecha y hora actual del sistema para la generación del documento
    const fechaActualSistema = new Date()
    const fechaDenunciaTexto = fechaATexto(fechaActualSistema.toISOString())
    const horaActualSistema = fechaActualSistema.toTimeString().slice(0, 5)

    // Crear un nuevo documento PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Configurar márgenes y dimensiones profesionales
    const marginTop = 15
    const marginSide = 25
    const marginBottom = 20
    const titleFontSize = 16
    const subtitleFontSize = 12
    const normalFontSize = 10
    const smallFontSize = 8
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const contentWidth = pageWidth - marginSide * 2
    let yPosition = 45

    // Intentar cargar las imágenes de los escudos (opcional)
    let escudoAmarilloBase64 = null
    let escudoAzulBase64 = null

    try {
      escudoAmarilloBase64 = await getBase64Image("/images/escudo-amarillo.png")
      escudoAzulBase64 = await getBase64Image("/images/escudo-azul.png")
    } catch (imageError) {
      console.warn("No se pudieron cargar las imágenes de los escudos:", imageError)
      // Continuar sin imágenes
    }

    // Añadir los escudos si se cargaron correctamente
    if (escudoAmarilloBase64 && escudoAzulBase64) {
      const escudoSize = 25
      try {
        pdf.addImage(escudoAmarilloBase64, "PNG", marginSide, marginTop, escudoSize, escudoSize)
        pdf.addImage(escudoAzulBase64, "PNG", pageWidth - marginSide - escudoSize, marginTop, escudoSize, escudoSize)
      } catch (addImageError) {
        console.warn("Error al agregar imágenes al PDF:", addImageError)
      }
    }

    // Añadir encabezado
    pdf.setFontSize(titleFontSize)
    pdf.setFont("times", "bold")
    pdf.text("POLICÍA DE LA PROVINCIA DE LA RIOJA", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    pdf.setFontSize(subtitleFontSize)
    pdf.text("DIRECCIÓN GENERAL DE INVESTIGACIONES", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    pdf.text(`${denuncia.departamento.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    pdf.text(`${denuncia.division.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    // Título de la denuncia
    pdf.setFontSize(normalFontSize)
    pdf.setFont("times", "bold")
    pdf.text(`DENUNCIA FORMULADA POR EL CIUDADANO: ${denuncia.denunciante.toUpperCase()}`, pageWidth / 2, yPosition, {
      align: "center",
    })
    yPosition += 15

    // Línea separadora con márgenes apropiados
    pdf.setDrawColor(0, 0, 0)
    pdf.line(marginSide, yPosition, pageWidth - marginSide, yPosition)
    yPosition += 10

    // Cuerpo de la denuncia con justificación perfecta
    pdf.setFont("times", "normal")
    pdf.setFontSize(normalFontSize)

    // Construir el texto de la denuncia
    const sexoTexto = denuncia.sexo === "Masculino" ? "Masculino" : "Femenino"
    const estadoCivilTexto =
      denuncia.estadoCivil === "Soltero/a"
        ? denuncia.sexo === "Masculino"
          ? "Soltero"
          : "Soltera"
        : denuncia.estadoCivil

    const textoDenuncia = `En la ciudad de La Rioja, capital de la provincia del mismo nombre a los ${fechaDenunciaTexto}, siendo las horas ${horaActualSistema}, comparece por ante la Oficina de Sumarios Judiciales de ésta ${denuncia.division}, dependiente de la Dirección General de Investigaciones, una persona de sexo ${sexoTexto}, manifestando deseos de formular una denuncia, motivo por el cual se lo notifica de los términos y contenidos del Art. 245 del Código Penal Argentino, que reprime al que denunciare falsamente un hecho, enterado de ello, seguidamente es interrogada por su apellido y demás circunstancias personales dijo llamarse: ${denuncia.denunciante.toUpperCase()}, de nacionalidad ${denuncia.nacionalidad}, de estado civil ${estadoCivilTexto}, ${denuncia.instruccion}, de ${denuncia.edad} años de edad, D.N.I. Nº ${denuncia.dni}, profesión ${denuncia.profesion}, con domicilio en ${denuncia.domicilio} del barrio ${denuncia.barrio} de esta Ciudad Capital, quien invitada al acto seguidamente DENUNCIA: ${denuncia.descripcion} Que es todo por lo que se da por finalizado el acto previa lectura y ratificación, firmando al pie de la presente de conformidad por ante mi Funcionario Policial que CERTIFICO.`

    // Aplicar justificación perfecta al texto principal
    const justifiedLines = justifyText(textoDenuncia, contentWidth, normalFontSize, pdf)

    // Renderizar el texto justificado con control de paginación
    let currentPageLines: { text: string; isJustified: boolean }[] = []
    let tempY = yPosition

    justifiedLines.forEach((line, index) => {
      // Verificar si la línea cabe en la página actual
      if (tempY + 6 > pageHeight - 50) {
        // Renderizar las líneas acumuladas en la página actual
        if (currentPageLines.length > 0) {
          yPosition = renderJustifiedText(currentPageLines, marginSide, yPosition, contentWidth, pdf)
        }

        // Nueva página
        pdf.addPage()
        yPosition = marginTop + 20
        tempY = yPosition
        currentPageLines = []
      }

      currentPageLines.push(line)
      tempY += 6
    })

    // Renderizar las líneas restantes
    if (currentPageLines.length > 0) {
      yPosition = renderJustifiedText(currentPageLines, marginSide, yPosition, contentWidth, pdf)
    }

    // Espacio para firmas
    yPosition += 30
    if (yPosition > pageHeight - 100) {
      pdf.addPage()
      yPosition = marginTop + 20
    }

    pdf.setFont("times", "bold")
    pdf.text("FIRMAS:", marginSide, yPosition)
    yPosition += 15

    // Líneas para firmas con márgenes apropiados
    const firmaWidth = 70
    const firmaY = yPosition + 20

    // Firma del denunciante
    pdf.line(marginSide, firmaY, marginSide + firmaWidth, firmaY)
    pdf.setFont("times", "normal")
    pdf.setFontSize(smallFontSize)
    pdf.text("Firma del Denunciante", marginSide, firmaY + 5)
    pdf.text(`${denuncia.denunciante}`, marginSide, firmaY + 10)
    pdf.text(`DNI: ${denuncia.dni}`, marginSide, firmaY + 15)

    // Firma del funcionario
    const funcionarioX = pageWidth - marginSide - firmaWidth
    pdf.line(funcionarioX, firmaY, funcionarioX + firmaWidth, firmaY)
    pdf.text("Firma del Funcionario", funcionarioX, firmaY + 5)
    pdf.text(`${denuncia.creadorNombre}`, funcionarioX, firmaY + 10)
    pdf.text(`${denuncia.creadorDepartamento}`, funcionarioX, firmaY + 15)

    // Añadir pie de página con márgenes apropiados
    const pageCount = pdf.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(smallFontSize)
      pdf.setFont("times", "italic")
      pdf.text(
        "Este documento fue generado automáticamente por el Sistema de Gestión Operativa.",
        pageWidth / 2,
        pageHeight - 15,
        { align: "center" },
      )
      pdf.text(
        "Policía de la Provincia de La Rioja - Dirección Gral. de Investigaciones",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
      )
      pdf.text(`Página ${i} de ${pageCount}`, pageWidth - marginSide, pageHeight - 5, {
        align: "right",
      })

      // Agregar fecha y hora de generación en el pie
      pdf.text(
        `Generado el: ${fechaActualSistema.toLocaleDateString()} a las ${horaActualSistema}`,
        marginSide,
        pageHeight - 5,
        { align: "left" },
      )
    }

    // Guardar el PDF
    const fileName = `denuncia_formal_${denuncia.id}_${fechaActualSistema.toISOString().split("T")[0]}.pdf`
    pdf.save(fileName)

    console.log("PDF generado exitosamente:", fileName)
  } catch (error) {
    console.error("Error detallado al generar el PDF:", error)

    // Mostrar error más específico al usuario
    let errorMessage = "Error desconocido al generar el PDF"

    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`
    } else if (typeof error === "string") {
      errorMessage = error
    }

    alert(`Error al generar el PDF: ${errorMessage}. Por favor, intente nuevamente.`)
    throw error
  }
}

// Función para convertir una imagen a base64 con mejor manejo de errores
const getBase64Image = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "Anonymous"

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto del canvas"))
          return
        }

        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL("image/png")
        resolve(dataURL)
      } catch (canvasError) {
        reject(new Error(`Error al procesar la imagen: ${canvasError}`))
      }
    }

    img.onerror = (error) => {
      reject(new Error(`Error al cargar la imagen desde ${url}: ${error}`))
    }

    // Timeout para evitar carga infinita
    setTimeout(() => {
      reject(new Error(`Timeout al cargar la imagen desde ${url}`))
    }, 10000)

    img.src = url
  })
}

// Función personalizada para justificación perfecta con soporte para sangría
const justifyText = (text: string, maxWidth: number, fontSize: number, pdf: jsPDF) => {
  pdf.setFontSize(fontSize)
  const words = text.split(" ")
  const lines: { text: string; isJustified: boolean }[] = []
  const sangriaSize = 12.7 // 0.5 pulgadas = 1.27 cm = 12.7 mm
  let currentLine = ""
  let isFirstLine = true

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + (currentLine ? " " : "") + words[i]
    // Ajustar ancho máximo para la primera línea (con sangría)
    const currentMaxWidth = isFirstLine ? maxWidth - sangriaSize : maxWidth
    const testWidth = pdf.getTextWidth(testLine)

    if (testWidth <= currentMaxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push({ text: currentLine, isJustified: true })
        currentLine = words[i]
        isFirstLine = false // Después de la primera línea
      } else {
        // Palabra muy larga, dividirla
        lines.push({ text: words[i], isJustified: false })
        currentLine = ""
        isFirstLine = false
      }
    }
  }

  if (currentLine) {
    lines.push({ text: currentLine, isJustified: false }) // Última línea no se justifica
  }

  return lines
}

// Función para renderizar texto justificado con sangría
const renderJustifiedText = (
  lines: { text: string; isJustified: boolean }[],
  x: number,
  y: number,
  maxWidth: number,
  pdf: jsPDF,
) => {
  let currentY = y
  const sangriaSize = 12.7 // 0.5 pulgadas = 1.27 cm = 12.7 mm
  let isFirstLineOfParagraph = true

  lines.forEach((line, index) => {
    // Determinar si es primera línea de párrafo
    const currentX = isFirstLineOfParagraph ? x + sangriaSize : x
    const currentMaxWidth = isFirstLineOfParagraph ? maxWidth - sangriaSize : maxWidth

    if (line.isJustified && line.text.trim().split(" ").length > 1) {
      // Justificar línea distribuyendo espacios uniformemente
      const words = line.text.trim().split(" ")
      const totalTextWidth = words.reduce((sum, word) => sum + pdf.getTextWidth(word), 0)
      const totalSpaceNeeded = currentMaxWidth - totalTextWidth
      const spaceBetweenWords = totalSpaceNeeded / (words.length - 1)

      let textX = currentX
      words.forEach((word, wordIndex) => {
        pdf.text(word, textX, currentY)
        textX += pdf.getTextWidth(word)
        if (wordIndex < words.length - 1) {
          textX += spaceBetweenWords
        }
      })
    } else {
      // Línea normal (última línea o línea con una sola palabra)
      pdf.text(line.text, currentX, currentY)
    }

    currentY += 6 // Interlineado

    // Después de la primera línea, las siguientes no llevan sangría
    // hasta que encuentre un nuevo párrafo (esto se podría mejorar detectando párrafos)
    isFirstLineOfParagraph = false
  })

  return currentY
}
