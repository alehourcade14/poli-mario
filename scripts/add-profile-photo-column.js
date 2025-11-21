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

async function addProfilePhotoColumn() {
  try {
    console.log('1. Conectando a PostgreSQL...')
    const client = await pool.connect()
    console.log('   ✅ Conexión exitosa')
    
    console.log('')
    console.log('2. Verificando si la columna foto_perfil existe...')
    
    // Verificar si la columna existe
    const columnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
        AND column_name = 'foto_perfil'
      );
    `)
    
    if (columnExists.rows[0].exists) {
      console.log('   ✅ La columna foto_perfil ya existe')
      client.release()
      return
    }
    
    console.log('   ❌ La columna foto_perfil no existe')
    console.log('   🔧 Agregando columna foto_perfil...')
    
    // Agregar columna foto_perfil
    await client.query(`
      ALTER TABLE usuarios 
      ADD COLUMN foto_perfil VARCHAR(500);
    `)
    
    console.log('   ✅ Columna foto_perfil agregada exitosamente')
    
    client.release()
    console.log('')
    console.log('✅ Proceso completado exitosamente')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

addProfilePhotoColumn()

