"use client"

import { supabase } from "./database"
import { useEffect, useState } from "react"

// Hook para sincronización en tiempo real
export function useRealtimeData<T>(table: string, filter?: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar datos iniciales
    const fetchData = async () => {
      const { data: initialData, error } = await supabase.from(table).select("*")

      if (!error && initialData) {
        setData(initialData)
      }
      setLoading(false)
    }

    fetchData()

    // Configurar suscripción en tiempo real
    const subscription = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
          filter: filter,
        },
        (payload) => {
          console.log("🔄 Cambio detectado:", payload)

          switch (payload.eventType) {
            case "INSERT":
              setData((prev) => [...prev, payload.new as T])
              break
            case "UPDATE":
              setData((prev) => prev.map((item) => ((item as any).id === payload.new.id ? (payload.new as T) : item)))
              break
            case "DELETE":
              setData((prev) => prev.filter((item) => (item as any).id !== payload.old.id))
              break
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [table, filter])

  return { data, loading, setData }
}

// Función para notificar cambios a todos los usuarios
export async function notifyChange(table: string, action: string, data: any) {
  await supabase.channel("notifications").send({
    type: "broadcast",
    event: "data-change",
    payload: { table, action, data, timestamp: new Date().toISOString() },
  })
}
