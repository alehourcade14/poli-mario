import LoginForm from "@/components/login-form"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 dark:bg-gray-950 relative">
      {/* Fondo con overlay */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 z-0"></div>

      {/* Imagen de fondo digital */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/network-background.jpeg"
          alt="Fondo digital de seguridad"
          fill
          className="object-cover opacity-40"
          priority
        />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo-policia-investigaciones.png"
              alt="Logo Policía Investigaciones"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema de Gestión Operativa</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Policía de la Provincia de La Rioja</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Dirección Gral. de Investigaciones</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
