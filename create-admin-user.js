const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

console.log('🔧 CREANDO USUARIO ADMIN')
console.log('========================')
console.log('')

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'sistema_denuncias',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  ssl: false,
})

async function createAdminUser() {
  try {
    console.log('1. Conectando a PostgreSQL...')
    const client = await pool.connect()
    console.log('   ✅ Conexión exitosa')
    
    console.log('')
    console.log('2. Verificando si la tabla usuarios existe...')
    
    // Verificar si la tabla existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `)
    
    if (!tableExists.rows[0].exists) {
      console.log('   ❌ Tabla usuarios no existe')
      console.log('   🔧 Creando tabla usuarios...')
      
      // Crear tabla usuarios
      await client.query(`
        CREATE TABLE usuarios (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          nombre VARCHAR(100) NOT NULL,
          apellido VARCHAR(100) NOT NULL,
          dni VARCHAR(20),
          telefono VARCHAR(20),
          rol VARCHAR(50) NOT NULL DEFAULT 'usuario',
          departamento_id INTEGER,
          activo BOOLEAN DEFAULT true,
          ultimo_acceso TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `)
      
      console.log('   ✅ Tabla usuarios creada')
    } else {
      console.log('   ✅ Tabla usuarios existe')
    }
    
    console.log('')
    console.log('3. Verificando usuario admin...')
    
    // Verificar si el usuario admin existe
    const adminExists = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      ['admin@policia.gob.ar']
    )
    
    if (adminExists.rows.length > 0) {
      console.log('   ✅ Usuario admin ya existe')
      console.log('   🔄 Actualizando contraseña...')
      
      // Actualizar contraseña del admin existente
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await client.query(
        'UPDATE usuarios SET password_hash = $1, activo = true WHERE email = $2',
        [hashedPassword, 'admin@policia.gob.ar']
      )
      
      console.log('   ✅ Contraseña actualizada')
    } else {
      console.log('   ❌ Usuario admin no existe')
      console.log('   🔧 Creando usuario admin...')
      
      // Crear usuario admin
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await client.query(`
        INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, activo)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['admin@policia.gob.ar', hashedPassword, 'Admin', 'Sistema', 'admin', true])
      
      console.log('   ✅ Usuario admin creado')
    }
    
    console.log('')
    console.log('4. Verificando usuario admin...')
    
    const adminUser = await client.query(
      'SELECT * FROM usuarios WHERE email = $1',
      ['admin@policia.gob.ar']
    )
    
    if (adminUser.rows.length > 0) {
      const user = adminUser.rows[0]
      console.log('   ✅ Usuario admin verificado:')
      console.log('      📧 Email:', user.email)
      console.log('      👤 Nombre:', user.nombre, user.apellido)
      console.log('      🔑 Rol:', user.rol)
      console.log('      🔒 Activo:', user.activo)
    }
    
    client.release()
    
    console.log('')
    console.log('===========================================')
    console.log('✅ USUARIO ADMIN CREADO EXITOSAMENTE')
    console.log('===========================================')
    console.log('')
    console.log('Credenciales de acceso:')
    console.log('📧 Email: admin@policia.gob.ar')
    console.log('🔑 Contraseña: admin123')
    console.log('')
    console.log('Ahora puedes hacer login en el sistema!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('')
    console.error('Posibles soluciones:')
    console.error('1. Verifica que PostgreSQL esté ejecutándose')
    console.error('2. Verifica la configuración en .env.local')
    console.error('3. Instala PostgreSQL si no está instalado')
  } finally {
    await pool.end()
  }
}

createAdminUser()

