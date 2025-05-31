import { supabase } from '@/plugins/supabase'
import type { DbContact, DbMessage, ChatContact, ChatMessage, ChatLogEntry } from '@/features/chat/types'
import { WhatsAppService } from '@/services'

export class ChatService {
  // Get all contacts (chats)
  static async getContacts(): Promise<ChatContact[]> {
    try {
      // console.log('🔍 ChatService: Fetching contacts from database...')
      
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (error) {
        console.error('❌ Error fetching contacts:', error)
        
        // Check if it\'s an RLS error
        if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === 'PGRST116') {
          console.error('🔒 RLS Error detected! The user might not have permission to access the contacts table.')
          // console.log('💡 Solution: Make sure RLS policies are set up for authenticated users.')
          // console.log('💡 Run this in console: setupChatRLSAndData()')
        }
        
        return []
      }

      // console.log('📊 ChatService: Raw contacts data from DB:', contacts)
      // console.log(`📈 ChatService: Found ${contacts?.length || 0} contacts`)

      const transformedContacts = contacts?.map(this.transformDbContactToChatContact) || []
      // console.log('🔄 ChatService: Transformed contacts:', transformedContacts)

      return transformedContacts
    } catch (error) {
      console.error('❌ Error in getContacts:', error)
      return []
    }
  }

  // Get messages for a specific contact
  static async getContactMessages(contactId: string): Promise<ChatLogEntry[]> {
    try {
      // console.log(`🔍 ChatService: Fetching messages for contact ID: ${contactId}`)
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('contact_id', contactId)
        .order('timestamp', { ascending: true })

      if (error) {
        console.error('❌ Error fetching messages:', error)
        return []
      }

      // console.log(`📊 ChatService: Raw messages data for contact ${contactId}:`, messages)
      // console.log(`📈 ChatService: Found ${messages?.length || 0} messages`)

      const transformedMessages = messages?.map(this.transformDbMessageToChatLogEntry) || []
      // console.log(`🔄 ChatService: Transformed messages for contact ${contactId}:`, transformedMessages)

      return transformedMessages
    } catch (error) {
      console.error('❌ Error in getContactMessages:', error)
      return []
    }
  }  // Send a new message
  static async sendMessage(
    contactId: string,
    content: string,
    authUserId: string, // This is the Supabase auth UID
    type: string = 'text'
  ): Promise<boolean> {
    try {
      // console.log('💬 ChatService: Sending message...')
      // console.log('📋 ChatService: Contact ID:', contactId)
      // console.log('👤 ChatService: Auth User ID (from Supabase auth):', authUserId)
      // console.log('📝 ChatService: Message content:', content)
      
      // First, get the internal user ID from the users table using auth_uid
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_uid', authUserId)
        .single()
      
      if (userError) {
        console.error('❌ ChatService: Error getting user data:', userError)
        return false
      }
      
      if (!userData?.id) {
        console.error('❌ ChatService: No user found with auth_uid:', authUserId)
        return false
      }
      
      // console.log('✅ ChatService: Found internal user ID:', userData.id)

      // Get contact data to get the WhatsApp number
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('wa_id, name')
        .eq('id', contactId)
        .single()

      if (contactError) {
        console.error('❌ ChatService: Error getting contact data:', contactError)
        return false
      }

      const timestamp = Date.now()
      
      // Insert message to database first
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          contact_id: contactId,
          user_id: userData.id, // Use the internal user ID from users table
          content,
          type,
          direction: 'outgoing',
          status: 'sent',
          timestamp,
          status_timestamp: timestamp
        })

      if (messageError) {
        console.error('❌ ChatService: Error inserting message:', messageError)
        return false
      }
      
      // console.log('✅ ChatService: Message inserted successfully')

      // Send WhatsApp message if contact has wa_id
      if (contactData?.wa_id && type === 'text') {
        // console.log('📱 ChatService: Sending WhatsApp message to:', contactData.wa_id)
        
        try {
          const whatsappResult = await WhatsAppService.sendTextMessage(contactData.wa_id, content)
          
          if (whatsappResult.success) {
            // console.log('✅ ChatService: WhatsApp message sent successfully')
            
            // Update message status to delivered
            await supabase
              .from('messages')
              .update({ 
                status: 'delivered',
                status_timestamp: Date.now()
              })
              .eq('contact_id', contactId)
              .eq('content', content)
              .eq('timestamp', timestamp)
              
          } else {
            console.warn('⚠️ ChatService: WhatsApp message failed:', whatsappResult.error)
            
            // Update message status to failed
            await supabase
              .from('messages')
              .update({ 
                status: 'failed',
                status_timestamp: Date.now()
              })
              .eq('contact_id', contactId)
              .eq('content', content)
              .eq('timestamp', timestamp)
          }
        } catch (whatsappError) {
          console.error('❌ ChatService: WhatsApp error:', whatsappError)
          
          // Update message status to failed
          await supabase
            .from('messages')
            .update({ 
              status: 'failed',
              status_timestamp: Date.now()
            })
            .eq('contact_id', contactId)
            .eq('content', content)
            .eq('timestamp', timestamp)
        }
      }

      // Update contact\'s last message
      const { error: contactUpdateError } = await supabase
        .from('contacts')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)

      if (contactUpdateError) {
        console.error('⚠️ ChatService: Error updating contact last message:', contactUpdateError)
        // Don\'t return false here, message was sent successfully
      } else {
        // console.log('✅ ChatService: Contact last message updated successfully')
      }

      // console.log('🎉 ChatService: Message sent successfully')
      return true
    } catch (error) {
      console.error('❌ ChatService: Error in sendMessage:', error)
      return false
    }
  }

  // Send an image message via WhatsApp
  static async sendImageMessage(
    contactId: string,
    imageUrl: string,
    caption: string,
    authUserId: string
  ): Promise<boolean> {
    try {
      // console.log('🖼️ ChatService: Sending image message...')
      // console.log('📋 ChatService: Contact ID:', contactId)
      // console.log('🔗 ChatService: Image URL:', imageUrl)
      // console.log('📝 ChatService: Caption:', caption)
      
      // Get internal user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_uid', authUserId)
        .single()
      
      if (userError || !userData?.id) {
        console.error('❌ ChatService: Error getting user data:', userError)
        return false
      }

      // Get contact data for WhatsApp number
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('wa_id, name')
        .eq('id', contactId)
        .single()

      if (contactError || !contactData?.wa_id) {
        console.error('❌ ChatService: Error getting contact data or no WhatsApp ID:', contactError)
        return false
      }

      const timestamp = Date.now()
      
      // Insert message to database
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          contact_id: contactId,
          user_id: userData.id,
          content: caption || 'Image',
          type: 'image',
          direction: 'outgoing',
          status: 'sent',
          timestamp,
          status_timestamp: timestamp,
          media_url: imageUrl
        })

      if (messageError) {
        console.error('❌ ChatService: Error inserting image message:', messageError)
        return false
      }
      
      // console.log('✅ ChatService: Image message inserted successfully')

      // Send WhatsApp image
      try {
        const whatsappResult = await WhatsAppService.sendImageMessage(
          contactData.wa_id, 
          imageUrl, 
          caption
        )
        
        if (whatsappResult.success) {
          // console.log('✅ ChatService: WhatsApp image sent successfully')
          
          // Update message status to delivered
          await supabase
            .from('messages')
            .update({ 
              status: 'delivered',
              status_timestamp: Date.now()
            })
            .eq('contact_id', contactId)
            .eq('timestamp', timestamp)
            
        } else {
          console.warn('⚠️ ChatService: WhatsApp image failed:', whatsappResult.error)
          
          // Update message status to failed
          await supabase
            .from('messages')
            .update({ 
              status: 'failed',
              status_timestamp: Date.now()
            })
            .eq('contact_id', contactId)
            .eq('timestamp', timestamp)
        }
      } catch (whatsappError) {
        console.error('❌ ChatService: WhatsApp image error:', whatsappError)
        
        // Update message status to failed
        await supabase
          .from('messages')
          .update({ 
            status: 'failed',
            status_timestamp: Date.now()
          })
          .eq('contact_id', contactId)
          .eq('timestamp', timestamp)
      }

      // Update contact\'s last message
      await supabase
        .from('contacts')
        .update({
          last_message: caption || 'Image',
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)

      // console.log('🎉 ChatService: Image message sent successfully')
      return true
    } catch (error) {
      console.error('❌ ChatService: Error in sendImageMessage:', error)
      return false
    }
  }

  // Upload image file and send via WhatsApp
  static async sendImageFile(
    contactId: string,
    imageFile: File,
    caption: string,
    authUserId: string
  ): Promise<boolean> {
    try {
      // console.log('📤 ChatService: Uploading and sending image file...')
      // console.log('📋 ChatService: Contact ID:', contactId)
      // console.log('📁 ChatService: File name:', imageFile.name)
      // console.log('📝 ChatService: Caption:', caption)
      
      // Get internal user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_uid', authUserId)
        .single()
      
      if (userError || !userData?.id) {
        console.error('❌ ChatService: Error getting user data:', userError)
        return false
      }

      // Get contact data for WhatsApp number
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('wa_id, name')
        .eq('id', contactId)
        .single()

      if (contactError || !contactData?.wa_id) {
        console.error('❌ ChatService: Error getting contact data or no WhatsApp ID:', contactError)
        return false
      }

      // 1. Upload image to Supabase Storage
      const fileName = `img_${Date.now()}_${imageFile.name}`
      const filePath = `${authUserId}/${fileName}` // Store under user's folder
      // console.log(`📤 ChatService: Uploading image to Supabase Storage at path: message-media/${filePath}`)
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('message-media')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (storageError) {
        console.error('❌ ChatService: Error uploading image to Supabase Storage:', storageError)
        return false
      }

      // console.log('✅ ChatService: Image uploaded to Supabase Storage:', storageData)

      // 2. Get public URL from Supabase Storage
      const { data: publicUrlData } = supabase.storage
        .from('message-media')
        .getPublicUrl(filePath)

      if (!publicUrlData?.publicUrl) {
        console.error('❌ ChatService: Error getting public URL for image from Supabase Storage.')
        // Attempt to remove the uploaded file if we can't get a URL
        await supabase.storage.from('message-media').remove([filePath])
        return false
      }
      const supabaseMediaUrl = publicUrlData.publicUrl
      // console.log('🔗 ChatService: Supabase Media URL:', supabaseMediaUrl)


      // Upload image to WhatsApp Media API (optional, if direct URL sending is not preferred or fails)
      // For now, we will rely on sending the public URL directly if the WhatsApp service supports it.
      // If WhatsApp requires uploading first, we'd use WhatsAppService.uploadMedia and then send by ID.
      // Let's assume WhatsAppService.sendImageMessage can take a public URL.

      const timestamp = Date.now()
      
      // 3. Insert message to database with Supabase media URL
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          contact_id: contactId,
          user_id: userData.id,
          content: caption || '', // Caption is the main content for image messages
          type: 'image', // Set type to 'image'
          direction: 'outgoing',
          status: 'sent',
          timestamp,
          status_timestamp: timestamp,
          media_url: supabaseMediaUrl // Store Supabase public URL
        })

      if (messageError) {
        console.error('❌ ChatService: Error inserting image message with Supabase URL:', messageError)
        // Attempt to remove the uploaded file from storage if DB insert fails
        await supabase.storage.from('message-media').remove([filePath])
        return false
      }
      
      // console.log('✅ ChatService: Image message (with Supabase URL) inserted successfully')

      // 4. Send WhatsApp image using the public URL
      try {
        // Assuming WhatsAppService.sendImageMessage can handle public URLs
        // If it expects a media ID, we would need to upload to WhatsApp first
        // and then use sendImageByMediaId.
        // For now, let's try sending the public URL.
        const whatsappResult = await WhatsAppService.sendImageMessage(
          contactData.wa_id, 
          supabaseMediaUrl, // Send the Supabase public URL
          caption
        )
        
        if (whatsappResult.success) {
          // console.log('✅ ChatService: WhatsApp image sent successfully using Supabase URL')
          await supabase
            .from('messages')
            .update({ 
              status: 'delivered',
              status_timestamp: Date.now()
            })
            .eq('contact_id', contactId)
            .eq('timestamp', timestamp)
            
        } else {
          console.warn('⚠️ ChatService: WhatsApp image failed using Supabase URL:', whatsappResult.error)
          await supabase
            .from('messages')
            .update({ 
              status: 'failed',
              status_timestamp: Date.now()
            })
            .eq('contact_id', contactId)
            .eq('timestamp', timestamp)
        }
      } catch (whatsappError) {
        console.error('❌ ChatService: WhatsApp image error (Supabase URL):', whatsappError)
        await supabase
          .from('messages')
          .update({ 
            status: 'failed',
            status_timestamp: Date.now()
          })
          .eq('contact_id', contactId)
          .eq('timestamp', timestamp)
      }

      // Update contact's last message
      await supabase
        .from('contacts')
        .update({
          last_message: caption || '📷 Image', // Indicate it's an image
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)

      // console.log('🎉 ChatService: Image file sent successfully using Supabase Storage')
      return true
    } catch (error) {
      console.error('❌ ChatService: Error in sendImageFile:', error)
      return false
    }
  }

  // Get a specific contact by ID
  static async getContactById(contactId: string): Promise<ChatContact | null> {
    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single()

      if (error) {
        console.error('Error fetching contact:', error)
        return null
      }

      return contact ? this.transformDbContactToChatContact(contact) : null
    } catch (error) {
      console.error('Error in getContactById:', error)
      return null
    }
  }

  // Transform DB contact to UI contact
  private static transformDbContactToChatContact(dbContact: DbContact): ChatContact {
    // console.log('🔄 Transforming DB contact:', dbContact)
    
    const chatContact: ChatContact = {
      id: dbContact.id,
      fullName: dbContact.name || dbContact.wa_id || 'Unknown Contact',
      role: 'Contact', // Default role since it's not in DB
      about: '', // Default about since it's not in DB
      avatar: dbContact.profile_pic_url || undefined,
      status: 'offline' as const, // Default status since we don't track online status
      wa_id: dbContact.wa_id || undefined,
      lastMessage: dbContact.last_message || undefined,
      lastMessageAt: dbContact.last_message_at || undefined,
      unseenMsgs: 0, // We can implement this later if needed
      email: undefined, // Not available in contacts table
      phone: undefined  // Not available in contacts table
    }
    
    // console.log('✅ Transformed to chat contact:', chatContact)
    return chatContact
  }

  // Transform DB message to UI chat log entry
  private static transformDbMessageToChatLogEntry(dbMessage: DbMessage): ChatLogEntry {
    // Handle timestamp conversion - check if it\'s in seconds or milliseconds
    let timestamp = dbMessage.timestamp
    if (timestamp) {
      // If timestamp is less than 13 digits, it\'s probably in seconds, convert to milliseconds
      if (timestamp.toString().length <= 10) {
        timestamp = timestamp * 1000
      }
    }
    
    // console.log(`🕐 ChatService: Original timestamp: ${dbMessage.timestamp}, Converted: ${timestamp}`)
    
    const chatMessage: ChatMessage = {
      id: dbMessage.id,
      message: dbMessage.content || '', // For text messages, or caption for images, or body for interactive
      time: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
      senderId: dbMessage.user_id || dbMessage.contact_id || '',
      feedback: {
        isSent: true,
        isDelivered: dbMessage.status === 'delivered' || dbMessage.status === 'read',
        isSeen: dbMessage.status === 'read'
      },
      type: (dbMessage.type as ChatMessage['type']) || 'text', // Ensure type is passed and cast
      mediaUrl: dbMessage.media_url || undefined, // Ensure media_url is passed
      direction: dbMessage.direction as 'incoming' | 'outgoing' || 'incoming',
      interactiveData: dbMessage.interactive_data || undefined, // Pass interactive data
    }

    if (dbMessage.type === 'interactive') {
      console.log('ChatService (transform): dbMessage.interactive_data:', JSON.stringify(dbMessage.interactive_data));
      console.log('ChatService (transform): chatMessage.interactiveData:', JSON.stringify(chatMessage.interactiveData));
    }

    return {
      message: chatMessage,
      isSender: dbMessage.direction === 'outgoing'
    }
  }

  // Real-time subscription for new messages
  static subscribeToMessages(contactId: string, callback: (message: ChatLogEntry, eventType: 'INSERT' | 'UPDATE') => void) {
    console.log(`🔔 ChatService: Subscribing to messages (INSERT & UPDATE) for contact_id=${contactId}`);
    return supabase
      .channel(`messages:contact_id=eq.${contactId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages',
          filter: `contact_id=eq.${contactId}`
        },
        (payload) => {
          console.log('🔔 ChatService: Real-time event payload received:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const dbMessage = payload.new as DbMessage
            const chatLogEntry = this.transformDbMessageToChatLogEntry(dbMessage)
            console.log(`🔔 ChatService: Transformed real-time message (event: ${payload.eventType}):`, chatLogEntry);
            callback(chatLogEntry, payload.eventType)
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ ChatService: Successfully subscribed to messages for contact_id=${contactId}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error(`❌ ChatService: Subscription error for contact_id=${contactId}. Status: ${status}`, err);
        }
      })
  }

  // Real-time subscription for contact updates
  static subscribeToContacts(callback: (contact: ChatContact) => void) {
    // console.log('🔔 ChatService: Subscribing to contact updates');
    return supabase
      .channel('contacts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          // console.log('🔔 ChatService: Real-time contact event payload received:', payload);
          if (payload.new) {
            const dbContact = payload.new as DbContact
            const chatContact = this.transformDbContactToChatContact(dbContact)
            // console.log('🔔 ChatService: Transformed real-time contact update:', chatContact);
            callback(chatContact)
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          // console.log('✅ ChatService: Successfully subscribed to contact updates');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error(`❌ ChatService: Contact subscription error. Status: ${status}`, err);
        }
      })
  }
}
