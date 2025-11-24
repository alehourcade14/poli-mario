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

// Función para adaptar el estado civil según el género del denunciante
const adaptarEstadoCivilSegunGenero = (estadoCivil: string, genero: string): string => {
  // Normalizar el estado civil eliminando espacios y convirtiendo a minúsculas para comparación
  const estadoCivilNormalizado = estadoCivil.trim().toLowerCase()
  const generoNormalizado = genero.trim().toLowerCase()

  // Si el género es Masculino
  if (generoNormalizado === "masculino") {
    if (estadoCivilNormalizado.includes("casado") || estadoCivilNormalizado.includes("casada")) {
      return "Casado"
    }
    if (estadoCivilNormalizado.includes("soltero") || estadoCivilNormalizado.includes("soltera")) {
      return "Soltero"
    }
    if (estadoCivilNormalizado.includes("divorciado") || estadoCivilNormalizado.includes("divorciada")) {
      return "Divorciado"
    }
    if (estadoCivilNormalizado.includes("viudo") || estadoCivilNormalizado.includes("viuda")) {
      return "Viudo"
    }
    if (estadoCivilNormalizado.includes("concubino") || estadoCivilNormalizado.includes("concubina")) {
      return "Concubino"
    }
  }

  // Si el género es Femenino
  if (generoNormalizado === "femenino") {
    if (estadoCivilNormalizado.includes("casado") || estadoCivilNormalizado.includes("casada")) {
      return "Casada"
    }
    if (estadoCivilNormalizado.includes("soltero") || estadoCivilNormalizado.includes("soltera")) {
      return "Soltera"
    }
    if (estadoCivilNormalizado.includes("divorciado") || estadoCivilNormalizado.includes("divorciada")) {
      return "Divorciada"
    }
    if (estadoCivilNormalizado.includes("viudo") || estadoCivilNormalizado.includes("viuda")) {
      return "Viuda"
    }
    if (estadoCivilNormalizado.includes("concubino") || estadoCivilNormalizado.includes("concubina")) {
      return "Concubina"
    }
  }

  // Si no se puede determinar o el género no es válido, devolver el estado civil original sin "/a"
  // Eliminar cualquier "/a" o combinación similar
  return estadoCivil.replace(/\/a/gi, "").trim()
}

export async function exportDenunciaFormalToPDF(denuncia: any) {
  try {
    // Validar que la denuncia tenga los datos mínimos necesarios
    if (!denuncia) {
      throw new Error("No se proporcionaron datos de la denuncia")
    }

    // Validar que la denuncia tenga un ID
    if (!denuncia.id) {
      throw new Error("La denuncia no tiene un ID válido")
    }

    console.log("🔍 Iniciando generación de PDF para denuncia ID:", denuncia.id)
    console.log("📋 Datos de denuncia recibidos:", denuncia)
    console.log("📋 División recibida:", denuncia.division)
    console.log("📋 Tipo de división:", typeof denuncia.division)

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
    let pdf: jsPDF
    try {
      pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })
      console.log("✅ PDF creado exitosamente")
    } catch (pdfError) {
      console.error("❌ Error al crear el documento PDF:", pdfError)
      throw new Error(`Error al crear el documento PDF: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`)
    }

    // Configurar márgenes y dimensiones profesionales para bordes nítidos
    const marginTop = 20
    const marginSide = 35  // Aumentado para coincidir con la imagen de referencia
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
    
    // División - Usar exactamente la división seleccionada con el mismo estilo que los otros títulos
    pdf.setFontSize(subtitleFontSize) // Mismo tamaño que "DIRECCIÓN GENERAL" y "DEPARTAMENTO"
    pdf.setFont("times", "bold") // Mismo tipo de fuente y peso
    // Obtener la división directamente, sin valores por defecto
    const divisionValue = denuncia.division || denuncia.division_nombre || denuncia.division_seleccionada
    
    if (!divisionValue || divisionValue.trim() === '') {
      console.error("❌ No se encontró división en la denuncia")
      throw new Error("La denuncia no tiene una división asignada. Por favor, seleccione una división antes de generar el PDF.")
    }
    
    console.log("📋 División que se mostrará en el PDF (exacta):", divisionValue)
    // Convertir a mayúsculas para mantener consistencia con los otros títulos del membrete
    pdf.text(divisionValue.toUpperCase(), pageWidth / 2, yPosition, { align: "center" })
    yPosition += 6 // Mismo espaciado que los otros títulos
    
    // Agregar espacio adicional antes del título "DENUNCIA FORMULADA POR EL CIUDADANO:"
    yPosition += 12 // Espacio adicional (equivalente a 1-2 saltos de línea)

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
    const estadoCivilRaw = getSafeValue(denuncia.denunciante_estado_civil || denuncia.estadoCivil || denuncia.estado_civil, 'No especificado')
    const estadoCivilTexto = adaptarEstadoCivilSegunGenero(estadoCivilRaw, sexoTexto)

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
    const tipoDelitoTexto = getSafeValue(denuncia.tipo_delito_nombre || denuncia.tipo_delito || denuncia.tipo, 'No especificado')
    const departamentoHechoTexto = getSafeValue(denuncia.departamento_hecho, 'No especificado')
    
    // Generar texto de la denuncia con estructura mejorada
    let textoDenuncia = ""
    try {
      console.log("🔍 Generando texto de denuncia...")
      
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
      // Usar la misma división del membrete para consistencia
      const divisionParaOficina = denuncia.division || denuncia.division_nombre || denuncia.division_seleccionada || divisionValue
      const oficinaDependencia = `Oficina de Sumarios Judiciales de ésta ${divisionParaOficina || 'División'}, dependiente de la Dirección General de Investigaciones`
      const notificacionLegal = `Art. 245 del Código Penal Argentino, que reprime al que denunciare falsamente un hecho`
      
      // Información personal del denunciante con validación mejorada
      const nacionalidad = getSafeValue(denuncia.denunciante_nacionalidad || denuncia.nacionalidad, 'Argentina')
      const dni = getSafeValue(denuncia.denunciante_dni || denuncia.dni, '58412986')
      const profesion = getSafeValue(denuncia.denunciante_profesion || denuncia.profesion, 'Policía')
      const direccion = getSafeValue(denuncia.denunciante_direccion || denuncia.domicilio, 'Agüero Vera 712, F5300BDA La Rioja, Argentina')
      const barrio = getSafeValue(denuncia.barrio || denuncia.barrio_hecho || denuncia.departamento_hecho, 'No especificado')
      
      // Obtener división para usar en el texto - usar exactamente la misma división del membrete
      const divisionValueTexto = divisionValue || denuncia.division || denuncia.division_nombre || denuncia.division_seleccionada
      
      if (!divisionValueTexto || divisionValueTexto.trim() === '') {
        console.error("❌ No se encontró división para el texto de la denuncia")
        throw new Error("La denuncia no tiene una división asignada.")
      }
      
      console.log("📋 nombreFinalSeguro:", nombreFinalSeguro)
      console.log("📋 sexoTexto:", sexoTexto)
      console.log("📋 estadoCivilTexto:", estadoCivilTexto)
      console.log("📋 barrio:", barrio)
      console.log("📋 tipoDelitoTexto:", tipoDelitoTexto)
      console.log("📋 divisionValueTexto:", divisionValueTexto)
      console.log("📋 denuncia completa:", denuncia)
      
      // Formato mejorado con comas en lugar de guiones para nombre, nacionalidad y estado civil
      const datosPersonales = `${nombreFinalSeguro.toUpperCase()}, nacionalidad ${nacionalidad}, estado civil ${estadoCivilTexto}, con instrucción ${instruccionExtraida}, de ${edadExtraida} años de edad, D.N.I. Nº ${dni}, profesión ${profesion}, con domicilio en ${direccion} del barrio ${barrio} de esta Ciudad Capital`
      
      // Información del hecho
      const fechaHoraHecho = `${fechaHechoTexto}, siendo las horas ${horaHechoTexto}`
      const lugarHecho = `${lugarHechoTexto}`
      const tipoHecho = `${tipoDelitoTexto}`
      const descripcionHecho = getSafeValue(denuncia.descripcion, 'Sin descripción')
      
      // Construir el texto con formato de acta policial profesional
      // Reformatear a 80 caracteres por línea con justificación
      const introduccion = `En la ciudad de La Rioja, capital de la provincia del mismo nombre, a los ${fechaHoraActual}, comparece por ante la Oficina de Sumarios Judiciales de ésta ${divisionValueTexto}, dependiente de la Dirección General de Investigaciones, una persona de sexo ${sexoExtraido}, manifestando deseos de formular una denuncia, motivo por el cual se lo notifica de los términos y contenidos del ${notificacionLegal}, enterado de ello, seguidamente es interrogado por su apellido y demás circunstancias personales, dijo llamarse:`
      
      const datosPersonalesCompletos = `${datosPersonales}, quien invitado al acto, seguidamente DENUNCIA: ${descripcionHecho || 'Sin descripción'}.`
      
      const cierre = `Que es todo por lo que se da por finalizado el acto, previa lectura y ratificación, firmando al pie de la presente de conformidad por ante mí, Funcionario Policial, que CERTIFICO.`

      // Construir el texto con párrafos separados (sin formatear aún)
      textoDenuncia = `${introduccion}\n\n${datosPersonalesCompletos}\n\n${cierre}`
      
      console.log("✅ Texto de denuncia generado exitosamente")
    } catch (textError) {
      console.error("❌ Error al generar texto de denuncia:", textError)
      throw new Error(`Error al generar texto de denuncia: ${textError instanceof Error ? textError.message : String(textError)}`)
    }

    // Configurar fuente y tamaño
    try {
      pdf.setFont("times", "normal")
      pdf.setFontSize(11)
      console.log("✅ Fuente configurada exitosamente")

      // Configurar para 80 caracteres por línea exactamente
      const sangria = 20 // Milímetros de sangría para la primera línea
      const anchoConSangria = contentWidth - sangria
      const caracteresPorLinea = 80 // Exactamente 80 caracteres como solicitado
      
      console.log(`📏 Ancho disponible: ${contentWidth}mm, Con sangría: ${anchoConSangria}mm`)
      console.log(`📏 Caracteres por línea: ${caracteresPorLinea}`)

      // Función para dividir texto en líneas de exactamente 80 caracteres
      const dividirTextoEnLineas = (texto: string, maxCaracteres: number = 80): string[] => {
        const palabras = texto.split(' ')
        const lineas: string[] = []
        let lineaActual = ''

        for (const palabra of palabras) {
          const espacio = lineaActual ? ' ' : ''
          const lineaConPalabra = lineaActual + espacio + palabra
          
          // Verificar si la línea cabe (exactamente 80 caracteres o menos)
          if (lineaConPalabra.length <= maxCaracteres) {
            lineaActual = lineaConPalabra
          } else {
            // Si la línea actual tiene contenido, guardarla
            if (lineaActual) {
              lineas.push(lineaActual)
            }
            // Si la palabra sola es más larga que el máximo, dividirla
            if (palabra.length > maxCaracteres) {
              // Dividir palabra muy larga
              let palabraRestante = palabra
              while (palabraRestante.length > maxCaracteres) {
                lineas.push(palabraRestante.substring(0, maxCaracteres))
                palabraRestante = palabraRestante.substring(maxCaracteres)
              }
              lineaActual = palabraRestante
            } else {
              lineaActual = palabra
            }
          }
        }
        
        // Agregar la última línea si existe
        if (lineaActual) {
          lineas.push(lineaActual)
        }
        
        return lineas
      }

      // Función para renderizar texto justificado con sangría
      const renderizarTextoJustificado = (texto: string, x: number, y: number, maxWidth: number, sangriaPrimeraLinea: number = 0): number => {
        let currentY = y
        let isFirstLine = true
        const lineas = dividirTextoEnLineas(texto, caracteresPorLinea)

        lineas.forEach((linea, index) => {
          // Verificar si necesitamos una nueva página
          if (currentY > pageHeight - 30) {
            pdf.addPage()
            currentY = marginTop + 20
            isFirstLine = true // Nueva página, primera línea del párrafo
          }

          const esUltimaLinea = index === lineas.length - 1
          const tieneSangria = isFirstLine && sangriaPrimeraLinea > 0
          const posicionX = tieneSangria ? x + sangriaPrimeraLinea : x
          const anchoDisponible = tieneSangria ? maxWidth - sangriaPrimeraLinea : maxWidth

          if (esUltimaLinea || linea.trim().split(' ').length === 1) {
            // Última línea o línea con una sola palabra: alineación izquierda
            pdf.text(linea, posicionX, currentY)
          } else {
            // Líneas intermedias: justificación perfecta
            const palabras = linea.trim().split(' ')
            if (palabras.length > 1) {
              // Calcular el ancho total del texto sin espacios
              const anchoTotalTexto = palabras.reduce((sum, palabra) => sum + pdf.getTextWidth(palabra), 0)
              const anchoEspacios = pdf.getTextWidth(' ') * (palabras.length - 1)
              const espacioDisponible = anchoDisponible - anchoTotalTexto - anchoEspacios
              const espacioExtraPorGap = espacioDisponible / (palabras.length - 1)

              let textX = posicionX
              palabras.forEach((palabra, palabraIndex) => {
                pdf.text(palabra, textX, currentY)
                textX += pdf.getTextWidth(palabra)
                if (palabraIndex < palabras.length - 1) {
                  textX += pdf.getTextWidth(' ') + espacioExtraPorGap
                }
              })
            } else {
              pdf.text(linea, posicionX, currentY)
            }
          }

          currentY += 6.5
          isFirstLine = false
        })

        return currentY
      }

      // Dividir el texto en párrafos y renderizar cada uno
      const parrafos = textoDenuncia.split('\n\n').filter(p => p.trim())
      console.log("📝 Párrafos a renderizar:", parrafos.length)
      
      for (let i = 0; i < parrafos.length; i++) {
        const parrafo = parrafos[i].trim()
        if (!parrafo) continue
        
        console.log(`📝 Renderizando párrafo ${i + 1}:`, parrafo.substring(0, 100) + "...")
        
        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight - 50) {
          pdf.addPage()
          yPosition = marginTop + 20
        }
        
        // Renderizar el párrafo con justificación y sangría
        yPosition = renderizarTextoJustificado(parrafo, marginSide, yPosition, contentWidth, sangria)
        
        // Agregar espacio entre párrafos (excepto después del último)
        if (i < parrafos.length - 1) {
          yPosition += 8
        }
      }
      
      console.log("✅ Texto renderizado exitosamente")
    } catch (renderError) {
      console.error("❌ Error al renderizar el texto:", renderError)
      throw new Error(`Error al renderizar el texto: ${renderError instanceof Error ? renderError.message : String(renderError)}`)
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

    // Guardar el PDF con DNI del denunciante para evitar reemplazos
    try {
      const dniDenunciante = denuncia.denunciante_dni || denuncia.dni || "sin_dni"
      const nombreDenunciante = (denuncia.denunciante_nombre || denuncia.denunciante || "sin_nombre").replace(/\s+/g, "_")
      const fileName = `denuncia_formal_${nombreDenunciante}_DNI_${dniDenunciante}_${fechaActualSistema.toISOString().split("T")[0]}.pdf`
      console.log("💾 Guardando PDF con nombre:", fileName)
      pdf.save(fileName)
      console.log("✅ PDF generado exitosamente:", fileName)
    } catch (saveError) {
      console.error("❌ Error al guardar el PDF:", saveError)
      throw new Error(`Error al guardar el PDF: ${saveError instanceof Error ? saveError.message : String(saveError)}`)
    }
  } catch (error) {
    console.error("❌ Error detallado al generar el PDF:", error)
    console.error("❌ Stack trace:", error instanceof Error ? error.stack : 'No stack trace available')
    console.error("❌ Datos de denuncia que causaron el error:", denuncia)

    // Mostrar error más específico al usuario
    let errorMessage = "Error desconocido al generar el PDF"

    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`
      console.error("❌ Error message:", error.message)
      console.error("❌ Error name:", error.name)
    } else if (typeof error === "string") {
      errorMessage = error
      console.error("❌ String error:", error)
    } else {
      console.error("❌ Unknown error type:", typeof error, error)
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

// Función simplificada para justificación (ya no se usa, mantenida por compatibilidad)
const justifyText = (text: string, maxWidth: number, fontSize: number, pdf: jsPDF) => {
  // Esta función ya no se usa, se reemplazó por la funcionalidad nativa de jsPDF
  return [{ text: text, isJustified: true }]
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

// Función simplificada para renderizar texto (ya no se usa, mantenida por compatibilidad)
const renderJustifiedText = (
  lines: { text: string; isJustified: boolean }[],
  x: number,
  y: number,
  maxWidth: number,
  pdf: jsPDF,
) => {
  // Esta función ya no se usa, se reemplazó por la funcionalidad nativa de jsPDF
  return y
}
