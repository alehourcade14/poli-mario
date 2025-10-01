-- Agregar campo division a la tabla denuncias_formales
ALTER TABLE denuncias_formales 
ADD COLUMN division VARCHAR(100) DEFAULT 'División de Robos y Hurtos';

-- Actualizar registros existentes con un valor por defecto
UPDATE denuncias_formales 
SET division = 'División de Robos y Hurtos' 
WHERE division IS NULL;

-- Hacer el campo NOT NULL después de actualizar
ALTER TABLE denuncias_formales 
ALTER COLUMN division SET NOT NULL;


