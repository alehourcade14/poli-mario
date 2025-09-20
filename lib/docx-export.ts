export function exportToDocx(denuncias: any[]) {
  // Crear contenido del documento
  let content = `
SISTEMA DE GESTIÓN DE DENUNCIAS
REPORTE DE DENUNCIAS
Fecha de generación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

`

  // Agregar cada denuncia
  denuncias.forEach((denuncia, index) => {
    content += `
DENUNCIA #${denuncia.id}
-----------------------------------------
Denunciante: ${denuncia.denunciante}
DNI: ${denuncia.dni || "No registrado"}
Tipo: ${denuncia.tipo}
Departamento: ${denuncia.departamento}
División: ${denuncia.division || "No asignada"}
Fecha: ${new Date(denuncia.fecha).toLocaleDateString()}
Estado: ${denuncia.estado}
Creado por: ${denuncia.creadorNombre} (${denuncia.creadorDepartamento})

DESCRIPCIÓN:
${denuncia.descripcion}

${index < denuncias.length - 1 ? "\n\n" : ""}`
  })

  // Crear blob y descargar
  const blob = new Blob([content], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `denuncias_${new Date().toISOString().split("T")[0]}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
