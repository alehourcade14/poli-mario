"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, CheckCircle } from "lucide-react"
import { exportDenunciaFormalToPDF } from "@/lib/pdf-denuncia-formal"
import { exportCertificadoDenuncia } from "@/lib/pdf-certificado-denuncia"
import { exportEntregaRodadoToPDF } from "@/lib/pdf-entrega-rodado"

export default function PruebasPDFPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [generated, setGenerated] = useState<string[]>([])

  // Datos de prueba para denuncia formal
  const denunciaPrueba = {
    id: "TEST-001",
    denunciante: "Juan Carlos Pérez González",
    dni: "12.345.678",
    edad: 35,
    sexo: "Masculino",
    estadoCivil: "Casado",
    nacionalidad: "Argentina",
    instruccion: "Secundario Completo",
    profesion: "Comerciante",
    domicilio: "Av. San Nicolás de Bari 1234",
    barrio: "Centro",
    fechaDenuncia: "2025-01-02",
    horaDenuncia: "14:30",
    departamento: "División Investigaciones",
    division: "Oficina de Sumarios Judiciales",
    tipo: "Robo",
    descripcion:
      "Que el día de la fecha, siendo aproximadamente las 13:00 horas, cuando se encontraba caminando por la calle Rivadavia al 800, fue abordado por dos sujetos de sexo masculino, quienes mediante amenazas con arma blanca le sustrajeron su teléfono celular marca Samsung Galaxy A54, color negro, IMEI 123456789012345, valorado en la suma de $150.000, su billetera conteniendo $25.000 en efectivo, documentos personales y tarjetas de crédito. Los sujetos se dieron a la fuga con rumbo desconocido. Que reconocería a los autores si los volviera a ver. Que no posee más datos para aportar a la presente investigación.",
    creadorNombre: "Comisario Inspector María Elena Rodríguez",
    creadorDepartamento: "División Investigaciones - Oficina de Sumarios Judiciales",
    numExpediente: "EXP-2025-001234",
  }

  // Datos de prueba para entrega de rodado
  const entregaPrueba = {
    id: "ENT-001",
    fechaEntrega: "2025-01-02",
    horaEntrega: "15:45",
    depositario: "Carlos Alberto Fernández",
    dniDepositario: "87.654.321",
    domicilioDepositario: "Calle Los Álamos 567, Barrio Jardín",
    telefonoDepositario: "380-4567890",
    propietario: "Ana María López",
    dniPropietario: "11.222.333",
    domicilioPropietario: "Av. Perón 1890, Centro",
    telefonoPropietario: "380-1234567",
    datosRodado:
      "Vehículo Marca: FORD, Modelo: FIESTA KINETIC, Año: 2018, Color: BLANCO, Dominio: ABC123, Motor Nº: 456789123, Chasis Nº: 9BFZXXEEBXJB123456. Estado general: Bueno, con algunos rayones menores en la puerta del conductor. Combustible: 1/4 de tanque. Documentación: Cédula Verde presente.",
    dominio: "ABC123",
    expediente: "EXP-2025-001234",
    juzgado: "Juzgado de Instrucción en lo Criminal y Correccional Nº 1",
    secretaria: "Secretaría Nº 2",
    funcionarioEntrega: "Comisario Inspector Roberto Martínez",
    departamentoFuncionario: "División Investigaciones",
  }

  const handleGeneratePDF = async (tipo: string) => {
    setLoading(tipo)
    try {
      switch (tipo) {
        case "denuncia":
          await exportDenunciaFormalToPDF(denunciaPrueba)
          break
        case "certificado":
          await exportCertificadoDenuncia(denunciaPrueba)
          break
        case "entrega":
          await exportEntregaRodadoToPDF(entregaPrueba)
          break
      }
      setGenerated((prev) => [...prev, tipo])
    } catch (error) {
      console.error(`Error generando PDF ${tipo}:`, error)
      alert(`Error al generar el PDF de ${tipo}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pruebas de PDFs - Verificación de Justificación</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Denuncia Formal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Denuncia Formal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Denunciante:</strong> {denunciaPrueba.denunciante}
              </p>
              <p>
                <strong>Tipo:</strong> {denunciaPrueba.tipo}
              </p>
              <p>
                <strong>Fecha:</strong> {denunciaPrueba.fechaDenuncia}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded text-xs">
              <strong>Verificar:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Texto principal justificado</li>
                <li>Márgenes de 20mm</li>
                <li>Fuente Times Roman</li>
                <li>Espaciado uniforme</li>
              </ul>
            </div>
            <Button onClick={() => handleGeneratePDF("denuncia")} disabled={loading === "denuncia"} className="w-full">
              {loading === "denuncia" ? (
                "Generando..."
              ) : generated.includes("denuncia") ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Regenerar PDF
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar PDF de Prueba
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Certificado de Denuncia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Certificado de Denuncia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Denunciante:</strong> {denunciaPrueba.denunciante}
              </p>
              <p>
                <strong>Expediente:</strong> {denunciaPrueba.numExpediente}
              </p>
              <p>
                <strong>Departamento:</strong> {denunciaPrueba.departamento}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded text-xs">
              <strong>Verificar:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Texto certificado justificado</li>
                <li>Formato oficial</li>
                <li>Alineación centrada en títulos</li>
                <li>Firma del funcionario</li>
              </ul>
            </div>
            <Button
              onClick={() => handleGeneratePDF("certificado")}
              disabled={loading === "certificado"}
              className="w-full"
            >
              {loading === "certificado" ? (
                "Generando..."
              ) : generated.includes("certificado") ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Regenerar PDF
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar PDF de Prueba
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Entrega de Rodado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Entrega de Elemento/Rodado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Depositario:</strong> {entregaPrueba.depositario}
              </p>
              <p>
                <strong>Dominio:</strong> {entregaPrueba.dominio}
              </p>
              <p>
                <strong>Fecha:</strong> {entregaPrueba.fechaEntrega}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded text-xs">
              <strong>Verificar:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Formato mejorado</li>
                <li>Manejo de errores</li>
                <li>Campo dominio opcional</li>
                <li>Terminología actualizada</li>
              </ul>
            </div>
            <Button onClick={() => handleGeneratePDF("entrega")} disabled={loading === "entrega"} className="w-full">
              {loading === "entrega" ? (
                "Generando..."
              ) : generated.includes("entrega") ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Regenerar PDF
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generar PDF de Prueba
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instrucciones de verificación */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de Verificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Aspectos a Verificar:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Justificación:</strong> El texto principal debe estar alineado tanto a izquierda como a
                  derecha
                </li>
                <li>
                  <strong>Márgenes:</strong> 20mm de margen en ambos lados
                </li>
                <li>
                  <strong>Fuente:</strong> Times Roman para apariencia profesional
                </li>
                <li>
                  <strong>Espaciado:</strong> Uniforme entre palabras y líneas
                </li>
                <li>
                  <strong>Última línea:</strong> No justificada (alineada a la izquierda)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Datos de Prueba Incluidos:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Texto largo para verificar justificación</li>
                <li>Caracteres especiales y acentos</li>
                <li>Números y fechas</li>
                <li>Párrafos de diferentes longitudes</li>
                <li>Información completa para todos los campos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
