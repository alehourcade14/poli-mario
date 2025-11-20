const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'sistema_denuncias',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  ssl: false,
})

async function addDivisionColumn() {
  const client = await pool.connect()
  try {
    console.log('🔍 Verificando si la columna division existe...')
    
    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'denuncias_formales' 
      AND column_name = 'division'
    `)
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna division ya existe en la tabla denuncias_formales')
      return
    }
    
    console.log('📝 Agregando columna division a la tabla denuncias_formales...')
    
    // Agregar la columna
    await client.query(`
      ALTER TABLE denuncias_formales 
      ADD COLUMN division VARCHAR(100) DEFAULT 'División de Robos y Hurtos'
    `)
    
    console.log('✅ Columna division agregada exitosamente')
    
    // Actualizar registros existentes
    console.log('📝 Actualizando registros existentes...')
    await client.query(`
      UPDATE denuncias_formales 
      SET division = 'División de Robos y Hurtos' 
      WHERE division IS NULL
    `)
    
    console.log('✅ Registros actualizados exitosamente')
    
    // Hacer el campo NOT NULL (opcional, comentado por si hay problemas)
    // await client.query(`
    //   ALTER TABLE denuncias_formales
    //   ALTER COLUMN division SET NOT NULL
    // `)
    
    console.log('✅ Migración completada exitosamente')
  } catch (error) {
    console.error('❌ Error al agregar la columna division:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

addDivisionColumn()
  .then(() => {
    console.log('✅ Script ejecutado correctamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error ejecutando el script:', error)
    process.exit(1)
  })

