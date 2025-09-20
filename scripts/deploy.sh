#!/bin/bash
# Script de despliegue automatizado

set -e

echo "🚀 Iniciando despliegue del Sistema de Denuncias..."

# Variables
APP_NAME="sistema-denuncias"
DOMAIN="tu-dominio.com"
DB_BACKUP_DIR="/var/backups/postgres"

# Crear backup de la base de datos
echo "📦 Creando backup de la base de datos..."
sudo -u postgres pg_dump sistema_denuncias > "$DB_BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

# Actualizar código
echo "📥 Actualizando código..."
git pull origin main

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --only=production

# Build de la aplicación
echo "🔨 Construyendo aplicación..."
npm run build

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
pm2 reload $APP_NAME

# Verificar salud del servicio
echo "🏥 Verificando salud del servicio..."
sleep 5
if curl -f http://localhost:3000/api/health; then
    echo "✅ Despliegue exitoso!"
else
    echo "❌ Error en el despliegue"
    exit 1
fi

# Limpiar archivos temporales
echo "🧹 Limpiando archivos temporales..."
npm prune --production

echo "🎉 Despliegue completado exitosamente!"
