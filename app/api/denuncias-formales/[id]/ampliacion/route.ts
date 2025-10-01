import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new NextResponse(JSON.stringify({ error: 'Token inválido' }), { status: 401 })
    }

    const { ampliacion } = await request.json()

    if (!ampliacion || !ampliacion.trim()) {
      return new NextResponse(JSON.stringify({ error: 'La ampliación no puede estar vacía' }), { status: 400 })
    }

    // Obtener la denuncia formal actual
    const denunciaResult = await query(`
      SELECT df.*, u.nombre as usuario_nombre 
      FROM denuncias_formales df 
      LEFT JOIN usuarios u ON df.usuario_id = u.id 
      WHERE df.id = $1
    `, [params.id])

    if (denunciaResult.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Denuncia formal no encontrada' }), { status: 404 })
    }

    const denuncia = denunciaResult.rows[0]

    // Formatear la ampliación con fecha y usuario
    const fechaActual = new Date().toLocaleDateString()
    const textoAmpliacion = `

--- AMPLIACIÓN (${fechaActual}) por ${decoded.nombre || 'Usuario'} ---
${ampliacion.trim()}`

    // Actualizar la descripción de la denuncia formal
    const result = await query(`
      UPDATE denuncias_formales 
      SET descripcion = descripcion || $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [textoAmpliacion, params.id])

    return new NextResponse(JSON.stringify({
      success: true,
      denuncia: result.rows[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("Error al agregar ampliación a denuncia formal:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
