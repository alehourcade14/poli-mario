-- =============================================
-- SCRIPT DE VERIFICACIÓN POST-ELIMINACIÓN
-- Verificar que la eliminación de columnas no rompió nada
-- =============================================

-- Verificar que la columna fue eliminada
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'camaras' 
            AND column_name = 'usuario_creacion_id'
        ) 
        THEN '❌ ERROR: La columna usuario_creacion_id todavía existe'
        ELSE '✅ OK: La columna usuario_creacion_id fue eliminada correctamente'
    END as verificacion_columna;

-- Verificar que no hay restricciones huérfanas
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu 
                ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = 'camaras' 
            AND ccu.column_name = 'usuario_creacion_id'
        )
        THEN '❌ ERROR: Existen restricciones relacionadas con usuario_creacion_id'
        ELSE '✅ OK: No hay restricciones relacionadas'
    END as verificacion_restricciones;

-- Verificar que las vistas funcionan correctamente
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.views 
            WHERE table_name = 'vista_camaras_por_zona'
        )
        THEN '✅ OK: La vista vista_camaras_por_zona existe'
        ELSE '⚠️ ADVERTENCIA: La vista vista_camaras_por_zona no existe'
    END as verificacion_vista;

-- Verificar que las consultas básicas funcionan
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM camaras LIMIT 1
        )
        THEN '✅ OK: Las consultas a la tabla camaras funcionan'
        ELSE '❌ ERROR: No se puede consultar la tabla camaras'
    END as verificacion_consulta;

-- Mostrar estructura actual de la tabla camaras
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'camaras'
ORDER BY ordinal_position;


