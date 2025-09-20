import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const authResult = await authenticateUser(email, password)

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: authResult.user!.id,
        email: authResult.user!.email,
        nombre: authResult.user!.nombre,
        apellido: authResult.user!.apellido,
        rol: authResult.user!.rol,
        departamento_id: authResult.user!.departamento_id
      }
    })

    // Configurar cookie con token
    response.cookies.set('auth-token', authResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    })

    return response
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
