@echo off 
echo ============================================ 
echo PROBANDO NAVEGACIÓN 
echo ============================================ 
echo. 
echo 1. Iniciando servidor... 
start /B npm run dev 
echo. 
echo 2. Esperando 5 segundos para que el servidor inicie... 
timeout /t 5 /nobreak >nul 
echo. 
echo 3. Abriendo navegador... 
start http://localhost:3000 
echo. 
echo ✅ Navegador abierto 
echo. 
echo Para probar: 
echo 1. Inicia sesión en el sistema 
echo 2. Ve al dashboard 
echo 3. Haz clic en "Denuncias" - debe ir a /dashboard/denuncias 
echo 4. Haz clic en "Cámaras" - debe ir a /dashboard/camaras 
echo. 
pause 
