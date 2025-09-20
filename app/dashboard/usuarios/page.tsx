"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Trash2, UserPlus, Key } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function Usuarios() {
  const { user, loading } = useCurrentUser()
  const [users, setUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    departamento_nombre: "",
    rol: "user",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [resetPasswordData, setResetPasswordData] = useState({
    userId: "",
    newPassword: "",
  })
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/")
      return
    }

    // Verificar si es administrador
    if (user.rol !== "admin" && user.rol !== "administrador") {
      router.push("/dashboard")
      return
    }

    // Cargar usuarios desde la API
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/usuarios', {
          method: 'GET',
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Error al cargar usuarios')
        }

        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
        setError("Error al cargar la lista de usuarios")
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [router, user, loading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validar campos
    if (!formData.email || !formData.password || !formData.nombre || !formData.apellido || !formData.rol) {
      setError("Todos los campos son obligatorios")
      return
    }

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear usuario')
      }

      const newUser = await response.json()
      setUsers([newUser, ...users])
      setSuccess(true)

      // Limpiar formulario
      setFormData({
        email: "",
        password: "",
        nombre: "",
        apellido: "",
        departamento_nombre: "",
        rol: "user",
      })

      // Cerrar diálogo
      setTimeout(() => {
        setIsDialogOpen(false)
        setSuccess(false)
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Error al crear el usuario")
      console.error(err)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar usuario')
      }

      setUsers(users.filter((u) => u.id !== userId))
    } catch (err: any) {
      setError(err.message || "Error al eliminar el usuario")
      console.error(err)
    }
  }

  const handleResetPassword = async (userId: string) => {
    setResetPasswordData({ userId, newPassword: "" })
    setIsResetPasswordDialogOpen(true)
  }

  const handleConfirmResetPassword = async () => {
    if (!resetPasswordData.newPassword) {
      setError("La nueva contraseña es obligatoria")
      return
    }

    try {
      const response = await fetch(`/api/usuarios/${resetPasswordData.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password: resetPasswordData.newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al restablecer contraseña')
      }

      setIsResetPasswordDialogOpen(false)
      setResetPasswordData({ userId: "", newPassword: "" })
      alert("Contraseña restablecida correctamente")
    } catch (err: any) {
      setError(err.message || "Error al restablecer la contraseña")
      console.error(err)
    }
  }

  if (loading || loadingUsers) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Cargando usuarios...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || (user.rol !== "admin" && user.rol !== "administrador")) return null

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>Complete el formulario para crear un nuevo usuario en el sistema</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive" className="my-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-50 text-green-800 border-green-200 my-2">
                    <AlertDescription>Usuario creado correctamente</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="col-span-3"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      className="col-span-3"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nombre" className="text-right">
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      className="col-span-3"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="apellido" className="text-right">
                      Apellido
                    </Label>
                    <Input
                      id="apellido"
                      name="apellido"
                      className="col-span-3"
                      value={formData.apellido}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="departamento_nombre" className="text-right">
                      Departamento
                    </Label>
                    <Select
                      value={formData.departamento_nombre}
                      onValueChange={(value) => handleSelectChange("departamento_nombre", value)}
                    >
                      <SelectTrigger id="departamento_nombre" className="col-span-3">
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ComisarÃ­a Central">ComisarÃ­a Central</SelectItem>
                        <SelectItem value="ComisarÃ­a Norte">ComisarÃ­a Norte</SelectItem>
                        <SelectItem value="ComisarÃ­a Sur">ComisarÃ­a Sur</SelectItem>
                        <SelectItem value="ComisarÃ­a Este">ComisarÃ­a Este</SelectItem>
                        <SelectItem value="ComisarÃ­a Oeste">ComisarÃ­a Oeste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rol" className="text-right">
                      Rol
                    </Label>
                    <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value)}>
                      <SelectTrigger id="rol" className="col-span-3">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="operador">Operador de Campo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Crear Usuario</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restablecer Contraseña</DialogTitle>
                <DialogDescription>Ingrese la nueva contraseña para el usuario seleccionado</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newPassword" className="text-right">
                    Nueva Contraseña
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="col-span-3"
                    value={resetPasswordData.newPassword}
                    onChange={(e) => setResetPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmResetPassword}>Restablecer Contraseña</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Usuarios</CardTitle>
            <CardDescription>Administre los usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.id.slice(0, 8)}...</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.nombre} {u.apellido}</TableCell>
                    <TableCell>{u.departamento_nombre || "-"}</TableCell>
                    <TableCell>
                      {u.rol === "admin" || u.rol === "administrador" ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Administrador</Badge>
                      ) : u.rol === "operador" ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operador de Campo</Badge>
                      ) : (
                        <Badge variant="outline">Usuario</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(u.id)}
                          title="Restablecer contraseña"
                        >
                          <Key className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.email === user.email}
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
