-- Script para configurar la base de datos inicial
-- Ejecutar como usuario postgres o superusuario

-- Crear la base de datos si no existe
CREATE DATABASE sistema_denuncias;

-- Conectar a la base de datos
\c sistema_denuncias;

-- Crear esquema si es necesario
CREATE SCHEMA IF NOT EXISTS public;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE sistema_denuncias TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

-- Ejecutar script de configuración limpia (elimina datos existentes)
\i scripts/clean-database-setup.sql

-- Mensaje de confirmación
\echo 'Base de datos sistema_denuncias creada y configurada exitosamente'
