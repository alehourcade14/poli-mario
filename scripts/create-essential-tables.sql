-- Script simplificado para crear solo las tablas esenciales
-- Ejecutar desde psql con: \i scripts/create-essential-tables.sql

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de departamentos/comisarías
CREATE TABLE IF NOT EXISTS departamentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(20),
  email VARCHAR(100),
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tipos de delitos
CREATE TABLE IF NOT EXISTS tipos_delitos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  codigo VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estados de denuncias
CREATE TABLE IF NOT EXISTS estados_denuncias (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true
);

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) UNIQUE,
  telefono VARCHAR(20),
  rol VARCHAR(50) DEFAULT 'operador',
  departamento_id UUID REFERENCES departamentos(id),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla principal de denuncias
CREATE TABLE IF NOT EXISTS denuncias (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_expediente VARCHAR(50) UNIQUE,
  
  -- Datos del denunciante
  denunciante_nombre VARCHAR(100) NOT NULL,
  denunciante_apellido VARCHAR(100) NOT NULL,
  denunciante_dni VARCHAR(20) NOT NULL,
  denunciante_telefono VARCHAR(20),
  denunciante_email VARCHAR(100),
  denunciante_direccion TEXT,
  
  -- Datos del hecho
  fecha_hecho DATE NOT NULL,
  hora_hecho TIME,
  lugar_hecho TEXT NOT NULL,
  departamento_hecho VARCHAR(100),
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  
  -- Descripción y clasificación
  descripcion TEXT NOT NULL,
  tipo_delito_id UUID REFERENCES tipos_delitos(id),
  estado_id UUID REFERENCES estados_denuncias(id),
  
  -- Datos del sistema
  departamento_id UUID REFERENCES departamentos(id),
  usuario_id UUID REFERENCES usuarios(id),
  fecha_denuncia TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hora_denuncia TIME DEFAULT CURRENT_TIME,
  
  -- Metadatos
  observaciones TEXT,
  archivos_adjuntos JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_denuncias_numero_expediente ON denuncias(numero_expediente);
CREATE INDEX IF NOT EXISTS idx_denuncias_dni ON denuncias(denunciante_dni);
CREATE INDEX IF NOT EXISTS idx_denuncias_fecha_hecho ON denuncias(fecha_hecho);

-- Insertar datos base
INSERT INTO departamentos (nombre, direccion) VALUES
('Comisaría Central', 'Av. San Nicolás de Bari 1234'),
('Comisaría Norte', 'Barrio Norte - Calle Principal 567'),
('Comisaría Sur', 'Zona Sur - Av. Libertador 890'),
('Comisaría Este', 'Barrio Este - Calle 25 de Mayo 123'),
('Comisaría Oeste', 'Zona Oeste - Av. Perón 456')
ON CONFLICT DO NOTHING;

INSERT INTO tipos_delitos (nombre, codigo) VALUES
('Hurto', 'HUR001'),
('Robo', 'ROB001'),
('Lesiones', 'LES001'),
('Daños', 'DAN001'),
('Estafa', 'EST001'),
('Amenazas', 'AME001'),
('Violencia de Género', 'VDG001'),
('Accidente de Tránsito', 'ACC001'),
('Otros', 'OTR001')
ON CONFLICT DO NOTHING;

INSERT INTO estados_denuncias (nombre, descripcion, color, orden) VALUES
('Pendiente', 'Denuncia recibida, pendiente de revisión', '#F59E0B', 1),
('En Proceso', 'Denuncia en investigación', '#3B82F6', 2),
('Completada', 'Denuncia procesada completamente', '#10B981', 3),
('Archivada', 'Denuncia archivada', '#6B7280', 4),
('Rechazada', 'Denuncia rechazada', '#EF4444', 5)
ON CONFLICT DO NOTHING;

-- Insertar usuario administrador por defecto
-- NOTA: La contraseña es 'admin123' hasheada con bcrypt
INSERT INTO usuarios (email, password_hash, nombre, apellido, dni, rol) VALUES
('admin@policia.gob.ar', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5Qd6.6QY0e', 'Administrador', 'Sistema', '00000000', 'administrador')
ON CONFLICT (email) DO NOTHING;

\echo 'Tablas esenciales creadas exitosamente!'
