import { query } from './database-postgres'

/**
 * Verifica si un usuario puede ver todas las denuncias sin restricciones
 * @param rol - Rol del usuario
 * @param division - División del usuario
 * @returns true si el usuario puede ver todas las denuncias
 */
export function canViewAllDenuncias(rol: string, division?: string): boolean {
  // Los administradores pueden ver todo
  if (rol === 'admin' || rol === 'administrador') {
    return true
  }
  
  // Los usuarios de Operaciones/Mesa de Entrada General pueden ver todo
  if (division === 'Operaciones/Mesa de Entrada General') {
    return true
  }
  
  return false
}

/**
 * Obtiene la división del usuario desde la base de datos
 * @param userId - ID del usuario
 * @returns La división del usuario o null
 */
export async function getUserDivision(userId: string): Promise<string | null> {
  try {
    const result = await query(
      'SELECT division FROM usuarios WHERE id = $1',
      [userId]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0].division || null
  } catch (error) {
    console.error('Error obteniendo división del usuario:', error)
    return null
  }
}

/**
 * Construye la condición WHERE para filtrar denuncias por división
 * @param canViewAll - Si el usuario puede ver todas las denuncias
 * @param userDivision - División del usuario
 * @param tableAlias - Alias de la tabla (d para denuncias, df para denuncias_formales)
 * @returns Condición SQL WHERE o cadena vacía si puede ver todo
 */
export function buildDivisionFilter(
  canViewAll: boolean,
  userDivision: string | null,
  tableAlias: string = 'd'
): string {
  if (canViewAll) {
    return ''
  }
  
  if (!userDivision) {
    // Si el usuario no tiene división, no puede ver ninguna denuncia
    return `WHERE ${tableAlias}.id IS NULL`
  }
  
  return `WHERE ${tableAlias}.division = $1`
}



