-- =============================================
-- SCRIPT DE LIMPIEZA: ELIMINAR COLUMNAS OBSOLETAS
-- Sistema de Gestión Policial
-- =============================================
-- 
-- Este script elimina columnas que ya no se utilizan en el código
-- de la aplicación, formularios, consultas o procesos críticos.
--
-- IMPORTANTE: 
-- - Hacer backup de la base de datos antes de ejecutar
-- - Revisar el análisis en scripts/analisis-columnas-obsoletas.md
-- - Ejecutar en un entorno de prueba primero
--
-- =============================================

BEGIN;

-- =============================================
-- 1. ELIMINAR COLUMNA usuario_creacion_id DE camaras
-- =============================================
-- 
-- Justificación:
-- - No se inserta en ninguna parte del código
-- - No se consulta en ninguna SELECT
-- - No se usa en formularios ni interfaces
-- - La tabla camaras no necesita tracking de usuario creador
--
-- Impacto: Bajo riesgo, no se usa en ningún lugar

DO $$
BEGIN
    -- Verificar si la columna existe antes de eliminarla
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'camaras' 
        AND column_name = 'usuario_creacion_id'
    ) THEN
        -- Eliminar la restricción de clave foránea si existe
        ALTER TABLE camaras DROP CONSTRAINT IF EXISTS camaras_usuario_creacion_id_fkey;
        
        -- Eliminar la columna
        ALTER TABLE camaras DROP COLUMN usuario_creacion_id;
        
        RAISE NOTICE 'Columna usuario_creacion_id eliminada de la tabla camaras';
    ELSE
        RAISE NOTICE 'La columna usuario_creacion_id no existe en la tabla camaras';
    END IF;
END $$;

-- =============================================
-- 2. RECREAR VISTAS QUE PUEDEN HABER SIDO AFECTADAS
-- =============================================
-- 
-- Las vistas que usan SELECT * pueden verse afectadas
-- Recreamos las vistas relevantes para asegurar consistencia

-- Recrear vista de cámaras por zona (si existe)
DROP VIEW IF EXISTS vista_camaras_por_zona CASCADE;

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

-- =============================================
-- 3. VERIFICACIÓN FINAL
-- =============================================
-- 
-- Verificar que las columnas fueron eliminadas correctamente

DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Verificar que usuario_creacion_id ya no existe
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'camaras' 
        AND column_name = 'usuario_creacion_id'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE EXCEPTION 'ERROR: La columna usuario_creacion_id todavía existe en camaras';
    ELSE
        RAISE NOTICE '✅ Verificación exitosa: usuario_creacion_id eliminada correctamente';
    END IF;
END $$;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

COMMIT;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'LIMPIEZA DE COLUMNAS OBSOLETAS COMPLETADA';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Columnas eliminadas:';
    RAISE NOTICE '  - camaras.usuario_creacion_id';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Vistas recreadas:';
    RAISE NOTICE '  - vista_camaras_por_zona';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'IMPORTANTE: Verificar que la aplicación funciona correctamente';
    RAISE NOTICE '=============================================';
END $$;


