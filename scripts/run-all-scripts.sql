-- Script para ejecutar la configuración limpia de base de datos
-- Ejecutar desde psql con: \i scripts/run-all-scripts.sql
-- IMPORTANTE: Este script ELIMINA todos los datos existentes

-- Ejecutar script de configuración limpia
\i scripts/clean-database-setup.sql

-- Mensaje de confirmación
\echo 'Base de datos configurada desde cero exitosamente!'
