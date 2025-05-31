/**
 * Utility functions untuk WhatsApp configuration dan validation
 */

export interface WhatsAppConfig {
  edgeFunctionUrl: string
  surveyFlowId: string
  phoneNumberId?: string
  supabaseAnonKey: string
}

/**
 * Mendapatkan konfigurasi WhatsApp dari environment variables
 */
export const getWhatsAppConfig = (): WhatsAppConfig => {
  return {
    edgeFunctionUrl: import.meta.env.VITE_WHATSAPP_EDGE_FUNCTION_URL || '',
    surveyFlowId: import.meta.env.VITE_WHATSAPP_SURVEY_FLOW_ID || '',
    phoneNumberId: import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE_NUMBER_ID || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  }
}

/**
 * Memvalidasi apakah konfigurasi WhatsApp lengkap
 */
export const validateWhatsAppConfig = (): { isValid: boolean; missingFields: string[] } => {
  const config = getWhatsAppConfig()
  const missingFields: string[] = []

  if (!config.edgeFunctionUrl) {
    missingFields.push('VITE_WHATSAPP_EDGE_FUNCTION_URL')
  }
  
  if (!config.surveyFlowId) {
    missingFields.push('VITE_WHATSAPP_SURVEY_FLOW_ID')
  }
  
  if (!config.supabaseAnonKey) {
    missingFields.push('VITE_SUPABASE_ANON_KEY')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

/**
 * Memvalidasi format WhatsApp ID
 */
export const isValidWhatsAppId = (waId: string): boolean => {
  // WhatsApp ID biasanya format: country_code + phone_number
  // Contoh: 6281234567890 (Indonesia: 62 + 81234567890)
  const whatsappPattern = /^\d{10,15}$/
  return whatsappPattern.test(waId)
}

/**
 * Format nomor telepon ke WhatsApp ID format
 */
export const formatToWhatsAppId = (phoneNumber: string, countryCode: string = '62'): string => {
  // Hapus semua karakter non-digit
  let cleaned = phoneNumber.replace(/\D/g, '')
  
  // Jika dimulai dengan 0, ganti dengan country code
  if (cleaned.startsWith('0')) {
    cleaned = countryCode + cleaned.substring(1)
  }
  
  // Jika belum ada country code, tambahkan
  if (!cleaned.startsWith(countryCode)) {
    cleaned = countryCode + cleaned
  }
  
  return cleaned
}

/**
 * Membuat URL survei dengan parameter visitor
 */
export const generateSurveyUrl = (visitorId: string, baseUrl: string = window.location.origin): string => {
  return `${baseUrl}/survey?visitor=${visitorId}&utm_source=whatsapp&utm_medium=message&utm_campaign=satisfaction_survey`
}

/**
 * Logging utility untuk debugging WhatsApp integration
 */
export const logWhatsAppActivity = (
  action: string, 
  data: any, 
  status: 'success' | 'error' | 'info' = 'info'
) => {
  const timestamp = new Date().toISOString()
  const logLevel = status === 'error' ? 'error' : status === 'success' ? 'log' : 'info'
  
  console[logLevel](`[WhatsApp ${timestamp}] ${action}:`, data)
  
  // Bisa ditambahkan external logging service di sini
  // seperti Sentry, LogRocket, atau custom analytics
}
