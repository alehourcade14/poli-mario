@echo off 
echo Probando API de denuncias... 
curl -X GET "http://localhost:3000/api/denuncias/1" -H "Content-Type: application/json" 
pause 
