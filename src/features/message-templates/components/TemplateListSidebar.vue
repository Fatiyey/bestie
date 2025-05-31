<template>
  <VCard flat class="template-list-sidebar h-100 d-flex flex-column">
    <!-- Header -->
    <VCardTitle class="d-flex align-center pa-4">
      <VIcon icon="ri-message-3-line" class="me-3" />
      <span class="text-h6">Message Templates</span>
      <VSpacer />
      <VBtn 
        color="primary" 
        size="small" 
        @click="$emit('create-template')"
      >
        <VIcon icon="ri-add-line" class="me-1" />
        Add
      </VBtn>
    </VCardTitle>
    
    <VDivider />

    <!-- Search -->
    <div class="pa-4">
      <VTextField
        v-model="searchQuery"
        placeholder="Search templates..."
        prepend-inner-icon="ri-search-line"
        variant="outlined"
        density="compact"
        hide-details
      />
    </div>

    <!-- Template Type Filter -->
    <div class="px-4 pb-4">
      <VSelect
        v-model="selectedType"
        :items="templateTypeOptions"
        placeholder="Filter by type"
        variant="outlined"
        density="compact"
        clearable
        hide-details
      />
    </div>

    <!-- Template List -->
    <VList class="flex-grow-1" density="compact">
      <template v-if="loading">
        <VListItem v-for="n in 5" :key="n">
          <VListItemTitle>
            <VSkeleton type="text" />
          </VListItemTitle>
          <VListItemSubtitle>
            <VSkeleton type="text" width="60%" />
          </VListItemSubtitle>
        </VListItem>
      </template>
      
      <template v-else-if="filteredTemplates.length === 0">
        <VListItem>
          <VListItemTitle class="text-center text-disabled">
            {{ searchQuery || selectedType ? 'No templates found' : 'No templates yet' }}
          </VListItemTitle>
        </VListItem>
      </template>
      
      <template v-else>
        <VListItem
          v-for="template in filteredTemplates"
          :key="template.id"
          :class="{ 'bg-primary-lighten-5': selectedTemplateId === template.id }"
          @click="$emit('select-template', template)"
        >
          <template #prepend>
            <VIcon 
              :icon="getTemplateTypeIcon(template.template_type)" 
              :color="getTemplateTypeColor(template.template_type)"
              size="20"
            />
          </template>

          <VListItemTitle class="text-body-2 font-weight-medium">
            {{ template.name }}
          </VListItemTitle>
          
          <VListItemSubtitle class="text-caption">
            {{ getTemplateTypeLabel(template.template_type) }}
            <span v-if="template.description" class="mx-1">•</span>
            <span v-if="template.description">{{ truncateText(template.description, 30) }}</span>
          </VListItemSubtitle>

          <template #append>
            <VBtn
              icon
              size="small"
              variant="text"
              @click.stop="$emit('delete-template', template)"
            >
              <VIcon icon="ri-delete-bin-7-line" size="16" />
            </VBtn>
          </template>
        </VListItem>
      </template>
    </VList>
  </VCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MessageTemplate, TemplateType } from '../types'

interface Props {
  templates: MessageTemplate[]
  selectedTemplateId?: string
  loading?: boolean
}

interface Emits {
  (e: 'select-template', template: MessageTemplate): void
  (e: 'create-template'): void
  (e: 'delete-template', template: MessageTemplate): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedTemplateId: '',
  loading: false,
})

defineEmits<Emits>()

const searchQuery = ref('')
const selectedType = ref<TemplateType | ''>('')

const templateTypeOptions = [
  { title: 'Text Only', value: 'TEXT_ONLY' },
  { title: 'Text with Placeholders', value: 'TEXT_WITH_PLACEHOLDERS' },
  { title: 'Image with Text', value: 'IMAGE_WITH_TEXT' },
  { title: 'Action Based', value: 'ACTION_BASED' },
  { title: 'Flow Trigger', value: 'FLOW_TRIGGER' },
]

const filteredTemplates = computed(() => {
  let filtered = props.templates

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query)
    )
  }

  // Filter by type
  if (selectedType.value) {
    filtered = filtered.filter(template => template.template_type === selectedType.value)
  }

  return filtered
})

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

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.template-list-sidebar {
  min-width: 320px;
  max-width: 400px;
  border-right: 1px solid rgb(var(--v-theme-outline-variant));
}
</style>
