import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken, hashPassword } from '@/lib/auth'

export async function PUT(
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

    // Solo administradores pueden actualizar usuarios
    if (decoded.rol !== 'admin' && decoded.rol !== 'administrador') {
      return new NextResponse(JSON.stringify({ error: 'No tienes permisos para actualizar usuarios' }), { status: 403 })
    }

    const data = await request.json()

    // Verificar que el usuario existe
    const existingUser = await query('SELECT id FROM usuarios WHERE id = $1', [params.id])
    if (existingUser.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 })
    }

    // Obtener departamento_id si se proporciona
    let departamentoId = null
    if (data.departamento_nombre) {
      const deptResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [data.departamento_nombre])
      departamentoId = deptResult.rows[0]?.id
    }

    // Construir query de actualización dinámicamente
    const updateFields = []
    const values = []
    let paramCount = 1

    if (data.email) {
      updateFields.push(`email = $${paramCount}`)
      values.push(data.email)
      paramCount++
    }

    if (data.nombre) {
      updateFields.push(`nombre = $${paramCount}`)
      values.push(data.nombre)
      paramCount++
    }

    if (data.apellido) {
      updateFields.push(`apellido = $${paramCount}`)
      values.push(data.apellido)
      paramCount++
    }

    if (data.rol) {
      updateFields.push(`rol = $${paramCount}`)
      values.push(data.rol)
      paramCount++
    }

    if (departamentoId !== null) {
      updateFields.push(`departamento_id = $${paramCount}`)
      values.push(departamentoId)
      paramCount++
    }

    if (data.activo !== undefined) {
      updateFields.push(`activo = $${paramCount}`)
      values.push(data.activo)
      paramCount++
    }

    if (data.password) {
      const passwordHash = await hashPassword(data.password)
      updateFields.push(`password_hash = $${paramCount}`)
      values.push(passwordHash)
      paramCount++
    }

    if (updateFields.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'No hay campos para actualizar' }), { status: 400 })
    }

    // Agregar updated_at y el ID al final
    updateFields.push(`updated_at = NOW()`)
    values.push(params.id)

    const result = await query(`
      UPDATE usuarios 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values)

    // No devolver el hash de la contraseña
    const user = result.rows[0]
    delete user.password_hash

    return new NextResponse(JSON.stringify(user), {
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

export async function DELETE(
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

    // Solo administradores pueden eliminar usuarios
    if (decoded.rol !== 'admin' && decoded.rol !== 'administrador') {
      return new NextResponse(JSON.stringify({ error: 'No tienes permisos para eliminar usuarios' }), { status: 403 })
    }

    // No permitir eliminar al usuario actual
    if (decoded.id === params.id) {
      return new NextResponse(JSON.stringify({ error: 'No puedes eliminar tu propio usuario' }), { status: 400 })
    }

    // Verificar que el usuario existe
    const existingUser = await query('SELECT id FROM usuarios WHERE id = $1', [params.id])
    if (existingUser.rows.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404 })
    }

    // Eliminar usuario
    await query('DELETE FROM usuarios WHERE id = $1', [params.id])

    return new NextResponse(JSON.stringify({ success: true }), {
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
