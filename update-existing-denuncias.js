const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'sistema_denuncias',
  password: process.env.POSTGRES_PASSWORD || 'root',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
})

async function updateExistingDenuncias() {
  try {
    console.log('🔄 Actualizando denuncias existentes...')
    
    // Obtener denuncias sin tipo_delito_id
    const denuncias = await pool.query('SELECT id, descripcion FROM denuncias WHERE tipo_delito_id IS NULL')
    
    console.log(`📊 Encontradas ${denuncias.rows.length} denuncias sin tipo_delito_id`)
    
    // Asignar tipo "Otros" por defecto a las denuncias sin tipo
    const tipoOtros = await pool.query('SELECT id FROM tipos_delitos WHERE nombre = $1', ['Otros'])
    
    if (tipoOtros.rows.length === 0) {
      console.log('❌ No se encontró el tipo "Otros" en la tabla tipos_delitos')
      return
    }
    
    const tipoOtrosId = tipoOtros.rows[0].id
    
    for (const denuncia of denuncias.rows) {
      await pool.query('UPDATE denuncias SET tipo_delito_id = $1 WHERE id = $2', [tipoOtrosId, denuncia.id])
      console.log(`✅ Actualizada denuncia ${denuncia.id} con tipo "Otros"`)
    }
    
    // Asignar división por defecto
    await pool.query('UPDATE denuncias SET division = $1 WHERE division IS NULL', ['División de Robos y Hurtos'])
    console.log('✅ Asignada división por defecto a denuncias sin división')
    
    console.log('🎉 Actualización completada!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

updateExistingDenuncias()

