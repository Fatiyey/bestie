<template>
  <VForm @submit.prevent="handleSubmit">
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center pa-4">
        {{ isEditing ? 'Edit Request' : 'New Request' }}
        <VBtn icon variant="text" @click="$emit('close')">
          <VIcon icon="ri-close-line" />
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        <VSelect
          v-model="form.service_type_id"
          :items="serviceTypes"
          item-title="name"
          item-value="id"
          label="Service Type"
          :error-messages="errors.service_type_id"
          required
          class="mb-4"
        />

        <VTextField
          v-model="form.title"
          label="Title"
          :error-messages="errors.title"
          required
          class="mb-4"
        />

        <VTextarea
          v-model="form.description"
          label="Description"
          :error-messages="errors.description"
          rows="3"
          class="mb-4"
        />

        <VSelect
          v-model="form.priority"
          :items="priorityOptions"
          label="Priority"
          :error-messages="errors.priority"
          required
          class="mb-4"
        />

        <VSelect
          v-if="users.length > 0"
          v-model="form.assigned_to"
          :items="users"
          item-title="name"
          item-value="id"
          label="Assign To"
          :error-messages="errors.assigned_to"
          clearable
          class="mb-4"
        />

        <VAlert
          v-if="errors.submit?.length"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ errors.submit[0] }}
        </VAlert>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn
          variant="tonal"
          color="secondary"
          @click="$emit('close')"
        >
          Cancel
        </VBtn>
        <VBtn
          :loading="loading"
          color="primary"
          type="submit"
        >
          {{ isEditing ? 'Update' : 'Create' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VForm>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ServiceRequest, ServiceType } from '../types'
import { useVisitorService } from '../services/visitorService'

const props = defineProps<{
  modelValue?: Partial<ServiceRequest>
  visitorId: string // This is the checkin_id
  pstUserId: string // New prop for the actual user ID
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<ServiceRequest>): void
  (e: 'save', value: ServiceRequest): void
  (e: 'close'): void
}>()

const { loading, error, createServiceRequest, updateServiceRequest, getServiceTypes } = useVisitorService()

const serviceTypes = ref<ServiceType[]>([])
const users = ref<{ id: string; name: string }[]>([])
const errors = ref<Record<string, string[]>>({})

const isEditing = computed(() => !!props.modelValue?.id)

const priorityOptions = [
  { title: 'Low', value: 'low' },
  { title: 'Normal', value: 'normal' },
  { title: 'High', value: 'high' },
  { title: 'Urgent', value: 'urgent' },
]

const form = ref<Partial<ServiceRequest>>({
  service_type_id: '',
  title: '',
  description: '',
  priority: 'normal',
  assigned_to: null,
  ...props.modelValue,
})

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.service_type_id) {
    errors.value.service_type_id = ['Service type is required']
    isValid = false
  }

  if (!form.value.title) {
    errors.value.title = ['Title is required']
    isValid = false
  }

  if (!form.value.priority) {
    errors.value.priority = ['Priority is required']
    isValid = false
  }

  // Validate using the new pstUserId prop
  if (!props.pstUserId) {
    errors.value.submit = ['Cannot create request: Visitor user ID is missing.']
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    // Prepare request data with required fields
    const requestData = {
      title: form.value.title,
      description: form.value.description,
      service_type_id: form.value.service_type_id,
      priority: form.value.priority as ServiceRequest['priority'],
      checkin_id: props.visitorId, // This is the checkin_id from pst_checkins
      pst_user_id: props.pstUserId, // Use the new prop for the actual pst_user_id
      status: isEditing.value ? (form.value.status as ServiceRequest['status']) : 'pending',
    } satisfies Partial<ServiceRequest>

    console.log('Submitting service request:', requestData)

    if (isEditing.value && form.value.id) {
      const result = await updateServiceRequest(form.value.id, requestData)
      console.log('Service request updated:', result)
      emit('save', result)
    } else {
      const result = await createServiceRequest(requestData)
      console.log('Service request created:', result)
      emit('save', result)
    }
  } catch (err: any) {
    console.error('Failed to save service request:', err)
    errors.value = {
      ...errors.value,
      submit: [err.message]
    }
  }
}

// Load service types when component is mounted
onMounted(async () => {
  try {
    const types = await getServiceTypes()
    serviceTypes.value = types
  } catch (err) {
    console.error('Failed to load service types:', err)
    errors.value.service_type_id = ['Failed to load service types']
  }
})
</script>
