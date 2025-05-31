import { ref } from 'vue'
import { 
  getWhatsAppConfig, 
  validateWhatsAppConfig, 
  isValidWhatsAppId, 
  generateSurveyUrl, 
  logWhatsAppActivity 
} from '../utils/whatsappUtils'

export interface WhatsAppFlowRequest {
  to: string
  flowId: string
  flowToken?: string
  headerText?: string
  bodyText?: string
  footerText?: string
  flowCta?: string
  screenId?: string
  flowData?: Record<string, any>
}

export interface WhatsAppTextRequest {
  to: string
  text: string
  previewUrl?: boolean
  replyToMessageId?: string
}

export const useWhatsAppService = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Validasi konfigurasi saat service diinisialisasi
  const configValidation = validateWhatsAppConfig()
  if (!configValidation.isValid) {
    console.warn('WhatsApp configuration incomplete. Missing:', configValidation.missingFields)
  }

  const config = getWhatsAppConfig()

  /**
   * Mengirim pesan teks via WhatsApp
   */
  const sendTextMessage = async (request: WhatsAppTextRequest) => {
    try {
      loading.value = true
      error.value = null

      // Validasi WhatsApp ID
      if (!isValidWhatsAppId(request.to)) {
        throw new Error(`Invalid WhatsApp ID format: ${request.to}`)
      }

      logWhatsAppActivity('Sending text message', { to: request.to, preview: request.text.substring(0, 50) + '...' })

      const response = await fetch(`${config.edgeFunctionUrl}/send-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabaseAnonKey}`
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send WhatsApp message')
      }

      const result = await response.json()
      logWhatsAppActivity('Text message sent successfully', result, 'success')
      return result
    } catch (err: any) {
      error.value = err.message
      logWhatsAppActivity('Error sending text message', err, 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Meluncurkan WhatsApp Flow untuk survei
   */
  const launchSurveyFlow = async (request: WhatsAppFlowRequest) => {
    try {
      loading.value = true
      error.value = null

      // Validasi WhatsApp ID
      if (!isValidWhatsAppId(request.to)) {
        throw new Error(`Invalid WhatsApp ID format: ${request.to}`)
      }

      logWhatsAppActivity('Launching survey flow', { to: request.to, flowId: request.flowId })

      const response = await fetch(`${config.edgeFunctionUrl}/launch-flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabaseAnonKey}`
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to launch WhatsApp flow')
      }

      const result = await response.json()
      logWhatsAppActivity('Flow launched successfully', result, 'success')
      return result
    } catch (err: any) {
      error.value = err.message
      logWhatsAppActivity('Error launching flow', err, 'error')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Mengirim survei kepuasan pelayanan via WhatsApp Flow
   */
  const sendSatisfactionSurvey = async (
    waId: string, 
    visitorName: string, 
    visitDate: string,
    serviceType?: string
  ) => {
    const flowRequest: WhatsAppFlowRequest = {
      to: waId,
      flowId: config.surveyFlowId || 'your-survey-flow-id',
      headerText: 'SURVEI KEPUASAN PELAYANAN',
      bodyText: `Halo ${visitorName}! Kami ingin mengetahui pengalaman Anda dalam menggunakan layanan kami pada ${visitDate}. Mohon luangkan waktu untuk mengisi survei kepuasan berikut.`,
      footerText: 'Terima kasih atas partisipasi Anda',
      flowCta: 'Isi Survei',
      flowData: {
        visitor_name: visitorName,
        visit_date: visitDate,
        service_type: serviceType || 'Pelayanan Umum'
      }
    }

    return await launchSurveyFlow(flowRequest)
  }

  /**
   * Mengirim pesan teks sederhana untuk survei (fallback jika Flow tidak tersedia)
   */
  const sendSimpleSurveyMessage = async (
    waId: string, 
    visitorName: string, 
    surveyUrl: string
  ) => {
    const textRequest: WhatsAppTextRequest = {
      to: waId,
      text: `Halo ${visitorName}! 

Terima kasih telah menggunakan layanan kami. Kami ingin mengetahui pengalaman Anda untuk meningkatkan kualitas pelayanan.

Mohon luangkan waktu untuk mengisi survei kepuasan berikut:
${surveyUrl}

Terima kasih atas partisipasi Anda! 🙏`,
      previewUrl: true
    }

    return await sendTextMessage(textRequest)
  }

  /**
   * Utility function untuk mendapatkan URL survei dengan visitor ID
   */
  const getSurveyUrl = (visitorId: string): string => {
    return generateSurveyUrl(visitorId)
  }

  return {
    loading,
    error,
    sendTextMessage,
    launchSurveyFlow,
    sendSatisfactionSurvey,
    sendSimpleSurveyMessage,
    getSurveyUrl,
    config,
    configValidation
  }
}
