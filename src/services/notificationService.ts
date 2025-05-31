import { WhatsAppService } from '@/services'

/**
 * Notification Service - Contoh penggunaan WhatsApp Service di feature lain
 * Dapat digunakan untuk mengirim notifikasi WhatsApp dari berbagai feature
 */
export class NotificationService {
  
  /**
   * Kirim notifikasi WhatsApp sederhana
   */
  static async sendWhatsAppNotification(
    phoneNumber: string, 
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📱 NotificationService: Sending WhatsApp notification...')
      
      const result = await WhatsAppService.sendTextMessage(phoneNumber, message)
      
      if (result.success) {
        console.log('✅ NotificationService: WhatsApp notification sent successfully')
        return { success: true }
      } else {
        console.error('❌ NotificationService: Failed to send WhatsApp notification:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ NotificationService: Error in sendWhatsAppNotification:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Kirim notifikasi dengan gambar
   */
  static async sendImageNotification(
    phoneNumber: string,
    imageUrl: string,
    caption: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🖼️ NotificationService: Sending image notification...')
      
      const result = await WhatsAppService.sendImageMessage(phoneNumber, imageUrl, caption)
      
      if (result.success) {
        console.log('✅ NotificationService: Image notification sent successfully')
        return { success: true }
      } else {
        console.error('❌ NotificationService: Failed to send image notification:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ NotificationService: Error in sendImageNotification:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Kirim notifikasi welcome untuk user baru
   */
  static async sendWelcomeNotification(
    phoneNumber: string,
    userName: string
  ): Promise<{ success: boolean; error?: string }> {
    const welcomeMessage = `🎉 Selamat datang ${userName}!\n\nTerima kasih telah bergabung dengan aplikasi kami. Kami senang Anda bergabung dengan komunitas kami.\n\nJika ada pertanyaan, jangan ragu untuk menghubungi kami.`
    
    return this.sendWhatsAppNotification(phoneNumber, welcomeMessage)
  }

  /**
   * Kirim notifikasi reminder
   */
  static async sendReminderNotification(
    phoneNumber: string,
    reminderText: string,
    reminderDate: Date
  ): Promise<{ success: boolean; error?: string }> {
    const formattedDate = reminderDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const reminderMessage = `⏰ Pengingat!\n\n${reminderText}\n\nWaktu: ${formattedDate}\n\nJangan sampai terlewat ya! 😊`
    
    return this.sendWhatsAppNotification(phoneNumber, reminderMessage)
  }

  /**
   * Kirim notifikasi batch ke multiple users
   */
  static async sendBatchNotifications(
    notifications: Array<{
      phoneNumber: string
      message: string
    }>,
    delayMs: number = 1000 // Delay antar pesan untuk menghindari rate limiting
  ): Promise<{
    sent: number
    failed: number
    errors: string[]
  }> {
    console.log(`📱 NotificationService: Sending batch notifications to ${notifications.length} recipients...`)
    
    let sent = 0
    let failed = 0
    const errors: string[] = []
    
    for (const notification of notifications) {
      try {
        const result = await this.sendWhatsAppNotification(
          notification.phoneNumber, 
          notification.message
        )
        
        if (result.success) {
          sent++
        } else {
          failed++
          errors.push(`${notification.phoneNumber}: ${result.error}`)
        }
        
        // Delay untuk menghindari rate limiting
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
        
      } catch (error) {
        failed++
        errors.push(`${notification.phoneNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    console.log(`📊 NotificationService: Batch complete - Sent: ${sent}, Failed: ${failed}`)
    
    return { sent, failed, errors }
  }

  /**
   * Validasi nomor sebelum mengirim
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    return WhatsAppService.validatePhoneNumber(phoneNumber)
  }

  /**
   * Format nomor untuk WhatsApp
   */
  static formatPhoneNumber(phoneNumber: string): string {
    return WhatsAppService.formatPhoneNumber(phoneNumber)
  }
}

/**
 * Helper types untuk notification service
 */
export interface NotificationConfig {
  phoneNumber: string
  message: string
  type?: 'text' | 'image' | 'template'
  imageUrl?: string
  caption?: string
}

export interface BatchNotificationResult {
  sent: number
  failed: number
  errors: string[]
}
