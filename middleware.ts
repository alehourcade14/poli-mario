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
        console.log("❌ No se encontró token de autenticación, redirigiendo al login")
        return NextResponse.redirect(new URL("/", req.url))
      }

      // En desarrollo, permitir acceso si hay token
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ Token encontrado, permitiendo acceso en desarrollo")
        return res
      }

      // En producción, aquí iría la verificación JWT real
      return res

    } catch (error) {
      console.error("❌ Error verificando autenticación:", error)
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*"]
}
