import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, WidthType, Table, TableRow, TableCell, ImageRun, ExternalHyperlink, PageBreak } from "docx"
import { saveAs } from "file-saver"

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

export async function exportDenunciaFormalToDocx(denuncia: any) {
  try {
    // Validar que la denuncia tenga los datos mínimos necesarios
    if (!denuncia) {
      throw new Error("No se proporcionaron datos de la denuncia")
    }

    // Validar que la denuncia tenga un ID
    if (!denuncia.id) {
      throw new Error("La denuncia no tiene un ID válido")
    }

    console.log("🔍 Iniciando generación de Word para denuncia ID:", denuncia.id)
    console.log("📋 Datos de denuncia recibidos:", denuncia)

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

    // Preparar datos
    const sexoTexto = getSafeValue(denuncia.sexo) === "Masculino" ? "Masculino" : (getSafeValue(denuncia.sexo) === "Femenino" ? "Femenino" : "No especificado")
    const estadoCivilTexto = getSafeValue(denuncia.denunciante_estado_civil || denuncia.estadoCivil || denuncia.estado_civil, 'No especificado')
    
    // Obtener el nombre completo del denunciante de forma segura
    const nombreCompleto = `${getSafeValue(denuncia.denunciante_nombre)} ${getSafeValue(denuncia.denunciante_apellido)}`.trim()
    const nombreCompletoFinal = (nombreCompleto && 
                                 nombreCompleto !== 'No especificado No especificado' && 
                                 nombreCompleto !== 'No especificado' && 
                                 nombreCompleto.length > 0) ? nombreCompleto : 'No especificado'
    
    // Asegurar que el nombre final sea una cadena válida
    const nombreFinalSeguro = (nombreCompletoFinal && typeof nombreCompletoFinal === 'string') ? nombreCompletoFinal : 'No especificado'

    // Información del hecho
    const fechaHechoTexto = denuncia.fecha_hecho ? fechaATexto(denuncia.fecha_hecho) : 'No especificada'
    const horaHechoTexto = getSafeValue(denuncia.hora_hecho, 'No especificada')
    const lugarHechoTexto = getSafeValue(denuncia.lugar_hecho, 'No especificado')
    const tipoDelitoTexto = getSafeValue(denuncia.tipo_delito_nombre || denuncia.tipo_delito || denuncia.tipo, 'No especificado')
    const departamentoHechoTexto = getSafeValue(denuncia.departamento_hecho, 'No especificado')
    
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
    const profesion = getSafeValue(denuncia.denunciante_profesion || denuncia.profesion, 'Policía')
    const direccion = getSafeValue(denuncia.denunciante_direccion || denuncia.domicilio, 'Agüero Vera 712, F5300BDA La Rioja, Argentina')
    const barrio = getSafeValue(denuncia.barrio || denuncia.barrio_hecho || denuncia.departamento_hecho, 'No especificado')
    
    // Obtener división para usar en el texto
    const divisionValue = getSafeValue(denuncia.division || denuncia.division_nombre, 'División de Robos y Hurtos')
    const departamentoValue = getSafeValue(denuncia.departamento_nombre || denuncia.departamento, 'Departamento Cibercrimen')
    
    const datosPersonales = `${nombreFinalSeguro.toUpperCase()}, de nacionalidad ${nacionalidad}, de estado civil ${estadoCivilTexto}, con instrucción ${instruccionExtraida}, de ${edadExtraida} años de edad, D.N.I. Nº ${dni}, profesión ${profesion}, con domicilio en ${direccion} del barrio ${barrio} de esta Ciudad Capital`
    
    // Información del hecho
    const fechaHoraHecho = `${fechaHechoTexto}, siendo las horas ${horaHechoTexto}`
    const lugarHecho = `${lugarHechoTexto}, departamento de ${departamentoHechoTexto}`
    const tipoHecho = `${tipoDelitoTexto}`
    const descripcionHecho = getSafeValue(denuncia.descripcion, 'Sin descripción')
    
    // Construir el texto con formato de acta policial profesional
    const introduccion = `En la ciudad de La Rioja, capital de la provincia del mismo nombre, a los ${fechaHoraActual}, comparece por ante la Oficina de Sumarios Judiciales de ésta ${divisionValue}, dependiente de la Dirección General de Investigaciones, una persona de sexo ${sexoExtraido}, manifestando deseos de formular una denuncia, motivo por el cual se lo notifica de los términos y contenidos del ${notificacionLegal}, enterado de ello, seguidamente es interrogado por su apellido y demás circunstancias personales, dijo llamarse:`
    
    const datosPersonalesCompletos = `${datosPersonales}, quien invitado al acto, seguidamente DENUNCIA: ${descripcionHecho || 'Sin descripción'}.`
    
    const cierre = `Que es todo por lo que se da por finalizado el acto, previa lectura y ratificación, firmando al pie de la presente de conformidad por ante mí, Funcionario Policial, que CERTIFICO.`

    // Construir el texto con párrafos separados
    const textoDenuncia = `${introduccion}\n\n${datosPersonalesCompletos}\n\n${cierre}`
    const parrafos = textoDenuncia.split('\n\n').filter(p => p.trim())

    // Crear el documento
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 2.54 cm (1 inch = 1440 twips)
                right: 1440, // 2.54 cm
                bottom: 1440, // 2.54 cm
                left: 1980, // 3.5 cm (aproximadamente 35mm como en el PDF)
              },
            },
          },
          children: [
            // Encabezado
            new Paragraph({
              text: "POLICÍA DE LA PROVINCIA DE LA RIOJA",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 },
              children: [
                new TextRun({
                  text: "POLICÍA DE LA PROVINCIA DE LA RIOJA",
                  bold: true,
                  size: 32, // 16pt
                  font: "Times New Roman",
                }),
              ],
            }),
            
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 },
              children: [
                new TextRun({
                  text: "DIRECCIÓN GENERAL DE INVESTIGACIONES",
                  size: 24, // 12pt
                  font: "Times New Roman",
                }),
              ],
            }),
            
            // Departamento
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 },
              children: [
                new TextRun({
                  text: departamentoValue.toUpperCase(),
                  bold: true,
                  size: 24, // 12pt
                  font: "Times New Roman",
                }),
              ],
            }),
            
            // División
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 },
              children: [
                new TextRun({
                  text: divisionValue.toUpperCase(),
                  bold: true,
                  size: 22, // 11pt
                  font: "Times New Roman",
                }),
              ],
            }),

            // Título principal de la denuncia
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 600, after: 600 },
              children: [
                new TextRun({
                  text: `DENUNCIA FORMULADA POR EL CIUDADANO: ${nombreFinalSeguro.toUpperCase()}`,
                  bold: true,
                  size: 22, // 11pt
                  font: "Times New Roman",
                }),
              ],
            }),

            // Línea separadora
            new Paragraph({
              children: [
                new TextRun({
                  text: "________________________________________________________________________________",
                  size: 22,
                  font: "Times New Roman",
                }),
              ],
              spacing: { after: 400 },
            }),

            // Cuerpo de la denuncia con párrafos justificados
            ...parrafos.flatMap((parrafo, index) => {
              const isLast = index === parrafos.length - 1
              return [
                new Paragraph({
                  text: parrafo.trim(),
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: { 
                    after: isLast ? 0 : 320, // Espacio entre párrafos
                    before: index === 0 ? 0 : 0,
                  },
                  indent: {
                    firstLine: 720, // Sangría de primera línea (0.5 inch)
                  },
                  children: [
                    new TextRun({
                      text: parrafo.trim(),
                      size: 22, // 11pt
                      font: "Times New Roman",
                    }),
                  ],
                }),
              ]
            }),

            // Espacio para firmas
            new Paragraph({
              text: "",
              spacing: { before: 800, after: 600 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "FIRMAS:",
                  bold: true,
                  size: 22,
                  font: "Times New Roman",
                }),
              ],
              spacing: { after: 600 },
            }),

            // Líneas para firmas
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: "_________________________________________________",
                  size: 22,
                  font: "Times New Roman",
                }),
              ],
            }),

            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: "Firma del Denunciante",
                  size: 16, // 8pt
                  font: "Times New Roman",
                }),
              ],
            }),

            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: nombreFinalSeguro,
                  size: 16,
                  font: "Times New Roman",
                }),
              ],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [
                new TextRun({
                  text: `DNI: ${dni}`,
                  size: 16,
                  font: "Times New Roman",
                }),
              ],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: "_________________________________________________",
                  size: 22,
                  font: "Times New Roman",
                }),
              ],
            }),

            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: "Firma del Funcionario",
                  size: 16,
                  font: "Times New Roman",
                }),
              ],
            }),

            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: getSafeValue(denuncia.usuario_nombre || denuncia.creadorNombre, 'Funcionario'),
                  size: 16,
                  font: "Times New Roman",
                }),
              ],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [
                new TextRun({
                  text: getSafeValue(denuncia.departamento_nombre || denuncia.creadorDepartamento || denuncia.departamento, 'Departamento'),
                  size: 16,
                  font: "Times New Roman",
                }),
              ],
            }),

            // Pie de página
            new Paragraph({
              text: "",
              spacing: { before: 800 },
            }),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: "Este documento fue generado automáticamente por el Sistema de Gestión Operativa.",
                  italics: true,
                  size: 16,
                  font: "Times New Roman",
                }),
              ],
            }),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: "Policía de la Provincia de La Rioja - Dirección Gral. de Investigaciones",
                  italics: true,
                  size: 16,
                  font: "Times New Roman",
                }),
              ],
            }),

            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: `Generado el: ${fechaActualSistema.toLocaleDateString()} a las ${horaActualSistema}`,
                  italics: true,
                  size: 16,
                  font: "Times New Roman",
                }),
              ],
            }),
          ],
        },
      ],
    })

    // Generar y descargar el documento
    const blob = await Packer.toBlob(doc)
    const dniDenunciante = denuncia.denunciante_dni || denuncia.dni || "sin_dni"
    const nombreDenunciante = (denuncia.denunciante_nombre || denuncia.denunciante || "sin_nombre").replace(/\s+/g, "_")
    const fileName = `denuncia_formal_${nombreDenunciante}_DNI_${dniDenunciante}_${fechaActualSistema.toISOString().split("T")[0]}.docx`
    
    saveAs(blob, fileName)

    console.log("✅ Word de denuncia formal generado exitosamente:", fileName)
    return true
  } catch (error) {
    console.error("❌ Error al generar el Word de denuncia formal:", error)

    let errorMessage = "Error desconocido al generar el documento"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    alert(`Error al generar el documento Word: ${errorMessage}. Por favor, intente nuevamente.`)
    throw error
  }
}

