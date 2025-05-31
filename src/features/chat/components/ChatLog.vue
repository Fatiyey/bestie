<template>
  <PerfectScrollbar
    ref="chatLogPS"
    tag="div"
    class="chat-log pa-6 flex-grow-1"
    :options="{ wheelPropagation: false }"
  >
    <template v-for="(msgData, index) in formattedChatLogWithDates" :key="msgData.id || `date-${index}`">
      <!-- Date Separator -->
      <div v-if="msgData.type === 'date-separator'" class="date-separator text-center my-4">
        <VChip
          color="surface-variant"
          size="small"
          label
        >
          {{ msgData.date }}
        </VChip>
      </div>

      <!-- Chat Message -->
      <div
        v-else
        class="chat-group d-flex align-start mb-4"
        :class="msgData.isSender ? 'justify-end' : 'justify-start'"
      >
        <!-- Receiver's Avatar (appears first for receiver) -->
        <VAvatar
          v-if="!msgData.isSender"
          size="32"
          class="me-3"
          :image="contact?.avatar || '/images/avatars/avatar-2.png'" 
        />

        <!-- Message Body (bubble and time/feedback) -->
        <div
          class="chat-body d-inline-flex flex-column"
          :class="msgData.isSender ? 'align-end' : 'align-start'"
        >
          <div
            class="chat-content text-body-1 py-2 px-4 elevation-2 mb-1"
            :class="[
              msgData.isSender ? 'bg-primary text-white' : 'bg-surface',
              msgData.messageType === 'interactive' ? 'interactive-message-bubble' : ''
            ]"
          >
            <!-- Text Message -->
            <p v-if="msgData.messageType === 'text'" class="mb-0">{{ msgData.message }}</p>
            
            <!-- Image Message -->
            <div v-if="msgData.messageType === 'image' && msgData.mediaUrl">
              <img 
                :src="msgData.mediaUrl" 
                alt="Image message" 
                style="max-width: 200px; max-height: 200px; height: auto; border-radius: 6px; cursor: pointer;" 
                @click="openImageFullscreen(msgData.mediaUrl)"
              >
              <p 
                v-if="msgData.message && msgData.messageType === 'image'" 
                class="mb-0 mt-1 text-caption"
                :class="{ 'text-white': msgData.isSender }"
              >
                {{ msgData.message }}
              </p> <!-- Optional caption display -->
            </div>

            <!-- Interactive Message (Simplified: displays content from msgData.message with an icon) -->
            <div v-if="msgData.messageType === 'interactive'" class="d-flex align-center">
              <VIcon size="small" class="me-2" color="info">ri-hand-coin-line</VIcon>
              <p class="mb-0">{{ msgData.message }}</p>
            </div>

          </div>
          <div 
            class="d-flex align-center gap-2"
            :class="msgData.isSender ? 'justify-end' : 'justify-start'"
          >
            <VIcon 
              v-if="msgData.isSender" 
              :color="msgData.feedback.isSeen ? 'success' : 'disabled'" 
              size="16"
            >
              {{ msgData.feedback.isDelivered ? (msgData.feedback.isSeen ? 'ri-check-double-line' : 'ri-check-double-line') : 'ri-check-line' }}
            </VIcon>
            <p class="text-sm text-disabled mb-0" style="letter-spacing: 0.4px;">{{ msgData.time }}</p>
          </div>
        </div>

        <!-- Sender's Avatar (appears after chat-body for sender) -->
        <VAvatar
          v-if="msgData.isSender"
          size="32"
          class="ms-3"
          :image="'/images/avatars/avatar-1.png'" 
        />
      </div>
    </template>
  </PerfectScrollbar>

  <!-- Fullscreen Image Modal -->
  <VDialog
    v-model="isFullscreenDialogVisible"
    max-width="90vw"
    max-height="90vh"
    @click:outside="closeImageFullscreen"
  >
    <VCard>
      <VImg
        :src="fullscreenImageUrl || ''"
        contain
        style="max-height: 85vh;"
      />
      <VCardActions class="justify-end">
        <VBtn color="primary" @click="closeImageFullscreen">Close</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
// Import OriginalFormattedChatLogMessage to avoid naming conflict
import type { ChatContact, ChatMessage, ChatLogEntry, FormattedChatLogMessage as OriginalFormattedChatLogMessage, InteractiveMessageContent, InteractiveMessageAction } from '@/features/chat/types'

// Define a type for date separator
interface DateSeparator {
  type: 'date-separator'
  date: string
  id: string // Unique key for v-for
}

// Define an internal version of FormattedChatLogMessage that includes the 'type' discriminator
// This interface should include all properties expected by the template for a message item.
interface InternalFormattedChatLogMessage {
  id: string; // From ChatMessage
  message: string; // From ChatMessage.message (caption for images, body for interactive)
  time: string; // Formatted time string
  isSender: boolean;
  feedback: {
    isSent: boolean;
    isDelivered: boolean;
    isSeen: boolean;
  }; // From ChatMessage.feedback
  type: 'chat-message'; // Discriminator property
  messageType: 'text' | 'image' | 'audio' | 'video' | 'file' | 'interactive'; // Original message type. Added 'interactive'
  mediaUrl?: string; // URL for media content (e.g., image in interactive header)
  interactiveData?: InteractiveMessageContent; // Added for interactive messages
}

// Use the internal version in the union type for items in the chat log
type ChatLogItem = InternalFormattedChatLogMessage | DateSeparator

const props = defineProps<{
  chatLog: ChatLogEntry[]
  contact?: ChatContact // The contact you are chatting with
}>()

const chatLogPS = ref<InstanceType<typeof PerfectScrollbar> | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (chatLogPS.value) {
      chatLogPS.value.$el.scrollTop = chatLogPS.value.$el.scrollHeight
    }
  })
}

// Helper function to format date
const formatDateForSeparator = (date: Date): string => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

const formattedChatLogWithDates = computed((): ChatLogItem[] => {
  const result: ChatLogItem[] = []
  let lastDate: string | null = null

  const sortedChatLog = [...props.chatLog].sort((a, b) => new Date(a.message.time).getTime() - new Date(b.message.time).getTime());

sortedChatLog.forEach(logEntry => {
    const messageDate = new Date(logEntry.message.time)
    const messageDateString = messageDate.toDateString()

    if (messageDateString !== lastDate) {
      result.push({
        type: 'date-separator',
        date: formatDateForSeparator(messageDate),
        id: `date-${messageDateString}` // Unique ID for the date separator
      })
      lastDate = messageDateString
    }

    // Construct an object conforming to InternalFormattedChatLogMessage
    const chatMessageItem: InternalFormattedChatLogMessage = {
      id: logEntry.message.id,
      message: logEntry.message.message, // Caption for images, text for text messages, body for interactive
      time: messageDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
      isSender: logEntry.isSender,
      feedback: logEntry.message.feedback,
      type: 'chat-message', // Discriminator for ChatLogItem union
      messageType: logEntry.message.type as 'text' | 'image' | 'audio' | 'video' | 'file' | 'interactive', // Actual message type
      mediaUrl: logEntry.message.mediaUrl, // Media URL for images, etc.
      interactiveData: logEntry.message.interactiveData, // Pass interactive data
    };

    result.push(chatMessageItem);
  })
  return result
})

// Add a ref for the fullscreen image URL and a method to open/close it
const fullscreenImageUrl = ref<string | null>(null)
const isFullscreenDialogVisible = ref(false)

const openImageFullscreen = (url: string) => {
  fullscreenImageUrl.value = url
  isFullscreenDialogVisible.value = true
}

const closeImageFullscreen = () => {
  isFullscreenDialogVisible.value = false
  // Optional: reset fullscreenImageUrl.value = null here if needed, though VDialog closing handles hiding it.
}

const handleInteractiveActionClick = (action: InteractiveMessageAction) => {
  console.log('Interactive action clicked:', action);
  // Here you would typically emit an event or call a service to handle the action,
  // e.g., send a reply to the server based on action.id
  // For now, we just log it.
  alert(`Action: ${action.title} (ID: ${action.id}) clicked. Type: ${action.type}`);
}

watch(() => props.chatLog, () => {
  scrollToBottom()
}, { deep: true, immediate: true })

</script>

<style lang="scss" scoped>
.chat-log {
  .chat-group {
    margin-bottom: 1rem;
  }

  .chat-body {
    max-inline-size: calc(100% - 6.75rem); /* Limits bubble width */
  }

  .chat-content {
    word-break: break-word;
    border-radius: 10px;
    p {
      text-align: start;
    }
  }

  // Styles for interactive message bubbles
  .interactive-message-bubble {
    // This class is a marker for interactive messages.
    // Adding a non-visual property to avoid empty ruleset error.
    outline: 1px solid transparent; 
  }

  // Specific style for received interactive messages (not sent by the current user)
  .chat-content.bg-surface.interactive-message-bubble {
    background-color: #e7f3fe !important; // A light blue, distinct from regular received messages
    // color: #333; // Example text color if needed
  }

  // Specific style for sent interactive messages
  .chat-content.bg-primary.interactive-message-bubble {
    // Sent interactive messages use primary background.
    // Adding a non-visual property to avoid empty ruleset error.
    outline-offset: 0px; 
  }

  .interactive-header {
    img {
      display: block; // Ensure image takes full width of its container
    }
    h4 {
      margin: 0;
    }
  }

  .interactive-body {
    white-space: pre-wrap; // Preserve newlines in the body text
  }

  .interactive-footer {
    font-size: 0.75rem;
    color: #757575;
  }

  .interactive-buttons {
    .v-btn {
      text-transform: none; // Keep button text as is
      justify-content: center;
    }
  }
  
  .interactive-list-item {
    border-bottom: 1px solid #f0f0f0; // Separator for list items
    &:last-child {
      border-bottom: none;
    }
    .v-list-item-title {
      font-size: 0.9rem;
    }
  }

  .date-separator {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
}
</style>
