-- =============================================
-- SCRIPT DE MIGRACIÓN: DE UUID A SERIAL
-- Sistema de Gestión Policial
-- =============================================

-- IMPORTANTE: Este script debe ejecutarse solo si ya tienes datos en la base de datos
-- Si estás empezando desde cero, usa database-complete-setup.sql

-- =============================================
-- PASO 1: CREAR NUEVAS TABLAS CON IDS SERIAL
-- =============================================

-- Crear tabla temporal de departamentos
CREATE TABLE departamentos_new (
  id SERIAL PRIMARY KEY,
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

-- Crear tabla temporal de tipos de delitos
CREATE TABLE tipos_delitos_new (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  codigo VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla temporal de estados de denuncias
CREATE TABLE estados_denuncias_new (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true
);

-- Crear tabla temporal de usuarios
CREATE TABLE usuarios_new (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) UNIQUE,
  telefono VARCHAR(20),
  rol VARCHAR(50) DEFAULT 'operador',
  departamento_id INTEGER REFERENCES departamentos_new(id),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla temporal de denuncias
CREATE TABLE denuncias_new (
  id SERIAL PRIMARY KEY,
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
  tipo_delito_id INTEGER REFERENCES tipos_delitos_new(id),
  estado_id INTEGER REFERENCES estados_denuncias_new(id),
  
  -- Datos del sistema
  departamento_id INTEGER REFERENCES departamentos_new(id),
  usuario_id INTEGER REFERENCES usuarios_new(id),
  fecha_denuncia TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hora_denuncia TIME DEFAULT CURRENT_TIME,
  
  -- Metadatos
  observaciones TEXT,
  archivos_adjuntos JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PASO 2: MIGRAR DATOS EXISTENTES
-- =============================================

-- Migrar departamentos
INSERT INTO departamentos_new (nombre, direccion, telefono, email, latitud, longitud, activo, created_at, updated_at)
SELECT nombre, direccion, telefono, email, latitud, longitud, activo, created_at, updated_at
FROM departamentos
ORDER BY created_at;

-- Migrar tipos de delitos
INSERT INTO tipos_delitos_new (nombre, descripcion, codigo, activo, created_at)
SELECT nombre, descripcion, codigo, activo, created_at
FROM tipos_delitos
ORDER BY created_at;

-- Migrar estados de denuncias
INSERT INTO estados_denuncias_new (nombre, descripcion, color, orden, activo)
SELECT nombre, descripcion, color, orden, activo
FROM estados_denuncias
ORDER BY orden;

-- Migrar usuarios (necesitamos mapear los departamentos)
INSERT INTO usuarios_new (email, password_hash, nombre, apellido, dni, telefono, rol, activo, ultimo_acceso, created_at, updated_at)
SELECT u.email, u.password_hash, u.nombre, u.apellido, u.dni, u.telefono, u.rol, u.activo, u.ultimo_acceso, u.created_at, u.updated_at
FROM usuarios u
ORDER BY u.created_at;

-- Actualizar referencias de departamentos en usuarios
UPDATE usuarios_new 
SET departamento_id = dn.id
FROM usuarios u
JOIN departamentos d ON u.departamento_id = d.id
JOIN departamentos_new dn ON d.nombre = dn.nombre
WHERE usuarios_new.email = u.email;

-- Migrar denuncias (necesitamos mapear todas las referencias)
INSERT INTO denuncias_new (
  numero_expediente, denunciante_nombre, denunciante_apellido, denunciante_dni,
  denunciante_telefono, denunciante_email, denunciante_direccion, fecha_hecho,
  hora_hecho, lugar_hecho, departamento_hecho, latitud, longitud, descripcion,
  observaciones, archivos_adjuntos, fecha_denuncia, hora_denuncia, created_at, updated_at
)
SELECT 
  numero_expediente, denunciante_nombre, denunciante_apellido, denunciante_dni,
  denunciante_telefono, denunciante_email, denunciante_direccion, fecha_hecho,
  hora_hecho, lugar_hecho, departamento_hecho, latitud, longitud, descripcion,
  observaciones, archivos_adjuntos, fecha_denuncia, hora_denuncia, created_at, updated_at
FROM denuncias
ORDER BY created_at;

-- Actualizar referencias en denuncias
UPDATE denuncias_new 
SET tipo_delito_id = tdn.id
FROM denuncias d
JOIN tipos_delitos td ON d.tipo_delito_id = td.id
JOIN tipos_delitos_new tdn ON td.nombre = tdn.nombre
WHERE denuncias_new.numero_expediente = d.numero_expediente;

UPDATE denuncias_new 
SET estado_id = edn.id
FROM denuncias d
JOIN estados_denuncias ed ON d.estado_id = ed.id
JOIN estados_denuncias_new edn ON ed.nombre = edn.nombre
WHERE denuncias_new.numero_expediente = d.numero_expediente;

UPDATE denuncias_new 
SET departamento_id = dn.id
FROM denuncias d
JOIN departamentos dep ON d.departamento_id = dep.id
JOIN departamentos_new dn ON dep.nombre = dn.nombre
WHERE denuncias_new.numero_expediente = d.numero_expediente;

UPDATE denuncias_new 
SET usuario_id = un.id
FROM denuncias d
JOIN usuarios u ON d.usuario_id = u.id
JOIN usuarios_new un ON u.email = un.email
WHERE denuncias_new.numero_expediente = d.numero_expediente;

-- =============================================
-- PASO 3: RECREAR ÍNDICES Y CONSTRAINTS
-- =============================================

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios_new(email);
CREATE INDEX idx_usuarios_dni ON usuarios_new(dni);
CREATE INDEX idx_usuarios_rol ON usuarios_new(rol);
CREATE INDEX idx_usuarios_departamento ON usuarios_new(departamento_id);

-- Índices para denuncias
CREATE INDEX idx_denuncias_numero_expediente ON denuncias_new(numero_expediente);
CREATE INDEX idx_denuncias_dni ON denuncias_new(denunciante_dni);
CREATE INDEX idx_denuncias_fecha_hecho ON denuncias_new(fecha_hecho);
CREATE INDEX idx_denuncias_tipo_delito ON denuncias_new(tipo_delito_id);
CREATE INDEX idx_denuncias_estado ON denuncias_new(estado_id);
CREATE INDEX idx_denuncias_departamento ON denuncias_new(departamento_id);
CREATE INDEX idx_denuncias_usuario ON denuncias_new(usuario_id);
CREATE INDEX idx_denuncias_created_at ON denuncias_new(created_at);

-- =============================================
-- PASO 4: REEMPLAZAR TABLAS ORIGINALES
-- =============================================

-- Hacer backup de las tablas originales
ALTER TABLE departamentos RENAME TO departamentos_old;
ALTER TABLE tipos_delitos RENAME TO tipos_delitos_old;
ALTER TABLE estados_denuncias RENAME TO estados_denuncias_old;
ALTER TABLE usuarios RENAME TO usuarios_old;
ALTER TABLE denuncias RENAME TO denuncias_old;

-- Renombrar las nuevas tablas
ALTER TABLE departamentos_new RENAME TO departamentos;
ALTER TABLE tipos_delitos_new RENAME TO tipos_delitos;
ALTER TABLE estados_denuncias_new RENAME TO estados_denuncias;
ALTER TABLE usuarios_new RENAME TO usuarios;
ALTER TABLE denuncias_new RENAME TO denuncias;

-- =============================================
-- MENSAJE DE CONFIRMACIÓN
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'Migración completada exitosamente.';
    RAISE NOTICE 'Las tablas originales se guardaron con sufijo _old.';
    RAISE NOTICE 'Los IDs ahora son auto-incrementales (SERIAL).';
END $$;
