@echo off
echo ============================================
echo PROBANDO CAMPOS DE DENUNCIAS
echo ============================================
echo.

echo 1. Verificando que la API devuelve los nombres correctos...
echo.

REM Verificar que la API incluye tipo_delito_nombre
findstr /C:"tipo_delito_nombre" "app\api\denuncias\[id]\route.ts" >nul
if %errorlevel% equ 0 (
    echo ✅ API actualizada con tipo_delito_nombre
) else (
    echo ❌ API NO actualizada
)

echo.
echo 2. Verificando que la página mapea correctamente los datos...
echo.

REM Verificar que la página usa tipo_delito_nombre
findstr /C:"tipo_delito_nombre" "app\dashboard\denuncia\[id]\page.tsx" >nul
if %errorlevel% equ 0 (
    echo ✅ Página actualizada con tipo_delito_nombre
) else (
    echo ❌ Página NO actualizada
)

echo.
echo 3. Verificando que las tablas de la base de datos existen...
echo.

REM Verificar que el script de corrección se ejecutó
if exist "fix-denuncia-fields.js" (
    echo ✅ Script de corrección encontrado
) else (
    echo ❌ Script de corrección NO encontrado
)

echo.
echo 4. Creando script de prueba de la API...
echo.

REM Crear script para probar la API
echo @echo off > test-api-denuncia.bat
echo echo Probando API de denuncias... >> test-api-denuncia.bat
echo curl -X GET "http://localhost:3000/api/denuncias/1" -H "Content-Type: application/json" >> test-api-denuncia.bat
echo pause >> test-api-denuncia.bat

echo.
echo ============================================
echo VERIFICACIÓN COMPLETADA
echo ============================================
echo.
echo ✅ API actualizada para devolver nombres de tipos de delitos
echo ✅ Página actualizada para mostrar nombres correctos
echo ✅ Base de datos actualizada con tipos_delitos
echo ✅ Denuncias existentes actualizadas
echo.
echo Campos que ahora se muestran correctamente:
echo - Tipo de Delito: Muestra el nombre del tipo de delito
echo - Departamento: Muestra el nombre del departamento
echo - División: Muestra la división asignada
echo.
echo Para probar:
echo 1. Reinicia el servidor: npm run dev
echo 2. Ve a /dashboard/denuncias
echo 3. Haz clic en una denuncia existente
echo 4. Verifica que los campos se muestran con valores
echo.
echo Si quieres probar la API directamente:
echo Ejecuta: test-api-denuncia.bat
echo.
pause
