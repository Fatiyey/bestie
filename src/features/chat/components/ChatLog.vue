<template>
  <PerfectScrollbar
    ref="chatLogPS"
    tag="div"
    class="chat-log pa-6 flex-grow-1"
    :options="{ wheelPropagation: false }"
  >
    <div
      v-for="(msgData) in formattedChatLog"
      :key="msgData.id"
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
          ]"
        >
          <p class="mb-0">{{ msgData.message }}</p>
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
  </PerfectScrollbar>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { ChatContact, ChatMessage, ChatLogEntry, FormattedChatLogMessage } from '@/features/chat/types'

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

const formattedChatLog = computed(() => {
  // This is a simplified version. You might want to group messages by sender or add more complex logic.
  return props.chatLog.map(logEntry => {
    return {
      ...logEntry.message,
      isSender: logEntry.isSender,
      time: new Date(logEntry.message.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
    } as FormattedChatLogMessage
  })
})

watch(() => props.chatLog, () => {
  scrollToBottom()
}, { deep: true, immediate: true })

</script>

<style lang="scss" scoped>
.chat-log {
  .chat-group {
    margin-bottom: 1rem;
    // width: 100%; // Let flexbox handle width distribution
    
    // Vuetify's justify-end and justify-start should handle these cases
    // when d-flex is present on the element.
    // &.justify-end {
    //   display: flex !important; 
    //   justify-content: flex-end !important;
    // }
    
    // &.justify-start {
    //   display: flex !important;
    //   justify-content: flex-start !important;
    // }
  }

  .chat-body {
    max-inline-size: calc(100% - 6.75rem); /* As per your example, limits bubble width */
  }

  .chat-content {
    word-break: break-word;
    border-radius: 10px;
    // Ensure text inside the bubble is left-aligned by default
    p {
      text-align: start;
    }
  }

  // .text-right class was removed from template for time/feedback, using justify-end instead.
}
</style>
