import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from './database-postgres'

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion'

export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  dni?: string
  telefono?: string
  rol: string
  departamento_id?: string
  activo: boolean
  created_at: Date
  updated_at: Date
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  error?: string
}

// Función para hashear contraseñas
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Función para verificar contraseñas
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Función para generar JWT
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    rol: user.rol,
    departamento_id: user.departamento_id
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

// Función para verificar JWT
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Token inválido')
  }
}

// Función para autenticar usuario
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Buscar usuario por email
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email]
    )

    if (result.rows.length === 0) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    const user = result.rows[0]

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      return { success: false, error: 'Contraseña incorrecta' }
    }

    // Generar token
    const token = generateToken(user)

    // Actualizar último acceso
    await query(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1',
      [user.id]
    )

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        dni: user.dni,
        telefono: user.telefono,
        rol: user.rol,
        departamento_id: user.departamento_id,
        activo: user.activo,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token
    }
  } catch (error) {
    console.error('Error en autenticación:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}

// Función para obtener usuario por ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await query(
      'SELECT * FROM usuarios WHERE id = $1 AND activo = true',
      [id]
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]
    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      dni: user.dni,
      telefono: user.telefono,
      rol: user.rol,
      departamento_id: user.departamento_id,
      activo: user.activo,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return null
  }
}

// Función para crear usuario (solo para administradores)
export async function createUser(userData: {
  email: string
  password: string
  nombre: string
  apellido: string
  dni?: string
  telefono?: string
  rol: string
  departamento_id?: string
}): Promise<AuthResult> {
  try {
    // Verificar que el email no exista
    const existingUser = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [userData.email]
    )

    if (existingUser.rows.length > 0) {
      return { success: false, error: 'El email ya está registrado' }
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(userData.password)

    // Insertar usuario
    const result = await query(
      `INSERT INTO usuarios (email, password_hash, nombre, apellido, dni, telefono, rol, departamento_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userData.email,
        passwordHash,
        userData.nombre,
        userData.apellido,
        userData.dni,
        userData.telefono,
        userData.rol,
        userData.departamento_id
      ]
    )

    const newUser = result.rows[0]
    
    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        dni: newUser.dni,
        telefono: newUser.telefono,
        rol: newUser.rol,
        departamento_id: newUser.departamento_id,
        activo: newUser.activo,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at
      }
    }
  } catch (error) {
    console.error('Error creando usuario:', error)
    return { success: false, error: 'Error interno del servidor' }
  }
}
