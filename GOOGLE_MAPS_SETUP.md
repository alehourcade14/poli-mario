# 🗺️ Configuración de Google Maps API

## ❌ Error Actual
Si ves el mensaje "Oops! Something went wrong. This page didn't load Google Maps correctly", significa que la API de Google Maps no está configurada correctamente.

## ✅ Solución Rápida

### Opción 1: Script Automático (Recomendado)
1. Ejecuta uno de estos scripts:
   - **Windows (CMD)**: `setup-google-maps.bat`
   - **Windows (PowerShell)**: `setup-google-maps.ps1`
2. Ingresa tu API Key cuando se solicite
3. Reinicia el servidor: `npm run dev`

### Opción 2: Configuración Manual
1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega la siguiente línea:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-api-key-aqui
   ```
3. Reinicia el servidor: `npm run dev`

## 🔑 Cómo Obtener una API Key

### Paso 1: Ir a Google Cloud Console
1. Ve a [https://console.cloud.google.com](https://console.cloud.google.com)
2. Inicia sesión con tu cuenta de Google

### Paso 2: Crear o Seleccionar Proyecto
1. Crea un nuevo proyecto o selecciona uno existente
2. Anota el nombre del proyecto

### Paso 3: Habilitar APIs Necesarias
1. Ve a "APIs y servicios" > "Biblioteca"
2. Busca y habilita estas APIs:
   - **Maps JavaScript API** (para mapas interactivos)
   - **Places API** (para autocompletado de direcciones)
   - **Geocoding API** (para conversión de coordenadas)

### Paso 4: Crear API Key
1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Clave de API"
3. Copia la API Key generada

### Paso 5: Configurar Restricciones (Opcional pero Recomendado)
1. Haz clic en la API Key creada
2. En "Restricciones de aplicación":
   - Selecciona "Sitios web HTTP"
   - Agrega: `http://localhost:3000/*`
3. En "Restricciones de API":
   - Selecciona "Restringir clave"
   - Selecciona las APIs habilitadas anteriormente

## 🚀 Verificar Configuración

Después de configurar la API Key, deberías ver:
- ✅ Mapas interactivos funcionando
- ✅ Autocompletado de direcciones
- ✅ Marcadores arrastrables
- ✅ Geocodificación inversa

## 🔧 Solución de Problemas

### Error: "This page didn't load Google Maps correctly"
- ✅ Verifica que la API Key esté en `.env.local`
- ✅ Verifica que las APIs estén habilitadas
- ✅ Reinicia el servidor de desarrollo

### Error: "REQUEST_DENIED"
- ✅ Verifica las restricciones de la API Key
- ✅ Asegúrate de que `localhost:3000` esté permitido

### Error: "OVER_QUERY_LIMIT"
- ✅ Verifica que tengas facturación habilitada en Google Cloud
- ✅ Revisa los límites de cuota

## 📞 Soporte

Si sigues teniendo problemas:
1. Verifica la consola del navegador para errores específicos
2. Revisa la documentación de Google Maps Platform
3. Contacta al administrador del sistema

---

**Nota**: La API Key es sensible, no la compartas públicamente ni la subas a repositorios públicos.
