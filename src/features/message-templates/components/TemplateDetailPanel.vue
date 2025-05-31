<template>
  <VCard flat class="template-detail-panel h-100 d-flex flex-column">
    <template v-if="!selectedTemplate">
      <div class="flex-grow-1 d-flex justify-center align-center">
        <div class="text-center">
          <VIcon icon="ri-message-3-line" size="64" class="text-disabled mb-4" />
          <p class="text-h6 text-disabled mb-2">Select a template</p>
          <p class="text-body-2 text-disabled">Choose a template from the sidebar to view and edit details</p>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Header -->
      <VCardTitle class="d-flex align-center pa-4">
        <VIcon 
          :icon="getTemplateTypeIcon(selectedTemplate.template_type)" 
          :color="getTemplateTypeColor(selectedTemplate.template_type)"
          class="me-3"
        />
        <div class="flex-grow-1">
          <div class="text-h6">{{ selectedTemplate.name }}</div>
          <div class="text-caption text-disabled">
            {{ getTemplateTypeLabel(selectedTemplate.template_type) }}
          </div>
        </div>
        <VBtn
          color="primary"
          size="small"
          @click="isEditMode = !isEditMode"
        >
          <VIcon :icon="isEditMode ? 'ri-save-line' : 'ri-edit-line'" class="me-1" />
          {{ isEditMode ? 'Save' : 'Edit' }}
        </VBtn>
      </VCardTitle>
      
      <VDivider />

      <!-- Content -->
      <VCardText class="flex-grow-1 pa-4">
        <VForm v-if="isEditMode" ref="formRef" @submit.prevent="handleSave">
          <!-- Basic Information -->
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="editForm.name"
                label="Template Name"
                variant="outlined"
                :rules="[rules.required]"
                required
              />
            </VCol>
            
            <VCol cols="12">
              <VTextarea
                v-model="editForm.description"
                label="Description"
                variant="outlined"
                rows="3"
              />
            </VCol>
            
            <VCol cols="12">
              <VSelect
                v-model="editForm.template_type"
                :items="templateTypeOptions"
                label="Template Type"
                variant="outlined"
                :rules="[rules.required]"
                required
              />
            </VCol>
          </VRow>

          <!-- Message Content Template -->
          <VRow>
            <VCol cols="12">
              <VTextarea
                v-model="editForm.message_content_template"
                label="Message Template"
                variant="outlined"
                rows="5"
                :hint="editForm.template_type ? getMessageTemplateHint(editForm.template_type) : ''"
                persistent-hint
              />
            </VCol>
          </VRow>

          <!-- Template Type Specific Fields -->
          <TemplateDetailsEditor
            v-model="editForm.details"
            :template-type="editForm.template_type"
          />

          <!-- Action Buttons -->
          <VRow class="mt-4">
            <VCol cols="12" class="d-flex gap-2">
              <VBtn color="primary" type="submit" :loading="saving">
                Save Changes
              </VBtn>
              <VBtn variant="outlined" @click="cancelEdit">
                Cancel
              </VBtn>
            </VCol>
          </VRow>
        </VForm>

        <!-- Read-only View -->
        <div v-else class="template-details">
          <!-- Basic Info -->
          <VCard variant="outlined" class="mb-4">
            <VCardSubtitle class="pb-0">Basic Information</VCardSubtitle>
            <VCardText>
              <VRow>
                <VCol cols="12" sm="6">
                  <div class="text-caption text-disabled">Name</div>
                  <div class="text-body-1">{{ selectedTemplate.name }}</div>
                </VCol>
                <VCol cols="12" sm="6">
                  <div class="text-caption text-disabled">Type</div>
                  <VChip 
                    :color="getTemplateTypeColor(selectedTemplate.template_type)"
                    size="small"
                    variant="tonal"
                  >
                    {{ getTemplateTypeLabel(selectedTemplate.template_type) }}
                  </VChip>
                </VCol>
                <VCol v-if="selectedTemplate.description" cols="12">
                  <div class="text-caption text-disabled">Description</div>
                  <div class="text-body-2">{{ selectedTemplate.description }}</div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Message Template -->
          <VCard variant="outlined" class="mb-4">
            <VCardSubtitle class="pb-0">Message Template</VCardSubtitle>
            <VCardText>
              <div class="message-preview bg-grey-lighten-5 pa-3 rounded">
                <pre class="text-body-2">{{ selectedTemplate.message_content_template || 'No message template defined' }}</pre>
              </div>
            </VCardText>
          </VCard>

          <!-- Template Details -->
          <TemplateDetailsViewer
            :details="selectedTemplate.details"
            :template-type="selectedTemplate.template_type"
          />

          <!-- Metadata -->
          <VCard variant="outlined">
            <VCardSubtitle class="pb-0">Metadata</VCardSubtitle>
            <VCardText>
              <VRow>
                <VCol cols="12" sm="6">
                  <div class="text-caption text-disabled">Created</div>
                  <div class="text-body-2">{{ formatDate(selectedTemplate.created_at) }}</div>
                </VCol>
                <VCol cols="12" sm="6">
                  <div class="text-caption text-disabled">Last Modified</div>
                  <div class="text-body-2">{{ formatDate(selectedTemplate.updated_at) }}</div>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </div>
      </VCardText>
    </template>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { MessageTemplate, TemplateType, UpdateTemplatePayload } from '../types'
import TemplateDetailsEditor from './TemplateDetailsEditor.vue'
import TemplateDetailsViewer from './TemplateDetailsViewer.vue'

interface Props {
  selectedTemplate: MessageTemplate | null
  saving?: boolean
}

interface Emits {
  (e: 'save-template', id: string, payload: UpdateTemplatePayload): void
}

const props = withDefaults(defineProps<Props>(), {
  saving: false,
})

const emit = defineEmits<Emits>()

const isEditMode = ref(false)
const formRef = ref()
const editForm = ref<UpdateTemplatePayload>({})

const templateTypeOptions = [
  { title: 'Text Only', value: 'TEXT_ONLY' },
  { title: 'Text with Placeholders', value: 'TEXT_WITH_PLACEHOLDERS' },
  { title: 'Image with Text', value: 'IMAGE_WITH_TEXT' },
  { title: 'Action Based', value: 'ACTION_BASED' },
  { title: 'Flow Trigger', value: 'FLOW_TRIGGER' },
]

const rules = {
  required: (value: any) => !!value || 'This field is required',
}

// Watch selected template and reset edit mode
watch(() => props.selectedTemplate, (newTemplate) => {
  isEditMode.value = false
  if (newTemplate) {
    editForm.value = {
      name: newTemplate.name,
      description: newTemplate.description || '',
      template_type: newTemplate.template_type,
      message_content_template: newTemplate.message_content_template || '',
      details: newTemplate.details ? { ...newTemplate.details } : undefined,
    }
  }
})

const handleSave = async () => {
  if (!props.selectedTemplate) return
  
  const { valid } = await formRef.value.validate()
  if (valid) {
    emit('save-template', props.selectedTemplate.id, editForm.value)
    isEditMode.value = false
  }
}

const cancelEdit = () => {
  isEditMode.value = false
  if (props.selectedTemplate) {
    editForm.value = {
      name: props.selectedTemplate.name,
      description: props.selectedTemplate.description || '',
      template_type: props.selectedTemplate.template_type,
      message_content_template: props.selectedTemplate.message_content_template || '',
      details: props.selectedTemplate.details ? { ...props.selectedTemplate.details } : undefined,
    }
  }
}

const getTemplateTypeIcon = (type: TemplateType): string => {
  const icons = {
    TEXT_ONLY: 'ri-text',
    TEXT_WITH_PLACEHOLDERS: 'ri-code-s-slash-line',
    IMAGE_WITH_TEXT: 'ri-image-line',
    ACTION_BASED: 'ri-settings-3-line',
    FLOW_TRIGGER: 'ri-git-branch-line',
  }
  return icons[type]
}

const getTemplateTypeColor = (type: TemplateType): string => {
  const colors = {
    TEXT_ONLY: 'primary',
    TEXT_WITH_PLACEHOLDERS: 'success',
    IMAGE_WITH_TEXT: 'info',
    ACTION_BASED: 'warning',
    FLOW_TRIGGER: 'secondary',
  }
  return colors[type]
}

const getTemplateTypeLabel = (type: TemplateType): string => {
  const labels = {
    TEXT_ONLY: 'Text Only',
    TEXT_WITH_PLACEHOLDERS: 'With Variables',
    IMAGE_WITH_TEXT: 'Image + Text',
    ACTION_BASED: 'Action',
    FLOW_TRIGGER: 'Flow',
  }
  return labels[type]
}

const getMessageTemplateHint = (type: TemplateType): string => {
  const hints = {
    TEXT_ONLY: 'Simple text message without variables',
    TEXT_WITH_PLACEHOLDERS: 'Use {{variable_name}} for dynamic content',
    IMAGE_WITH_TEXT: 'Caption text for the image (can include variables)',
    ACTION_BASED: 'Confirmation message sent after action completes',
    FLOW_TRIGGER: 'Initial message before flow starts',
  }
  return hints[type]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.template-detail-panel {
  min-width: 500px;
}

.message-preview {
  font-family: monospace;
  white-space: pre-wrap;
}
</style>
