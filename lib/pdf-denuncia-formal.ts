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
      sexo: denuncia.sexo,
      telefono: denuncia.denunciante_telefono,
      email: denuncia.denunciante_email,
      domicilio: denuncia.denunciante_direccion || denuncia.domicilio,
      
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
    let logoNuevoBase64 = null

    try {
      escudoAmarilloBase64 = await getBase64Image("/images/escudo-amarillo.png")
      
      // Reemplazar el logo azul por el logo nuevo de la policía
      // Usar el logo específico: logo_policiadelarioja.png
      try {
        logoNuevoBase64 = await getBase64Image("/images/logo_policiadelarioja.png")
        console.log("✅ Logo nuevo cargado: logo_policiadelarioja.png")
      } catch (logoError) {
        console.warn("⚠️ No se pudo cargar el logo nuevo (logo_policiadelarioja.png), usando escudo-azul.png como fallback")
        try {
          logoNuevoBase64 = await getBase64Image("/images/escudo-azul.png")
        } catch (fallbackError) {
          console.warn("❌ No se pudo cargar ningún logo")
        }
      }
    } catch (imageError) {
      console.warn("No se pudieron cargar las imágenes de los escudos:", imageError)
      // Continuar sin imágenes
    }

    // Añadir los escudos si se cargaron correctamente
    if (escudoAmarilloBase64 && logoNuevoBase64) {
      const escudoSize = 25
      try {
        pdf.addImage(escudoAmarilloBase64, "PNG", marginSide, marginTop, escudoSize, escudoSize)
        // Usar el logo nuevo en lugar del escudo azul
        pdf.addImage(logoNuevoBase64, "PNG", pageWidth - marginSide - escudoSize, marginTop, escudoSize, escudoSize)
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
      let barrio = getSafeValue(denuncia.barrio || denuncia.barrio_hecho || denuncia.departamento_hecho, '')
      
      // Limpiar el barrio: eliminar referencias a "Departamento Delitos Contra la Propiedad" o similares
      if (barrio && barrio !== 'No especificado') {
        // Eliminar cualquier referencia a "Departamento" seguido de texto
        barrio = barrio.replace(/Departamento\s+Delitos\s+Contra\s+la\s+Propiedad/gi, '')
        barrio = barrio.replace(/Departamento\s+[^,]+/gi, '')
        barrio = barrio.replace(/Departamento\s+/gi, '')
        // Limpiar espacios múltiples y espacios al inicio/final
        barrio = barrio.replace(/\s+/g, ' ').trim()
        // Si quedó vacío después de limpiar, dejar vacío
        if (barrio === '' || barrio === 'No especificado') {
          barrio = ''
        }
      } else {
        barrio = ''
      }
      
      // Obtener división para usar en el texto - usar exactamente la misma división del membrete
      const divisionValueTexto = divisionValue || denuncia.division || denuncia.division_nombre || denuncia.division_seleccionada
      
      if (!divisionValueTexto || divisionValueTexto.trim() === '') {
        console.error("❌ No se encontró división para el texto de la denuncia")
        throw new Error("La denuncia no tiene una división asignada.")
      }
      
      // Función para separar palabras pegadas (ej: "LAURAANA" -> "LAURA ANA")
      const separarPalabrasPegadas = (texto: string): string => {
        if (!texto || typeof texto !== 'string') return texto
        
        // Lista de nombres comunes para ayudar en la separación
        const nombresComunes = ['LAURA', 'ANA', 'MARIA', 'JUAN', 'CARLOS', 'PEDRO', 'LUIS', 'JOSE', 'FLAVIO', 'BRIZUELA', 'FERNANDEZ', 'GONZALEZ', 'RODRIGUEZ', 'LOPEZ', 'MARTINEZ', 'GARCIA', 'PEREZ', 'SANCHEZ', 'RAMIREZ', 'TORRES', 'GOMEZ', 'DIAZ', 'MORALES', 'CASTRO', 'ORTIZ', 'RUIZ', 'JIMENEZ', 'HERRERA', 'RAMOS', 'VARGAS']
        
        let resultado = texto.toUpperCase().trim()
        
        // Intentar separar nombres comunes pegados
        // Buscar patrones como "LAURAANA" donde "LAURA" y "ANA" son nombres comunes
        for (let i = 0; i < nombresComunes.length; i++) {
          for (let j = 0; j < nombresComunes.length; j++) {
            if (i !== j) {
              const nombre1 = nombresComunes[i]
              const nombre2 = nombresComunes[j]
              const patronPegado = nombre1 + nombre2
              if (resultado.includes(patronPegado)) {
                resultado = resultado.replace(new RegExp(patronPegado, 'g'), `${nombre1} ${nombre2}`)
              }
            }
          }
        }
        
        // Separar cuando hay transición de mayúsculas consecutivas (patrón general)
        // Ejemplo: "BRIZUELAFLAVIO" -> "BRIZUELA FLAVIO"
        resultado = resultado.replace(/([A-ZÁÉÍÓÚÑ]{5,})([A-ZÁÉÍÓÚÑ]{3,})/g, (match, p1, p2) => {
          // Verificar si alguna parte es un nombre común
          const p1EsNombre = nombresComunes.some(n => p1 === n || p1.startsWith(n))
          const p2EsNombre = nombresComunes.some(n => p2 === n || p2.startsWith(n))
          if (p1EsNombre || p2EsNombre || (p1.length >= 5 && p2.length >= 3)) {
            return `${p1} ${p2}`
          }
          return match
        })
        
        // Separar cuando hay transición de minúscula a mayúscula
        resultado = resultado.replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2')
        
        return resultado
      }
      
      // Formatear el nombre: usar los campos separados si están disponibles
      let nombreFormateado = nombreFinalSeguro.trim()
      
      // Si tenemos nombre y apellido separados, usarlos directamente
      const nombreSeparado = denuncia.denunciante_nombre && denuncia.denunciante_apellido
        ? `${denuncia.denunciante_apellido} ${denuncia.denunciante_nombre}`.trim()
        : null
      
      if (nombreSeparado && nombreSeparado !== 'No especificado No especificado' && nombreSeparado.length > 0) {
        nombreFormateado = nombreSeparado
      } else if (nombreFormateado && !nombreFormateado.includes(' ')) {
        // Si el nombre viene pegado, intentar separarlo
        // Por ejemplo: "LAURAANA" -> "LAURA ANA", "BRIZUELAFLAVIO" -> "BRIZUELA FLAVIO"
        nombreFormateado = separarPalabrasPegadas(nombreFormateado)
      }
      
      // Asegurar que el nombre tenga espacios correctos y convertir a mayúsculas
      nombreFormateado = nombreFormateado.replace(/\s+/g, ' ').trim()
      const nombreFinal = nombreFormateado.toUpperCase()
      
      // Formatear instrucción con mayúscula inicial
      const instruccionFormateada = instruccionExtraida.charAt(0).toUpperCase() + instruccionExtraida.slice(1).toLowerCase()
      
      // El estado civil ya viene adaptado por género (Casado/Casada, Soltero/Soltera, etc.)
      // Solo asegurar mayúscula inicial sin cambiar el resto
      const estadoCivilFormateado = estadoCivilTexto.charAt(0).toUpperCase() + estadoCivilTexto.slice(1)
      
      // Formatear nacionalidad con mayúscula inicial
      const nacionalidadFormateada = nacionalidad.charAt(0).toUpperCase() + nacionalidad.slice(1).toLowerCase()
      
      // Formatear profesión con mayúscula inicial
      const profesionFormateada = profesion.charAt(0).toUpperCase() + profesion.slice(1).toLowerCase()
      
      console.log("📋 nombreFinalSeguro:", nombreFinalSeguro)
      console.log("📋 nombreFormateado:", nombreFormateado)
      console.log("📋 sexoTexto:", sexoTexto)
      console.log("📋 estadoCivilTexto:", estadoCivilTexto)
      console.log("📋 barrio (limpio):", barrio)
      console.log("📋 tipoDelitoTexto:", tipoDelitoTexto)
      console.log("📋 divisionValueTexto:", divisionValueTexto)
      
      // Formato mejorado con espacios correctos y formato según el modelo
      // Modelo: BRIZUELA FLAVIO, nacionalidad Argentina, estado civil Viudo, con instrucción Primaria incompleta, de 56 años de edad, D.N.I. Nº 26.054.755, profesión Policía, con domicilio en Teresita Flores 1322 del barrio XXXXX de esta Ciudad Capital
      // Limpiar espacios múltiples en la dirección
      const direccionLimpia = direccion.replace(/\s+/g, ' ').trim()
      
      // Construir el texto del barrio: si existe, incluir "del barrio [nombre]", si no, solo dejar espacio
      const barrioTexto = barrio && barrio.trim() !== '' ? `del barrio ${barrio.trim()} ` : ''
      
      // Construir el texto completo con formato correcto
      // Asegurar espacios después de cada coma y separar palabras pegadas
      let datosPersonalesRaw = `${nombreFinal}, nacionalidad ${nacionalidadFormateada}, estado civil ${estadoCivilFormateado}, con instrucción ${instruccionFormateada}, de ${edadExtraida} años de edad, D.N.I. Nº ${dni}, profesión ${profesionFormateada}, con domicilio en ${direccionLimpia} ${barrioTexto}de esta Ciudad Capital`
      
      // Separar palabras pegadas comunes que pueden venir sin espacios
      // Aplicar correcciones en orden específico para evitar conflictos
      datosPersonalesRaw = datosPersonalesRaw
        // Primero, separar palabras específicas conocidas
        .replace(/coninstrucción/gi, 'con instrucción') // Separar "coninstrucción" (con tilde)
        .replace(/coninstruccion/gi, 'con instrucción') // Separar "coninstruccion" (sin tilde)
        .replace(/estadocivil/gi, 'estado civil') // Separar "estadocivil"
        .replace(/nacionalidad([A-ZÁÉÍÓÚÑ])/gi, 'nacionalidad $1') // Separar "nacionalidadArgentina"
        // Separar cualquier palabra pegada (minúscula seguida de mayúscula)
        .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2')
        // Asegurar espacio después de cada coma
        .replace(/,([^\s])/g, ', $1')
        // Limpiar espacios múltiples y espacios al inicio/final
        .replace(/\s+/g, ' ')
        .trim()
      
      // Asegurar que no haya valores "undefined" o "null" en el texto
      datosPersonalesRaw = datosPersonalesRaw
        .replace(/undefined/gi, '')
        .replace(/null/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
      
      const datosPersonales = datosPersonalesRaw
      
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

    // Obtener datos del funcionario desde los datos de la denuncia
    // La API ya debe incluir estos datos en la respuesta
    let funcionarioNombre = ''
    let funcionarioDni = ''
    
    // Intentar obtener desde diferentes campos que pueden venir en la respuesta
    if (denuncia.creador_nombre) {
      funcionarioNombre = denuncia.creador_nombre
    } else if (denuncia.funcionario_nombre) {
      funcionarioNombre = denuncia.funcionario_nombre
    } else if (denuncia.usuario_nombre) {
      funcionarioNombre = denuncia.usuario_nombre
    } else if (denuncia.creador_nombre_completo) {
      funcionarioNombre = denuncia.creador_nombre_completo
    }
    
    // Obtener DNI del funcionario
    if (denuncia.creador_dni) {
      funcionarioDni = denuncia.creador_dni
    } else if (denuncia.funcionario_dni) {
      funcionarioDni = denuncia.funcionario_dni
    } else if (denuncia.usuario_dni) {
      funcionarioDni = denuncia.usuario_dni
    }

    // Obtener datos del denunciante de forma segura
    const nombreDenunciante = `${getSafeValue(denuncia.denunciante_nombre, '')} ${getSafeValue(denuncia.denunciante_apellido, '')}`.trim() || getSafeValue(denuncia.denunciante, '')
    const dniDenunciante = getSafeValue(denuncia.denunciante_dni || denuncia.dni, '')
    // Para teléfono y email, usar cadena vacía como default para no mostrar "No especificado"
    const telefonoDenunciante = (denuncia.denunciante_telefono || denuncia.telefono) ? String(denuncia.denunciante_telefono || denuncia.telefono).trim() : ''
    const emailDenunciante = (denuncia.denunciante_email || denuncia.email) ? String(denuncia.denunciante_email || denuncia.email).trim() : ''

    // Líneas para firmas con márgenes apropiados
    const firmaWidth = 70
    const firmaY = yPosition + 20
    let currentYDenunciante = firmaY + 5
    let currentYFuncionario = firmaY + 5

    // Firma del denunciante
    pdf.line(marginSide, firmaY, marginSide + firmaWidth, firmaY)
    pdf.setFont("times", "normal")
    pdf.setFontSize(smallFontSize)
    pdf.text("Firma del Denunciante", marginSide, currentYDenunciante)
    currentYDenunciante += 5
    
    if (nombreDenunciante && nombreDenunciante !== 'No especificado' && nombreDenunciante.trim() !== '') {
      pdf.text(nombreDenunciante, marginSide, currentYDenunciante)
      currentYDenunciante += 5
    }
    
    if (dniDenunciante && dniDenunciante !== 'No especificado' && dniDenunciante.trim() !== '') {
      pdf.text(`DNI: ${dniDenunciante}`, marginSide, currentYDenunciante)
      currentYDenunciante += 5
    }
    
    if (telefonoDenunciante && telefonoDenunciante !== '' && telefonoDenunciante !== 'undefined' && telefonoDenunciante !== 'null') {
      pdf.text(`Teléfono: ${telefonoDenunciante}`, marginSide, currentYDenunciante)
      currentYDenunciante += 5
    }
    
    if (emailDenunciante && emailDenunciante !== '' && emailDenunciante !== 'undefined' && emailDenunciante !== 'null') {
      pdf.text(`Correo: ${emailDenunciante}`, marginSide, currentYDenunciante)
    }

    // Firma del funcionario
    const funcionarioX = pageWidth - marginSide - firmaWidth
    pdf.line(funcionarioX, firmaY, funcionarioX + firmaWidth, firmaY)
    pdf.text("Firma del Funcionario", funcionarioX, currentYFuncionario)
    currentYFuncionario += 5
    
    if (funcionarioNombre && funcionarioNombre.trim() !== '') {
      pdf.text(funcionarioNombre, funcionarioX, currentYFuncionario)
      currentYFuncionario += 5
    }
    
    if (funcionarioDni && funcionarioDni.trim() !== '') {
      pdf.text(`DNI: ${funcionarioDni}`, funcionarioX, currentYFuncionario)
    }

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
