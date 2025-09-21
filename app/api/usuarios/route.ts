import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken, hashPassword } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new NextResponse(JSON.stringify({ error: 'Token inválido' }), { status: 401 })
    }

    // Solo administradores pueden ver todos los usuarios
    if (decoded.rol !== 'admin' && decoded.rol !== 'administrador') {
      return new NextResponse(JSON.stringify({ error: 'No tienes permisos para acceder a esta información' }), { status: 403 })
    }

    const result = await query(`
      SELECT 
        u.id,
        u.email,
        u.nombre,
        u.apellido,
        u.rol,
        u.activo,
        u.created_at,
        u.division,
        d.nombre as departamento_nombre
      FROM usuarios u
      LEFT JOIN departamentos d ON u.departamento_id = d.id
      ORDER BY u.created_at DESC
    `)

    return new NextResponse(JSON.stringify(result.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("Error ejecutando query:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST(request: Request) {
  try {
    const token = request.cookies.get('auth-token')?.value || request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new NextResponse(JSON.stringify({ error: 'Token inválido' }), { status: 401 })
    }

    // Solo administradores pueden crear usuarios
    if (decoded.rol !== 'admin' && decoded.rol !== 'administrador') {
      return new NextResponse(JSON.stringify({ error: 'No tienes permisos para crear usuarios' }), { status: 403 })
    }

    const data = await request.json()

    // Validar campos obligatorios
    if (!data.email || !data.password || !data.nombre || !data.apellido || !data.rol) {
      return new NextResponse(JSON.stringify({ error: 'Todos los campos son obligatorios' }), { status: 400 })
    }

    // Verificar si el email ya existe
    const existingUser = await query('SELECT id FROM usuarios WHERE email = $1', [data.email])
    if (existingUser.rows.length > 0) {
      return new NextResponse(JSON.stringify({ error: 'El email ya está registrado' }), { status: 400 })
    }

    // Obtener departamento_id si se proporciona
    let departamentoId = null
    if (data.departamento_nombre) {
      const deptResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [data.departamento_nombre])
      departamentoId = deptResult.rows[0]?.id
    }

    // Hashear la contraseña
    const passwordHash = await hashPassword(data.password)

    const result = await query(`
      INSERT INTO usuarios (
        email, password_hash, nombre, apellido, rol, departamento_id, division, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.email,
      passwordHash,
      data.nombre,
      data.apellido,
      data.rol,
      departamentoId,
      data.division || null,
      data.activo !== false // Por defecto activo
    ])

    // No devolver el hash de la contraseña
    const user = result.rows[0]
    delete user.password_hash

    return new NextResponse(JSON.stringify(user), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("Error ejecutando query:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
