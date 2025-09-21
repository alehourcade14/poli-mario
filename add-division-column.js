const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

console.log('🔧 AGREGANDO COLUMNA DIVISIÓN A LA TABLA USUARIOS')
console.log('================================================')
console.log('')

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'sistema_denuncias',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  ssl: false,
})

async function addDivisionColumn() {
  try {
    console.log('1. Conectando a PostgreSQL...')
    const client = await pool.connect()
    console.log('   ✅ Conexión exitosa')
    console.log('')

    console.log('2. Verificando si la columna division existe...')
    
    // Verificar si la columna ya existe
    const columnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND column_name = 'division'
    `)
    
    if (columnExists.rows.length > 0) {
      console.log('   ✅ La columna division ya existe')
    } else {
      console.log('   ❌ La columna division no existe')
      console.log('   🔧 Agregando columna division...')
      
      // Agregar la columna division
      await client.query(`
        ALTER TABLE usuarios 
        ADD COLUMN division VARCHAR(100)
      `)
      
      console.log('   ✅ Columna division agregada exitosamente')
    }

    console.log('')
    console.log('3. Verificando estructura de la tabla usuarios...')
    
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `)
    
    console.log('   📋 Estructura actual de la tabla usuarios:')
    tableStructure.rows.forEach(row => {
      console.log(`      - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
    })

    console.log('')
    console.log('4. Verificando datos existentes...')
    
    const userCount = await client.query('SELECT COUNT(*) FROM usuarios')
    console.log(`   📊 Total de usuarios en la base de datos: ${userCount.rows[0].count}`)
    
    if (userCount.rows[0].count > 0) {
      const usersWithDivision = await client.query('SELECT COUNT(*) FROM usuarios WHERE division IS NOT NULL')
      console.log(`   📊 Usuarios con división asignada: ${usersWithDivision.rows[0].count}`)
    }

    client.release()

    console.log('')
    console.log('================================================')
    console.log('✅ COLUMNA DIVISIÓN AGREGADA EXITOSAMENTE')
    console.log('================================================')
    console.log('')
    console.log('Ahora puedes:')
    console.log('1. Crear usuarios con departamento y división')
    console.log('2. Los campos aparecerán en el formulario de usuarios')
    console.log('3. La tabla mostrará la información de división')
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('')
    console.error('Posibles soluciones:')
    console.error('1. Verifica que PostgreSQL esté ejecutándose')
    console.error('2. Verifica la configuración en .env.local')
    console.error('3. Ejecuta: setup-complete.bat')
  } finally {
    await pool.end()
  }
}

addDivisionColumn()
