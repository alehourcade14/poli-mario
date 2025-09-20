import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  username: string
  dni: string
  telefono?: string
  rol: string
  departamento?: string
  departamento_id?: string
  activo: boolean
  ultimo_acceso?: string
  created_at: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/user/current', {
          credentials: 'include'
        })

        if (!response.ok) {
          if (response.status === 401) {
            setUser(null)
            return
          }
          throw new Error('Error al obtener usuario')
        }

        const userData = await response.json()
        setUser(userData)
      } catch (err: any) {
        console.error('Error fetching user:', err)
        setError(err.message)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const refreshUser = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user/current', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null)
          return
        }
        throw new Error('Error al obtener usuario')
      }

      const userData = await response.json()
      setUser(userData)
    } catch (err: any) {
      console.error('Error refreshing user:', err)
      setError(err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, error, refreshUser }
}
