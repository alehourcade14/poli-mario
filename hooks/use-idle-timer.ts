"use client"

import { useEffect, useRef, useCallback } from "react"

interface UseIdleTimerProps {
  timeout: number // tiempo en milisegundos
  onIdle: () => void
  onActive?: () => void
  events?: string[]
}

export function useIdleTimer({
  timeout,
  onIdle,
  onActive,
  events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click", "keydown"],
}: UseIdleTimerProps) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isIdleRef = useRef(false)

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (isIdleRef.current) {
      isIdleRef.current = false
      onActive?.()
    }

    timeoutRef.current = setTimeout(() => {
      isIdleRef.current = true
      onIdle()
    }, timeout)
  }, [timeout, onIdle, onActive])

  const handleActivity = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    // Iniciar el timer
    resetTimer()

    // Agregar event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [events, handleActivity, resetTimer])

  return {
    reset: resetTimer,
    isIdle: isIdleRef.current,
  }
}
