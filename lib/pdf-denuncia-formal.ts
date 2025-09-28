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
      // Verificar si el valor es solo espacios o caracteres vacíos
      if (stringValue === "" || stringValue === "null" || stringValue === "undefined") {
        return defaultValue
      }
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

    // Configurar márgenes y dimensiones profesionales para bordes nítidos
    const marginTop = 20
    const marginSide = 20
    const marginBottom = 25
    const titleFontSize = 16
    const subtitleFontSize = 12
    const normalFontSize = 11
    const smallFontSize = 8
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const contentWidth = pageWidth - marginSide * 2
    let yPosition = 50

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

    // Añadir encabezado con formato específico solicitado
    pdf.setFontSize(titleFontSize)
    pdf.setFont("times", "bold")
    pdf.text("POLICÍA DE LA PROVINCIA DE LA RIOJA", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    
    pdf.setFontSize(subtitleFontSize)
    pdf.text("DIRECCIÓN GENERAL DE INVESTIGACIONES", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    
    // Departamento - Con formato correcto
    pdf.setFontSize(subtitleFontSize)
    pdf.setFont("times", "bold")
    const departamentoValue = getSafeValue(denuncia.departamento_nombre || denuncia.departamento, 'Departamento Cibercrimen')
    pdf.text(`${departamentoValue.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6
    
    // División - Con formato correcto
    pdf.setFontSize(normalFontSize)
    pdf.setFont("times", "bold")
    const divisionValue = getSafeValue(denuncia.division, 'División de Robos y Hurtos')
    pdf.text(`${divisionValue.toUpperCase()}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    // Título principal de la denuncia
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
    const estadoCivilTexto = getSafeValue(denuncia.estadoCivil, 'No especificado')

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
    
    // Generar texto de la denuncia con estructura mejorada
    let textoDenuncia = ""
    try {
      console.log("🔍 Generando texto de denuncia...")
      console.log("📋 nombreFinalSeguro:", nombreFinalSeguro)
      console.log("📋 sexoTexto:", sexoTexto)
      console.log("📋 estadoCivilTexto:", estadoCivilTexto)
      
      // Extraer información adicional de las observaciones si está disponible
      const observaciones = getSafeValue(denuncia.observaciones, '')
      let edadExtraida = getSafeValue(denuncia.edad, '56')
      let sexoExtraido = sexoTexto
      let instruccionExtraida = getSafeValue(denuncia.instruccion, 'Primaria incompleta')
      
      // Si las observaciones contienen información estructurada, extraerla
      if (observaciones.includes('Edad:') && observaciones.includes('Sexo:') && observaciones.includes('Instrucción:')) {
        const edadMatch = observaciones.match(/Edad:\s*([^,]+)/)
        const sexoMatch = observaciones.match(/Sexo:\s*([^,]+)/)
        const instruccionMatch = observaciones.match(/Instrucción:\s*([^,]+)/)
        
        if (edadMatch) edadExtraida = edadMatch[1].trim()
        if (sexoMatch) sexoExtraido = sexoMatch[1].trim()
        if (instruccionMatch) instruccionExtraida = instruccionMatch[1].trim()
      }

      // Construir el texto con estructura mejorada y títulos claros
      const fechaHoraActual = `${fechaDenunciaTexto}, siendo las horas ${horaActualSistema}`
      const oficinaDependencia = `Oficina de Sumarios Judiciales de ésta ${getSafeValue(denuncia.division, 'División')}, dependiente de la Dirección General de Investigaciones`
      const notificacionLegal = `Art. 245 del Código Penal Argentino, que reprime al que denunciare falsamente un hecho`
      
      // Información personal del denunciante con validación mejorada
      const nacionalidad = getSafeValue(denuncia.denunciante_nacionalidad || denuncia.nacionalidad, 'Argentina')
      const dni = getSafeValue(denuncia.denunciante_dni || denuncia.dni, '58412986')
      const profesion = getSafeValue(denuncia.denunciante_profesion || denuncia.profesion, 'Policia')
      const direccion = getSafeValue(denuncia.denunciante_direccion || denuncia.domicilio, 'Agüero Vera 712, F5300BDA La Rioja, Argentina')
      const barrio = getSafeValue(denuncia.barrio, 'No especificado')
      
      const datosPersonales = `${nombreFinalSeguro.toUpperCase()}, de nacionalidad ${nacionalidad}, de estado civil ${estadoCivilTexto}, con instrucción ${instruccionExtraida}, de ${edadExtraida} años de edad, D.N.I. Nº ${dni}, profesión ${profesion}, con domicilio en ${direccion} del barrio ${barrio} de esta Ciudad Capital`
      
      // Información del hecho
      const fechaHoraHecho = `${fechaHechoTexto}, siendo las horas ${horaHechoTexto}`
      const lugarHecho = `${lugarHechoTexto}, departamento de ${departamentoHechoTexto}`
      const tipoHecho = `${tipoDelitoTexto}`
      const descripcionHecho = getSafeValue(denuncia.descripcion, 'Sin descripción')

      // Obtener división para usar en el texto
      const divisionValue = getSafeValue(denuncia.division, 'División de Robos y Hurtos')
      
      // Construir el texto con el formato exacto solicitado
      const introduccion = `En la ciudad de La Rioja, capital de la provincia del mismo nombre a los ${fechaHoraActual}, comparece por ante la Oficina de Sumarios Judiciales de ésta ${divisionValue}, dependiente de la Dirección General de Investigaciones, una persona de sexo ${sexoExtraido}, manifestando deseos de formular una denuncia, motivo por el cual se lo notifica de los términos y contenidos del ${notificacionLegal}, enterado de ello, seguidamente es interrogada por su apellido y demás circunstancias personales dijo llamarse:`
      
      const seccionDenuncia = `DENUNCIA:`
      
      const descripcionDelHecho = descripcionHecho || 'Sin descripción'
      
      const cierre = `Que es todo por lo que se da por finalizado el acto previa lectura y ratificación, firmando al pie de la presente de conformidad por ante mi Funcionario Policial que CERTIFICO.`

      // Construir el texto con el formato exacto solicitado
      textoDenuncia = `${introduccion} ${datosPersonales}, quien invitada al acto seguidamente ${seccionDenuncia} ${descripcionDelHecho} ${cierre}`
      
      console.log("✅ Texto de denuncia generado exitosamente")
    } catch (textError) {
      console.error("❌ Error al generar texto de denuncia:", textError)
      throw new Error(`Error al generar texto de denuncia: ${textError instanceof Error ? textError.message : String(textError)}`)
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

    // Espacio para firmas
    yPosition += 20
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
    const pageCount = pdf.getNumberOfPages()
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
  pdf.setFontSize(11) // Tamaño de fuente unificado
  
  // Limpiar el texto y separar palabras correctamente
  const cleanText = text.replace(/\s+/g, ' ').trim()
  const words = cleanText.split(" ")
  const lines: { text: string; isJustified: boolean }[] = []
  const sangriaSize = 12.7 // 0.5 pulgadas = 1.27 cm = 12.7 mm
  let currentLine = ""
  let isFirstLine = true

  for (let i = 0; i < words.length; i++) {
    const word = words[i].trim()
    if (!word) continue // Saltar palabras vacías
    
    const testLine = currentLine + (currentLine ? " " : "") + word
    // Ajustar ancho máximo para la primera línea (con sangría)
    const currentMaxWidth = isFirstLine ? maxWidth - sangriaSize : maxWidth
    const testWidth = pdf.getTextWidth(testLine)

    if (testWidth <= currentMaxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        // Justificar la línea actual
        const justifiedLine = justifyLine(currentLine, currentMaxWidth, pdf, isFirstLine ? sangriaSize : 0)
        lines.push({ text: justifiedLine, isJustified: true })
        currentLine = word
        isFirstLine = false // Después de la primera línea
      } else {
        // Palabra muy larga, dividirla
        lines.push({ text: word, isJustified: false })
        currentLine = ""
        isFirstLine = false
      }
    }
  }

  if (currentLine) {
    // Justificar la última línea
    const justifiedLine = justifyLine(currentLine, maxWidth, pdf, isFirstLine ? sangriaSize : 0)
    lines.push({ text: justifiedLine, isJustified: true })
  }

  return lines
}

// Función para justificar una línea individual
const justifyLine = (line: string, maxWidth: number, pdf: jsPDF, sangria: number = 0) => {
  const words = line.split(" ")
  if (words.length <= 1) return line

  const currentWidth = pdf.getTextWidth(line)
  const availableWidth = maxWidth - sangria
  const extraSpace = availableWidth - currentWidth

  if (extraSpace <= 0) return line

  const spacesToAdd = words.length - 1
  const spacePerGap = extraSpace / spacesToAdd

  let justifiedLine = words[0]
  for (let i = 1; i < words.length; i++) {
    const spaces = " ".repeat(Math.floor(spacePerGap * i) - Math.floor(spacePerGap * (i - 1)))
    justifiedLine += spaces + words[i]
  }

  return justifiedLine
}

// Función para renderizar texto justificado con sangría y manejo de títulos
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

    // Aplicar formato unificado para todo el texto
    pdf.setFont("times", "normal")
    pdf.setFontSize(11)

    // Renderizar texto sin justificación para evitar problemas de superposición
    pdf.text(line.text, currentX, currentY)

    // Interlineado de 1.5 (11pt * 1.5 = 16.5pt)
    currentY += 6.5

    // Después de la primera línea, las siguientes no llevan sangría
    // hasta que encuentre un nuevo párrafo (esto se podría mejorar detectando párrafos)
    isFirstLineOfParagraph = false
  })

  return currentY
}
