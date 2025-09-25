"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión')
        return
      }

      if (data.success) {
        // Guardar usuario en localStorage
        localStorage.setItem("currentUser", JSON.stringify(data.user))
        
        // Manejar "Recordame" (mantener en localStorage)
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email)
        } else {
          localStorage.removeItem("rememberedEmail")
        }

        // Redirigir según el rol
        if (data.user.rol === "operador") {
          router.push("/dashboard/operador")
        } else {
          router.push("/dashboard")
        }
      } else {
        setError(data.error || 'Error al iniciar sesión')
      }
    } catch (err) {
      setError("Error de conexión. Verifica que el servidor esté funcionando.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          
          className="bg-white dark:bg-gray-700"
          placeholder="tu@email.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          
          className="bg-white dark:bg-gray-700"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          id="remember"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
        />
        <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
          Recordarme
        </Label>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-amber-500 hover:bg-amber-600 text-black dark:text-white"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </Button>
    </form>
  )
}
