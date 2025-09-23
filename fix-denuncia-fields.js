const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'sistema_denuncias',
  password: process.env.POSTGRES_PASSWORD || 'root',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
})

async function fixDenunciaFields() {
  try {
    console.log('🔧 Corrigiendo campos de denuncias...')
    
    // 1. Verificar si existe la tabla tipos_delitos
    const tiposDelitosExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tipos_delitos'
      )
    `)
    
    if (!tiposDelitosExists.rows[0].exists) {
      console.log('📝 Creando tabla tipos_delitos...')
      await pool.query(`
        CREATE TABLE tipos_delitos (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL UNIQUE,
          descripcion TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `)
      
      // Insertar tipos de delitos comunes
      await pool.query(`
        INSERT INTO tipos_delitos (nombre, descripcion) VALUES
        ('Robo', 'Sustracción de bienes con violencia o intimidación'),
        ('Hurto', 'Sustracción de bienes sin violencia'),
        ('Defraudación', 'Estafa o fraude'),
        ('Paradero', 'Persona desaparecida'),
        ('Lesiones', 'Daño físico a otra persona'),
        ('Amenazas', 'Intimidación verbal o escrita'),
        ('Daños', 'Destrucción o deterioro de bienes'),
        ('Otros', 'Otros tipos de delitos no especificados')
      `)
      console.log('✅ Tabla tipos_delitos creada y poblada')
    } else {
      console.log('✅ Tabla tipos_delitos ya existe')
    }
    
    // 2. Verificar si existe la columna tipo_delito_id en denuncias
    const tipoDelitoIdExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'denuncias' 
        AND column_name = 'tipo_delito_id'
      )
    `)
    
    if (!tipoDelitoIdExists.rows[0].exists) {
      console.log('📝 Agregando columna tipo_delito_id a denuncias...')
      await pool.query(`
        ALTER TABLE denuncias 
        ADD COLUMN tipo_delito_id INTEGER REFERENCES tipos_delitos(id)
      `)
      console.log('✅ Columna tipo_delito_id agregada')
    } else {
      console.log('✅ Columna tipo_delito_id ya existe')
    }
    
    // 3. Verificar si existe la columna division en denuncias
    const divisionExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'denuncias' 
        AND column_name = 'division'
      )
    `)
    
    if (!divisionExists.rows[0].exists) {
      console.log('📝 Agregando columna division a denuncias...')
      await pool.query(`
        ALTER TABLE denuncias 
        ADD COLUMN division VARCHAR(100)
      `)
      console.log('✅ Columna division agregada')
    } else {
      console.log('✅ Columna division ya existe')
    }
    
    // 4. Verificar si hay denuncias sin tipo_delito_id
    console.log('🔄 Verificando denuncias existentes...')
    const denunciasSinTipo = await pool.query('SELECT COUNT(*) as count FROM denuncias WHERE tipo_delito_id IS NULL')
    console.log(`📊 Denuncias sin tipo_delito_id: ${denunciasSinTipo.rows[0].count}`)
    
    if (parseInt(denunciasSinTipo.rows[0].count) > 0) {
      console.log('ℹ️ Hay denuncias sin tipo_delito_id. Se pueden actualizar manualmente si es necesario.')
    }
    
    console.log('🎉 Corrección completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

fixDenunciaFields()
