<template>
  <div class="template-details-editor">
    <!-- Placeholders for TEXT_WITH_PLACEHOLDERS and IMAGE_WITH_TEXT -->
    <VRow v-if="showPlaceholders">
      <VCol cols="12">
        <VCard variant="outlined">
          <VCardSubtitle class="pb-0">Variables/Placeholders</VCardSubtitle>
          <VCardText>
            <div v-for="(placeholder, index) in editableDetails.placeholders" :key="index" class="mb-3">
              <VRow>
                <VCol cols="4">
                  <VTextField
                    v-model="placeholder.name"
                    label="Variable Name"
                    variant="outlined"
                    density="compact"
                    prefix="{{"
                    suffix="}}"
                  />
                </VCol>
                <VCol cols="4">
                  <VTextField
                    v-model="placeholder.description"
                    label="Description"
                    variant="outlined"
                    density="compact"
                  />
                </VCol>
                <VCol cols="3">
                  <VTextField
                    v-model="placeholder.example"
                    label="Example"
                    variant="outlined"
                    density="compact"
                  />
                </VCol>
                <VCol cols="1" class="d-flex align-center">
                  <VBtn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="removePlaceholder(index)"
                  >
                    <VIcon icon="ri-delete-bin-7-line" />
                  </VBtn>
                </VCol>
              </VRow>
            </div>
            <VBtn
              variant="outlined"
              size="small"
              @click="addPlaceholder"
            >
              <VIcon icon="ri-add-line" class="me-1" />
              Add Variable
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Image URL for IMAGE_WITH_TEXT -->
    <VRow v-if="templateType === 'IMAGE_WITH_TEXT'">
      <VCol cols="12">
        <VTextField
          v-model="editableDetails.image_url"
          label="Image URL"
          variant="outlined"
          hint="URL to the image that will be sent with the message"
          persistent-hint
        />
      </VCol>
    </VRow>

    <!-- Action Configuration for ACTION_BASED -->
    <template v-if="templateType === 'ACTION_BASED'">
      <VRow>
        <VCol cols="12">
          <VCard variant="outlined">
            <VCardSubtitle class="pb-0">Action Configuration</VCardSubtitle>
            <VCardText>
              <VTextField
                v-model="editableDetails.action_identifier"
                label="Action Identifier"
                variant="outlined"
                hint="Unique identifier for the backend action (e.g., CREATE_PST_BOOKING)"
                persistent-hint
                class="mb-4"
              />

              <!-- Target Operation -->
              <div class="mb-4">
                <div class="text-subtitle-2 mb-2">Target Database Operation</div>
                <VTextField
                  v-model="targetTable"
                  label="Target Table"
                  variant="outlined"
                  density="compact"
                  class="mb-2"
                />
              </div>

              <!-- Admin Inputs -->
              <div class="mb-4">
                <div class="text-subtitle-2 mb-2">Admin Input Fields</div>
                <div v-for="(input, index) in editableDetails.required_inputs_for_admin" :key="index" class="mb-3">
                  <VRow>
                    <VCol cols="3">
                      <VTextField
                        v-model="input.name"
                        label="Field Name"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="3">
                      <VTextField
                        v-model="input.label"
                        label="Field Label"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="2">
                      <VSelect
                        v-model="input.type"
                        :items="inputTypeOptions"
                        label="Type"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="2">
                      <VCheckbox
                        v-model="input.required"
                        label="Required"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="2" class="d-flex align-center">
                      <VBtn
                        icon
                        size="small"
                        variant="text"
                        color="error"
                        @click="removeAdminInput(index)"
                      >
                        <VIcon icon="ri-delete-bin-7-line" />
                      </VBtn>
                    </VCol>
                  </VRow>
                </div>
                <VBtn
                  variant="outlined"
                  size="small"
                  @click="addAdminInput"
                >
                  <VIcon icon="ri-add-line" class="me-1" />
                  Add Input Field
                </VBtn>
              </div>

              <!-- Message Placeholders -->
              <div>
                <div class="text-subtitle-2 mb-2">Message Variables</div>
                <div v-for="(placeholder, index) in editableDetails.message_placeholders" :key="index" class="mb-3">
                  <VRow>
                    <VCol cols="3">
                      <VTextField
                        v-model="placeholder.name"
                        label="Variable Name"
                        variant="outlined"
                        density="compact"
                        prefix="{{"
                        suffix="}}"
                      />
                    </VCol>
                    <VCol cols="3">
                      <VTextField
                        v-model="placeholder.source_from_input"
                        label="Source Input Field"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="3">
                      <VTextField
                        v-model="placeholder.format"
                        label="Format (optional)"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="3" class="d-flex align-center">
                      <VBtn
                        icon
                        size="small"
                        variant="text"
                        color="error"
                        @click="removeMessagePlaceholder(index)"
                      >
                        <VIcon icon="ri-delete-bin-7-line" />
                      </VBtn>
                    </VCol>
                  </VRow>
                </div>
                <VBtn
                  variant="outlined"
                  size="small"
                  @click="addMessagePlaceholder"
                >
                  <VIcon icon="ri-add-line" class="me-1" />
                  Add Message Variable
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>

    <!-- Flow Configuration for FLOW_TRIGGER -->
    <template v-if="templateType === 'FLOW_TRIGGER'">
      <VRow>
        <VCol cols="12">
          <VCard variant="outlined">
            <VCardSubtitle class="pb-0">Flow Configuration</VCardSubtitle>
            <VCardText>
              <VTextField
                v-model="editableDetails.flow_id"
                label="Flow ID"
                variant="outlined"
                hint="Unique identifier for the flow to trigger"
                persistent-hint
                class="mb-4"
              />

              <!-- Initial Message Placeholders -->
              <div class="mb-4">
                <div class="text-subtitle-2 mb-2">Initial Message Variables</div>
                <div v-for="(placeholder, index) in editableDetails.initial_message_placeholders" :key="index" class="mb-3">
                  <VRow>
                    <VCol cols="4">
                      <VTextField
                        v-model="placeholder.name"
                        label="Variable Name"
                        variant="outlined"
                        density="compact"
                        prefix="{{"
                        suffix="}}"
                      />
                    </VCol>
                    <VCol cols="4">
                      <VTextField
                        v-model="placeholder.description"
                        label="Description"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="3">
                      <VTextField
                        v-model="placeholder.example"
                        label="Example"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol cols="1" class="d-flex align-center">
                      <VBtn
                        icon
                        size="small"
                        variant="text"
                        color="error"
                        @click="removeInitialPlaceholder(index)"
                      >
                        <VIcon icon="ri-delete-bin-7-line" />
                      </VBtn>
                    </VCol>
                  </VRow>
                </div>
                <VBtn
                  variant="outlined"
                  size="small"
                  @click="addInitialPlaceholder"
                >
                  <VIcon icon="ri-add-line" class="me-1" />
                  Add Variable
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TemplateDetails, TemplateType } from '../types'

interface Props {
  modelValue: TemplateDetails | null
  templateType: TemplateType
}

interface Emits {
  (e: 'update:modelValue', value: TemplateDetails | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editableDetails = ref<TemplateDetails>(getDefaultDetails())
const inputTypeOptions = [
  { title: 'Text', value: 'text' },
  { title: 'Date', value: 'date' },
  { title: 'Time', value: 'time' },
  { title: 'Number', value: 'number' },
  { title: 'Textarea', value: 'textarea' },
]

const showPlaceholders = computed(() => 
  props.templateType === 'TEXT_WITH_PLACEHOLDERS' || props.templateType === 'IMAGE_WITH_TEXT'
)

// Computed properties for nested optional properties
const targetTable = computed({
  get: () => editableDetails.value.target_operation?.table || '',
  set: (value: string) => {
    if (!editableDetails.value.target_operation) {
      editableDetails.value.target_operation = { table: '', map_to_columns: {} }
    }
    editableDetails.value.target_operation.table = value
  }
})

function getDefaultDetails(): TemplateDetails {
  const base: TemplateDetails = {}
  
  switch (props.templateType) {
    case 'TEXT_WITH_PLACEHOLDERS':
    case 'IMAGE_WITH_TEXT':
      base.placeholders = []
      if (props.templateType === 'IMAGE_WITH_TEXT') {
        base.image_url = ''
      }
      break
    case 'ACTION_BASED':
      base.action_identifier = ''
      base.required_inputs_for_admin = []
      base.target_operation = { table: '', map_to_columns: {} }
      base.message_placeholders = []
      break
    case 'FLOW_TRIGGER':
      base.flow_id = ''
      base.initial_message_placeholders = []
      base.map_admin_inputs_to_flow_params = {}
      break
  }
  
  return base
}

// Watch for changes and emit updates
watch(editableDetails, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    editableDetails.value = { ...newValue }
  } else {
    editableDetails.value = getDefaultDetails()
  }
  
  // Ensure required properties exist for ACTION_BASED type
  if (props.templateType === 'ACTION_BASED') {
    if (!editableDetails.value.target_operation) {
      editableDetails.value.target_operation = { table: '', map_to_columns: {} }
    }
    if (!editableDetails.value.required_inputs_for_admin) {
      editableDetails.value.required_inputs_for_admin = []
    }
    if (!editableDetails.value.message_placeholders) {
      editableDetails.value.message_placeholders = []
    }
  }
}, { immediate: true })

watch(() => props.templateType, () => {
  editableDetails.value = getDefaultDetails()
  
  // Ensure required properties exist for ACTION_BASED type
  if (props.templateType === 'ACTION_BASED') {
    if (!editableDetails.value.target_operation) {
      editableDetails.value.target_operation = { table: '', map_to_columns: {} }
    }
    if (!editableDetails.value.required_inputs_for_admin) {
      editableDetails.value.required_inputs_for_admin = []
    }
    if (!editableDetails.value.message_placeholders) {
      editableDetails.value.message_placeholders = []
    }
  }
})

// Placeholder management
const addPlaceholder = () => {
  if (!editableDetails.value.placeholders) {
    editableDetails.value.placeholders = []
  }
  editableDetails.value.placeholders.push({
    name: '',
    description: '',
    example: '',
  })
}

const removePlaceholder = (index: number) => {
  editableDetails.value.placeholders?.splice(index, 1)
}

// Admin input management
const addAdminInput = () => {
  if (!editableDetails.value.required_inputs_for_admin) {
    editableDetails.value.required_inputs_for_admin = []
  }
  if (!editableDetails.value.target_operation) {
    editableDetails.value.target_operation = { table: '', map_to_columns: {} }
  }
  editableDetails.value.required_inputs_for_admin.push({
    name: '',
    label: '',
    type: 'text',
    required: false,
  })
}

const removeAdminInput = (index: number) => {
  editableDetails.value.required_inputs_for_admin?.splice(index, 1)
}

// Message placeholder management
const addMessagePlaceholder = () => {
  if (!editableDetails.value.message_placeholders) {
    editableDetails.value.message_placeholders = []
  }
  editableDetails.value.message_placeholders.push({
    name: '',
    source_from_input: '',
    format: '',
  })
}

const removeMessagePlaceholder = (index: number) => {
  editableDetails.value.message_placeholders?.splice(index, 1)
}

// Initial placeholder management for flow trigger
const addInitialPlaceholder = () => {
  if (!editableDetails.value.initial_message_placeholders) {
    editableDetails.value.initial_message_placeholders = []
  }
  editableDetails.value.initial_message_placeholders.push({
    name: '',
    description: '',
    example: '',
  })
}

const removeInitialPlaceholder = (index: number) => {
  editableDetails.value.initial_message_placeholders?.splice(index, 1)
}
</script>
