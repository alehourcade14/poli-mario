import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// GET - Obtener entrega de rodado por ID
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
        e.*,
        de.nombre as departamento_nombre,
        u.nombre || ' ' || u.apellido as creador_nombre
      FROM entregas_rodados e
      LEFT JOIN departamentos de ON e.departamento_id = de.id
      LEFT JOIN usuarios u ON e.usuario_id = u.id
      WHERE e.id = $1
    `, [params.id])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Entrega de rodado no encontrada' }), { status: 404 })
    }

    return new NextResponse(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al obtener entrega de rodado:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// PUT - Actualizar entrega de rodado
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
    
    // Obtener departamento si se proporciona
    let departamentoId = null
    if (data.departamento) {
      const deptResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [data.departamento])
      departamentoId = deptResult.rows[0]?.id
    }

    const result = await query(`
      UPDATE entregas_rodados SET
        numero_acta = COALESCE($2, numero_acta),
        propietario_nombre = COALESCE($3, propietario_nombre),
        propietario_apellido = COALESCE($4, propietario_apellido),
        propietario_dni = COALESCE($5, propietario_dni),
        propietario_telefono = COALESCE($6, propietario_telefono),
        propietario_direccion = COALESCE($7, propietario_direccion),
        tipo_vehiculo = COALESCE($8, tipo_vehiculo),
        marca = COALESCE($9, marca),
        modelo = COALESCE($10, modelo),
        año = COALESCE($11, año),
        color = COALESCE($12, color),
        patente = COALESCE($13, patente),
        numero_motor = COALESCE($14, numero_motor),
        numero_chasis = COALESCE($15, numero_chasis),
        fecha_entrega = COALESCE($16, fecha_entrega),
        hora_entrega = COALESCE($17, hora_entrega),
        lugar_entrega = COALESCE($18, lugar_entrega),
        motivo_entrega = COALESCE($19, motivo_entrega),
        estado_vehiculo = COALESCE($20, estado_vehiculo),
        observaciones = COALESCE($21, observaciones),
        funcionario_entrega = COALESCE($22, funcionario_entrega),
        rango_funcionario = COALESCE($23, rango_funcionario),
        departamento_id = COALESCE($24, departamento_id),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      params.id,
      data.numExpediente,
      data.nombreApellido?.split(' ')[0] || data.propietario_nombre,
      data.nombreApellido?.split(' ').slice(1).join(' ') || data.propietario_apellido,
      data.dni,
      data.telefono,
      data.direccion,
      data.datosRodado?.split(' ')[0] || data.tipo_vehiculo,
      data.marca,
      data.modelo,
      data.año,
      data.color,
      data.dominio,
      data.numeroMotor,
      data.numeroChasis,
      data.fechaEntrega,
      data.horaEntrega,
      data.lugarEntrega,
      data.motivoEntrega,
      data.estadoVehiculo,
      data.observaciones,
      data.funcionarioActuante,
      data.rangoFuncionario,
      departamentoId
    ])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Entrega de rodado no encontrada' }), { status: 404 })
    }

    return new NextResponse(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al actualizar entrega de rodado:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// DELETE - Eliminar entrega de rodado
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
      return new NextResponse(JSON.stringify({ error: 'No autorizado para eliminar entregas de rodados' }), { status: 403 })
    }

    const result = await query('DELETE FROM entregas_rodados WHERE id = $1 RETURNING id', [params.id])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Entrega de rodado no encontrada' }), { status: 404 })
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al eliminar entrega de rodado:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
