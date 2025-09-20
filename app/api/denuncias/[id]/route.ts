import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// GET - Obtener denuncia por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0]
    
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new NextResponse(JSON.stringify({ error: 'Token inválido' }), { status: 401 })
    }

    const result = await query(`
      SELECT 
        d.*,
        de.nombre as departamento_nombre,
        es.nombre as estado_nombre,
        u.nombre || ' ' || u.apellido as creador_nombre
      FROM denuncias d
      LEFT JOIN departamentos de ON d.departamento_id = de.id
      LEFT JOIN estados es ON d.estado_id = es.id
      LEFT JOIN usuarios u ON d.usuario_id = u.id
      WHERE d.id = $1
    `, [params.id])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Denuncia no encontrada' }), { status: 404 })
    }

    return new NextResponse(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al obtener denuncia:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// PUT - Actualizar denuncia
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0]
    
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new NextResponse(JSON.stringify({ error: 'Token inválido' }), { status: 401 })
    }

    const data = await request.json()
    
    // Obtener estado si se proporciona
    let estadoId = null
    if (data.estado) {
      const estadoResult = await query('SELECT id FROM estados WHERE nombre = $1', [data.estado])
      estadoId = estadoResult.rows[0]?.id
    }

    // Obtener departamento si se proporciona
    let departamentoId = null
    if (data.departamento) {
      const deptResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [data.departamento])
      departamentoId = deptResult.rows[0]?.id
    }

    const result = await query(`
      UPDATE denuncias SET
        numero_denuncia = COALESCE($2, numero_denuncia),
        denunciante_nombre = COALESCE($3, denunciante_nombre),
        denunciante_dni = COALESCE($4, denunciante_dni),
        tipo_delito = COALESCE($5, tipo_delito),
        departamento_id = COALESCE($6, departamento_id),
        division = COALESCE($7, division),
        descripcion = COALESCE($8, descripcion),
        estado_id = COALESCE($9, estado_id),
        fecha_denuncia = COALESCE($10, fecha_denuncia),
        hora_denuncia = COALESCE($11, hora_denuncia),
        fecha_hecho = COALESCE($12, fecha_hecho),
        hora_hecho = COALESCE($13, hora_hecho),
        barrio_hecho = COALESCE($14, barrio_hecho),
        num_expediente = COALESCE($15, num_expediente),
        direccion = COALESCE($16, direccion),
        ubicacion_lat = COALESCE($17, ubicacion_lat),
        ubicacion_lng = COALESCE($18, ubicacion_lng),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      params.id,
      data.numExpediente,
      data.denunciante,
      data.dni,
      data.tipo,
      departamentoId,
      data.division,
      data.descripcion,
      estadoId,
      data.fechaDenuncia,
      data.horaDenuncia,
      data.fechaHecho,
      data.horaHecho,
      data.barrioHecho,
      data.numExpediente,
      data.direccion,
      data.ubicacion?.lat,
      data.ubicacion?.lng
    ])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Denuncia no encontrada' }), { status: 404 })
    }

    return new NextResponse(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al actualizar denuncia:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// DELETE - Eliminar denuncia
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0]
    
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new NextResponse(JSON.stringify({ error: 'Token inválido' }), { status: 401 })
    }

    // Solo administradores pueden eliminar
    if (decoded.rol !== 'administrador') {
      return new NextResponse(JSON.stringify({ error: 'No autorizado para eliminar denuncias' }), { status: 403 })
    }

    const result = await query('DELETE FROM denuncias WHERE id = $1 RETURNING id', [params.id])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Denuncia no encontrada' }), { status: 404 })
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al eliminar denuncia:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
