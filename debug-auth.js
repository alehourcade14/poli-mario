const { Pool } = require('pg')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 DIAGNÓSTICO DE AUTENTICACIÓN')
console.log('================================')
console.log('')

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'sistema_denuncias',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  ssl: false,
})

async function debugAuth() {
  try {
    console.log('1. Verificando configuración...')
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '***DEFINIDO***' : 'NO DEFINIDO')
    console.log('   POSTGRES_DB:', process.env.POSTGRES_DB || 'NO DEFINIDO')
    console.log('')

    console.log('2. Conectando a PostgreSQL...')
    const client = await pool.connect()
    console.log('   ✅ Conexión exitosa')
    console.log('')

    console.log('3. Verificando usuario admin...')
    const adminUser = await client.query(
      'SELECT * FROM usuarios WHERE email = $1',
      ['admin@policia.gob.ar']
    )

    if (adminUser.rows.length === 0) {
      console.log('   ❌ Usuario admin no encontrado')
      console.log('   🔧 Creando usuario admin...')
      
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await client.query(`
        INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, activo)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['admin@policia.gob.ar', hashedPassword, 'Admin', 'Sistema', 'admin', true])
      
      console.log('   ✅ Usuario admin creado')
    } else {
      console.log('   ✅ Usuario admin encontrado')
      console.log('   📧 Email:', adminUser.rows[0].email)
      console.log('   👤 Nombre:', adminUser.rows[0].nombre, adminUser.rows[0].apellido)
      console.log('   🔑 Rol:', adminUser.rows[0].rol)
      console.log('   🔒 Activo:', adminUser.rows[0].activo)
    }

    console.log('')
    console.log('4. Probando generación de token...')
    
    const user = adminUser.rows[0]
    const JWT_SECRET = process.env.JWT_SECRET || 'mi-secreto-super-seguro-para-jwt-2024'
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol,
        departamento_id: user.departamento_id 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    console.log('   ✅ Token generado correctamente')
    console.log('   🗝️ Token (primeros 50 caracteres):', token.substring(0, 50) + '...')
    
    console.log('')
    console.log('5. Probando verificación de token...')
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      console.log('   ✅ Token verificado correctamente')
      console.log('   👤 Usuario ID:', decoded.id)
      console.log('   📧 Email:', decoded.email)
      console.log('   🔑 Rol:', decoded.rol)
    } catch (error) {
      console.log('   ❌ Error verificando token:', error.message)
    }

    console.log('')
    console.log('6. Simulando login completo...')
    
    // Simular el proceso de login
    const loginData = {
      email: 'admin@policia.gob.ar',
      password: 'admin123'
    }
    
    console.log('   📧 Email:', loginData.email)
    console.log('   🔑 Contraseña:', loginData.password)
    
    // Verificar contraseña
    const bcrypt = require('bcryptjs')
    const isValidPassword = await bcrypt.compare(loginData.password, user.password_hash)
    
    if (isValidPassword) {
      console.log('   ✅ Contraseña correcta')
      console.log('   ✅ Login exitoso')
      console.log('   🗝️ Token para usar en cookies:', token)
    } else {
      console.log('   ❌ Contraseña incorrecta')
    }

    client.release()

    console.log('')
    console.log('===========================================')
    console.log('✅ DIAGNÓSTICO COMPLETADO')
    console.log('===========================================')
    console.log('')
    console.log('Si todo está correcto, el login debería funcionar.')
    console.log('Si hay problemas, revisa la consola del navegador (F12)')
    console.log('')

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message)
    console.error('')
    console.error('Posibles soluciones:')
    console.error('1. Verifica que PostgreSQL esté ejecutándose')
    console.error('2. Verifica la configuración en .env.local')
    console.error('3. Ejecuta: setup-complete.bat')
  } finally {
    await pool.end()
  }
}

debugAuth()
