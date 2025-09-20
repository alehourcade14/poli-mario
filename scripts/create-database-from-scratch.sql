-- =============================================
-- SCRIPT PARA CREAR BASE DE DATOS DESDE CERO
-- Sistema de Gestión Policial
-- =============================================

-- IMPORTANTE: Ejecutar como superusuario (postgres)

-- =============================================
-- PASO 1: ELIMINAR BASE DE DATOS SI EXISTE
-- =============================================

-- Terminar todas las conexiones a la base de datos
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'sistema_denuncias' AND pid <> pg_backend_pid();

-- Eliminar la base de datos si existe
DROP DATABASE IF EXISTS sistema_denuncias;

-- =============================================
-- PASO 2: CREAR NUEVA BASE DE DATOS
-- =============================================

-- Crear la base de datos
CREATE DATABASE sistema_denuncias
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Argentina.1252'
    LC_CTYPE = 'Spanish_Argentina.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- =============================================
-- PASO 3: CONECTAR A LA NUEVA BASE DE DATOS
-- =============================================

\c sistema_denuncias;

-- =============================================
-- PASO 4: CREAR ESQUEMA Y PERMISOS
-- =============================================

-- Crear esquema si es necesario
CREATE SCHEMA IF NOT EXISTS public;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE sistema_denuncias TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

-- =============================================
-- PASO 5: EJECUTAR CONFIGURACIÓN COMPLETA
-- =============================================

-- Ejecutar script de configuración limpia
\i scripts/clean-database-setup.sql

-- =============================================
-- MENSAJE FINAL
-- =============================================

\echo '============================================='
\echo 'BASE DE DATOS CREADA EXITOSAMENTE DESDE CERO'
\echo '============================================='
\echo 'Base de datos: sistema_denuncias'
\echo 'Usuario admin: admin@policia.gob.ar'
\echo 'Contraseña: admin123'
\echo 'IDs: Auto-incrementales (1, 2, 3...)'
\echo '============================================='
