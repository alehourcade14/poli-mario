"use client"

import { useState, useEffect } from "react"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function TestAPI() {
  const { user, loading: userLoading } = useCurrentUser()
  const [denuncias, setDenuncias] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDenuncias = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/denuncias', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Error al cargar denuncias')
      }

      const data = await response.json()
      setDenuncias(data)
      console.log('Denuncias cargadas:', data)
    } catch (error) {
      console.error('Error fetching denuncias:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTestDenuncia = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/denuncias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          numero_expediente: `EXP-${Date.now()}`,
          denunciante_nombre: 'Juan',
          denunciante_apellido: 'Pérez',
          denunciante_dni: '12345678',
          denunciante_telefono: '1122334455',
          denunciante_email: 'juan.perez@example.com',
          denunciante_direccion: 'Calle Falsa 123',
          fecha_hecho: new Date().toISOString().split('T')[0],
          hora_hecho: new Date().toTimeString().slice(0, 5),
          lugar_hecho: 'Barrio Centro',
          departamento_hecho: 'Capital',
          latitud: -29.4131,
          longitud: -66.8563,
          descripcion: 'Denuncia de prueba desde la API con todos los datos completos.',
          tipo_delito: 'Robo'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear denuncia')
      }

      const newDenuncia = await response.json()
      console.log('Denuncia creada:', newDenuncia)
      
      // Recargar la lista
      await fetchDenuncias()
    } catch (error) {
      console.error('Error creating denuncia:', error)
    } finally {
      setLoading(false)
    }
  }

  if (userLoading) {
    return <div>Cargando usuario...</div>
  }

  if (!user) {
    return <div>No hay usuario autenticado</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test API - Sistema de Denuncias</h1>
      
      <div className="mb-4">
        <p><strong>Usuario:</strong> {user.nombre} {user.apellido} ({user.email})</p>
        <p><strong>Rol:</strong> {user.rol}</p>
      </div>

      <div className="space-x-4 mb-6">
        <button 
          onClick={fetchDenuncias}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Cargar Denuncias'}
        </button>
        
        <button 
          onClick={createTestDenuncia}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Denuncia de Prueba'}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Denuncias ({denuncias.length})</h2>
        {denuncias.length === 0 ? (
          <p>No hay denuncias</p>
        ) : (
          <div className="space-y-2">
            {denuncias.map((denuncia) => (
              <div key={denuncia.id} className="border p-3 rounded">
                <p><strong>ID:</strong> {denuncia.id}</p>
                <p><strong>Número Expediente:</strong> {denuncia.numero_expediente}</p>
                <p><strong>Denunciante:</strong> {denuncia.denunciante_nombre} {denuncia.denunciante_apellido}</p>
                <p><strong>DNI:</strong> {denuncia.denunciante_dni}</p>
                <p><strong>Teléfono:</strong> {denuncia.denunciante_telefono}</p>
                <p><strong>Email:</strong> {denuncia.denunciante_email}</p>
                <p><strong>Dirección:</strong> {denuncia.denunciante_direccion}</p>
                <p><strong>Tipo de Delito:</strong> {denuncia.tipo_delito}</p>
                <p><strong>Estado:</strong> {denuncia.estado_nombre}</p>
                <p><strong>Lugar del Hecho:</strong> {denuncia.lugar_hecho}</p>
                <p><strong>Departamento del Hecho:</strong> {denuncia.departamento_hecho}</p>
                <p><strong>Fecha del Hecho:</strong> {denuncia.fecha_hecho}</p>
                <p><strong>Hora del Hecho:</strong> {denuncia.hora_hecho}</p>
                <p><strong>Descripción:</strong> {denuncia.descripcion}</p>
                <p><strong>Coordenadas:</strong> {denuncia.latitud}, {denuncia.longitud}</p>
                <p><strong>Fecha de Creación:</strong> {new Date(denuncia.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
