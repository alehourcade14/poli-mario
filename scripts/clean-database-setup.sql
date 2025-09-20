-- =============================================
-- SCRIPT DE CONFIGURACIÓN LIMPIA DE BASE DE DATOS
-- Sistema de Gestión Policial
-- =============================================

-- IMPORTANTE: Este script ELIMINA TODOS LOS DATOS EXISTENTES
-- Solo usar si quieres empezar completamente desde cero

-- =============================================
-- PASO 1: ELIMINAR TABLAS EXISTENTES (EN ORDEN CORRECTO)
-- =============================================

-- Eliminar tablas que dependen de otras primero
DROP TABLE IF EXISTS ampliaciones_denuncias CASCADE;
DROP TABLE IF EXISTS denuncias_formales CASCADE;
DROP TABLE IF EXISTS denuncias CASCADE;
DROP TABLE IF EXISTS entregas_rodados CASCADE;
DROP TABLE IF EXISTS camaras CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Eliminar tablas base
DROP TABLE IF EXISTS estados_denuncias CASCADE;
DROP TABLE IF EXISTS tipos_delitos CASCADE;
DROP TABLE IF EXISTS departamentos CASCADE;

-- Eliminar extensiones si no se necesitan
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- =============================================
-- PASO 2: CREAR EXTENSIONES NECESARIAS
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PASO 3: CREAR TABLAS BASE CON IDS AUTO-INCREMENTALES
-- =============================================

-- Tabla de departamentos/comisarías
CREATE TABLE departamentos (
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

-- Tabla de tipos de delitos
CREATE TABLE tipos_delitos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  codigo VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de estados de denuncias
CREATE TABLE estados_denuncias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true
);

-- =============================================
-- PASO 4: CREAR TABLA DE USUARIOS
-- =============================================

-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) UNIQUE,
  telefono VARCHAR(20),
  rol VARCHAR(50) DEFAULT 'operador',
  departamento_id INTEGER REFERENCES departamentos(id),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_dni ON usuarios(dni);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_departamento ON usuarios(departamento_id);

-- =============================================
-- PASO 5: CREAR TABLA DE DENUNCIAS
-- =============================================

-- Tabla principal de denuncias
CREATE TABLE denuncias (
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
  tipo_delito_id INTEGER REFERENCES tipos_delitos(id),
  estado_id INTEGER REFERENCES estados_denuncias(id),
  
  -- Datos del sistema
  departamento_id INTEGER REFERENCES departamentos(id),
  usuario_id INTEGER REFERENCES usuarios(id),
  fecha_denuncia TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hora_denuncia TIME DEFAULT CURRENT_TIME,
  
  -- Metadatos
  observaciones TEXT,
  archivos_adjuntos JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para denuncias
CREATE INDEX idx_denuncias_numero_expediente ON denuncias(numero_expediente);
CREATE INDEX idx_denuncias_dni ON denuncias(denunciante_dni);
CREATE INDEX idx_denuncias_fecha_hecho ON denuncias(fecha_hecho);
CREATE INDEX idx_denuncias_tipo_delito ON denuncias(tipo_delito_id);
CREATE INDEX idx_denuncias_estado ON denuncias(estado_id);
CREATE INDEX idx_denuncias_departamento ON denuncias(departamento_id);
CREATE INDEX idx_denuncias_usuario ON denuncias(usuario_id);
CREATE INDEX idx_denuncias_created_at ON denuncias(created_at);

-- =============================================
-- PASO 6: CREAR TABLA DE DENUNCIAS FORMALES
-- =============================================

-- Tabla de denuncias formales (más detalladas)
CREATE TABLE denuncias_formales (
  id SERIAL PRIMARY KEY,
  numero_expediente VARCHAR(50) UNIQUE,
  
  -- Datos del denunciante
  denunciante_nombre VARCHAR(100) NOT NULL,
  denunciante_apellido VARCHAR(100) NOT NULL,
  denunciante_dni VARCHAR(20) NOT NULL,
  denunciante_telefono VARCHAR(20),
  denunciante_email VARCHAR(100),
  denunciante_direccion TEXT,
  denunciante_nacionalidad VARCHAR(50) DEFAULT 'Argentina',
  denunciante_estado_civil VARCHAR(30),
  denunciante_profesion VARCHAR(100),
  
  -- Datos del hecho
  fecha_hecho DATE NOT NULL,
  hora_hecho TIME,
  lugar_hecho TEXT NOT NULL,
  departamento_hecho VARCHAR(100),
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  
  -- Descripción detallada
  descripcion TEXT NOT NULL,
  circunstancias TEXT,
  testigos TEXT,
  elementos_sustraidos TEXT,
  valor_estimado DECIMAL(12, 2),
  
  -- Clasificación
  tipo_delito_id INTEGER REFERENCES tipos_delitos(id),
  estado_id INTEGER REFERENCES estados_denuncias(id),
  
  -- Datos del denunciado (si aplica)
  denunciado_nombre VARCHAR(100),
  denunciado_apellido VARCHAR(100),
  denunciado_dni VARCHAR(20),
  denunciado_descripcion TEXT,
  
  -- Datos del sistema
  departamento_id INTEGER REFERENCES departamentos(id),
  usuario_id INTEGER REFERENCES usuarios(id),
  fecha_denuncia TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hora_denuncia TIME DEFAULT CURRENT_TIME,
  
  -- Metadatos
  observaciones TEXT,
  archivos_adjuntos JSONB DEFAULT '[]',
  requiere_seguimiento BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para denuncias formales
CREATE INDEX idx_denuncias_formales_numero_expediente ON denuncias_formales(numero_expediente);
CREATE INDEX idx_denuncias_formales_dni ON denuncias_formales(denunciante_dni);
CREATE INDEX idx_denuncias_formales_fecha_hecho ON denuncias_formales(fecha_hecho);
CREATE INDEX idx_denuncias_formales_tipo_delito ON denuncias_formales(tipo_delito_id);
CREATE INDEX idx_denuncias_formales_estado ON denuncias_formales(estado_id);

-- =============================================
-- PASO 7: CREAR TABLA DE ENTREGAS DE RODADOS
-- =============================================

-- Tabla de entregas de rodados
CREATE TABLE entregas_rodados (
  id SERIAL PRIMARY KEY,
  numero_acta VARCHAR(50) UNIQUE,
  
  -- Datos del propietario
  propietario_nombre VARCHAR(100) NOT NULL,
  propietario_apellido VARCHAR(100) NOT NULL,
  propietario_dni VARCHAR(20) NOT NULL,
  propietario_telefono VARCHAR(20),
  propietario_direccion TEXT,
  
  -- Datos del rodado
  tipo_vehiculo VARCHAR(50) NOT NULL, -- auto, moto, bicicleta, etc.
  marca VARCHAR(50),
  modelo VARCHAR(50),
  año INTEGER,
  color VARCHAR(30),
  patente VARCHAR(20),
  numero_motor VARCHAR(100),
  numero_chasis VARCHAR(100),
  
  -- Datos de la entrega
  fecha_entrega DATE NOT NULL,
  hora_entrega TIME DEFAULT CURRENT_TIME,
  lugar_entrega TEXT NOT NULL,
  motivo_entrega TEXT NOT NULL,
  estado_vehiculo TEXT,
  observaciones TEXT,
  
  -- Datos del funcionario
  funcionario_entrega VARCHAR(200) NOT NULL,
  rango_funcionario VARCHAR(50),
  
  -- Datos del sistema
  departamento_id INTEGER REFERENCES departamentos(id),
  usuario_id INTEGER REFERENCES usuarios(id),
  
  -- Documentación
  documentos_adjuntos JSONB DEFAULT '[]',
  fotos_vehiculo JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para entregas de rodados
CREATE INDEX idx_entregas_rodados_numero_acta ON entregas_rodados(numero_acta);
CREATE INDEX idx_entregas_rodados_propietario_dni ON entregas_rodados(propietario_dni);
CREATE INDEX idx_entregas_rodados_patente ON entregas_rodados(patente);
CREATE INDEX idx_entregas_rodados_fecha_entrega ON entregas_rodados(fecha_entrega);
CREATE INDEX idx_entregas_rodados_tipo_vehiculo ON entregas_rodados(tipo_vehiculo);

-- =============================================
-- PASO 8: CREAR TABLA DE CÁMARAS
-- =============================================

-- Tabla de cámaras de seguridad
CREATE TABLE camaras (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  
  -- Ubicación
  direccion TEXT NOT NULL,
  latitud DECIMAL(10, 8) NOT NULL,
  longitud DECIMAL(11, 8) NOT NULL,
  departamento VARCHAR(100),
  zona VARCHAR(100),
  
  -- Características técnicas
  tipo_camara VARCHAR(50), -- fija, domo, PTZ, etc.
  resolucion VARCHAR(20),
  vision_nocturna BOOLEAN DEFAULT false,
  audio BOOLEAN DEFAULT false,
  zoom_optico VARCHAR(10),
  
  -- Estado y funcionamiento
  estado VARCHAR(30) DEFAULT 'activa', -- activa, inactiva, mantenimiento
  fecha_instalacion DATE,
  ultimo_mantenimiento DATE,
  proximo_mantenimiento DATE,
  
  -- Conectividad
  ip_address INET,
  puerto INTEGER,
  protocolo VARCHAR(20),
  url_streaming TEXT,
  
  -- Datos del sistema
  departamento_id INTEGER REFERENCES departamentos(id),
  usuario_creacion_id INTEGER REFERENCES usuarios(id),
  
  -- Metadatos
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para cámaras
CREATE INDEX idx_camaras_nombre ON camaras(nombre);
CREATE INDEX idx_camaras_estado ON camaras(estado);
CREATE INDEX idx_camaras_departamento ON camaras(departamento_id);
CREATE INDEX idx_camaras_ubicacion ON camaras(latitud, longitud);
CREATE INDEX idx_camaras_zona ON camaras(zona);

-- =============================================
-- PASO 9: CREAR TABLA DE AMPLIACIONES
-- =============================================

-- Tabla de ampliaciones de denuncias
CREATE TABLE ampliaciones_denuncias (
  id SERIAL PRIMARY KEY,
  denuncia_id INTEGER REFERENCES denuncias(id) ON DELETE CASCADE,
  
  -- Datos de la ampliación
  fecha_ampliacion DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_ampliacion TIME DEFAULT CURRENT_TIME,
  descripcion_ampliacion TEXT NOT NULL,
  
  -- Nuevos datos aportados
  nuevos_testigos TEXT,
  nuevas_pruebas TEXT,
  elementos_recuperados TEXT,
  
  -- Datos del funcionario
  funcionario_nombre VARCHAR(200) NOT NULL,
  rango_funcionario VARCHAR(50),
  
  -- Datos del sistema
  usuario_id INTEGER REFERENCES usuarios(id),
  departamento_id INTEGER REFERENCES departamentos(id),
  
  -- Archivos adjuntos
  archivos_adjuntos JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para ampliaciones
CREATE INDEX idx_ampliaciones_denuncia_id ON ampliaciones_denuncias(denuncia_id);
CREATE INDEX idx_ampliaciones_fecha ON ampliaciones_denuncias(fecha_ampliacion);
CREATE INDEX idx_ampliaciones_usuario ON ampliaciones_denuncias(usuario_id);

-- =============================================
-- PASO 10: CREAR FUNCIONES Y TRIGGERS
-- =============================================

-- Función para generar número de expediente automático
CREATE OR REPLACE FUNCTION generar_numero_expediente()
RETURNS TRIGGER AS $$
DECLARE
  año_actual TEXT;
  contador INTEGER;
  nuevo_numero TEXT;
BEGIN
  -- Obtener el año actual
  año_actual := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Contar denuncias del año actual
  SELECT COUNT(*) + 1 INTO contador
  FROM denuncias 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Generar número de expediente: AÑO-NUMERO (ej: 2024-001234)
  nuevo_numero := año_actual || '-' || LPAD(contador::TEXT, 6, '0');
  
  NEW.numero_expediente := nuevo_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de expediente para denuncias formales
CREATE OR REPLACE FUNCTION generar_numero_expediente_formal()
RETURNS TRIGGER AS $$
DECLARE
  año_actual TEXT;
  contador INTEGER;
  nuevo_numero TEXT;
BEGIN
  año_actual := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COUNT(*) + 1 INTO contador
  FROM denuncias_formales 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  nuevo_numero := 'F' || año_actual || '-' || LPAD(contador::TEXT, 6, '0');
  
  NEW.numero_expediente := nuevo_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de acta para entregas de rodados
CREATE OR REPLACE FUNCTION generar_numero_acta()
RETURNS TRIGGER AS $$
DECLARE
  año_actual TEXT;
  contador INTEGER;
  nuevo_numero TEXT;
BEGIN
  año_actual := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COUNT(*) + 1 INTO contador
  FROM entregas_rodados 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  nuevo_numero := 'ER' || año_actual || '-' || LPAD(contador::TEXT, 6, '0');
  
  NEW.numero_acta := nuevo_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para generar números automáticamente
CREATE TRIGGER trigger_generar_numero_expediente
  BEFORE INSERT ON denuncias
  FOR EACH ROW
  WHEN (NEW.numero_expediente IS NULL)
  EXECUTE FUNCTION generar_numero_expediente();

CREATE TRIGGER trigger_generar_numero_expediente_formal
  BEFORE INSERT ON denuncias_formales
  FOR EACH ROW
  WHEN (NEW.numero_expediente IS NULL)
  EXECUTE FUNCTION generar_numero_expediente_formal();

CREATE TRIGGER trigger_generar_numero_acta
  BEFORE INSERT ON entregas_rodados
  FOR EACH ROW
  WHEN (NEW.numero_acta IS NULL)
  EXECUTE FUNCTION generar_numero_acta();

-- Triggers para actualizar updated_at
CREATE TRIGGER trigger_updated_at_usuarios
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_updated_at_denuncias
  BEFORE UPDATE ON denuncias
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_updated_at_denuncias_formales
  BEFORE UPDATE ON denuncias_formales
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_updated_at_entregas_rodados
  BEFORE UPDATE ON entregas_rodados
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_updated_at_camaras
  BEFORE UPDATE ON camaras
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- =============================================
-- PASO 11: ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE denuncias_formales ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas_rodados ENABLE ROW LEVEL SECURITY;
ALTER TABLE camaras ENABLE ROW LEVEL SECURITY;
ALTER TABLE ampliaciones_denuncias ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (solo administradores pueden ver todos)
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Administradores pueden ver todos los usuarios" ON usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id::text = auth.uid()::text 
      AND rol = 'administrador'
    )
  );

-- Políticas para denuncias (usuarios pueden ver las de su departamento)
CREATE POLICY "Ver denuncias del departamento" ON denuncias
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id::text = auth.uid()::text 
      AND (departamento_id = denuncias.departamento_id OR rol = 'administrador')
    )
  );

CREATE POLICY "Crear denuncias" ON denuncias
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id::text = auth.uid()::text 
      AND activo = true
    )
  );

-- Políticas similares para denuncias formales
CREATE POLICY "Ver denuncias formales del departamento" ON denuncias_formales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id::text = auth.uid()::text 
      AND (departamento_id = denuncias_formales.departamento_id OR rol = 'administrador')
    )
  );

CREATE POLICY "Crear denuncias formales" ON denuncias_formales
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id::text = auth.uid()::text 
      AND activo = true
    )
  );

-- Políticas para entregas de rodados
CREATE POLICY "Ver entregas del departamento" ON entregas_rodados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id::text = auth.uid()::text 
      AND (departamento_id = entregas_rodados.departamento_id OR rol = 'administrador')
    )
  );

-- Políticas para cámaras (todos pueden ver, solo administradores modifican)
CREATE POLICY "Todos pueden ver cámaras" ON camaras
  FOR SELECT USING (true);

CREATE POLICY "Solo administradores modifican cámaras" ON camaras
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id::text = auth.uid()::text 
      AND rol = 'administrador'
    )
  );

-- =============================================
-- PASO 12: CREAR VISTAS
-- =============================================

-- Vista para estadísticas de denuncias
CREATE VIEW vista_estadisticas_denuncias AS
SELECT 
  d.departamento_id,
  dep.nombre as departamento_nombre,
  COUNT(*) as total_denuncias,
  COUNT(CASE WHEN d.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as denuncias_ultimo_mes,
  COUNT(CASE WHEN d.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as denuncias_ultima_semana,
  COUNT(CASE WHEN e.nombre = 'Pendiente' THEN 1 END) as pendientes,
  COUNT(CASE WHEN e.nombre = 'En Proceso' THEN 1 END) as en_proceso,
  COUNT(CASE WHEN e.nombre = 'Completada' THEN 1 END) as completadas
FROM denuncias d
LEFT JOIN departamentos dep ON d.departamento_id = dep.id
LEFT JOIN estados_denuncias e ON d.estado_id = e.id
GROUP BY d.departamento_id, dep.nombre;

-- Vista para denuncias con información completa
CREATE VIEW vista_denuncias_completa AS
SELECT 
  d.*,
  dep.nombre as departamento_nombre,
  td.nombre as tipo_delito_nombre,
  ed.nombre as estado_nombre,
  ed.color as estado_color,
  u.nombre || ' ' || u.apellido as usuario_nombre
FROM denuncias d
LEFT JOIN departamentos dep ON d.departamento_id = dep.id
LEFT JOIN tipos_delitos td ON d.tipo_delito_id = td.id
LEFT JOIN estados_denuncias ed ON d.estado_id = ed.id
LEFT JOIN usuarios u ON d.usuario_id = u.id;

-- Vista para cámaras por zona
CREATE VIEW vista_camaras_por_zona AS
SELECT 
  zona,
  departamento,
  COUNT(*) as total_camaras,
  COUNT(CASE WHEN estado = 'activa' THEN 1 END) as camaras_activas,
  COUNT(CASE WHEN estado = 'inactiva' THEN 1 END) as camaras_inactivas,
  COUNT(CASE WHEN estado = 'mantenimiento' THEN 1 END) as en_mantenimiento
FROM camaras
GROUP BY zona, departamento
ORDER BY zona, departamento;

-- Vista para entregas de rodados con información completa
CREATE VIEW vista_entregas_rodados_completa AS
SELECT 
  er.*,
  dep.nombre as departamento_nombre,
  u.nombre || ' ' || u.apellido as usuario_nombre
FROM entregas_rodados er
LEFT JOIN departamentos dep ON er.departamento_id = dep.id
LEFT JOIN usuarios u ON er.usuario_id = u.id;

-- =============================================
-- PASO 13: INSERTAR DATOS INICIALES
-- =============================================

-- Insertar datos base para departamentos
INSERT INTO departamentos (nombre, direccion) VALUES
('Comisaría Central', 'Av. San Nicolás de Bari 1234'),
('Comisaría Norte', 'Barrio Norte - Calle Principal 567'),
('Comisaría Sur', 'Zona Sur - Av. Libertador 890'),
('Comisaría Este', 'Barrio Este - Calle 25 de Mayo 123'),
('Comisaría Oeste', 'Zona Oeste - Av. Perón 456');

-- Insertar tipos de delitos comunes
INSERT INTO tipos_delitos (nombre, codigo) VALUES
('Hurto', 'HUR001'),
('Robo', 'ROB001'),
('Lesiones', 'LES001'),
('Daños', 'DAN001'),
('Estafa', 'EST001'),
('Amenazas', 'AME001'),
('Violencia de Género', 'VDG001'),
('Accidente de Tránsito', 'ACC001'),
('Otros', 'OTR001');

-- Insertar estados de denuncias
INSERT INTO estados_denuncias (nombre, descripcion, color, orden) VALUES
('Pendiente', 'Denuncia recibida, pendiente de revisión', '#F59E0B', 1),
('En Proceso', 'Denuncia en investigación', '#3B82F6', 2),
('Completada', 'Denuncia procesada completamente', '#10B981', 3),
('Archivada', 'Denuncia archivada', '#6B7280', 4),
('Rechazada', 'Denuncia rechazada', '#EF4444', 5);

-- Insertar usuario administrador por defecto
-- NOTA: La contraseña es 'admin123' hasheada con bcrypt
INSERT INTO usuarios (email, password_hash, nombre, apellido, dni, rol, departamento_id) VALUES
('admin@policia.gob.ar', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5Qd6.6QY0e', 'Administrador', 'Sistema', '00000000', 'administrador', 1);

-- =============================================
-- MENSAJE DE CONFIRMACIÓN
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'BASE DE DATOS CONFIGURADA EXITOSAMENTE';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Usuario administrador creado: admin@policia.gob.ar';
    RAISE NOTICE 'Contraseña por defecto: admin123';
    RAISE NOTICE 'IDs ahora son auto-incrementales (1, 2, 3...)';
    RAISE NOTICE 'Todas las tablas creadas con datos iniciales';
    RAISE NOTICE '=============================================';
END $$;
