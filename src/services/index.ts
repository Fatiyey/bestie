// Global Services Export
export { WhatsAppService } from './whatsappService'
export { NotificationService } from './notificationService'

// Export types for WhatsApp service
export type {
  WhatsAppTextMessage,
  WhatsAppImageMessage,
  WhatsAppDocumentMessage,
  WhatsAppVideoMessage,
  WhatsAppAudioMessage,
  WhatsAppTemplateMessage,
  WhatsAppMessage,
  WhatsAppResponse,
  WhatsAppError
} from './whatsappService'

// Export types for Notification service
export type {
  NotificationConfig,
  BatchNotificationResult
} from './notificationService'
