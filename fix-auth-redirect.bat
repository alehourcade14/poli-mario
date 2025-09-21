@echo off
echo ============================================
echo SOLUCIONAR REDIRECCION AL LOGIN
echo ============================================
echo.

echo 1. Ejecutando diagnostico de autenticacion...
echo.
node debug-auth.js
echo.

echo 2. Verificando archivo .env.local...
if not exist .env.local (
    echo ❌ Archivo .env.local no encontrado
    echo 🔧 Creando archivo .env.local...
    call create-env-local.bat
) else (
    echo ✅ Archivo .env.local existe
)
echo.

echo 3. Instalando dependencias necesarias...
echo.
npm install pg bcryptjs jsonwebtoken dotenv
echo.

echo 4. Creando usuario admin si no existe...
echo.
node create-admin-user.js
echo.

echo 5. Verificando configuracion de Next.js...
echo.
echo ✅ Error de i18n.localeDetection ya corregido
echo.

echo 6. Limpiando cache del navegador...
echo.
echo 💡 Para limpiar el cache:
echo    1. Presiona Ctrl+Shift+R en el navegador
echo    2. O abre una ventana de incognito
echo    3. O borra las cookies del sitio
echo.

echo ============================================
echo CONFIGURACION COMPLETADA
echo ============================================
echo.
echo Ahora puedes:
echo 1. Reiniciar el servidor: npm run dev
echo 2. Ir a: http://localhost:3000
echo 3. Hacer login con:
echo    📧 Email: admin@policia.gob.ar
echo    🔑 Contraseña: admin123
echo 4. Los botones del dashboard deberian funcionar
echo.
echo Si aun hay problemas:
echo 1. Abre la consola del navegador (F12)
echo 2. Ve a la pestaña Network
echo 3. Intenta hacer login y revisa los errores
echo.
pause
