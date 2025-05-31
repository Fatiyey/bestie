<template>
  <div class="template-details-viewer">
    <!-- Placeholders for TEXT_WITH_PLACEHOLDERS and IMAGE_WITH_TEXT -->
    <VCard v-if="showPlaceholders && details?.placeholders?.length" variant="outlined" class="mb-4">
      <VCardSubtitle class="pb-0">Message Variables</VCardSubtitle>
      <VCardText>
        <VList density="compact">
          <VListItem
            v-for="placeholder in details.placeholders"
            :key="placeholder.name"
          >
            <template #prepend>
              <VIcon icon="ri-code-s-slash-line" size="20" class="me-2" />
            </template>
            <VListItemTitle class="text-body-2">
              <code>{{ formatPlaceholder(placeholder.name) }}</code>
            </VListItemTitle>
            <VListItemSubtitle>
              {{ placeholder.description }}
              <span v-if="placeholder.example" class="text-primary">
                (e.g., {{ placeholder.example }})
              </span>
            </VListItemSubtitle>
          </VListItem>
        </VList>
      </VCardText>
    </VCard>

    <!-- Image URL for IMAGE_WITH_TEXT -->
    <VCard v-if="templateType === 'IMAGE_WITH_TEXT' && details?.image_url" variant="outlined" class="mb-4">
      <VCardSubtitle class="pb-0">Image</VCardSubtitle>
      <VCardText>
        <div class="d-flex align-center gap-3">
          <VImg
            :src="details.image_url"
            width="80"
            height="60"
            cover
            class="rounded"
          />
          <div>
            <div class="text-body-2 font-weight-medium mb-1">Image URL</div>
            <div class="text-caption text-disabled">{{ details.image_url }}</div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Action Configuration for ACTION_BASED -->
    <template v-if="templateType === 'ACTION_BASED' && details">
      <VCard variant="outlined" class="mb-4">
        <VCardSubtitle class="pb-0">Automated Action Details</VCardSubtitle>
        <VCardText>
          <VList density="compact" class="py-0">
            <VListItem v-if="details.action_identifier">
              <VListItemTitle class="text-caption text-disabled mb-1">Action Identifier</VListItemTitle>
              <VListItemSubtitle>{{ details.action_identifier }}</VListItemSubtitle>
            </VListItem>
            <VListItem v-if="details.target_operation?.table">
              <VListItemTitle class="text-caption text-disabled mb-1">Target Database Table</VListItemTitle>
              <VListItemSubtitle>{{ details.target_operation.table }}</VListItemSubtitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>

      <!-- Admin Input Fields -->
      <VCard v-if="details.required_inputs_for_admin?.length" variant="outlined" class="mb-4">
        <VCardSubtitle class="pb-0">Data Required from Admin</VCardSubtitle>
        <VCardText>
          <VList density="compact">
            <VListItem
              v-for="input in details.required_inputs_for_admin"
              :key="input.name"
            >
              <template #prepend>
                <VIcon 
                  :icon="getInputTypeIcon(input.type)" 
                  size="20" 
                  class="me-2" 
                />
              </template>
              <VListItemTitle class="text-body-2">
                {{ input.label }}
                <VChip v-if="input.required" size="x-small" color="error" class="ms-2">Required</VChip>
              </VListItemTitle>
              <VListItemSubtitle>
                {{ input.name }} ({{ input.type }})
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>

      <!-- Message Variables -->
      <VCard v-if="details.message_placeholders?.length" variant="outlined" class="mb-4">
        <VCardSubtitle class="pb-0">Dynamic Variables in Sent Message</VCardSubtitle>
        <VCardText>
          <VList density="compact">
            <VListItem
              v-for="placeholder in details.message_placeholders"
              :key="placeholder.name"
            >
              <template #prepend>
                <VIcon icon="ri-code-s-slash-line" size="20" class="me-2" />
              </template>
              <VListItemTitle class="text-body-2">
                <code>{{ formatPlaceholder(placeholder.name) }}</code>
              </VListItemTitle>
              <VListItemSubtitle>
                Source: {{ placeholder.source_from_input || placeholder.source_from_action_result || 'Not specified' }}
                <span v-if="placeholder.format" class="text-primary">
                  (Format: {{ placeholder.format }})
                </span>
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </template>

    <!-- Flow Configuration for FLOW_TRIGGER -->
    <template v-if="templateType === 'FLOW_TRIGGER' && details">
      <VCard variant="outlined" class="mb-4">
        <VCardSubtitle class="pb-0">Conversation Flow Trigger</VCardSubtitle>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <div class="text-caption text-disabled">Flow ID</div>
              <div class="text-body-2">{{ details.flow_id || 'Not specified' }}</div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Initial Message Variables -->
      <VCard v-if="details.initial_message_placeholders?.length" variant="outlined" class="mb-4">
        <VCardSubtitle class="pb-0">Initial Variables for Flow Message</VCardSubtitle>
        <VCardText>
          <VList density="compact">
            <VListItem
              v-for="placeholder in details.initial_message_placeholders"
              :key="placeholder.name"
            >
              <template #prepend>
                <VIcon icon="ri-code-s-slash-line" size="20" class="me-2" />
              </template>
              <VListItemTitle class="text-body-2">
                <code>{{ formatPlaceholder(placeholder.name) }}</code>
              </VListItemTitle>
              <VListItemSubtitle>
                {{ placeholder.description }}
                <span v-if="placeholder.example" class="text-primary">
                  (e.g., {{ placeholder.example }})
                </span>
              </VListItemSubtitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </template>

    <!-- Empty State -->
    <VCard v-if="!hasDetails" variant="outlined" class="text-center">
      <VCardText>
        <VIcon icon="ri-information-line" size="48" class="text-disabled mb-2" />
        <p class="text-body-2 text-disabled">No additional configuration for this template type</p>
      </VCardText>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TemplateDetails, TemplateType } from '../types'

interface Props {
  details: TemplateDetails | null
  templateType: TemplateType
}

const props = defineProps<Props>()

const showPlaceholders = computed(() => 
  props.templateType === 'TEXT_WITH_PLACEHOLDERS' || props.templateType === 'IMAGE_WITH_TEXT'
)

const hasDetails = computed(() => {
  if (!props.details) return false
  
  switch (props.templateType) {
    case 'TEXT_ONLY':
      return false
    case 'TEXT_WITH_PLACEHOLDERS':
    case 'IMAGE_WITH_TEXT':
      return !!props.details.placeholders?.length || !!props.details.image_url
    case 'ACTION_BASED':
      return !!(
        props.details.action_identifier ||
        props.details.target_operation?.table ||
        props.details.required_inputs_for_admin?.length ||
        props.details.message_placeholders?.length
      )
    case 'FLOW_TRIGGER':
      return !!(
        props.details.flow_id ||
        props.details.initial_message_placeholders?.length
      )
    default:
      return false
  }
})

const getInputTypeIcon = (type: string): string => {
  const icons = {
    text: 'ri-text',
    date: 'ri-calendar-line',
    time: 'ri-time-line',
    number: 'ri-hashtag',
    textarea: 'ri-file-text-line',
  }
  return icons[type as keyof typeof icons] || 'ri-text'
}

const formatPlaceholder = (name: string): string => {
  return `{{${name}}}`
}
</script>
