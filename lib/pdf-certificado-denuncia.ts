import jsPDF from "jspdf"
import QRCode from "qrcode"

export async function exportCertificadoDenuncia(denuncia: any) {
  // Crear un nuevo documento PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Cargar las imágenes de los escudos
  const escudoAmarilloUrl = "/images/escudo-amarillo.png"
  const escudoAzulUrl = "/images/escudo-azul.png"

  // Función para convertir una imagen a base64 con mejor manejo de errores
  const getBase64Image = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Crear un timeout para evitar que se cuelgue la carga
      const timeoutId = setTimeout(() => {
        console.warn(`Timeout al cargar la imagen: ${url}`)
        resolve("") // Resolver con string vacío en caso de timeout
      }, 5000)

      const img = new Image()
      img.crossOrigin = "Anonymous"

      img.onload = () => {
        clearTimeout(timeoutId)
        try {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            console.warn("No se pudo obtener el contexto 2D del canvas")
            resolve("")
            return
          }
          ctx.drawImage(img, 0, 0)
          const dataURL = canvas.toDataURL("image/png")
          resolve(dataURL)
        } catch (err) {
          console.warn("Error al procesar la imagen:", err)
          resolve("")
        }
      }

      img.onerror = (error) => {
        clearTimeout(timeoutId)
        console.warn(`Error al cargar la imagen: ${url}`, error)
        resolve("") // Resolver con string vacío en caso de error
      }

      img.src = url
    })
  }

  // Función para generar código QR con datos de validación
  const generateQRCode = async (data: any): Promise<string> => {
    try {
      // Crear objeto con datos clave para validación
      const qrData = {
        id: data.id || "N/A",
        denunciante: data.denunciante || "N/A",
        dni: data.dni || "N/A",
        fechaDenuncia: data.fechaDenuncia || "N/A", // Fecha original de la denuncia
        numExpediente: data.numExpediente || "S/N",
        tipo: data.tipo || "N/A",
        departamento: data.departamento || "N/A",
        fechaGeneracion: new Date().toISOString(), // Fecha actual de generación
        fechaCertificado: new Date().toLocaleDateString(), // Fecha del certificado
        sistema: "Sistema de Gestión Operativa - Policía La Rioja",
      }

      // Convertir a JSON string
      const qrString = JSON.stringify(qrData)

      // Generar código QR
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        width: 150,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      })

      return qrCodeDataURL
    } catch (error) {
      console.warn("Error al generar código QR:", error)
      return ""
    }
  }

  // Función para justificación perfecta de texto con sangría
  const justifyText = (text: string, maxWidth: number, fontSize: number): string[] => {
    pdf.setFontSize(fontSize)
    const words = text.split(" ")
    const lines: string[] = []
    const sangriaSize = 12.7 // 0.5 pulgadas = 1.27 cm = 12.7 mm
    let currentLine = ""
    let isFirstLine = true

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + (currentLine ? " " : "") + words[i]
      // Ajustar ancho máximo para la primera línea (con sangría)
      const currentMaxWidth = isFirstLine ? maxWidth - sangriaSize : maxWidth
      const testWidth = pdf.getTextWidth(testLine)

      if (testWidth > currentMaxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = words[i]
        isFirstLine = false // Después de la primera línea
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  // Función para renderizar texto justificado con distribución perfecta y sangría
  const renderJustifiedText = (lines: string[], x: number, y: number, maxWidth: number, lineHeight: number): number => {
    let currentY = y
    const sangriaSize = 12.7 // 0.5 pulgadas = 1.27 cm = 12.7 mm
    let isFirstLineOfParagraph = true

    lines.forEach((line, index) => {
      const isLastLine = index === lines.length - 1

      // Determinar posición X y ancho máximo según si es primera línea
      const currentX = isFirstLineOfParagraph ? x + sangriaSize : x
      const currentMaxWidth = isFirstLineOfParagraph ? maxWidth - sangriaSize : maxWidth

      if (isLastLine || line.trim().split(" ").length === 1) {
        // Última línea o línea con una sola palabra: alineación izquierda
        pdf.text(line, currentX, currentY)
      } else {
        // Líneas intermedias: justificación perfecta
        const words = line.trim().split(" ")
        if (words.length > 1) {
          const totalTextWidth = words.reduce((sum, word) => sum + pdf.getTextWidth(word), 0)
          const totalSpaceWidth = currentMaxWidth - totalTextWidth
          const spaceWidth = totalSpaceWidth / (words.length - 1)

          let textX = currentX
          words.forEach((word, wordIndex) => {
            pdf.text(word, textX, currentY)
            textX += pdf.getTextWidth(word)
            if (wordIndex < words.length - 1) {
              textX += spaceWidth
            }
          })
        } else {
          pdf.text(line, currentX, currentY)
        }
      }

      currentY += lineHeight

      // Después de la primera línea, las siguientes no llevan sangría
      isFirstLineOfParagraph = false
    })

    return currentY
  }

  // Función para convertir números a texto
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

  // Función para convertir fecha a texto
  const fechaATexto = (fecha: string): string => {
    try {
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
      if (isNaN(date.getTime())) {
        return "fecha inválida"
      }

      const dia = numeroATexto(date.getDate())
      const mes = meses[date.getMonth()]
      const año = date.getFullYear()

      // Convertir año a texto
      const añoTexto = año === 2025 ? "dos mil veinticinco" : año.toString()

      return `${dia} días del mes de ${mes} del año ${añoTexto}`
    } catch (error) {
      console.warn("Error al convertir fecha a texto:", error)
      return "fecha inválida"
    }
  }

  // Función para determinar el artículo del código penal según el tipo de delito
  const getArticuloCodigo = (tipo: string): string => {
    const articulos: { [key: string]: string } = {
      Robo: "Robo Art. 164, del Código Penal Argentino",
      Hurto: "Hurto Calificado Art. 163, del Código Penal Argentino",
      "Sustracción de Automotor": "Sustracción de Automotor Art. 163 bis, del Código Penal Argentino",
      Defraudación: "Defraudación Art. 172, del Código Penal Argentino",
      Estafa: "Estafa Art. 172, del Código Penal Argentino",
      Paradero: "Averiguación de Paradero",
      Homicidio: "Homicidio Art. 79, del Código Penal Argentino",
      Suicidio: "Averiguación de Suicidio",
      Otro: "Delito contra la Propiedad",
    }
    return articulos[tipo] || "Delito contra la Propiedad"
  }

  try {
    // Configurar márgenes y dimensiones profesionales
    const marginTop = 15 // Margen superior reducido para escudos
    const marginSide = 25 // Márgenes laterales profesionales
    const marginBottom = 20 // Margen inferior
    const titleFontSize = 16
    const subtitleFontSize = 12
    const normalFontSize = 10
    const smallFontSize = 8
    const lineHeight = 6
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const contentWidth = pageWidth - marginSide * 2
    let yPosition = 45

    // Obtener las imágenes en base64 con manejo de errores
    let escudoAmarilloBase64 = ""
    let escudoAzulBase64 = ""

    try {
      escudoAmarilloBase64 = await getBase64Image(escudoAmarilloUrl)
      escudoAzulBase64 = await getBase64Image(escudoAzulUrl)
    } catch (imgError) {
      console.warn("Error al cargar las imágenes de los escudos:", imgError)
      // Continuar sin las imágenes
    }

    // Generar código QR con datos de validación
    const qrCodeDataURL = await generateQRCode(denuncia)

    // Añadir los escudos solo si se cargaron correctamente
    const escudoSize = 25
    if (escudoAmarilloBase64) {
      try {
        pdf.addImage(escudoAmarilloBase64, "PNG", marginSide, marginTop, escudoSize, escudoSize)
      } catch (e) {
        console.warn("Error al añadir escudo amarillo:", e)
      }
    }

    if (escudoAzulBase64) {
      try {
        pdf.addImage(escudoAzulBase64, "PNG", pageWidth - marginSide - escudoSize, marginTop, escudoSize, escudoSize)
      } catch (e) {
        console.warn("Error al añadir escudo azul:", e)
      }
    }

    // Añadir encabezado
    pdf.setFontSize(titleFontSize)
    pdf.setFont("times", "bold")
    pdf.text("POLICÍA DE LA PROVINCIA DE LA RIOJA", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    pdf.text("DIRECCIÓN GENERAL DE INVESTIGACIONES", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    pdf.text(`${denuncia.departamento?.toUpperCase() || "DEPARTAMENTO"}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    // Título del certificado
    pdf.setFontSize(titleFontSize)
    pdf.setFont("times", "bold")
    pdf.text("CERTIFICADO DE DENUNCIA", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 20

    // Funcionario que suscribe
    pdf.setFontSize(subtitleFontSize)
    pdf.setFont("times", "bold")
    pdf.text("EL FUNCIONARIO DE POLICIA QUE SUSCRIBE:", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 20

    // CERTIFICA
    pdf.setFontSize(subtitleFontSize)
    pdf.setFont("times", "bold")
    pdf.text("C E R T I F I C A:", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    // Cuerpo del certificado
    pdf.setFont("times", "normal")
    pdf.setFontSize(normalFontSize)

    // Construir el texto del certificado con validaciones (SIN la frase del pedido de secuestro)
    // Usar fecha actual del sistema para la generación del certificado
    const fechaActualSistema = new Date()
    const fechaDenunciaTexto = fechaATexto(fechaActualSistema.toISOString())
    const fechaActual = fechaATexto(fechaActualSistema.toISOString())

    // Validar campos para evitar errores
    const departamento = denuncia.departamento || "Departamento"
    const numExpediente = denuncia.numExpediente || "S/N"
    const fechaDenuncia = denuncia.fechaDenuncia
      ? new Date(denuncia.fechaDenuncia).toLocaleDateString()
      : new Date().toLocaleDateString()
    const denunciante = denuncia.denunciante || "Denunciante"
    const dni = denuncia.dni || "Sin DNI"
    const domicilio = denuncia.domicilio || "Sin domicilio"
    const barrio = denuncia.barrio || "Sin barrio"
    const descripcion = denuncia.descripcion || "Sin descripción"
    const articuloCodigo = getArticuloCodigo(denuncia.tipo) // Declare the variable here

    // Texto del certificado SIN la frase del pedido de secuestro
    const textoCertificado = `Que en este ${departamento}, dependiente de la Dirección General de Investigaciones, de la Policía de la Provincia de La Rioja, se instruyen actuaciones sumariales de prevención, en averiguación del supuesto delito de ${articuloCodigo}, con intervención del señor Juez de Instrucción en lo Criminal y Correccional en turno, Expte. Nro. ${numExpediente}, iniciado en base a denuncia radicada de fecha ${fechaActualSistema.toLocaleDateString()}, por el ciudadano: ${denunciante.toUpperCase()}, D.N.I. Nro. ${dni}, con domicilio en ${domicilio} del barrio ${barrio} de esta ciudad Capital por ${descripcion}.`

    // Aplicar justificación perfecta al texto principal
    const textLines = justifyText(textoCertificado, contentWidth, normalFontSize)

    // Renderizar el texto con justificación perfecta
    yPosition = renderJustifiedText(textLines, marginSide, yPosition, contentWidth, lineHeight)

    // Línea separadora con márgenes apropiados
    yPosition += 10
    pdf.setDrawColor(0, 0, 0)
    pdf.line(marginSide, yPosition, pageWidth - marginSide, yPosition)
    yPosition += 15

    // Texto final
    const textoFinal = `A solicitud de parte interesada, se expide la presente para ser presentado ante las autoridades que lo requieran, en la ciudad de La Rioja Capital de la Provincia del mismo nombre, a los ${fechaActual}.`

    // Aplicar justificación perfecta al texto final
    const finalLines = justifyText(textoFinal, contentWidth, normalFontSize)
    yPosition = renderJustifiedText(finalLines, marginSide, yPosition, contentWidth, lineHeight)

    // Espacio para firma
    yPosition += 30
    if (yPosition > pageHeight - 100) {
      // Aumentamos el margen para el QR
      pdf.addPage()
      yPosition = marginTop + 30
    }

    // Línea para firma del funcionario con márgenes apropiados
    const firmaWidth = 80
    const firmaX = pageWidth / 2 - firmaWidth / 2
    pdf.line(firmaX, yPosition, firmaX + firmaWidth, yPosition)

    yPosition += 8
    pdf.setFont("times", "bold")
    pdf.setFontSize(normalFontSize)
    pdf.text("FUNCIONARIO POLICIAL", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 6
    pdf.setFont("times", "normal")
    pdf.setFontSize(smallFontSize)
    pdf.text(`${denuncia.creadorNombre || ""}`, pageWidth / 2, yPosition, { align: "center" })

    yPosition += 4
    pdf.text(`${denuncia.creadorDepartamento || departamento}`, pageWidth / 2, yPosition, { align: "center" })

    // Agregar código QR en la parte inferior
    if (qrCodeDataURL) {
      try {
        yPosition += 20

        // Verificar si hay espacio suficiente para el QR
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = marginTop + 20
        }

        const qrSize = 30 // Tamaño del QR en mm
        const qrX = pageWidth - marginSide - qrSize // Posición en la esquina inferior derecha

        // Agregar el código QR
        pdf.addImage(qrCodeDataURL, "PNG", qrX, yPosition, qrSize, qrSize)

        // Agregar texto explicativo del QR
        pdf.setFont("times", "italic")
        pdf.setFontSize(smallFontSize - 1)
        pdf.text("Código QR para validación", qrX, yPosition + qrSize + 4, { align: "left" })
        pdf.text("de autenticidad del documento", qrX, yPosition + qrSize + 8, { align: "left" })
      } catch (qrError) {
        console.warn("Error al agregar código QR:", qrError)
      }
    }

    // Añadir pie de página con márgenes apropiados
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(smallFontSize)
      pdf.setFont("times", "italic")
      pdf.text(
        "Este certificado fue generado automáticamente por el Sistema de Gestión Operativa.",
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
    }

    // Guardar el PDF
    const nombreArchivo = `certificado_denuncia_${(denuncia.denunciante || "sin_nombre").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
    pdf.save(nombreArchivo)

    return true // Indicar éxito
  } catch (error) {
    console.error("Error al generar el certificado:", error)
    throw error // Re-lanzar el error para que se maneje en el componente
  }
}
