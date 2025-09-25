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
    // Validar que la denuncia tenga los datos mínimos necesarios
    if (!denuncia) {
      throw new Error("No se proporcionaron datos de la denuncia")
    }

    // Log para debugging
    console.log("📋 Datos de denuncia recibidos para PDF:", {
      // Datos personales
      denunciante_nombre: denuncia.denunciante_nombre,
      denunciante_apellido: denuncia.denunciante_apellido,
      denunciante: denuncia.denunciante,
      dni: denuncia.denunciante_dni || denuncia.dni,
      nacionalidad: denuncia.denunciante_nacionalidad || denuncia.nacionalidad,
      estadoCivil: denuncia.estadoCivil,
      instruccion: denuncia.instruccion,
      edad: denuncia.edad,
      sexo: denuncia.sexo,
      profesion: denuncia.denunciante_profesion || denuncia.profesion,
      domicilio: denuncia.denunciante_direccion || denuncia.domicilio,
      barrio: denuncia.barrio,
      
      // Datos de la denuncia
      numero_expediente: denuncia.numero_expediente,
      tipo_delito: denuncia.tipo_delito,
      departamento: denuncia.departamento,
      division: denuncia.division,
      fecha_hecho: denuncia.fecha_hecho,
      hora_hecho: denuncia.hora_hecho,
      lugar_hecho: denuncia.lugar_hecho,
      departamento_hecho: denuncia.departamento_hecho,
      descripcion: denuncia.descripcion,
      observaciones: denuncia.observaciones,
      
      // Ubicación
      latitud: denuncia.latitud,
      longitud: denuncia.longitud
    })

    // Función para obtener valores seguros
    const getSafeValue = (value: any, defaultValue: string = "No especificado"): string => {
      if (value === null || value === undefined || value === "") {
        return defaultValue
      }
      const stringValue = String(value).trim()
      return stringValue || defaultValue
    }

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
    pdf.text(`${getSafeValue(denuncia.departamento, 'La Rioja').toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    pdf.text(`${getSafeValue(denuncia.division, 'División').toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    // Título de la denuncia
    pdf.setFontSize(normalFontSize)
    pdf.setFont("times", "bold")
    const nombreCompletoTitulo = `${getSafeValue(denuncia.denunciante_nombre)} ${getSafeValue(denuncia.denunciante_apellido)}`.trim()
    const nombreFinalTitulo = nombreCompletoTitulo || getSafeValue(denuncia.denunciante, 'No especificado')
    pdf.text(`DENUNCIA FORMULADA POR EL CIUDADANO: ${nombreFinalTitulo.toUpperCase()}`, pageWidth / 2, yPosition, {
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

    // Construir el texto de la denuncia con validaciones
    const sexoTexto = getSafeValue(denuncia.sexo) === "Masculino" ? "Masculino" : (getSafeValue(denuncia.sexo) === "Femenino" ? "Femenino" : "No especificado")
    const estadoCivilTexto =
      getSafeValue(denuncia.estadoCivil) === "Soltero/a"
        ? getSafeValue(denuncia.sexo) === "Masculino"
          ? "Soltero"
          : "Soltera"
        : getSafeValue(denuncia.estadoCivil)

    // Obtener el nombre completo del denunciante de forma segura
    const nombreCompleto = `${getSafeValue(denuncia.denunciante_nombre)} ${getSafeValue(denuncia.denunciante_apellido)}`.trim()
    const nombreCompletoFinal = (nombreCompleto && 
                                 nombreCompleto !== 'No especificado No especificado' && 
                                 nombreCompleto !== 'No especificado' && 
                                 nombreCompleto.length > 0) ? nombreCompleto : 'No especificado'
    
    // Asegurar que el nombre final sea una cadena válida
    const nombreFinalSeguro = (nombreCompletoFinal && typeof nombreCompletoFinal === 'string') ? nombreCompletoFinal : 'No especificado'

    // Información del hecho - definir fuera del try para que esté disponible en toda la función
    const fechaHechoTexto = denuncia.fecha_hecho ? fechaATexto(denuncia.fecha_hecho) : 'No especificada'
    const horaHechoTexto = getSafeValue(denuncia.hora_hecho, 'No especificada')
    const lugarHechoTexto = getSafeValue(denuncia.lugar_hecho, 'No especificado')
    const tipoDelitoTexto = getSafeValue(denuncia.tipo_delito, 'No especificado')
    const departamentoHechoTexto = getSafeValue(denuncia.departamento_hecho, 'No especificado')
    
    // Generar texto de la denuncia con manejo seguro de errores
    let textoDenuncia = ""
    try {
      console.log("🔍 Generando texto de denuncia...")
      console.log("📋 nombreFinalSeguro:", nombreFinalSeguro)
      console.log("📋 sexoTexto:", sexoTexto)
      console.log("📋 estadoCivilTexto:", estadoCivilTexto)
      
      // Extraer información adicional de las observaciones si está disponible
      const observaciones = getSafeValue(denuncia.observaciones, '')
      let edadExtraida = getSafeValue(denuncia.edad, 'No especificado')
      let sexoExtraido = sexoTexto
      let instruccionExtraida = getSafeValue(denuncia.instruccion, 'No especificado')
      
      // Si las observaciones contienen información estructurada, extraerla
      if (observaciones.includes('Edad:') && observaciones.includes('Sexo:') && observaciones.includes('Instrucción:')) {
        const edadMatch = observaciones.match(/Edad:\s*([^,]+)/)
        const sexoMatch = observaciones.match(/Sexo:\s*([^,]+)/)
        const instruccionMatch = observaciones.match(/Instrucción:\s*([^,]+)/)
        
        if (edadMatch) edadExtraida = edadMatch[1].trim()
        if (sexoMatch) sexoExtraido = sexoMatch[1].trim()
        if (instruccionMatch) instruccionExtraida = instruccionMatch[1].trim()
      }

      // Las variables de información del hecho ya están definidas arriba

      textoDenuncia = `En la ciudad de La Rioja, capital de la provincia del mismo nombre a los ${fechaDenunciaTexto}, siendo las horas ${horaActualSistema}, comparece por ante la Oficina de Sumarios Judiciales de ésta ${getSafeValue(denuncia.division, 'División')}, dependiente de la Dirección General de Investigaciones, una persona de sexo ${sexoExtraido}, manifestando deseos de formular una denuncia, motivo por el cual se lo notifica de los términos y contenidos del Art. 245 del Código Penal Argentino, que reprime al que denunciare falsamente un hecho, enterado de ello, seguidamente es interrogada por su apellido y demás circunstancias personales dijo llamarse: ${nombreFinalSeguro.toUpperCase()}, de nacionalidad ${getSafeValue(denuncia.denunciante_nacionalidad || denuncia.nacionalidad, 'Argentina')}, de estado civil ${estadoCivilTexto}, con instrucción ${instruccionExtraida}, ${getSafeValue(denuncia.denunciante_profesion || denuncia.profesion)}, de ${edadExtraida} años de edad, D.N.I. Nº ${getSafeValue(denuncia.denunciante_dni || denuncia.dni)}, profesión ${getSafeValue(denuncia.denunciante_profesion || denuncia.profesion)}, con domicilio en ${getSafeValue(denuncia.denunciante_direccion || denuncia.domicilio)} del barrio ${getSafeValue(denuncia.barrio)} de esta Ciudad Capital, quien invitada al acto seguidamente DENUNCIA: Que el día ${fechaHechoTexto}, siendo las horas ${horaHechoTexto}, en ${lugarHechoTexto}, departamento de ${departamentoHechoTexto}, ocurrió un hecho del tipo ${tipoDelitoTexto}, siendo los detalles del mismo los siguientes: ${getSafeValue(denuncia.descripcion)} Que es todo por lo que se da por finalizado el acto previa lectura y ratificación, firmando al pie de la presente de conformidad por ante mi Funcionario Policial que CERTIFICO.`
      
      console.log("✅ Texto de denuncia generado exitosamente")
    } catch (textError) {
      console.error("❌ Error al generar texto de denuncia:", textError)
      throw new Error(`Error al generar texto de denuncia: ${textError.message}`)
    }

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

    // Espacio para información adicional
    yPosition += 20
    if (yPosition > pageHeight - 150) {
      pdf.addPage()
      yPosition = marginTop + 20
    }

    // Información adicional del formulario
    pdf.setFont("times", "bold")
    pdf.setFontSize(subtitleFontSize)
    pdf.text("INFORMACIÓN ADICIONAL:", marginSide, yPosition)
    yPosition += 10

    pdf.setFont("times", "normal")
    pdf.setFontSize(normalFontSize)

    // Crear tabla de información adicional
    const infoItems = [
      { label: "Número de Expediente:", value: getSafeValue(denuncia.numero_expediente, 'No especificado') },
      { label: "Fecha de Denuncia:", value: fechaDenunciaTexto },
      { label: "Hora de Denuncia:", value: horaActualSistema },
      { label: "Fecha del Hecho:", value: fechaHechoTexto },
      { label: "Hora del Hecho:", value: horaHechoTexto },
      { label: "Lugar del Hecho:", value: lugarHechoTexto },
      { label: "Departamento del Hecho:", value: departamentoHechoTexto },
      { label: "Tipo de Delito:", value: tipoDelitoTexto },
      { label: "División:", value: getSafeValue(denuncia.division, 'No especificado') },
      { label: "Departamento:", value: getSafeValue(denuncia.departamento, 'No especificado') }
    ]

    // Mostrar información en dos columnas
    const col1X = marginSide
    const col2X = marginSide + contentWidth / 2 + 10
    let currentCol = 1
    let colY = yPosition

    infoItems.forEach((item, index) => {
      const x = currentCol === 1 ? col1X : col2X
      
      pdf.setFont("times", "bold")
      pdf.text(item.label, x, colY)
      pdf.setFont("times", "normal")
      pdf.text(item.value, x + 60, colY)
      
      colY += 6
      
      // Cambiar a segunda columna después de la mitad de los elementos
      if (index === Math.floor(infoItems.length / 2) - 1) {
        currentCol = 2
        colY = yPosition
      }
    })

    yPosition = colY + 20

    // Espacio para firmas
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
