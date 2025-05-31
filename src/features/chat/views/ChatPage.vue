<template>
  <VLayout class="chat-app-layout bg-surface">
    <!-- User Profile Sidebar -->
    <UserProfileSidebar v-model="isUserProfileSidebarOpen" :user-profile="currentUser" />

    <!-- Chat List Sidebar -->
    <ChatListSidebar 
      v-model="isChatListSidebarOpen" 
      :user-profile="currentUser"
      @open-user-profile="isUserProfileSidebarOpen = true" 
      @open-active-chat-user-profile="isActiveChatUserProfileOpen = true"
      @select-chat="handleSelectChat"
    />

    <!-- Main Chat Content -->
    <VMain class="chat-content-container">
      <div v-if="activeContact" class="d-flex flex-column h-100">
        <!-- Active Chat Header -->
        <div class="active-chat-header d-flex align-center text-medium-emphasis pa-4">
          <VBtn icon variant="text" class="d-md-none me-4" @click="isChatListSidebarOpen = !isChatListSidebarOpen">
            <VIcon icon="ri-menu-line" />
          </VBtn>
          <div class="d-flex align-center cursor-pointer" @click="isActiveChatUserProfileOpen = true">
            <VBadge dot :color="resolveAvatarBadgeVariant(activeContact.status)" location="bottom right" offset-x="3" offset-y="3" bordered class="me-4">
              <VAvatar :image="activeContact.avatar || '/images/avatars/avatar-placeholder.png'" size="40" />
            </VBadge>
            <div class="flex-grow-1 overflow-hidden">
              <h6 class="text-h6 font-weight-regular">{{ activeContact.fullName }}</h6>
              <p class="text-body-2 text-truncate mb-0">{{ activeContact.role }}</p>
            </div>
          </div>
          <VSpacer />
          <div class="d-sm-flex align-center d-none">
            <VBtn icon variant="text">
              <VIcon icon="ri-phone-line" />
            </VBtn>
            <VBtn icon variant="text">
              <VIcon icon="ri-vidicon-line" />
            </VBtn>
            <VBtn icon variant="text">
              <VIcon icon="ri-search-line" />
            </VBtn>
          </div>
          <VBtn icon variant="text">
            <VIcon icon="ri-more-2-line" />
            <!-- <VMenu activator="parent"> ... More options menu ... </VMenu> -->
          </VBtn>
        </div>
        <VDivider />

        <!-- Chat Log -->
        <ChatLog :chat-log="currentChatMessages" :contact="activeContact" class="flex-grow-1" />

        <!-- Message Input -->
        <ChatMessageInput @send-message="sendMessage" @send-image="sendImageMessage" />
      </div>
      <div v-else class="d-flex justify-center align-center h-100">
        <p class="text-h6 text-disabled">Select a chat to start messaging</p>
      </div>
    </VMain>

    <!-- Active Chat User Profile Sidebar -->
    <ActiveChatUserProfileSidebar v-model="isActiveChatUserProfileOpen" :user="activeContact || undefined" />
  </VLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import { ChatService } from '@/features/chat/services/chatService'
import { useChatAuth } from '@/features/chat/composables/useChatAuth'
import type { ChatLogEntry, ChatContact } from '@/features/chat/types'

// Components
import UserProfileSidebar from '@/features/chat/components/UserProfileSidebar.vue'
import ChatListSidebar from '@/features/chat/components/ChatListSidebar.vue'
import ChatLog from '@/features/chat/components/ChatLog.vue'
import ChatMessageInput from '@/features/chat/components/ChatMessageInput.vue'
import ActiveChatUserProfileSidebar from '@/features/chat/components/ActiveChatUserProfileSidebar.vue'

const isUserProfileSidebarOpen = ref(false)
const isActiveChatUserProfileOpen = ref(false)
const isChatListSidebarOpen = ref(true) // Default to open on larger screens

const { mdAndUp } = useDisplay()
const { currentUser } = useChatAuth()

// Adjust sidebar visibility based on screen size
watch(mdAndUp, val => {
  isChatListSidebarOpen.value = val
}, { immediate: true })

// Chat state
const activeContactId = ref<string | null>(null)
const activeContact = ref<ChatContact | null>(null)
const currentChatMessages = ref<ChatLogEntry[]>([])
const loading = ref(false)

// Message subscription
let messageSubscription: any = null

const handleSelectChat = async (contactId: string) => {
  // console.log(`🎯 ChatPage: Selected chat with contact ID: ${contactId}`)
  
  // 1. Unsubscribe from previous chat if a subscription exists
  if (messageSubscription) {
    // console.log('🔌 ChatPage: Unsubscribing from previous contact...');
    messageSubscription.unsubscribe()
    messageSubscription = null
  }
  
  // 2. Reset active contact and messages immediately for UI responsiveness
  // console.log('🔄 ChatPage: Resetting active contact and messages...');
  activeContact.value = null
  currentChatMessages.value = []
  activeContactId.value = contactId // Set the new contact ID
  
  loading.value = true
  
  try {
    // console.log(`🔍 ChatPage: Getting contact details for ID: ${contactId}`)
    const contact = await ChatService.getContactById(contactId)
    // console.log(`📊 ChatPage: Contact details received:`, contact)
    
    if (contact) {
      activeContact.value = contact
      // console.log(`✅ ChatPage: Active contact set:`, activeContact.value)
      
      // console.log(`🔍 ChatPage: Loading messages for contact ID: ${contactId}`)
      const messages = await ChatService.getContactMessages(contactId)
      // console.log(`📊 ChatPage: Messages received:`, messages)
      // console.log(`📈 ChatPage: Total messages count: ${messages.length}`)
      currentChatMessages.value = messages
      
      // 4. Subscribe to new messages for the current contact
      // console.log('🔌 ChatPage: Subscribing to new contact...');
      messageSubscription = ChatService.subscribeToMessages(contactId, (newMessage, eventType) => {
        // console.log('🔔 ChatPage: Real-time message received in ChatPage:', newMessage, 'Event:', eventType);
        handleNewMessage(newMessage, eventType)
      })
    } else {
      console.error(`❌ ChatPage: Contact not found for ID: ${contactId}`);
      // Potentially clear activeContactId if contact is not found to prevent further issues
      // activeContactId.value = null;
    }
    
  } catch (error) {
    console.error('❌ ChatPage: Error loading chat:', error)
    // Reset to a known safe state in case of error
    activeContact.value = null
    currentChatMessages.value = []
    // activeContactId.value = null; // Optionally reset this too
  } finally {
    loading.value = false
  }
}

const sendMessage = async (messageContent: string) => {
  if (!activeContactId.value || !currentUser.value.id) return
  
  try {
    const success = await ChatService.sendMessage(
      activeContactId.value,
      messageContent,
      currentUser.value.id
    )
    
    if (success) {
      // Message will be added via real-time subscription
      // console.log('Message sent successfully')
    } else {
      console.error('Failed to send message')
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const sendImageMessage = async (imageFile: File, caption: string) => {
  if (!activeContactId.value || !currentUser.value.id) return
  
  // console.log('🖼️ ChatPage: Sending image message...')
  // console.log('📁 File:', imageFile.name)
  // console.log('📝 Caption:', caption)
  
  try {
    const success = await ChatService.sendImageFile(
      activeContactId.value,
      imageFile,
      caption,
      currentUser.value.id
    )
    
    if (success) {
      // console.log('✅ ChatPage: Image message sent successfully')
    } else {
      console.error('❌ ChatPage: Failed to send image message')
    }
  } catch (error) {
    console.error('❌ ChatPage: Error sending image message:', error)
  }
}

const resolveAvatarBadgeVariant = (status?: 'online' | 'offline' | 'away' | 'busy') => {
  if (status === 'online') return 'success'
  if (status === 'busy') return 'error'
  if (status === 'away') return 'warning'
  return 'secondary' // For offline or undefined
}

const handleNewMessage = (messageEntry: ChatLogEntry, eventType: 'INSERT' | 'UPDATE') => {
  // console.log('💬 ChatPage: handleNewMessage eventType:', eventType, 'messageEntry:', messageEntry)

  if (activeContact.value) { // Check if there's an active chat
    if (!messageEntry.isSender) { // Incoming message
      // This is an incoming message for the active chat
      // console.log('💬 ChatPage: Incoming message for active chat, pushing to log.', messageEntry)
      currentChatMessages.value.push(messageEntry);
    } else { // Outgoing message (messageEntry.isSender is true)
      // This is an outgoing message related to the active chat
      if (eventType === 'INSERT') {
        // console.log('💬 ChatPage: Outgoing message INSERT for active chat, pushing to log.', messageEntry)
        currentChatMessages.value.push(messageEntry);
      } else if (eventType === 'UPDATE') {
        // console.log('💬 ChatPage: Outgoing message UPDATE for active chat, attempting to update existing.', messageEntry)
        const existingMessageIndex = currentChatMessages.value.findIndex(entry => entry.message.id === messageEntry.message.id);
        if (existingMessageIndex !== -1) {
          // console.log('💬 ChatPage: Found existing outgoing message, updating feedback.', messageEntry.message.feedback)
          // Update feedback and potentially other properties if needed
          currentChatMessages.value[existingMessageIndex].message.feedback = { ...messageEntry.message.feedback };
          // To ensure full reactivity of the message object if other properties might change:
          // currentChatMessages.value[existingMessageIndex].message = { ...currentChatMessages.value[existingMessageIndex].message, ...messageEntry.message };
        } else {
          // This case might happen if the UPDATE event arrives before the INSERT for some reason,
          // or if the initial fetch didn't include this message and it's an update to a message not yet in the log.
          // console.warn('💬 ChatPage: Did not find existing outgoing message to update via UPDATE event, pushing to log.', messageEntry)
          currentChatMessages.value.push(messageEntry); 
        }
      }
    }
  } else {
    // console.log('💬 ChatPage: Message received but no active chat. Cannot update UI for this chat.');
    // Logic for updating unseen messages for non-active chats was here.
    // This requires access to the 'contacts' list, which is not directly available in this component's scope.
    // This part was commented out in a previous step due to 'contacts' not being defined.
    // if (messageEntry.message.direction === 'incoming') {
      // console.warn('💬 ChatPage: Received message for non-active chat, but cannot update unseenMsgs as \'contacts\' is not available here.')
    // }
  }
}

onMounted(() => {
  // Any additional initialization can go here
})

onUnmounted(() => {
  if (messageSubscription) {
    messageSubscription.unsubscribe()
  }
})

</script>

<style lang="scss">
.chat-app-layout {
  height: calc(100vh - 64px - 48px - 24px); 
}

.v-main.chat-content-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>
