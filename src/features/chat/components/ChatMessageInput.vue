<template>
  <VForm class="chat-message-input d-flex align-center pa-4" @submit.prevent="sendMessage">
    <VTextField
      v-model="messageInput"
      density="compact"
      variant="solo"
      placeholder="Type your message here..."
      class="me-4"
      hide-details
      autofocus
    />
    <VBtn type="submit" icon class="me-2">
      <VIcon icon="ri-send-plane-line" />
    </VBtn>
    <VBtn icon variant="text">
      <VIcon icon="ri-mic-line" />
    </VBtn>
    <VBtn icon variant="text">
      <VIcon icon="ri-attachment-2" />
    </VBtn>
  </VForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'sendMessage', message: string): void
}>()

const messageInput = ref('')

const sendMessage = () => {
  if (messageInput.value.trim()) {
    emit('sendMessage', messageInput.value.trim())
    messageInput.value = ''
  }
}
</script>

<style lang="scss">
.chat-message-input {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background-color: rgb(var(--v-theme-surface));
}
</style>
