export interface WhatsAppTextMessage {
  to: string
  type: 'text'
  text: {
    body: string
  }
}

export interface WhatsAppImageMessage {
  to: string
  type: 'image'
  image: {
    link?: string
    id?: string
    caption?: string
  }
}

export interface WhatsAppDocumentMessage {
  to: string
  type: 'document'
  document: {
    link?: string
    id?: string
    caption?: string
    filename?: string
  }
}

export interface WhatsAppVideoMessage {
  to: string
  type: 'video'
  video: {
    link?: string
    id?: string
    caption?: string
  }
}

export interface WhatsAppAudioMessage {
  to: string
  type: 'audio'
  audio: {
    link?: string
    id?: string
  }
}

export interface WhatsAppTemplateMessage {
  to: string
  type: 'template'
  template: {
    name: string
    language: {
      code: string
    }
    components?: Array<{
      type: string
      parameters?: Array<{
        type: string
        text?: string
        image?: {
          link: string
        }
        document?: {
          link: string
          filename: string
        }
        video?: {
          link: string
        }
      }>
    }>
  }
}

export type WhatsAppMessage = 
  | WhatsAppTextMessage 
  | WhatsAppImageMessage 
  | WhatsAppDocumentMessage
  | WhatsAppVideoMessage
  | WhatsAppAudioMessage
  | WhatsAppTemplateMessage

export interface WhatsAppResponse {
  messaging_product: string
  contacts: Array<{
    input: string
    wa_id: string
  }>
  messages: Array<{
    id: string
  }>
}

export interface WhatsAppError {
  error: {
    message: string
    type: string
    code: number
    error_subcode?: number
    fbtrace_id: string
  }
}

export class WhatsAppService {
  private static readonly API_BASE_URL = import.meta.env.VITE_WHATSAPP_API_BASE_URL || 'https://graph.facebook.com'
  private static readonly API_VERSION = import.meta.env.VITE_WHATSAPP_API_VERSION || 'v18.0'
  private static readonly ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN
  private static readonly PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE_NUMBER_ID

  /**
   * Kirim pesan teks WhatsApp
   */
  static async sendTextMessage(
    to: string,
    message: string
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    try {
      console.log('📱 WhatsAppService: Sending text message...')
      console.log('📞 To:', to)
      console.log('💬 Message:', message)

      if (!this.ACCESS_TOKEN) {
        throw new Error('WhatsApp access token not configured')
      }

      if (!this.PHONE_NUMBER_ID) {
        throw new Error('WhatsApp phone number ID not configured')
      }

      const messageData: WhatsAppTextMessage = {
        to: to.replace(/\D/g, ''), // Remove non-numeric characters
        type: 'text',
        text: {
          body: message
        }
      }

      const url = `${this.API_BASE_URL}/${this.API_VERSION}/${this.PHONE_NUMBER_ID}/messages`
      
      console.log('🌐 API URL:', url)
      console.log('📋 Message data:', messageData)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('❌ WhatsApp API error:', responseData)
        const error = responseData as WhatsAppError
        throw new Error(error.error?.message || 'Failed to send WhatsApp message')
      }

      console.log('✅ WhatsApp message sent successfully:', responseData)
      return {
        success: true,
        data: responseData as WhatsAppResponse
      }

    } catch (error) {
      console.error('❌ Error sending WhatsApp text message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Kirim pesan gambar WhatsApp
   */
  static async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    try {
      console.log('📱 WhatsAppService: Sending image message...')
      console.log('📞 To:', to)
      console.log('🖼️ Image URL:', imageUrl)
      console.log('📝 Caption:', caption)

      if (!this.ACCESS_TOKEN) {
        throw new Error('WhatsApp access token not configured')
      }

      if (!this.PHONE_NUMBER_ID) {
        throw new Error('WhatsApp phone number ID not configured')
      }

      const messageData: WhatsAppImageMessage = {
        to: to.replace(/\D/g, ''), // Remove non-numeric characters
        type: 'image',
        image: {
          link: imageUrl,
          ...(caption && { caption })
        }
      }

      const url = `${this.API_BASE_URL}/${this.API_VERSION}/${this.PHONE_NUMBER_ID}/messages`
      
      console.log('🌐 API URL:', url)
      console.log('📋 Message data:', messageData)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('❌ WhatsApp API error:', responseData)
        const error = responseData as WhatsAppError
        throw new Error(error.error?.message || 'Failed to send WhatsApp image')
      }

      console.log('✅ WhatsApp image sent successfully:', responseData)
      return {
        success: true,
        data: responseData as WhatsAppResponse
      }

    } catch (error) {
      console.error('❌ Error sending WhatsApp image message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Kirim pesan dokumen WhatsApp
   */
  static async sendDocumentMessage(
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    try {
      console.log('📱 WhatsAppService: Sending document message...')
      console.log('📞 To:', to)
      console.log('📄 Document URL:', documentUrl)
      console.log('📁 Filename:', filename)

      if (!this.ACCESS_TOKEN) {
        throw new Error('WhatsApp access token not configured')
      }

      if (!this.PHONE_NUMBER_ID) {
        throw new Error('WhatsApp phone number ID not configured')
      }

      const messageData: WhatsAppDocumentMessage = {
        to: to.replace(/\D/g, ''),
        type: 'document',
        document: {
          link: documentUrl,
          filename,
          ...(caption && { caption })
        }
      }

      const url = `${this.API_BASE_URL}/${this.API_VERSION}/${this.PHONE_NUMBER_ID}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('❌ WhatsApp API error:', responseData)
        const error = responseData as WhatsAppError
        throw new Error(error.error?.message || 'Failed to send WhatsApp document')
      }

      console.log('✅ WhatsApp document sent successfully:', responseData)
      return {
        success: true,
        data: responseData as WhatsAppResponse
      }

    } catch (error) {
      console.error('❌ Error sending WhatsApp document message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Kirim pesan video WhatsApp
   */
  static async sendVideoMessage(
    to: string,
    videoUrl: string,
    caption?: string
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    try {
      console.log('📱 WhatsAppService: Sending video message...')

      if (!this.ACCESS_TOKEN) {
        throw new Error('WhatsApp access token not configured')
      }

      if (!this.PHONE_NUMBER_ID) {
        throw new Error('WhatsApp phone number ID not configured')
      }

      const messageData: WhatsAppVideoMessage = {
        to: to.replace(/\D/g, ''),
        type: 'video',
        video: {
          link: videoUrl,
          ...(caption && { caption })
        }
      }

      const url = `${this.API_BASE_URL}/${this.API_VERSION}/${this.PHONE_NUMBER_ID}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('❌ WhatsApp API error:', responseData)
        const error = responseData as WhatsAppError
        throw new Error(error.error?.message || 'Failed to send WhatsApp video')
      }

      console.log('✅ WhatsApp video sent successfully:', responseData)
      return {
        success: true,
        data: responseData as WhatsAppResponse
      }

    } catch (error) {
      console.error('❌ Error sending WhatsApp video message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Kirim pesan template WhatsApp
   */
  static async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'id',
    components?: any[]
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    try {
      console.log('📱 WhatsAppService: Sending template message...')
      console.log('📞 To:', to)
      console.log('📋 Template:', templateName)

      if (!this.ACCESS_TOKEN) {
        throw new Error('WhatsApp access token not configured')
      }

      if (!this.PHONE_NUMBER_ID) {
        throw new Error('WhatsApp phone number ID not configured')
      }

      const messageData: WhatsAppTemplateMessage = {
        to: to.replace(/\D/g, ''),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          ...(components && { components })
        }
      }

      const url = `${this.API_BASE_URL}/${this.API_VERSION}/${this.PHONE_NUMBER_ID}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('❌ WhatsApp API error:', responseData)
        const error = responseData as WhatsAppError
        throw new Error(error.error?.message || 'Failed to send WhatsApp template')
      }

      console.log('✅ WhatsApp template sent successfully:', responseData)
      return {
        success: true,
        data: responseData as WhatsAppResponse
      }

    } catch (error) {
      console.error('❌ Error sending WhatsApp template message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Upload media ke WhatsApp untuk mendapatkan media ID
   */
  static async uploadMedia(
    file: File,
    type: 'image' | 'document' | 'audio' | 'video'
  ): Promise<{ success: boolean; mediaId?: string; error?: string }> {
    try {
      console.log('📤 WhatsAppService: Uploading media...')
      console.log('📁 File:', file.name)
      console.log('📋 Type:', type)

      if (!this.ACCESS_TOKEN) {
        throw new Error('WhatsApp access token not configured')
      }

      if (!this.PHONE_NUMBER_ID) {
        throw new Error('WhatsApp phone number ID not configured')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('messaging_product', 'whatsapp')

      const url = `${this.API_BASE_URL}/${this.API_VERSION}/${this.PHONE_NUMBER_ID}/media`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
        },
        body: formData
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('❌ WhatsApp media upload error:', responseData)
        const error = responseData as WhatsAppError
        throw new Error(error.error?.message || 'Failed to upload media to WhatsApp')
      }

      console.log('✅ Media uploaded successfully:', responseData)
      return {
        success: true,
        mediaId: responseData.id
      }

    } catch (error) {
      console.error('❌ Error uploading media to WhatsApp:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Kirim pesan gambar menggunakan media ID
   */
  static async sendImageByMediaId(
    to: string,
    mediaId: string,
    caption?: string
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    try {
      console.log('📱 WhatsAppService: Sending image by media ID...')

      if (!this.ACCESS_TOKEN) {
        throw new Error('WhatsApp access token not configured')
      }

      if (!this.PHONE_NUMBER_ID) {
        throw new Error('WhatsApp phone number ID not configured')
      }

      const messageData: WhatsAppImageMessage = {
        to: to.replace(/\D/g, ''),
        type: 'image',
        image: {
          id: mediaId,
          ...(caption && { caption })
        }
      }

      const url = `${this.API_BASE_URL}/${this.API_VERSION}/${this.PHONE_NUMBER_ID}/messages`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error('❌ WhatsApp API error:', responseData)
        const error = responseData as WhatsAppError
        throw new Error(error.error?.message || 'Failed to send WhatsApp image')
      }

      console.log('✅ WhatsApp image sent successfully:', responseData)
      return {
        success: true,
        data: responseData as WhatsAppResponse
      }

    } catch (error) {
      console.error('❌ Error sending WhatsApp image by media ID:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Validasi nomor WhatsApp
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-numeric characters
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    
    // Check if it's a valid length (8-15 digits)
    if (cleanNumber.length < 8 || cleanNumber.length > 15) {
      return false
    }
    
    // Check if it starts with country code
    return true
  }

  /**
   * Format nomor telepon untuk WhatsApp
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleanNumber = phoneNumber.replace(/\D/g, '')
    
    // If starts with 0, replace with 62 (Indonesia)
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '62' + cleanNumber.slice(1)
    }
    
    // If doesn't start with country code, add 62
    if (!cleanNumber.startsWith('62')) {
      cleanNumber = '62' + cleanNumber
    }
    
    return cleanNumber
  }
}
