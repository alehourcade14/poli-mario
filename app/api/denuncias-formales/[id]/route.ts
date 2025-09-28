import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// GET - Obtener denuncia formal por ID
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
        df.*,
        de.nombre as departamento_nombre,
        es.nombre as estado_nombre,
        td.nombre as tipo_delito,
        u.nombre || ' ' || u.apellido as creador_nombre
      FROM denuncias_formales df
      LEFT JOIN departamentos de ON df.departamento_id = de.id
      LEFT JOIN estados_denuncias es ON df.estado_id = es.id
      LEFT JOIN tipos_delitos td ON df.tipo_delito_id = td.id
      LEFT JOIN usuarios u ON df.usuario_id = u.id
      WHERE df.id = $1
    `, [params.id])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Denuncia formal no encontrada' }), { status: 404 })
    }

    return new NextResponse(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al obtener denuncia formal:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// PUT - Actualizar denuncia formal
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
      const estadoResult = await query('SELECT id FROM estados_denuncias WHERE nombre = $1', [data.estado])
      estadoId = estadoResult.rows[0]?.id
    }

    // Obtener departamento si se proporciona
    let departamentoId = null
    if (data.departamento) {
      const deptResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [data.departamento])
      departamentoId = deptResult.rows[0]?.id
    }

    // Obtener tipo de delito si se proporciona
    let tipoDelitoId = null
    if (data.tipo_delito) {
      const tipoResult = await query('SELECT id FROM tipos_delitos WHERE nombre = $1', [data.tipo_delito])
      tipoDelitoId = tipoResult.rows[0]?.id
    }

    const result = await query(`
      UPDATE denuncias_formales SET
        numero_expediente = COALESCE($2, numero_expediente),
        denunciante_nombre = COALESCE($3, denunciante_nombre),
        denunciante_apellido = COALESCE($4, denunciante_apellido),
        denunciante_dni = COALESCE($5, denunciante_dni),
        denunciante_telefono = COALESCE($6, denunciante_telefono),
        denunciante_email = COALESCE($7, denunciante_email),
        denunciante_direccion = COALESCE($8, denunciante_direccion),
        denunciante_nacionalidad = COALESCE($9, denunciante_nacionalidad),
        denunciante_estado_civil = COALESCE($10, denunciante_estado_civil),
        denunciante_profesion = COALESCE($11, denunciante_profesion),
        fecha_hecho = COALESCE($12, fecha_hecho),
        hora_hecho = COALESCE($13, hora_hecho),
        lugar_hecho = COALESCE($14, lugar_hecho),
        departamento_hecho = COALESCE($15, departamento_hecho),
        latitud = COALESCE($16, latitud),
        longitud = COALESCE($17, longitud),
        descripcion = COALESCE($18, descripcion),
        circunstancias = COALESCE($19, circunstancias),
        testigos = COALESCE($20, testigos),
        elementos_sustraidos = COALESCE($21, elementos_sustraidos),
        valor_estimado = COALESCE($22, valor_estimado),
        denunciado_nombre = COALESCE($23, denunciado_nombre),
        denunciado_apellido = COALESCE($24, denunciado_apellido),
        denunciado_dni = COALESCE($25, denunciado_dni),
        denunciado_descripcion = COALESCE($26, denunciado_descripcion),
        tipo_delito_id = COALESCE($27, tipo_delito_id),
        estado_id = COALESCE($28, estado_id),
        departamento_id = COALESCE($29, departamento_id),
        observaciones = COALESCE($30, observaciones),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      params.id,
      data.numero_expediente,
      data.denunciante_nombre,
      data.denunciante_apellido,
      data.denunciante_dni,
      data.denunciante_telefono,
      data.denunciante_email,
      data.denunciante_direccion,
      data.denunciante_nacionalidad,
      data.denunciante_estado_civil,
      data.denunciante_profesion,
      data.fecha_hecho,
      data.hora_hecho,
      data.lugar_hecho,
      data.departamento_hecho,
      data.latitud,
      data.longitud,
      data.descripcion,
      data.circunstancias,
      data.testigos,
      data.elementos_sustraidos,
      data.valor_estimado,
      data.denunciado_nombre,
      data.denunciado_apellido,
      data.denunciado_dni,
      data.denunciado_descripcion,
      tipoDelitoId,
      estadoId,
      departamentoId,
      data.observaciones
    ])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Denuncia formal no encontrada' }), { status: 404 })
    }

    return new NextResponse(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al actualizar denuncia formal:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// DELETE - Eliminar denuncia formal
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

    // Solo administradores pueden eliminar denuncias
    if (decoded.rol !== 'admin' && decoded.rol !== 'administrador') {
      return new NextResponse(JSON.stringify({ error: 'No tienes permisos para eliminar denuncias' }), { status: 403 })
    }

    const result = await query('DELETE FROM denuncias_formales WHERE id = $1 RETURNING *', [params.id])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Denuncia formal no encontrada' }), { status: 404 })
    }

    return new NextResponse(JSON.stringify({ message: 'Denuncia formal eliminada correctamente' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al eliminar denuncia formal:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
