# Análisis de Columnas Obsoletas en la Base de Datos

## Resumen Ejecutivo

Este documento identifica las columnas que existen en la base de datos pero que no se utilizan en el código de la aplicación, formularios, consultas, estadísticas o procesos críticos.

## Metodología

1. Revisión de esquemas SQL en `scripts/clean-database-setup.sql` y `scripts/database-complete-setup.sql`
2. Búsqueda exhaustiva en el código fuente (app/, lib/, components/)
3. Verificación de uso en formularios, APIs, consultas SELECT/INSERT/UPDATE
4. Verificación de dependencias (claves foráneas, índices, vistas)

## Columnas Candidatas a Eliminar

### 1. `camaras.usuario_creacion_id`

**Tabla:** `camaras`  
**Tipo:** `INTEGER REFERENCES usuarios(id)`  
**Estado:** ❌ NO SE USA

**Justificación:**
- No se inserta en `app/api/camaras/route.ts` (línea 64-79)
- No se consulta en ninguna SELECT
- No se usa en formularios ni interfaces
- La tabla `camaras` no tiene un campo `usuario_id` estándar como otras tablas

**Impacto de eliminación:**
- ✅ Bajo riesgo: No se usa en ningún lugar
- ✅ No afecta relaciones críticas
- ✅ No se usa en estadísticas ni reportes

**Recomendación:** ELIMINAR

---

## Columnas que SÍ se usan (NO eliminar)

### Tabla `denuncias`
- ✅ Todas las columnas se usan activamente
- `denunciante_telefono` y `denunciante_email`: Se insertan y consultan en APIs
- `division`: Se agregó recientemente y se usa en filtros de permisos

### Tabla `denuncias_formales`
- ✅ Todas las columnas se usan
- `circunstancias`, `testigos`, `elementos_sustraidos`, `valor_estimado`: Se insertan y consultan
- `denunciado_*`: Se usan en el formulario y API
- `requiere_seguimiento`: Se consulta en GET

### Tabla `usuarios`
- ✅ Todas las columnas se usan
- `foto_perfil`: Se usa en upload y consultas de perfil
- `division`: Se usa en permisos y filtros

### Tabla `entregas_rodados`
- ✅ Todas las columnas se usan activamente

### Tabla `camaras`
- ✅ Todas las demás columnas se usan
- Solo `usuario_creacion_id` está obsoleta

### Tabla `ampliaciones_denuncias`
- ✅ Todas las columnas se usan

---

## Columnas Protegidas (NUNCA eliminar)

- Todas las claves primarias (`id`)
- Todas las claves foráneas activas (`*_id`)
- Timestamps (`created_at`, `updated_at`)
- Campos de autenticación (`password_hash`, `email`)
- Campos de permisos (`rol`, `activo`, `division`)
- Campos obligatorios marcados como `NOT NULL` que se usan en formularios

---

## Notas Importantes

1. **Columna `division`**: Se agregó recientemente a `denuncias` y `denuncias_formales`. Aunque no está en todos los scripts SQL antiguos, está en uso activo y NO debe eliminarse.

2. **Campos en `observaciones`**: Algunos datos como `edad`, `sexo`, `instruccion` se guardan como texto en `observaciones` en lugar de columnas dedicadas. Esto es intencional y no requiere cambios.

3. **Vistas**: Las vistas (`vista_estadisticas_denuncias`, `vista_denuncias_completa`, etc.) usan `d.*` o `er.*`, por lo que eliminar columnas afectaría estas vistas. Se debe recrear las vistas después de eliminar columnas.

---

## Conclusión

Solo se identificó **1 columna obsoleta** que puede eliminarse de forma segura:
- `camaras.usuario_creacion_id`

Todas las demás columnas están en uso activo y deben mantenerse.


