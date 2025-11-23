import { NextResponse } from 'next/server'
import { query } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'
import { canViewAllDenuncias, getUserDivision, buildDivisionFilter } from '@/lib/permissions'

// GET - Obtener todas las denuncias formales
export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0]
    
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new NextResponse(JSON.stringify({ error: 'Token inválido' }), { status: 401 })
    }

    // Obtener división del usuario
    const userDivision = await getUserDivision(decoded.id)
    const canViewAll = canViewAllDenuncias(decoded.rol, userDivision || undefined)
    
    // Construir filtro de división
    const divisionFilter = buildDivisionFilter(canViewAll, userDivision, 'df')
    const hasFilter = divisionFilter && !divisionFilter.includes('IS NULL')

    let queryText = `
      SELECT 
        df.id,
        df.numero_expediente,
        df.denunciante_nombre,
        df.denunciante_apellido,
        df.denunciante_dni,
        df.denunciante_telefono,
        df.denunciante_email,
        df.denunciante_direccion,
        df.denunciante_nacionalidad,
        df.denunciante_estado_civil,
        df.denunciante_profesion,
        df.fecha_hecho,
        df.hora_hecho,
        df.lugar_hecho,
        df.departamento_hecho,
        df.latitud,
        df.longitud,
        df.descripcion,
        df.circunstancias,
        df.testigos,
        df.elementos_sustraidos,
        df.valor_estimado,
        df.denunciado_nombre,
        df.denunciado_apellido,
        df.denunciado_dni,
        df.denunciado_descripcion,
        df.tipo_delito_id,
        df.estado_id,
        df.departamento_id,
        df.fecha_denuncia,
        df.hora_denuncia,
        df.observaciones,
        df.archivos_adjuntos,
        df.requiere_seguimiento,
        df.created_at,
        df.updated_at,
        COALESCE(df.division, 'División de Robos y Hurtos') as division,
        de.nombre as departamento_nombre,
        es.nombre as estado_nombre,
        td.nombre as tipo_delito,
        u.nombre || ' ' || u.apellido as creador_nombre
      FROM denuncias_formales df
      LEFT JOIN departamentos de ON df.departamento_id = de.id
      LEFT JOIN estados_denuncias es ON df.estado_id = es.id
      LEFT JOIN tipos_delitos td ON df.tipo_delito_id = td.id
      LEFT JOIN usuarios u ON df.usuario_id = u.id
      ${divisionFilter}
      ORDER BY df.created_at DESC
    `

    const result = hasFilter 
      ? await query(queryText, [userDivision])
      : await query(queryText)

    return new NextResponse(JSON.stringify(result.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error al obtener denuncias formales:", error)
    return new NextResponse(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// POST - Crear nueva denuncia formal
export async function POST(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0]
    
    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new NextResponse(JSON.stringify({ error: 'Token inválido' }), { status: 401 })
    }

    const data = await request.json()
    console.log("Datos recibidos para denuncia formal:", data)
    
    // Validar campos requeridos
    if (!data.denunciante_nombre || !data.denunciante_apellido || !data.denunciante_dni) {
      return new NextResponse(JSON.stringify({ error: 'Faltan campos requeridos: nombre, apellido o DNI' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Obtener estado seleccionado en el formulario o usar Consulta por defecto
    const estadoSeleccionado = data.estado || 'Consulta'
    const estadoResult = await query('SELECT id FROM estados_denuncias WHERE nombre = $1', [estadoSeleccionado])
    const estadoId = estadoResult.rows[0]?.id || 1

    // Obtener tipo de delito si existe
    let tipoDelitoId = null
    if (data.tipo_delito) {
      try {
        const tipoResult = await query('SELECT id FROM tipos_delitos WHERE nombre = $1', [data.tipo_delito])
        tipoDelitoId = tipoResult.rows[0]?.id
      } catch (tipoError) {
        console.warn("No se pudo encontrar el tipo de delito:", data.tipo_delito)
        // Continuar sin tipo de delito
      }
    }

    // Obtener departamento si existe
    let departamentoId = null
    if (data.departamento) {
      try {
        console.log("🔍 Buscando departamento:", data.departamento)
        const deptResult = await query('SELECT id FROM departamentos WHERE nombre = $1', [data.departamento])
        departamentoId = deptResult.rows[0]?.id
        console.log("✅ Departamento encontrado:", { nombre: data.departamento, id: departamentoId })
      } catch (deptError) {
        console.warn("❌ No se pudo encontrar el departamento:", data.departamento, deptError)
        // Continuar sin departamento
      }
    } else {
      console.log("⚠️ No se proporcionó departamento")
    }

    // Generar número de expediente único si no se proporciona
    let numeroExpediente = data.numero_expediente
    if (!numeroExpediente) {
      numeroExpediente = `EXP-FORMAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    // Verificar si el número de expediente ya existe
    const existingExpediente = await query('SELECT id FROM denuncias_formales WHERE numero_expediente = $1', [numeroExpediente])
    if (existingExpediente.rows.length > 0) {
      // Si existe, generar uno nuevo
      numeroExpediente = `EXP-FORMAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    // Obtener fecha y hora actual si no se proporcionan
    const fechaDenuncia = data.fecha_denuncia || new Date().toISOString().split('T')[0]
    const horaDenuncia = data.hora_denuncia || new Date().toTimeString().split(' ')[0].substring(0, 5)

    const result = await query(`
      INSERT INTO denuncias_formales (
        numero_expediente, denunciante_nombre, denunciante_apellido,
        denunciante_dni, denunciante_telefono, denunciante_email, denunciante_direccion,
        denunciante_nacionalidad, denunciante_estado_civil, denunciante_profesion,
        fecha_hecho, hora_hecho, lugar_hecho, departamento_hecho, latitud, longitud,
        descripcion, circunstancias, testigos, elementos_sustraidos, valor_estimado,
        denunciado_nombre, denunciado_apellido, denunciado_dni, denunciado_descripcion,
        tipo_delito_id, estado_id, departamento_id, usuario_id, observaciones, division,
        fecha_denuncia, hora_denuncia
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
      RETURNING *
    `, [
      numeroExpediente,
      data.denunciante_nombre || '',
      data.denunciante_apellido || '',
      data.denunciante_dni || '',
      data.denunciante_telefono || '',
      data.denunciante_email || '',
      data.denunciante_direccion || '',
      data.denunciante_nacionalidad || 'Argentina',
      data.denunciante_estado_civil || '',
      data.denunciante_profesion || '',
      data.fecha_hecho || null,
      data.hora_hecho || null,
      data.lugar_hecho || '',
      data.departamento_hecho || '',
      data.latitud || null,
      data.longitud || null,
      data.descripcion || '',
      data.circunstancias || '',
      data.testigos || '',
      data.elementos_sustraidos || '',
      data.valor_estimado || null,
      data.denunciado_nombre || '',
      data.denunciado_apellido || '',
      data.denunciado_dni || '',
      data.denunciado_descripcion || '',
      tipoDelitoId,
      estadoId,
      departamentoId,
      decoded.id,
      data.observaciones || '',
      data.division || 'División de Robos y Hurtos',
      fechaDenuncia,
      horaDenuncia
    ])

    // Obtener la denuncia creada con los datos relacionados (departamento_nombre, etc.)
    const denunciaCreada = result.rows[0]
    const denunciaCompleta = await query(`
      SELECT 
        df.*,
        de.nombre as departamento_nombre,
        es.nombre as estado_nombre,
        COALESCE(td.nombre, 'Delito no especificado') as tipo_delito_nombre,
        u.nombre || ' ' || u.apellido as creador_nombre,
        COALESCE(df.division, 'División de Robos y Hurtos') as division
      FROM denuncias_formales df
      LEFT JOIN departamentos de ON df.departamento_id = de.id
      LEFT JOIN estados_denuncias es ON df.estado_id = es.id
      LEFT JOIN tipos_delitos td ON df.tipo_delito_id = td.id
      LEFT JOIN usuarios u ON df.usuario_id = u.id
      WHERE df.id = $1
    `, [denunciaCreada.id])

    // Si no se encontró el departamento_nombre en el JOIN, usar el que se envió en el formulario
    const denunciaFinal = denunciaCompleta.rows[0] || denunciaCreada
    if (!denunciaFinal.departamento_nombre && data.departamento) {
      denunciaFinal.departamento_nombre = data.departamento
    }
    // Asegurar que la división siempre use el valor enviado desde el formulario
    if (data.division && data.division.trim() !== '') {
      denunciaFinal.division = data.division
      console.log("📋 División asignada desde data.division:", data.division)
    } else if (!denunciaFinal.division || denunciaFinal.division.trim() === '') {
      denunciaFinal.division = 'División de Robos y Hurtos'
      console.log("📋 División usando valor por defecto")
    }
    console.log("📋 División final en la respuesta:", denunciaFinal.division)
    if (!denunciaFinal.tipo_delito_nombre && data.tipo_delito) {
      denunciaFinal.tipo_delito_nombre = data.tipo_delito
    }

    return new NextResponse(JSON.stringify(denunciaFinal), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error("Error detallado al crear denuncia formal:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      constraint: error.constraint,
      detail: error.detail
    })
    return new NextResponse(JSON.stringify({ 
      error: error.message || 'Error interno del servidor',
      details: error.detail || error.constraint || 'Sin detalles adicionales'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
