# 🗺️ Solución Rápida: Error de Google Maps

## ❌ Error Común
Si ves el mensaje **"This page can't load Google Maps correctly"** o el watermark **"For development purposes only"**, significa que hay un problema con la configuración de la API Key de Google Maps.

## ✅ Solución Paso a Paso

### Paso 1: Verificar el archivo `.env.local`

1. **Abre el archivo `.env.local`** en la raíz del proyecto
2. **Verifica que contenga** la siguiente línea:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-api-key-aqui
   ```
3. **Si el archivo no existe**, créalo con este contenido mínimo:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-api-key-aqui
   ```

### Paso 2: Obtener o Verificar tu API Key

#### Si NO tienes una API Key:
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps JavaScript API** (obligatorio)
   - **Places API** (para autocompletado)
   - **Geocoding API** (para conversión de coordenadas)
4. Ve a "APIs y servicios" > "Credenciales"
5. Haz clic en "Crear credenciales" > "Clave de API"
6. Copia la API Key generada

#### Si YA tienes una API Key:
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Verifica que la API Key esté **activa** y **no haya expirado**
3. Verifica que las APIs estén **habilitadas**:
   - Maps JavaScript API
   - Places API
   - Geocoding API

### Paso 3: Configurar Restricciones (Recomendado)

1. En Google Cloud Console, haz clic en tu API Key
2. En **"Restricciones de aplicación"**:
   - Selecciona "Sitios web HTTP"
   - Agrega: `http://localhost:3000/*`
   - Si estás en producción, agrega tu dominio
3. En **"Restricciones de API"**:
   - Selecciona "Restringir clave"
   - Selecciona solo las APIs que necesitas

### Paso 4: Habilitar Facturación

⚠️ **IMPORTANTE**: Google Maps requiere facturación habilitada, incluso para el plan gratuito.

1. Ve a "Facturación" en Google Cloud Console
2. Asocia una cuenta de facturación a tu proyecto
3. Google ofrece $200 USD de crédito gratuito mensual

### Paso 5: Actualizar `.env.local`

1. Abre el archivo `.env.local`
2. Reemplaza `tu-api-key-aqui` con tu API Key real:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCbZKl06drMng0-sPZmEJqHJCUdY-N8Vjs
   ```
3. **Guarda el archivo**

### Paso 6: Reiniciar el Servidor

1. **Detén el servidor** actual (Ctrl+C en la terminal)
2. **Reinicia el servidor**:
   ```bash
   npm run dev
   ```
3. **Limpia la caché del navegador** (Ctrl+Shift+R o Ctrl+F5)

## 🔍 Verificar que Funciona

Después de seguir estos pasos, deberías ver:
- ✅ Mapas interactivos cargando correctamente
- ✅ Sin mensaje de error
- ✅ Sin watermark "For development purposes only"
- ✅ Autocompletado de direcciones funcionando
- ✅ Marcadores arrastrables en el mapa

## 🛠️ Solución de Problemas Específicos

### Error: "REQUEST_DENIED"
- ✅ Verifica que las APIs estén habilitadas
- ✅ Verifica que las restricciones de dominio permitan `localhost:3000`
- ✅ Verifica que la facturación esté habilitada

### Error: "INVALID_KEY"
- ✅ Verifica que la API Key esté correcta en `.env.local`
- ✅ Verifica que la API Key no haya expirado
- ✅ Crea una nueva API Key si es necesario

### Error: "OVER_QUERY_LIMIT"
- ✅ Verifica los límites de cuota en Google Cloud Console
- ✅ Verifica que la facturación esté habilitada
- ✅ Espera unos minutos y vuelve a intentar

### Watermark "For development purposes only"
- ✅ Esto indica que la API Key no está configurada o no es válida
- ✅ Sigue los pasos anteriores para configurar correctamente la API Key

## 📞 Si Aún No Funciona

1. **Verifica la consola del navegador** (F12) para ver errores específicos
2. **Verifica que el archivo `.env.local` esté en la raíz del proyecto**
3. **Verifica que el servidor se reinició** después de crear/editar `.env.local`
4. **Verifica que no haya espacios** antes o después del signo `=` en `.env.local`

## 🔒 Seguridad

⚠️ **IMPORTANTE**: 
- No compartas tu API Key públicamente
- No la subas a repositorios públicos
- Configura restricciones de dominio en Google Cloud Console
- Considera usar variables de entorno diferentes para desarrollo y producción

---

**¡Listo!** Con estos pasos, los mapas de Google Maps deberían funcionar correctamente.




