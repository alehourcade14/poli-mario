"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useIdleTimer } from "@/hooks/use-idle-timer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface IdleSessionManagerProps {
  children: React.ReactNode
}

export default function IdleSessionManager({ children }: IdleSessionManagerProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const router = useRouter()

  // Timer para advertencia (19 minutos)
  const warningTimer = useIdleTimer({
    timeout: 19 * 60 * 1000, // 19 minutos
    onIdle: () => {
      setShowWarning(true)
      setCountdown(60)
    },
  })

  // Timer para cierre automático (20 minutos)
  const logoutTimer = useIdleTimer({
    timeout: 20 * 60 * 1000, // 20 minutos
    onIdle: () => {
      handleLogout()
    },
  })

  // Countdown para el modal de advertencia
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (showWarning && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showWarning, countdown])

  const handleContinueSession = () => {
    setShowWarning(false)
    setCountdown(60)
    warningTimer.reset()
    logoutTimer.reset()
  }

  const handleLogout = () => {
    // Limpiar datos de sesión
    localStorage.clear()
    sessionStorage.clear()

    // Redirigir al login
    router.push("/")
  }

  return (
    <>
      {children}

      <Dialog open={showWarning} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Sesión por Expirar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">Su sesión expirará por inactividad en:</p>

            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{countdown}</div>
              <p className="text-sm text-gray-500">segundos</p>
            </div>

            <p className="text-sm text-gray-600">¿Desea continuar con su sesión?</p>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
              >
                Cerrar Sesión
              </Button>
              <Button onClick={handleContinueSession} className="bg-amber-500 hover:bg-amber-600 text-white">
                Continuar Sesión
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
