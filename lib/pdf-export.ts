import jsPDF from "jspdf"

export const exportToPDF = (title: string, header: string[], data: string[][], fileName: string) => {
  // Usar fecha y hora actual del sistema para todos los documentos generados
  const fechaActualSistema = new Date()
  const fechaGeneracion = fechaActualSistema.toLocaleDateString()
  const horaGeneracion = fechaActualSistema.toTimeString().slice(0, 5)

  const pdf = new jsPDF()

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const marginSide = 10
  let yPosition = 20

  // Título
  pdf.setFontSize(20)
  pdf.text(title, pageWidth / 2, yPosition, { align: "center" })
  yPosition += 20

  // Fecha de generación
  pdf.setFontSize(10)
  pdf.text(`Fecha de generación: ${fechaGeneracion} - ${horaGeneracion}`, marginSide, yPosition)
  yPosition += 10

  // Encabezado de la tabla
  pdf.setFontSize(12)
  let xPosition = marginSide
  const columnWidth = (pageWidth - 2 * marginSide) / header.length

  header.forEach((columnTitle) => {
    pdf.text(columnTitle, xPosition, yPosition)
    xPosition += columnWidth
  })
  yPosition += 10

  // Datos de la tabla
  pdf.setFontSize(10)
  data.forEach((row) => {
    xPosition = marginSide
    row.forEach((cellValue) => {
      pdf.text(cellValue, xPosition, yPosition)
      xPosition += columnWidth
    })
    yPosition += 10

    // Si la posición vertical excede el límite, agregar una nueva página
    if (yPosition > pageHeight - 20) {
      pdf.addPage()
      yPosition = 20

      // Volver a imprimir el encabezado en la nueva página
      pdf.setFontSize(12)
      xPosition = marginSide
      header.forEach((columnTitle) => {
        pdf.text(columnTitle, xPosition, yPosition)
        xPosition += columnWidth
      })
      yPosition += 10
    }
  })

  // Pie de página
  pdf.setFontSize(8)
  pdf.text(
    `Documento generado automáticamente el ${fechaGeneracion} a las ${horaGeneracion}`,
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" },
  )

  pdf.save(`${fileName}.pdf`)
}
