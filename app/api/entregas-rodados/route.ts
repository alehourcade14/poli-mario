import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// GET - Obtener todas las entregas de rodados
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
        e.*,
        de.nombre as departamento_nombre,
        u.nombre || ' ' || u.apellido as creador_nombre
      FROM entregas_rodados e
      LEFT JOIN departamentos de ON e.departamento_id = de.id
      LEFT JOIN usuarios u ON e.usuario_id = u.id
      ORDER BY e.created_at DESC
    `)

    return new NextResponse(JSON.stringify(result.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al obtener entregas de rodados:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// POST - Crear nueva entrega de rodado
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
    
    // Obtener departamento si existe
    let departamentoId = null
    if (data.departamento) {
      const deptResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [data.departamento])
      departamentoId = deptResult.rows[0]?.id
    }

    const insertValues = [
      data.numero_acta || `ACT-${Date.now()}`,
      data.propietario_nombre || '',
      data.propietario_apellido || '',
      data.propietario_dni || '',
      data.propietario_telefono || null,
      data.propietario_direccion || null,
      data.tipo_vehiculo || 'Vehiculo',
      data.marca || null,
      data.modelo || null,
      data.año || null,
      data.color || null,
      data.patente || '',
      data.numero_motor || null,
      data.numero_chasis || null,
      data.fecha_entrega,
      data.hora_entrega,
      data.lugar_entrega || 'Comisaría',
      data.motivo_entrega || 'Entrega por orden judicial',
      data.estado_vehiculo || null,
      data.observaciones || null,
      data.funcionario_entrega || '',
      data.rango_funcionario || 'Oficial',
      departamentoId,
      decoded.id
    ]
    
    const result = await query(`
      INSERT INTO entregas_rodados (
        numero_acta, propietario_nombre, propietario_apellido, propietario_dni,
        propietario_telefono, propietario_direccion, tipo_vehiculo, marca,
        modelo, "aÃ±o", color, patente, numero_motor, numero_chasis,
        fecha_entrega, hora_entrega, lugar_entrega, motivo_entrega,
        estado_vehiculo, observaciones, funcionario_entrega, rango_funcionario,
        departamento_id, usuario_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `, insertValues)

    return new NextResponse(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al crear entrega de rodado:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
