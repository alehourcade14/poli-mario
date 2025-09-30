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
        COALESCE(td.nombre, 'Delito no especificado') as tipo_delito_nombre,
        u.nombre || ' ' || u.apellido as creador_nombre,
        COALESCE(df.departamento_hecho, 'División de Robos y Hurtos') as division
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

    const denuncia = result.rows[0]
    console.log('🔍 API Denuncias Formales - Datos devueltos:', {
      id: denuncia.id,
      tipo_delito_nombre: denuncia.tipo_delito_nombre,
      tipo_delito_id: denuncia.tipo_delito_id,
      division: denuncia.division,
      departamento_nombre: denuncia.departamento_nombre
    })

    return new NextResponse(JSON.stringify(denuncia), {
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
    if (data.estado_nombre) {
      const estadoResult = await query('SELECT id FROM estados_denuncias WHERE nombre = $1', [data.estado_nombre])
      estadoId = estadoResult.rows[0]?.id
    }

    // Obtener departamento si se proporciona
    let departamentoId = null
    if (data.departamento_nombre) {
      const deptResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [data.departamento_nombre])
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
        tipo_delito_id = COALESCE($6, tipo_delito_id),
        departamento_id = COALESCE($7, departamento_id),
        division = COALESCE($8, division),
        descripcion = COALESCE($9, descripcion),
        estado_id = COALESCE($10, estado_id),
        fecha_denuncia = COALESCE($11, fecha_denuncia),
        hora_denuncia = COALESCE($12, hora_denuncia),
        fecha_hecho = COALESCE($13, fecha_hecho),
        hora_hecho = COALESCE($14, hora_hecho),
        lugar_hecho = COALESCE($15, lugar_hecho),
        latitud = COALESCE($16, latitud),
        longitud = COALESCE($17, longitud),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      params.id,
      data.numero_expediente,
      data.denunciante_nombre,
      data.denunciante_apellido,
      data.denunciante_dni,
      tipoDelitoId,
      departamentoId,
      data.division,
      data.descripcion,
      estadoId,
      data.fecha_denuncia,
      data.hora_denuncia,
      data.fecha_hecho,
      data.hora_hecho,
      data.lugar_hecho,
      data.latitud,
      data.longitud
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

    // Solo administradores pueden eliminar
    if (decoded.rol !== 'administrador') {
      return new NextResponse(JSON.stringify({ error: 'No autorizado para eliminar denuncias' }), { status: 403 })
    }

    const result = await query('DELETE FROM denuncias_formales WHERE id = $1 RETURNING id', [params.id])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Denuncia formal no encontrada' }), { status: 404 })
    }

    return new NextResponse(JSON.stringify({ success: true }), {
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