"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function AmpliacionDenuncia() {
  const { user, loading } = useCurrentUser()
  const [denuncia, setDenuncia] = useState<any>(null)
  const [ampliacion, setAmpliacion] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loadingDenuncia, setLoadingDenuncia] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/")
      return
    }

    // Cargar denuncia desde la API
    const fetchDenuncia = async () => {
      try {
        const response = await fetch(`/api/denuncias/${id}`, {
          method: 'GET',
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Denuncia no encontrada')
        }

        const data = await response.json()
        setDenuncia(data)
      } catch (error) {
        console.error("Error al cargar denuncia:", error)
        setError("Error al cargar la denuncia")
        router.push("/dashboard/denuncias")
      } finally {
        setLoadingDenuncia(false)
      }
    }

    fetchDenuncia()
  }, [id, router, user, loading])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAmpliacion(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validar campos
    if (!ampliacion.trim()) {
      setError("El campo de ampliación no puede estar vacío")
      return
    }

    try {
      const response = await fetch(`/api/denuncias/${id}/ampliacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ampliacion: ampliacion.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al agregar ampliación')
      }

      setSuccess(true)

      // Redireccionar después de 2 segundos
      setTimeout(() => {
        router.push(`/dashboard/denuncia/${id}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Error al actualizar la denuncia")
      console.error(err)
    }
  }

  if (loading || loadingDenuncia) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Cargando denuncia...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !denuncia) return null

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard/denuncias")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Ampliación de Denuncia #{denuncia.id}</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Ampliación de Denuncia</CardTitle>
            <CardDescription>Agregue información adicional a la denuncia de {denuncia.denunciante_nombre} {denuncia.denunciante_apellido}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>Ampliación registrada correctamente. Redirigiendo...</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="descripcionOriginal">Descripción Original</Label>
                <Textarea
                  id="descripcionOriginal"
                  rows={5}
                  value={denuncia.descripcion}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ampliacion">Ampliación</Label>
                <Textarea
                  id="ampliacion"
                  rows={5}
                  value={ampliacion}
                  onChange={handleChange}
                  placeholder="Ingrese la información adicional para esta denuncia..."
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/denuncia/${id}`)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Ampliación</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}

