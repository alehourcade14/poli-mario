import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, WidthType, Table, TableRow, TableCell } from "docx"
import { saveAs } from "file-saver"

export async function exportInformeDenunciaToDocx(denuncia: any, funcionarioEditor?: any) {
  try {
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

    // Preparar datos
    const nombreCompleto = `${toSafeString(denuncia.denunciante_nombre || denuncia.denunciante)} ${toSafeString(denuncia.denunciante_apellido || "")}`.trim()
    const fechaRegistro = denuncia.created_at ? new Date(denuncia.created_at).toLocaleDateString() : denuncia.fecha ? new Date(denuncia.fecha).toLocaleDateString() : "No registrada"
    const fechaGeneracion = new Date()

    // Crear el documento
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Encabezado
            new Paragraph({
              text: "INFORME RESUMIDO DE DENUNCIA",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),

            // Información General
            new Paragraph({
              text: "INFORMACIÓN GENERAL",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Número de Denuncia: ", bold: true }),
                new TextRun({ text: `#${toSafeString(denuncia.id)}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Fecha de Registro: " }),
                new TextRun({ text: fechaRegistro }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Estado Actual: " }),
                new TextRun({ text: toSafeString(denuncia.estado_nombre || denuncia.estado) }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Tipo de Delito: " }),
                new TextRun({ text: toSafeString(denuncia.tipo_delito_nombre || denuncia.tipo_delito || denuncia.tipo) }),
              ],
            }),
            ...(denuncia.numero_expediente
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Número de Expediente: " }),
                      new TextRun({ text: toSafeString(denuncia.numero_expediente) }),
                    ],
                  }),
                ]
              : []),

            new Paragraph({ text: "" }), // Espacio

            // Datos del Denunciante
            new Paragraph({
              text: "DATOS DEL DENUNCIANTE",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Nombre: ", bold: true }),
                new TextRun({ text: nombreCompleto }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "DNI: " }),
                new TextRun({ text: toSafeString(denuncia.denunciante_dni || denuncia.dni) }),
              ],
            }),
            ...(denuncia.lugar_hecho
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Lugar del Hecho: " }),
                      new TextRun({ text: toSafeString(denuncia.lugar_hecho) }),
                    ],
                  }),
                ]
              : []),

            new Paragraph({ text: "" }), // Espacio

            // Departamento Asignado
            new Paragraph({
              text: "DEPARTAMENTO ASIGNADO",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Departamento: " }),
                new TextRun({ text: toSafeString(denuncia.departamento_nombre || denuncia.departamento) }),
              ],
            }),
            ...(denuncia.division
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "División: " }),
                      new TextRun({ text: toSafeString(denuncia.division) }),
                    ],
                  }),
                ]
              : []),

            new Paragraph({ text: "" }), // Espacio

            // Cronología
            new Paragraph({
              text: "CRONOLOGÍA",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            ...(denuncia.fecha_hecho && denuncia.hora_hecho
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Fecha del Hecho: " }),
                      new TextRun({ text: `${toSafeString(denuncia.fecha_hecho)} a las ${toSafeString(denuncia.hora_hecho)}` }),
                    ],
                  }),
                ]
              : []),
            ...(denuncia.fecha_denuncia && denuncia.hora_denuncia
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Fecha de Denuncia: " }),
                      new TextRun({ text: `${toSafeString(denuncia.fecha_denuncia)} a las ${toSafeString(denuncia.hora_denuncia)}` }),
                    ],
                  }),
                ]
              : denuncia.created_at
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Fecha de Registro: " }),
                      new TextRun({ text: new Date(denuncia.created_at).toLocaleString() }),
                    ],
                  }),
                ]
              : []),
            ...(denuncia.updated_at
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Última Actualización: " }),
                      new TextRun({ text: new Date(denuncia.updated_at).toLocaleString() }),
                    ],
                  }),
                ]
              : []),

            new Paragraph({ text: "" }), // Espacio

            // Descripción del Hecho
            new Paragraph({
              text: "DESCRIPCIÓN DEL HECHO",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: toSafeString(denuncia.descripcion),
              spacing: { after: 200 },
            }),

            // Ubicación si existe
            ...((denuncia.latitud && denuncia.longitud) || (denuncia.ubicacion && denuncia.ubicacion.lat && denuncia.ubicacion.lng)
              ? [
                  new Paragraph({
                    text: "UBICACIÓN",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Coordenadas: " }),
                      new TextRun({
                        text: denuncia.latitud && denuncia.longitud
                          ? `${Number(denuncia.latitud).toFixed(6)}, ${Number(denuncia.longitud).toFixed(6)}`
                          : `${denuncia.ubicacion.lat.toFixed(6)}, ${denuncia.ubicacion.lng.toFixed(6)}`,
                      }),
                    ],
                  }),
                  new Paragraph({ text: "" }), // Espacio
                ]
              : []),

            // Funcionario Responsable
            new Paragraph({
              text: "FUNCIONARIO RESPONSABLE",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Creado por: ", bold: true }),
                new TextRun({ text: toSafeString(denuncia.usuario_nombre || denuncia.creadorNombre || "Usuario del Sistema") }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Departamento: " }),
                new TextRun({
                  text: toSafeString(
                    denuncia.departamento_nombre || denuncia.creadorDepartamento || denuncia.departamento || "Departamento Cibercrimen"
                  ),
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Fecha de Creación: " }),
                new TextRun({
                  text: denuncia.created_at
                    ? new Date(denuncia.created_at).toLocaleString()
                    : denuncia.fecha
                    ? new Date(denuncia.fecha).toLocaleString()
                    : "No registrada",
                }),
              ],
            }),
            ...(funcionarioEditor && funcionarioEditor.username !== denuncia.usuario_id
              ? [
                  new Paragraph({ text: "" }), // Espacio
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Informe generado por: " }),
                      new TextRun({ text: toSafeString(funcionarioEditor.nombre || funcionarioEditor.username) }),
                    ],
                  }),
                  ...(denuncia.actualizadoPor
                    ? [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "Última modificación por: " }),
                            new TextRun({ text: toSafeString(denuncia.actualizadoPor) }),
                          ],
                        }),
                      ]
                    : []),
                ]
              : []),

            // Pie de página
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({
              text: "Sistema de Gestión Operativa - Policía de La Rioja",
              alignment: AlignmentType.CENTER,
              spacing: { before: 400 },
            }),
            new Paragraph({
              text: `Informe generado el: ${fechaGeneracion.toLocaleString()}`,
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    })

    // Generar y descargar el documento
    const blob = await Packer.toBlob(doc)
    const dniDenunciante = denuncia.denunciante_dni || denuncia.dni || "sin_dni"
    const nombreDenunciante = (denuncia.denunciante_nombre || denuncia.denunciante || "sin_nombre").replace(/\s+/g, "_")
    const fileName = `informe_denuncia_${nombreDenunciante}_DNI_${dniDenunciante}_${fechaGeneracion.toISOString().split("T")[0]}.docx`
    
    saveAs(blob, fileName)

    console.log("Informe Word generado exitosamente:", fileName)
    return true
  } catch (error) {
    console.error("Error al generar el informe Word:", error)

    let errorMessage = "Error desconocido al generar el informe"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    alert(`Error al generar el informe: ${errorMessage}`)
    return false
  }
}

