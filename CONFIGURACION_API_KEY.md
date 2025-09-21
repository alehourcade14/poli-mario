# 🔑 Configuración de API Key - Google Maps

## ✅ API Key Configurada
Tu API Key de Google Maps ha sido configurada:
```
AIzaSyCbZKl06drMng0-sPZmEJqHJCUdY-N8Vjs
```

## 🚀 Pasos para Activar

### Opción 1: Script Automático (Recomendado)
Ejecuta uno de estos comandos en la terminal:

**Windows (CMD):**
```cmd
create-env-local.bat
```

**Windows (PowerShell):**
```powershell
.\create-env-local.ps1
```

### Opción 2: Creación Manual
1. Crea un archivo llamado `.env.local` en la raíz del proyecto
2. Copia y pega el siguiente contenido:

```env
# ============================================
# CONFIGURACION DEL SISTEMA DE GESTION OPERATIVA
# ============================================

# ============================================
# CONFIGURACION DE POSTGRESQL
# ============================================
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sistema_denuncias
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password_aqui

# ============================================
# GOOGLE MAPS PLATFORM API
# ============================================
# API Key configurada para Google Maps Platform
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCbZKl06drMng0-sPZmEJqHJCUdY-N8Vjs

# ============================================
# CONFIGURACION DE AUTENTICACION
# ============================================
JWT_SECRET=tu-secreto-super-seguro-para-jwt-cambiar-en-produccion
NEXTAUTH_URL=http://localhost:3000

# ============================================
# CONFIGURACION DE DESARROLLO
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

## 🔄 Reiniciar el Servidor

Después de crear el archivo `.env.local`:

1. **Detén el servidor actual** (Ctrl+C en la terminal)
2. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

## ✅ Verificar que Funciona

Después de reiniciar, deberías ver:
- ✅ Mapas interactivos cargando correctamente
- ✅ Sin mensaje "Oops! Something went wrong"
- ✅ Autocompletado de direcciones funcionando
- ✅ Marcadores arrastrables en el mapa

## 🔧 Si Aún No Funciona

1. **Verifica que el archivo `.env.local` existe** en la raíz del proyecto
2. **Verifica que la API Key esté correcta** en el archivo
3. **Reinicia completamente** el servidor de desarrollo
4. **Limpia la caché del navegador** (Ctrl+Shift+R)

## 🛡️ Seguridad

⚠️ **IMPORTANTE**: 
- No compartas esta API Key públicamente
- No la subas a repositorios públicos
- Considera configurar restricciones en Google Cloud Console

## 📞 Soporte

Si tienes problemas:
1. Verifica la consola del navegador (F12)
2. Revisa que el archivo `.env.local` esté en la ubicación correcta
3. Asegúrate de que el servidor se reinició después de crear el archivo

---

**¡Listo!** Tu API Key está configurada y los mapas deberían funcionar correctamente.
