import { Pool, PoolClient } from 'pg'

// Configuración de la conexión PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'sistema_denuncias',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Función para obtener una conexión del pool
export async function getConnection(): Promise<PoolClient> {
  try {
    const client = await pool.connect()
    return client
  } catch (error) {
    console.error('Error al conectar a PostgreSQL:', error)
    throw error
  }
}

// Función para ejecutar queries
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await getConnection()
  try {
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error('Error ejecutando query:', error)
    throw error
  } finally {
    client.release()
  }
}

// Función para verificar la conexión
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time')
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0])
    return true
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error)
    return false
  }
}

// Función para cerrar el pool (útil para tests o shutdown)
export async function closePool(): Promise<void> {
  await pool.end()
}

// Exportar el pool para casos especiales
export { pool }
