"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { useTheme } from "@/components/theme-provider"

// Registrar los componentes necesarios de Chart.js
Chart.register(...registerables)

// Función para obtener colores adaptados al tema
function getThemeColors(theme: "light" | "dark") {
  return {
    gridColor: theme === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
    textColor: theme === "light" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
  }
}

interface PieChartProps {
  labels: string[]
  data: number[]
  backgroundColor?: string[]
}

export function PieChart({ labels, data, backgroundColor }: PieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { theme } = useTheme()
  const { textColor } = getThemeColors(theme)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Crear nuevo gráfico
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColor || [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [labels, data, backgroundColor, theme])

  return <canvas ref={chartRef} />
}

interface DoughnutChartProps {
  labels: string[]
  data: number[]
  backgroundColor?: string[]
  cutout?: string
}

export function DoughnutChart({ labels, data, backgroundColor, cutout = "70%" }: DoughnutChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { theme } = useTheme()
  const { textColor } = getThemeColors(theme)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Crear nuevo gráfico
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColor || [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [labels, data, backgroundColor, cutout, theme])

  return <canvas ref={chartRef} />
}

interface RadarChartProps {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

export function RadarChart({ labels, datasets }: RadarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { theme } = useTheme()
  const { gridColor, textColor } = getThemeColors(theme)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Crear nuevo gráfico
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: datasets.map((dataset) => ({
          label: dataset.label,
          data: dataset.data,
          backgroundColor: dataset.backgroundColor || "rgba(54, 162, 235, 0.2)",
          borderColor: dataset.borderColor || "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          pointBackgroundColor: dataset.borderColor || "rgba(54, 162, 235, 1)",
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              color: gridColor,
            },
            pointLabels: {
              color: textColor,
            },
            ticks: {
              color: textColor,
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [labels, datasets, theme])

  return <canvas ref={chartRef} />
}

interface BarChartProps {
  labels: string[]
  data: number[]
  label: string
  backgroundColor?: string
  horizontal?: boolean
}

export function BarChart({ labels, data, label, backgroundColor, horizontal = false }: BarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { theme } = useTheme()
  const { gridColor, textColor } = getThemeColors(theme)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Crear nuevo gráfico
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "bar", // Usar siempre 'bar'
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: backgroundColor || "rgba(54, 162, 235, 0.7)",
            borderColor: backgroundColor || "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: horizontal ? "y" : "x", // Usar 'y' para barras horizontales
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [labels, data, label, backgroundColor, horizontal, theme])

  return <canvas ref={chartRef} />
}

interface LineChartProps {
  labels: string[]
  data: number[]
  label: string
  borderColor?: string
  backgroundColor?: string
}

export function LineChart({ labels, data, label, borderColor, backgroundColor }: LineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { theme } = useTheme()
  const { gridColor, textColor } = getThemeColors(theme)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Crear nuevo gráfico
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            fill: true,
            borderColor: borderColor || "rgba(54, 162, 235, 1)",
            backgroundColor: backgroundColor || "rgba(54, 162, 235, 0.1)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [labels, data, label, borderColor, backgroundColor, theme])

  return <canvas ref={chartRef} />
}
