import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Headers de seguridad
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Verificar rutas protegidas
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    try {
      // Obtener token de las cookies
      const token = req.cookies.get('auth-token')?.value

      if (!token) {
        return NextResponse.redirect(new URL("/", req.url))
      }

      // Para desarrollo, simplemente verificar que existe el token
      // En producción, deberías implementar una verificación más robusta
      if (process.env.NODE_ENV === 'development') {
        // En desarrollo, permitir acceso si hay token
        return res
      }

      // En producción, aquí iría la verificación JWT real
      return res

    } catch (error) {
      console.error("Error verificando autenticación:", error)
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*"]
}
