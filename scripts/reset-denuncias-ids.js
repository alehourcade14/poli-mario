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

async function resetDenunciasIds() {
  try {
    console.log('1. Conectando a PostgreSQL...')
    const client = await pool.connect()
    console.log('   ✅ Conexión exitosa')
    
    console.log('')
    console.log('2. Verificando tablas de denuncias...')
    
    // Verificar si las tablas existen
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'denuncias' OR table_name = 'denuncias_formales')
      ORDER BY table_name;
    `)
    
    const existingTables = tablesCheck.rows.map(row => row.table_name)
    console.log('   📋 Tablas encontradas:', existingTables)
    
    if (existingTables.length === 0) {
      console.log('   ❌ No se encontraron tablas de denuncias')
      client.release()
      return
    }
    
    console.log('')
    console.log('3. Obteniendo el máximo ID actual de cada tabla...')
    
    // Obtener el máximo ID de cada tabla
    const maxIds = {}
    for (const table of existingTables) {
      const result = await client.query(`SELECT COALESCE(MAX(id), 0) as max_id FROM ${table}`)
      maxIds[table] = parseInt(result.rows[0].max_id) || 0
      console.log(`   📊 ${table}: ID máximo = ${maxIds[table]}`)
    }
    
    console.log('')
    console.log('4. Reiniciando secuencias...')
    
    // Reiniciar secuencias para cada tabla
    for (const table of existingTables) {
      try {
        // Obtener el nombre de la secuencia (PostgreSQL usa el patrón: tablename_columnname_seq)
        const sequenceName = `${table}_id_seq`
        
        // Verificar si la secuencia existe
        const seqCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM pg_class 
            WHERE relname = $1
          );
        `, [sequenceName])
        
        if (seqCheck.rows[0].exists) {
          // Reiniciar la secuencia al siguiente valor disponible (1 si no hay registros, o MAX(id)+1)
          const nextId = maxIds[table] > 0 ? maxIds[table] + 1 : 1
          await client.query(`ALTER SEQUENCE ${sequenceName} RESTART WITH ${nextId}`)
          console.log(`   ✅ Secuencia ${sequenceName} reiniciada a ${nextId}`)
        } else {
          console.log(`   ⚠️  Secuencia ${sequenceName} no encontrada (puede que la tabla use otro tipo de ID)`)
        }
      } catch (error) {
        console.error(`   ❌ Error al reiniciar secuencia de ${table}:`, error.message)
      }
    }
    
    console.log('')
    console.log('5. Verificando que las secuencias se reiniciaron correctamente...')
    
    // Verificar el siguiente valor de cada secuencia
    for (const table of existingTables) {
      const sequenceName = `${table}_id_seq`
      try {
        const result = await client.query(`SELECT last_value, is_called FROM ${sequenceName}`)
        if (result.rows.length > 0) {
          const { last_value, is_called } = result.rows[0]
          const nextValue = is_called ? parseInt(last_value) + 1 : parseInt(last_value)
          console.log(`   📊 ${sequenceName}: próximo ID será ${nextValue}`)
        }
      } catch (error) {
        console.log(`   ⚠️  No se pudo verificar ${sequenceName}`)
      }
    }
    
    client.release()
    console.log('')
    console.log('✅ Proceso completado exitosamente')
    console.log('')
    console.log('📝 Nota: Los nuevos registros comenzarán desde el ID siguiente al máximo actual.')
    console.log('   Si deseas que los IDs comiencen desde 1, primero debes eliminar todos los registros.')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

resetDenunciasIds()
