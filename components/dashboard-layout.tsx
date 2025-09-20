"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, FileText, Users, BarChart3, Camera, Car, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import IdleSessionManager from "./idle-session-manager"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    })
    router.push("/")
  }

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Denuncias", href: "/dashboard/denuncias", icon: FileText },
    { name: "Usuarios", href: "/dashboard/usuarios", icon: Users },
    { name: "Estadísticas", href: "/dashboard/estadisticas", icon: BarChart3 },
    { name: "Cámaras", href: "/dashboard/camaras", icon: Camera },
    { name: "Entregas Rodados", href: "/dashboard/entregas-rodados", icon: Car },
  ]

  // Filtrar menú según rol
  const filteredMenuItems =
    user?.role === "operador"
      ? menuItems.filter((item) => !["Usuarios", "Estadísticas"].includes(item.name))
      : menuItems

  return (
    <IdleSessionManager>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "md:translate-x-0",
            sidebarCollapsed ? "md:w-16" : "md:w-64",
            "w-64",
          )}
        >
          {/* Logo and toggle */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            {!sidebarCollapsed && <h1 className="text-xl font-bold">Sistema de Gestion Operativa D.G.I.</h1>}

            {/* Collapse button - only on desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-1 h-8 w-8"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>

            {/* Close button - only on mobile */}
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="md:hidden p-1 h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {filteredMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("flex-shrink-0 h-5 w-5", sidebarCollapsed ? "mr-0" : "mr-3")} />
                  {!sidebarCollapsed && item.name}
                </Link>
              ))}
            </nav>

            {/* User info and logout */}
            {!sidebarCollapsed && (
              <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{user?.nombre?.charAt(0) || "U"}</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.nombre || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.departamento || "Departamento"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            )}

            {/* Collapsed logout button */}
            {sidebarCollapsed && (
              <div className="flex-shrink-0 p-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="w-full p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className={cn("transition-all duration-300", sidebarCollapsed ? "md:ml-16" : "md:ml-64")}>
          {/* Top bar */}
          <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </IdleSessionManager>
  )
}
