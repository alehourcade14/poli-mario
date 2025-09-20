import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// GET - Obtener todas las denuncias
export async function GET(request: Request) {
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
        d.id,
        d.numero_expediente,
        d.numero_denuncia,
        d.denunciante_nombre,
        d.denunciante_apellido,
        d.denunciante_dni,
        d.denunciante_telefono,
        d.denunciante_email,
        d.denunciante_direccion,
        d.fecha_hecho,
        d.hora_hecho,
        d.lugar_hecho,
        d.departamento_hecho,
        d.latitud,
        d.longitud,
        d.descripcion,
        d.tipo_delito,
        d.division,
        d.barrio_hecho,
        d.num_expediente,
        d.direccion,
        d.ubicacion_lat,
        d.ubicacion_lng,
        d.fecha_denuncia,
        d.hora_denuncia,
        d.observaciones,
        d.archivos_adjuntos,
        d.created_at,
        d.updated_at,
        de.nombre as departamento_nombre,
        es.nombre as estado_nombre,
        u.nombre || ' ' || u.apellido as creador_nombre
      FROM denuncias d
      LEFT JOIN departamentos de ON d.departamento_id = de.id
      LEFT JOIN estados es ON d.estado_id = es.id
      LEFT JOIN usuarios u ON d.usuario_id = u.id
      ORDER BY d.created_at DESC
    `)

    return new NextResponse(JSON.stringify(result.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al obtener denuncias:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// POST - Crear nueva denuncia
export async function POST(request: Request) {
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
    
    // Obtener estado por defecto (Consulta)
    const estadoResult = await query('SELECT id FROM estados WHERE nombre = $1', ['Consulta'])
    const estadoId = estadoResult.rows[0]?.id || '2d169b08-1bdb-4f56-acf6-4dc3ba4e92f5' // ID del estado Consulta

    // Obtener departamento si existe
    let departamentoId = null
    if (data.departamento) {
      const deptResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [data.departamento])
      departamentoId = deptResult.rows[0]?.id
    }

    const result = await query(`
      INSERT INTO denuncias (
        numero_expediente, numero_denuncia, denunciante_nombre, denunciante_apellido,
        denunciante_dni, denunciante_telefono, denunciante_email, denunciante_direccion,
        fecha_hecho, hora_hecho, lugar_hecho, departamento_hecho, latitud, longitud,
        descripcion, tipo_delito, estado_id, departamento_id, usuario_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      data.numero_expediente || `EXP-${Date.now()}`,
      data.numero_denuncia || `DEN-${Date.now()}`,
      data.denunciante_nombre,
      data.denunciante_apellido,
      data.denunciante_dni,
      data.denunciante_telefono,
      data.denunciante_email,
      data.denunciante_direccion,
      data.fecha_hecho,
      data.hora_hecho,
      data.lugar_hecho,
      data.departamento_hecho,
      data.latitud || null,
      data.longitud || null,
      data.descripcion,
      data.tipo_delito,
      estadoId,
      departamentoId,
      decoded.id
    ])

    return new NextResponse(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al crear denuncia:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
