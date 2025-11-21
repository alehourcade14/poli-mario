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

async function resetDenunciasIdsComplete(deleteAll = false) {
  try {
    console.log('1. Conectando a PostgreSQL...')
    const client = await pool.connect()
    console.log('   ✅ Conexión exitosa')
    
    console.log('')
    console.log('2. Verificando datos existentes...')
    
    // Verificar si hay denuncias
    const denunciasCount = await client.query('SELECT COUNT(*) FROM denuncias')
    const denunciasFormalesCount = await client.query('SELECT COUNT(*) FROM denuncias_formales')
    
    const countDenuncias = parseInt(denunciasCount.rows[0].count)
    const countFormales = parseInt(denunciasFormalesCount.rows[0].count)
    
    console.log(`   📊 Denuncias normales: ${countDenuncias}`)
    console.log(`   📊 Denuncias formales: ${countFormales}`)
    
    if ((countDenuncias > 0 || countFormales > 0) && deleteAll) {
      console.log('')
      console.log('3. Eliminando todas las denuncias existentes...')
      
      if (countDenuncias > 0) {
        console.log(`   🗑️  Eliminando ${countDenuncias} denuncia(s) normal(es)...`)
        await client.query('DELETE FROM denuncias')
        console.log('   ✅ Denuncias normales eliminadas')
      }
      
      if (countFormales > 0) {
        console.log(`   🗑️  Eliminando ${countFormales} denuncia(s) formal(es)...`)
        await client.query('DELETE FROM denuncias_formales')
        console.log('   ✅ Denuncias formales eliminadas')
      }
    } else if (countDenuncias > 0 || countFormales > 0) {
      console.log('')
      console.log('   ⚠️  Hay denuncias existentes. Para reiniciar desde ID=1,')
      console.log('   ⚠️  ejecute el script con el parámetro deleteAll=true')
      console.log('   ⚠️  o elimine manualmente todas las denuncias primero.')
    }
    
    console.log('')
    console.log('4. Reiniciando secuencias de IDs...')
    
    // Reiniciar secuencia de denuncias a 1
    console.log('   🔄 Reiniciando secuencia de denuncias a 1...')
    await client.query('ALTER SEQUENCE denuncias_id_seq RESTART WITH 1')
    console.log('   ✅ Secuencia de denuncias reiniciada a 1')
    
    // Reiniciar secuencia de denuncias_formales a 1
    console.log('   🔄 Reiniciando secuencia de denuncias_formales a 1...')
    await client.query('ALTER SEQUENCE denuncias_formales_id_seq RESTART WITH 1')
    console.log('   ✅ Secuencia de denuncias_formales reiniciada a 1')
    
    // Verificar el siguiente valor de las secuencias
    console.log('')
    console.log('5. Verificando secuencias...')
    
    const nextDenuncias = await client.query("SELECT nextval('denuncias_id_seq')")
    const nextFormales = await client.query("SELECT nextval('denuncias_formales_id_seq')")
    
    // Reiniciar de nuevo porque nextval incrementa el valor
    await client.query('ALTER SEQUENCE denuncias_id_seq RESTART WITH 1')
    await client.query('ALTER SEQUENCE denuncias_formales_id_seq RESTART WITH 1')
    
    console.log(`   ✅ Próximo ID de denuncias: ${nextDenuncias.rows[0].nextval}`)
    console.log(`   ✅ Próximo ID de denuncias_formales: ${nextFormales.rows[0].nextval}`)
    
    client.release()
    console.log('')
    console.log('✅ Proceso completado exitosamente')
    console.log('')
    console.log('📝 Los próximos registros insertados comenzarán con ID = 1')
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('does not exist')) {
      console.error('   💡 La secuencia no existe. Verifique que las tablas estén creadas correctamente.')
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Obtener argumento de línea de comandos
const deleteAll = process.argv.includes('--delete-all') || process.argv.includes('-d')

if (deleteAll) {
  console.log('⚠️  MODO: Eliminar todas las denuncias y reiniciar IDs desde 1')
  console.log('')
} else {
  console.log('ℹ️  MODO: Solo reiniciar secuencias (mantener datos existentes)')
  console.log('   Use --delete-all o -d para eliminar todas las denuncias primero')
  console.log('')
}

resetDenunciasIdsComplete(deleteAll)

