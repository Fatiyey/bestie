<template>
  <VForm class="chat-message-input d-flex align-center pa-4" @submit.prevent="sendMessage">
    <!-- Image Preview if selected -->
    <div v-if="selectedImage" class="image-preview me-4">
      <div class="image-container">
        <img :src="imagePreview" alt="Preview" class="preview-image" />
        <VBtn
          icon
          size="small"
          variant="elevated"
          color="error"
          class="remove-image-btn"
          @click="removeImage"
        >
          <VIcon icon="ri-close-line" size="16" />
        </VBtn>
      </div>
    </div>

    <VTextField
      v-model="messageInput"
      :placeholder="inputPlaceholder"
      density="compact"
      variant="solo"
      class="me-4 flex-grow-1"
      hide-details
      autofocus
      @keydown.enter.prevent="sendMessage"
    />
    
    <VBtn type="submit" icon class="me-2" :loading="sending">
      <VIcon icon="ri-send-plane-line" />
    </VBtn>
    
    <!-- Template Selector Button -->
    <VBtn icon variant="text" class="me-2" @click="openTemplateDialog">
      <VIcon icon="ri-file-list-2-line" />
    </VBtn>
    
    <!-- File Upload Button -->
    <VBtn icon variant="text" @click="openFileDialog">
      <VIcon icon="ri-image-line" />
    </VBtn>
    
    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleImageSelect"
    />

    <!-- Template Selection Dialog -->
    <VDialog v-model="isTemplateDialogOpen" max-width="500px">
      <VCard>
        <VCardTitle>Select a Message Template</VCardTitle>
        <VCardText>
          <VList v-if="!loading && availableTemplates.length > 0">
            <VListItem
              v-for="template_item in availableTemplates"
              :key="template_item.id"
              @click="selectTemplate(template_item)"
            >
              <VListItemTitle>{{ template_item.name }}</VListItemTitle>
              <VListItemSubtitle>{{ template_item.template_type }}</VListItemSubtitle>
            </VListItem>
          </VList>
          <p v-else-if="loading">Loading templates...</p>
          <p v-else>No templates available or failed to load.</p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="isTemplateDialogOpen = false">Cancel</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Placeholder Input Dialog -->
    <VDialog v-model="isPlaceholderDialogOpen" max-width="600px" persistent>
      <VCard>
        <VCardTitle>Enter Placeholder Values</VCardTitle>
        <VCardText>
          <div v-if="currentTemplateForPlaceholders" class="mb-3">
            <p>
              Template: <strong>{{ currentTemplateForPlaceholders.name }}</strong>
            </p>
            <p v-if="currentTemplateForPlaceholders.template_type === 'IMAGE_WITH_TEXT' && currentTemplateForPlaceholders.details && currentTemplateForPlaceholders.details.image_url" class="text-caption">
              <em>This template also includes an image. The text below will accompany it.</em>
            </p>
          </div>
          <div v-for="(placeholder, index) in extractedPlaceholders" :key="placeholder" class="mb-4">
            <label :for="'placeholder-input-' + index" class="d-block font-weight-medium mb-1">
              {{ getPlaceholderDisplayName(placeholder) }}
            </label>
            <VTextField
              v-model="placeholderInputValues[placeholder]"
              :placeholder="'Enter value for ' + getPlaceholderDisplayName(placeholder)"
              density="compact"
              variant="outlined"
              :id="'placeholder-input-' + index"
            />
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="cancelPlaceholderDialog">Cancel</VBtn>
          <VBtn variant="elevated" color="primary" @click="submitPlaceholders">Submit</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VForm>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessageTemplateService } from '@/features/message-templates/services/templateService'
import type { MessageTemplate } from '@/features/message-templates/types'

const emit = defineEmits<{
  (e: 'sendMessage', message: string): void
  (e: 'sendImage', file: File, caption: string): void
}>()

const messageInput = ref('')
const selectedImage = ref<File | null>(null)
const imagePreview = ref<string>('')
const sending = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isTemplateDialogOpen = ref(false)
const availableTemplates = ref<MessageTemplate[]>([])

// Refs for placeholder dialog
const isPlaceholderDialogOpen = ref(false)
const currentTemplateForPlaceholders = ref<MessageTemplate | null>(null)
const extractedPlaceholders = ref<string[]>([]) // Stores full placeholders like {{name}}
const placeholderInputValues = ref<Record<string, string>>({}) // Keys are full placeholders

const { getTemplates, error: templateError, loading } = useMessageTemplateService()

const inputPlaceholder = computed(() => {
  return selectedImage.value ? 'Add a caption...' : 'Type your message here...';
});

const sendMessage = async () => {
  if (selectedImage.value) {
    // Ensure there's an image if this block is entered.
    // Caption is optional.
    if (!selectedImage.value) return; 
    
    sending.value = true
    try {
      emit('sendImage', selectedImage.value as File, messageInput.value.trim()) 
      messageInput.value = ''
      removeImage()
    } finally {
      sending.value = false
    }
  } else if (messageInput.value.trim()) {
    sending.value = true
    try {
      emit('sendMessage', messageInput.value.trim())
      messageInput.value = ''
    } finally {
      sending.value = false
    }
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    selectedImage.value = file
    messageInput.value = '' // Clear message input when image is selected
    
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
  if (target) {
    target.value = '';
  }
}

const removeImage = () => {
  selectedImage.value = null
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const openTemplateDialog = async () => {
  if (availableTemplates.value.length === 0 && !loading.value) {
    const { success, data, error } = await getTemplates()
    if (success && data) { // Ensure data is not null/undefined
      availableTemplates.value = data
    } else if (error) {
      console.error("Failed to fetch templates:", error)
      // Optionally show a notification to the user
      // availableTemplates.value = [] // Clear or set to empty on error
    }
  }
  isTemplateDialogOpen.value = true
}

const extractPlaceholdersFromString = (content: string): string[] => {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g; 
  const matches = content.match(regex);
  return matches ? [...new Set(matches)] : [];
}

const getPlaceholderDisplayName = (rawPlaceholder: string): string => {
  // rawPlaceholder is like \"{{ my_var }}\"
  // This regex removes {{, }}, and surrounding whitespace to get \"my_var\"
  return rawPlaceholder.replace(/{{\s*|\s*}}/g, '');
};

const selectTemplate = (template: MessageTemplate) => {
  isTemplateDialogOpen.value = false; 

  if (template.template_type === 'TEXT_WITH_PLACEHOLDERS' || template.template_type === 'IMAGE_WITH_TEXT') {
    if (template.message_content_template && template.message_content_template.includes('{{')) {
      const placeholders = extractPlaceholdersFromString(template.message_content_template);
      if (placeholders.length > 0) {
        currentTemplateForPlaceholders.value = template;
        extractedPlaceholders.value = placeholders;
        placeholderInputValues.value = placeholders.reduce((acc, plc) => {
          acc[plc] = ''; 
          return acc;
        }, {} as Record<string, string>);
        isPlaceholderDialogOpen.value = true;
        return; // sendMessage will be called by submitPlaceholders after dialog submission
      }
    }
  }

  // Handle templates without placeholders or other types that directly set messageInput
  if (template.message_content_template) {
    if (template.template_type === 'ACTION_BASED' || template.template_type === 'FLOW_TRIGGER') {
      messageInput.value = `Triggering: ${template.name}`;
    } else { // TEXT_ONLY or IMAGE_WITH_TEXT (without detected placeholders)
      messageInput.value = template.message_content_template;
    }
  } else {
    messageInput.value = `Selected template: ${template.name} (no content)`;
  }

  // If messageInput has been set by the template, attempt to send it.
  if (messageInput.value.trim()) {
    sendMessage(); 
  }
}

const cancelPlaceholderDialog = () => {
  isPlaceholderDialogOpen.value = false;
  currentTemplateForPlaceholders.value = null;
  extractedPlaceholders.value = [];
  placeholderInputValues.value = {};
}

const submitPlaceholders = () => {
  if (!currentTemplateForPlaceholders.value || !currentTemplateForPlaceholders.value.message_content_template) {
    cancelPlaceholderDialog();
    return;
  }

  let populatedMessage = currentTemplateForPlaceholders.value.message_content_template;
  for (const placeholder of extractedPlaceholders.value) {
    // Correctly escape the placeholder string for use in a RegExp
    const escapedPlaceholder = placeholder.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
    const regex = new RegExp(escapedPlaceholder, 'g');
    populatedMessage = populatedMessage.replace(regex, placeholderInputValues.value[placeholder] || '');
  }
  messageInput.value = populatedMessage;
  cancelPlaceholderDialog();
  sendMessage(); // Call sendMessage after populating input and closing dialog
}

onMounted(async () => {
  // console.log('ChatMessageInput mounted')
  // No need to fetch templates on mount, fetch when dialog is opened
})

</script>

<style lang="scss">
.chat-message-input {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background-color: rgb(var(--v-theme-surface));
}

.image-preview {
  max-width: 200px;
  
  .image-container {
    position: relative;
    display: inline-block;
    
    .preview-image {
      max-width: 100%;
      max-height: 50px; /* Adjust as needed */
      border-radius: 8px;
      object-fit: cover;
    }
    
    .remove-image-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      z-index: 1;
    }
  }
}
</style>
