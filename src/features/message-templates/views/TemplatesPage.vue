<template>
  <div class="d-flex h-100">
    <!-- Sidebar -->
    <TemplateListSidebar
      :templates="templates"
      :selected-template-id="selectedTemplate?.id"
      :loading="loading"
      @select-template="selectedTemplate = $event"
      @create-template="openCreateDialog"
    />

    <!-- Detail Panel -->
    <TemplateDetailPanel
      v-if="selectedTemplate"
      :selectedTemplate="selectedTemplate"
      :saving="templateLoading"
      @save-template="handleSaveTemplate"
      @delete-template="handleDeleteTemplate"
    />

    <!-- Empty State -->
    <div
      v-else
      class="flex-grow-1 d-flex align-center justify-center"
    >
      <div class="text-center">
        <VIcon
          size="120"
          color="disabled"
          class="mb-4"
        >
          ri-message-3-line
        </VIcon>
        <h4 class="text-h4 text-disabled mb-2">
          Select a Template
        </h4>
        <p class="text-body-1 text-disabled mb-4">
          Choose a template from the sidebar to view details
        </p>
        <VBtn
          color="primary"
          @click="openCreateDialog"
        >
          Create New Template
        </VBtn>
      </div>
    </div>

    <!-- Create Template Dialog -->
    <VDialog
      v-model="isCreateDialogVisible"
      max-width="600"
      persistent
    >
      <VCard>
        <VCardTitle class="d-flex align-center justify-space-between">
          <span>Create New Template</span>
          <VBtn
            icon
            variant="plain"
            @click="closeCreateDialog"
          >
            <VIcon>ri-close-line</VIcon>
          </VBtn>
        </VCardTitle>
        
        <VCardText>
          <VForm ref="createFormRef" @submit.prevent="handleCreateTemplate">
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="newTemplate.name"
                  label="Template Name"
                  :rules="[rules.required]"
                  required
                />
              </VCol>
              
              <VCol cols="12">
                <VSelect
                  v-model="newTemplate.type"
                  label="Template Type"
                  :items="templateTypeOptions"
                  item-title="label"
                  item-value="value"
                  :rules="[rules.required]"
                  required
                />
              </VCol>
              
              <VCol cols="12">
                <VTextarea
                  v-model="newTemplate.description"
                  label="Description"
                  rows="3"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="closeCreateDialog"
          >
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            :loading="creating"
            @click="handleCreateTemplate"
          >
            Create
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation Dialog -->
    <VDialog
      v-model="isDeleteDialogVisible"
      max-width="400"
    >
      <VCard>
        <VCardTitle>
          Confirm Delete
        </VCardTitle>
        
        <VCardText>
          Are you sure you want to delete the template "{{ templateToDelete?.name }}"? This action cannot be undone.
        </VCardText>
        
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="isDeleteDialogVisible = false"
          >
            Cancel
          </VBtn>
          <VBtn
            color="error"
            :loading="deleting"
            @click="confirmDelete"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Snackbar for notifications -->
    <VSnackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="bottom"
    >
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TemplateListSidebar from '../components/TemplateListSidebar.vue'
import TemplateDetailPanel from '../components/TemplateDetailPanel.vue'
import { useMessageTemplateService } from '../services/templateService'
import type { MessageTemplate, TemplateType, CreateTemplatePayload, UpdateTemplatePayload } from '../types'

const templateService = useMessageTemplateService()

// Notification state
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Notification helper
const showNotification = (message: string, color: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  snackbarText.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Data
const templates = ref<MessageTemplate[]>([])
const selectedTemplate = ref<MessageTemplate | null>(null)
const loading = ref(false)
const templateLoading = ref(false)
const creating = ref(false)
const deleting = ref(false)

// Dialogs
const isCreateDialogVisible = ref(false)
const isDeleteDialogVisible = ref(false)
const templateToDelete = ref<MessageTemplate | null>(null)

// Form
const createFormRef = ref()
const newTemplate = ref({
  name: '',
  type: 'TEXT_ONLY' as TemplateType,
  description: ''
})

// Template type options
const templateTypeOptions = [
  { label: 'Text Only', value: 'TEXT_ONLY' },
  { label: 'Text with Placeholders', value: 'TEXT_WITH_PLACEHOLDERS' },
  { label: 'Image with Text', value: 'IMAGE_WITH_TEXT' },
  { label: 'Action Based', value: 'ACTION_BASED' },
  { label: 'Flow Trigger', value: 'FLOW_TRIGGER' }
]

// Validation rules
const rules = {
  required: (value: string) => !!value || 'This field is required'
}

// Methods
const fetchTemplates = async () => {
  loading.value = true
  try {
    const result = await templateService.getTemplates()
    if (result.success && result.data) {
      templates.value = result.data
    } else {
      showNotification(result.error || 'Failed to fetch templates', 'error')
    }
  } catch (error) {
    console.error('Error fetching templates:', error)
    showNotification('Failed to fetch templates', 'error')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  newTemplate.value = {
    name: '',
    type: 'TEXT_ONLY',
    description: ''
  }
  isCreateDialogVisible.value = true
}

const closeCreateDialog = () => {
  isCreateDialogVisible.value = false
  newTemplate.value = {
    name: '',
    type: 'TEXT_ONLY',
    description: ''
  }
}

const handleCreateTemplate = async () => {
  if (!createFormRef.value) return
  
  const { valid } = await createFormRef.value.validate()
  if (!valid) return

  creating.value = true
  try {
    const createData: CreateTemplatePayload = {
      name: newTemplate.value.name,
      template_type: newTemplate.value.type,
      description: newTemplate.value.description || undefined,
      message_content_template: getDefaultContent(newTemplate.value.type),
      details: getDefaultDetails(newTemplate.value.type)
    }

    const result = await templateService.createTemplate(createData)
    if (result.success && result.data) {
      showNotification('Template created successfully')
      closeCreateDialog()
      await fetchTemplates()
      // Select the newly created template
      selectedTemplate.value = result.data
    } else {
      showNotification(result.error || 'Failed to create template', 'error')
    }
  } catch (error) {
    console.error('Error creating template:', error)
    showNotification('Failed to create template', 'error')
  } finally {
    creating.value = false
  }
}

const getDefaultContent = (type: TemplateType): string => {
  switch (type) {
    case 'TEXT_ONLY':
      return 'Your message here...'
    case 'TEXT_WITH_PLACEHOLDERS':
      return 'Hello {{name}}, welcome to our service!'
    case 'IMAGE_WITH_TEXT':
      return 'Check out this image!'
    case 'ACTION_BASED':
      return 'Click the button below to continue'
    case 'FLOW_TRIGGER':
      return 'Starting conversation flow...'
    default:
      return ''
  }
}

const getDefaultDetails = (type: TemplateType): any => {
  switch (type) {
    case 'TEXT_WITH_PLACEHOLDERS':
      return {
        placeholders: [
          { key: 'name', label: 'Name', type: 'text', required: true }
        ]
      }
    case 'IMAGE_WITH_TEXT':
      return {
        imageUrl: '',
        imageAlt: ''
      }
    case 'ACTION_BASED':
      return {
        actions: [],
        requiresAdminInput: false,
        adminInputFields: []
      }
    case 'FLOW_TRIGGER':
      return {
        flowId: '',
        flowName: '',
        initialMessage: ''
      }
    default:
      return {}
  }
}

const handleSaveTemplate = async (id: string, payload: UpdateTemplatePayload) => {
  templateLoading.value = true
  try {
    const result = await templateService.updateTemplate(id, {
      name: payload.name,
      description: payload.description || null,
      message_content_template: payload.message_content_template || null,
      details: payload.details || null
    })

    if (result.success && result.data) {
      showNotification('Template saved successfully')
      selectedTemplate.value = result.data
      await fetchTemplates()
    } else {
      showNotification(result.error || 'Failed to save template', 'error')
    }
  } catch (error) {
    console.error('Error saving template:', error)
    showNotification('Failed to save template', 'error')
  } finally {
    templateLoading.value = false
  }
}

const handleDeleteTemplate = (template: MessageTemplate) => {
  templateToDelete.value = template
  isDeleteDialogVisible.value = true
}

const confirmDelete = async () => {
  if (!templateToDelete.value) return

  deleting.value = true
  try {
    const result = await templateService.deleteTemplate(templateToDelete.value.id)
    if (result.success) {
      showNotification('Template deleted successfully')
      
      // Clear selection if deleted template was selected
      if (selectedTemplate.value?.id === templateToDelete.value.id) {
        selectedTemplate.value = null
      }
      
      await fetchTemplates()
    } else {
      showNotification(result.error || 'Failed to delete template', 'error')
    }
  } catch (error) {
    console.error('Error deleting template:', error)
    showNotification('Failed to delete template', 'error')
  } finally {
    deleting.value = false
    isDeleteDialogVisible.value = false
    templateToDelete.value = null
  }
}

// Lifecycle
onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.d-flex.h-100 {
  height: 100vh;
}
</style>
