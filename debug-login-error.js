const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 DIAGNÓSTICO COMPLETO DEL ERROR DE LOGIN')
console.log('==========================================')
console.log('')

// 1. Verificar variables de entorno
console.log('1. Verificando variables de entorno...')
console.log('   POSTGRES_HOST:', process.env.POSTGRES_HOST || 'NO DEFINIDO')
console.log('   POSTGRES_PORT:', process.env.POSTGRES_PORT || 'NO DEFINIDO')
console.log('   POSTGRES_DB:', process.env.POSTGRES_DB || 'NO DEFINIDO')
console.log('   POSTGRES_USER:', process.env.POSTGRES_USER || 'NO DEFINIDO')
console.log('   POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '***DEFINIDO***' : 'NO DEFINIDO')
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '***DEFINIDO***' : 'NO DEFINIDO')
console.log('')

// 2. Probar conexión a PostgreSQL
console.log('2. Probando conexión a PostgreSQL...')
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'sistema_denuncias',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

async function testDatabase() {
  try {
    const client = await pool.connect()
    console.log('   ✅ Conexión a PostgreSQL exitosa')
    
    // Verificar si la tabla usuarios existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `)
    
    if (tableCheck.rows[0].exists) {
      console.log('   ✅ Tabla usuarios existe')
      
      // Verificar si hay usuarios
      const userCount = await client.query('SELECT COUNT(*) FROM usuarios')
      console.log(`   📊 Usuarios en la base de datos: ${userCount.rows[0].count}`)
      
      // Verificar usuario admin
      const adminUser = await client.query('SELECT * FROM usuarios WHERE email = $1', ['admin@policia.gob.ar'])
      if (adminUser.rows.length > 0) {
        console.log('   ✅ Usuario admin encontrado')
        console.log('   📧 Email:', adminUser.rows[0].email)
        console.log('   👤 Nombre:', adminUser.rows[0].nombre, adminUser.rows[0].apellido)
        console.log('   🔑 Rol:', adminUser.rows[0].rol)
        console.log('   🔒 Activo:', adminUser.rows[0].activo)
        console.log('   🗝️ Password hash:', adminUser.rows[0].password_hash ? '***DEFINIDO***' : 'NO DEFINIDO')
      } else {
        console.log('   ❌ Usuario admin NO encontrado')
        console.log('   💡 Creando usuario admin...')
        
        // Crear usuario admin
        const hashedPassword = await bcrypt.hash('admin123', 12)
        await client.query(`
          INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, activo, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, ['admin@policia.gob.ar', hashedPassword, 'Admin', 'Sistema', 'admin', true])
        
        console.log('   ✅ Usuario admin creado exitosamente')
        console.log('   📧 Email: admin@policia.gob.ar')
        console.log('   🔑 Contraseña: admin123')
      }
    } else {
      console.log('   ❌ Tabla usuarios NO existe')
      console.log('   💡 Ejecuta: setup-database.ps1 para crear las tablas')
    }
    
    client.release()
    
  } catch (error) {
    console.log('   ❌ Error de conexión a PostgreSQL:')
    console.log('   📝 Mensaje:', error.message)
    console.log('   🔢 Código:', error.code)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 PostgreSQL no está ejecutándose')
      console.log('   🔧 Solución: Inicia PostgreSQL desde Servicios de Windows')
    } else if (error.code === '28P01') {
      console.log('   💡 Error de autenticación')
      console.log('   🔧 Solución: Verifica usuario y contraseña en .env.local')
    } else if (error.code === '3D000') {
      console.log('   💡 Base de datos no existe')
      console.log('   🔧 Solución: Ejecuta setup-database.ps1')
    }
  }
}

// 3. Probar autenticación
async function testAuthentication() {
  console.log('')
  console.log('3. Probando autenticación...')
  
  try {
    const client = await pool.connect()
    
    // Buscar usuario admin
    const result = await client.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      ['admin@policia.gob.ar']
    )
    
    if (result.rows.length === 0) {
      console.log('   ❌ Usuario admin no encontrado')
      return
    }
    
    const user = result.rows[0]
    console.log('   ✅ Usuario admin encontrado')
    
    // Probar contraseña
    const isValidPassword = await bcrypt.compare('admin123', user.password_hash)
    if (isValidPassword) {
      console.log('   ✅ Contraseña correcta')
      
      // Generar token
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion',
        { expiresIn: '24h' }
      )
      console.log('   ✅ Token JWT generado correctamente')
      
    } else {
      console.log('   ❌ Contraseña incorrecta')
      console.log('   💡 Usa la contraseña: admin123')
    }
    
    client.release()
    
  } catch (error) {
    console.log('   ❌ Error en autenticación:', error.message)
  }
}

// 4. Ejecutar diagnóstico
async function runDiagnostic() {
  await testDatabase()
  await testAuthentication()
  
  console.log('')
  console.log('==========================================')
  console.log('📋 RESUMEN DEL DIAGNÓSTICO')
  console.log('==========================================')
  console.log('')
  console.log('Si todo está correcto, el login debería funcionar con:')
  console.log('📧 Email: admin@policia.gob.ar')
  console.log('🔑 Contraseña: admin123')
  console.log('')
  
  await pool.end()
}

runDiagnostic().catch(console.error)
