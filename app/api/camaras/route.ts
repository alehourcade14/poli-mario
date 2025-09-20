import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// GET - Obtener todas las cámaras
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
        c.*,
        de.nombre as departamento_nombre
      FROM camaras c
      LEFT JOIN departamentos de ON c.departamento_id = de.id
      ORDER BY c.ubicacion
    `)

    return new NextResponse(JSON.stringify(result.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al obtener cámaras:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// POST - Crear nueva cámara
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
    if (data.comisaria) {
      const deptResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [data.comisaria])
      departamentoId = deptResult.rows[0]?.id
    }

    const result = await query(`
      INSERT INTO camaras (
        numero_camara, tipo_camara, ubicacion, direccion, latitud, longitud,
        estado, fecha_instalacion, ultima_revision, descripcion, departamento_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      data.numeroCamara || `CAM-${Date.now()}`,
      data.tipo,
      data.ubicacion,
      data.direccion || data.ubicacion,
      data.lat || null,
      data.lng || null,
      data.estado || 'Activa',
      data.fechaInstalacion || new Date().toISOString().split('T')[0],
      data.ultimaRevision || new Date().toISOString().split('T')[0],
      data.descripcion || `Cámara ${data.tipo === "F" ? "Fija" : "Domo"} ubicada en ${data.ubicacion}`,
      departamentoId
    ])

    return new NextResponse(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al crear cámara:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
