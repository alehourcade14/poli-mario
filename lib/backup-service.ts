import { supabase } from "./database"
import { writeFileSync } from "fs"
import { format } from "date-fns"

export class BackupService {
  private static instance: BackupService

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService()
    }
    return BackupService.instance
  }

  // Backup automático de datos críticos
  async createBackup(): Promise<string> {
    try {
      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss")
      const backupData = {
        timestamp,
        usuarios: await this.exportTable("usuarios"),
        denuncias: await this.exportTable("denuncias"),
        denuncias_formales: await this.exportTable("denuncias_formales"),
        camaras: await this.exportTable("camaras"),
        entregas_rodados: await this.exportTable("entregas_rodados"),
      }

      const filename = `backup_${timestamp}.json`

      // En producción, subir a S3 o almacenamiento en la nube
      if (process.env.NODE_ENV === "production") {
        await this.uploadToCloud(filename, backupData)
      } else {
        writeFileSync(`./backups/${filename}`, JSON.stringify(backupData, null, 2))
      }

      console.log(`✅ Backup creado: ${filename}`)
      return filename
    } catch (error) {
      console.error("❌ Error creando backup:", error)
      throw error
    }
  }

  private async exportTable(tableName: string) {
    const { data, error } = await supabase.from(tableName).select("*")
    if (error) throw error
    return data
  }

  private async uploadToCloud(filename: string, data: any) {
    // Implementar subida a AWS S3, Google Cloud Storage, etc.
    // Por ahora, guardar en Supabase Storage
    const { error } = await supabase.storage.from("backups").upload(filename, JSON.stringify(data))

    if (error) throw error
  }

  // Programar backups automáticos
  scheduleBackups() {
    // Backup diario a las 2 AM
    setInterval(async () => {
      const now = new Date()
      if (now.getHours() === 2 && now.getMinutes() === 0) {
        await this.createBackup()
      }
    }, 60000) // Verificar cada minuto
  }
}
