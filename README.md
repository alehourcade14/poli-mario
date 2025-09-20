# 🚔 Sistema de Denuncias Policiales

Sistema web para gestión de denuncias, entregas de rodados y cámaras de seguridad para la Policía de Investigaciones.

## 🚀 Características

- **Gestión de Denuncias**: Crear, editar y gestionar denuncias formales e informales
- **Entregas de Rodados**: Sistema para registrar entregas de vehículos
- **Mapas Interactivos**: Integración con Google Maps para ubicaciones
- **Dashboard**: Panel de control con estadísticas y gráficos
- **Autenticación**: Sistema de login seguro con Supabase
- **Exportación**: Generación de PDFs y documentos

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **Estilos**: Tailwind CSS, Radix UI
- **Base de Datos**: PostgreSQL (conexión directa)
- **Mapas**: Google Maps API
- **Autenticación**: JWT + bcrypt
- **PDF**: jsPDF, generación de documentos

## 📋 Requisitos Previos

- Node.js 18+ 
- npm (incluido con Node.js)
- PostgreSQL 12+ instalado y corriendo
- API Key de Google Maps

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd poli
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar PostgreSQL

#### Instalar PostgreSQL:
- **Windows**: Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql` o descarga desde postgresql.org
- **Linux**: `sudo apt-get install postgresql postgresql-contrib` (Ubuntu/Debian)

#### Crear la base de datos:
```bash
# Conectar a PostgreSQL como superusuario
psql -U postgres

# Ejecutar el script de configuración
\i scripts/setup-database.sql
```

### 4. Configurar variables de entorno

Copia el archivo `env-template.txt` y renómbralo a `.env.local`:

```bash
copy env-template.txt .env.local
```

Luego edita `.env.local` con tus credenciales de PostgreSQL:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sistema_denuncias
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password_postgres
JWT_SECRET=tu-secreto-super-seguro-para-jwt
```

#### 🗺️ Obtener API Key de Google Maps:

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Habilita **Maps JavaScript API**
4. Ve a **Credentials** y crea una **API Key**
5. Configura restricciones de dominio para seguridad

### 5. Configurar las tablas de la base de datos

Ejecuta los scripts SQL en orden para crear las tablas:

```bash
# Conectar a la base de datos
psql -U postgres -d sistema_denuncias

# Ejecutar los scripts en orden:
\i scripts/01-create-base-tables.sql
\i scripts/02-create-users-table.sql
\i scripts/03-create-denuncias-table.sql
\i scripts/04-create-denuncias-formales-table.sql
\i scripts/05-create-entregas-rodados-table.sql
\i scripts/06-create-camaras-table.sql
\i scripts/07-create-ampliaciones-table.sql
\i scripts/08-create-functions-triggers.sql
\i scripts/09-create-rls-policies.sql
\i scripts/10-create-views.sql
```

**Usuario por defecto:**
- Email: `admin@policia.gob.ar`
- Contraseña: `admin123`

### 6. Ejecutar el proyecto

```bash
npm run dev
```

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
├── app/                    # Páginas de Next.js 13+
│   ├── dashboard/         # Panel de control
│   │   ├── denuncias/    # Gestión de denuncias
│   │   ├── entregas-rodados/ # Gestión de entregas
│   │   ├── camaras/      # Gestión de cámaras
│   │   └── estadisticas/ # Dashboard con gráficos
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI (Radix)
│   ├── camaras-map.tsx   # Mapa de cámaras
│   ├── denuncias-table.tsx # Tabla de denuncias
│   └── charts.tsx        # Gráficos y estadísticas
├── lib/                  # Utilidades y configuración
│   ├── database-config.ts # Configuración de BD
│   ├── pdf-generator.ts   # Generación de PDFs
│   └── utils.ts          # Utilidades generales
└── scripts/              # Scripts SQL de base de datos
```

## 🎯 Funcionalidades Principales

### Dashboard
- Resumen de denuncias por período
- Gráficos de estadísticas
- Mapa interactivo con ubicaciones

### Gestión de Denuncias
- Crear denuncias formales e informales
- Agregar ampliaciones
- Exportar a PDF
- Seguimiento de estado

### Entregas de Rodados
- Registrar entregas de vehículos
- Generar certificados
- Historial de entregas

### Cámaras de Seguridad
- Mapa interactivo de cámaras
- Gestión de ubicaciones
- Estado de funcionamiento

## 🔒 Seguridad

- Autenticación con Supabase Auth
- Row Level Security (RLS) en base de datos
- Middleware de protección de rutas
- Validación de entrada con Zod

## 🚀 Despliegue

### Variables de entorno para producción:

```env
DATABASE_PROVIDER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-maps-api-key
NEXTAUTH_SECRET=secreto-super-seguro
NEXTAUTH_URL=https://tu-dominio.com
```

### Deploy en Vercel (recomendado):

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático

## 🛠️ Scripts Disponibles

```bash
npm run dev       # Modo desarrollo
npm run build     # Construir para producción
npm start         # Servidor de producción
npm run lint      # Verificar código
```

## 🐛 Solución de Problemas

### Error de conexión a base de datos:
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto de Supabase esté activo

### Google Maps no funciona:
- Verifica que la API Key sea correcta
- Asegúrate de haber habilitado **Maps JavaScript API**
- Verifica las restricciones de dominio

### Error de autenticación:
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- Asegúrate de que las políticas RLS estén configuradas

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador
2. Verifica las variables de entorno
3. Asegúrate de que todos los scripts SQL se ejecutaron correctamente

## 📝 Licencia

Este proyecto es privado y está destinado para uso institucional de la Policía de Investigaciones.
