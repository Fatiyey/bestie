export interface WhatsAppTextMessage {
  messaging_product: string
  to: string
  type: 'text'
  text: {
    body: string
  }
}

export interface WhatsAppImageMessage {
  messaging_product: string
  to: string
  type: 'image'
  image: {
    link?: string
    id?: string
    caption?: string
  }
}

export interface WhatsAppDocumentMessage {
  messaging_product: string
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
  messaging_product: string
  to: string
  type: 'video'
  video: {
    link?: string
    id?: string
    caption?: string
  }
}

export interface WhatsAppAudioMessage {
  messaging_product: string
  to: string
  type: 'audio'
  audio: {
    link?: string // Use link for sending
    id?: string   // Use id for sending
  }
}

export interface WhatsAppImageIdMessage { // Added interface
  messaging_product: string
  to: string
  type: 'image'
  image: {
    id: string
    caption?: string
  }
}

export interface WhatsAppTemplateMessage {
  messaging_product: string
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

  private static async sendRequest(
    endpoint: string,
    payload: object
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    const url = `${WhatsAppService.API_BASE_URL}/${WhatsAppService.API_VERSION}/${WhatsAppService.PHONE_NUMBER_ID}${endpoint}`;
    // console.log(`📞 WhatsAppService.sendRequest: POST ${url}`, payload);

    if (!WhatsAppService.ACCESS_TOKEN || !WhatsAppService.PHONE_NUMBER_ID) {
      // console.error('❌ Missing API credentials for sendRequest');
      return { success: false, error: 'Missing API credentials' };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WhatsAppService.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // console.error(`❌ WhatsApp API error in sendRequest (${response.status}) for ${endpoint}:`, responseData);
        const error = responseData as WhatsAppError;
        const errorMessage = error.error?.message || `Failed to POST ${endpoint}`;
        return { success: false, error: errorMessage };
      }

      // console.log(`✅ WhatsAppService.sendRequest successful for ${endpoint}:`, responseData);
      return { success: true, data: responseData as WhatsAppResponse };
    } catch (error) {
      // console.error(`❌ Network or other error in sendRequest for ${endpoint}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Network or other error during POST ${endpoint}`;
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Kirim pesan teks WhatsApp
   */
  static async sendTextMessage(
    to: string,
    message: string
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    // console.log(`Attempting to send text message to ${to}`);
    const payload: WhatsAppTextMessage = {
      messaging_product: 'whatsapp',
      to: WhatsAppService.formatPhoneNumber(to),
      type: 'text',
      text: { body: message },
    };
    return WhatsAppService.sendRequest('/messages', payload);
  }

  /**
   * Kirim pesan gambar WhatsApp
   */
  static async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    // console.log(`Attempting to send image message to ${to} with URL ${imageUrl}`);
    const payload: WhatsAppImageMessage = {
      messaging_product: 'whatsapp',
      to: WhatsAppService.formatPhoneNumber(to),
      type: 'image',
      image: {
        link: imageUrl,
        caption: caption || '',
      },
    };
    return WhatsAppService.sendRequest('/messages', payload);
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
    // console.log(`Attempting to send document message to ${to} with URL ${documentUrl}`);
    const payload: WhatsAppDocumentMessage = {
      messaging_product: 'whatsapp',
      to: WhatsAppService.formatPhoneNumber(to),
      type: 'document',
      document: {
        link: documentUrl,
        filename,
        ...(caption && { caption })
      }
    }
    return WhatsAppService.sendRequest('/messages', payload);
  }

  /**
   * Kirim pesan video WhatsApp
   */
  static async sendVideoMessage(
    to: string,
    videoUrl: string,
    caption?: string
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    // console.log(`Attempting to send video message to ${to} with URL ${videoUrl}`);
    const payload: WhatsAppVideoMessage = {
      messaging_product: 'whatsapp',
      to: WhatsAppService.formatPhoneNumber(to),
      type: 'video',
      video: {
        link: videoUrl,
        ...(caption && { caption })
      }
    }
    return WhatsAppService.sendRequest('/messages', payload);
  }

  /**
   * Kirim pesan audio WhatsApp
   */
  static async sendAudioMessage(
    to: string,
    audioUrlOrId: string, // Can be a URL or a media ID
    isMediaId: boolean = false 
  ): Promise<{ success: boolean; data?: WhatsAppResponse; error?: string }> {
    // console.log(`Attempting to send audio message to ${to}`);
    const payload: WhatsAppAudioMessage = {
      messaging_product: 'whatsapp',
      to: WhatsAppService.formatPhoneNumber(to),
      type: 'audio',
      audio: isMediaId ? { id: audioUrlOrId } : { link: audioUrlOrId },
    };
    return WhatsAppService.sendRequest('/messages', payload);
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
    // console.log(`Attempting to send template message ${templateName} to ${to}`);
    const payload: WhatsAppTemplateMessage = {
      messaging_product: 'whatsapp',
      to: WhatsAppService.formatPhoneNumber(to),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        ...(components && { components })
      }
    }
    return WhatsAppService.sendRequest('/messages', payload);
  }

  /**
   * Upload media ke WhatsApp untuk mendapatkan media ID
   */
  static async uploadMedia(
    file: File,
    // type parameter is not strictly needed by WhatsApp API for FormData uploads,
    // but can be useful for internal logic or if API changes.
    // type: 'image' | 'document' | 'audio' | 'video' | 'sticker' 
  ): Promise<{ success: boolean; mediaId?: string; error?: string }> {
    // console.log(`Attempting to upload media: ${file.name}`);
    const endpoint = '/media';
    const url = `${WhatsAppService.API_BASE_URL}/${WhatsAppService.API_VERSION}/${WhatsAppService.PHONE_NUMBER_ID}${endpoint}`;

    if (!WhatsAppService.ACCESS_TOKEN || !WhatsAppService.PHONE_NUMBER_ID || !WhatsAppService.API_BASE_URL) {
      // console.error('❌ Missing API credentials for uploadMedia');
      return { success: false, error: 'Missing API credentials' };
    }

    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', file);
    // formData.append('type', file.type); // WhatsApp infers type from file, but can be specified if needed

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WhatsAppService.ACCESS_TOKEN}`,
          // 'Content-Type': 'multipart/form-data' // Usually set automatically by browser/fetch with FormData
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.id) {
        // console.error('❌ WhatsApp API error during media upload:', responseData);
        const errorDetail = responseData.error?.message || JSON.stringify(responseData);
        return { success: false, error: `Media upload failed: ${errorDetail}` };
      }
      // console.log('✅ Media uploaded successfully:', responseData);
      return { success: true, mediaId: responseData.id };
    } catch (error) {
      // console.error('❌ Error in uploadMedia fetch/processing:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error during media upload' };
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
    // console.log(`Attempting to send image by media ID ${mediaId} to ${to}`);
    const payload: WhatsAppImageIdMessage = { // Use the new interface
      messaging_product: 'whatsapp',
      to: WhatsAppService.formatPhoneNumber(to),
      type: 'image',
      image: {
        id: mediaId,
        caption: caption || '',
      },
    };
    return WhatsAppService.sendRequest('/messages', payload);
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
