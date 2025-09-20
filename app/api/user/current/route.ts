import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// GET - Obtener usuario actual
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
        u.id, u.email, u.nombre, u.apellido, u.dni, u.telefono,
        u.rol, u.activo, u.ultimo_acceso, u.created_at,
        d.nombre as departamento_nombre, d.id as departamento_id
      FROM usuarios u
      LEFT JOIN departamentos d ON u.departamento_id = d.id
      WHERE u.id = $1
    `, [decoded.id])

    if (result.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 })
    }

    const user = result.rows[0]
    
    // Actualizar último acceso
    await query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1', [decoded.id])

    // Formatear respuesta para compatibilidad con el frontend
    const userFormatted = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      username: user.email.split('@')[0], // Para compatibilidad
      dni: user.dni,
      telefono: user.telefono,
      rol: user.rol,
      departamento: user.departamento_nombre,
      departamento_id: user.departamento_id,
      activo: user.activo,
      ultimo_acceso: user.ultimo_acceso,
      created_at: user.created_at
    }

    return new NextResponse(JSON.stringify(userFormatted), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al obtener usuario actual:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
