const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

// Configuración de la conexión PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'sistema_denuncias',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

async function testConnection() {
  console.log('🔍 Probando conexión a PostgreSQL...')
  console.log('📋 Configuración:')
  console.log(`   Host: ${process.env.POSTGRES_HOST || 'localhost'}`)
  console.log(`   Puerto: ${process.env.POSTGRES_PORT || '5432'}`)
  console.log(`   Base de datos: ${process.env.POSTGRES_DB || 'sistema_denuncias'}`)
  console.log(`   Usuario: ${process.env.POSTGRES_USER || 'postgres'}`)
  console.log('')

  try {
    const client = await pool.connect()
    console.log('✅ Conexión exitosa a PostgreSQL!')
    
    // Probar query simple
    const result = await client.query('SELECT NOW() as current_time')
    console.log(`⏰ Hora actual del servidor: ${result.rows[0].current_time}`)
    
    // Verificar si la base de datos existe
    const dbResult = await client.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [process.env.POSTGRES_DB || 'sistema_denuncias']
    )
    
    if (dbResult.rows.length > 0) {
      console.log('✅ Base de datos encontrada')
    } else {
      console.log('❌ Base de datos no encontrada')
      console.log('💡 Ejecuta: setup-database.ps1 para crear la base de datos')
    }
    
    client.release()
    
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:')
    console.error('   Mensaje:', error.message)
    console.error('   Código:', error.code)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('')
      console.log('💡 Soluciones:')
      console.log('   1. Verifica que PostgreSQL esté ejecutándose')
      console.log('   2. Verifica que el puerto 5432 esté abierto')
      console.log('   3. Verifica la configuración en .env.local')
    } else if (error.code === '28P01') {
      console.log('')
      console.log('💡 Error de autenticación:')
      console.log('   1. Verifica el usuario y contraseña en .env.local')
      console.log('   2. Asegúrate de que el usuario postgres exista')
    } else if (error.code === '3D000') {
      console.log('')
      console.log('💡 Base de datos no encontrada:')
      console.log('   1. Ejecuta: setup-database.ps1')
      console.log('   2. O crea la base de datos manualmente')
    }
  } finally {
    await pool.end()
  }
}

testConnection()
