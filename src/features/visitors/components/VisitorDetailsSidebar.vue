<template>
  <VNavigationDrawer
    v-model="isDrawerOpen"
    location="right"
    :width="400"
    absolute
    touchless
    temporary
    class="visitor-details-sidebar"
  >
    <div class="pa-4">
      <div class="d-flex align-center mb-4">
        <h6 class="text-h6">Visitor Details</h6>
        <VSpacer />
        <VBtn icon variant="text" @click="isDrawerOpen = false">
          <VIcon icon="ri-close-line" />
        </VBtn>
      </div>

      <template v-if="selectedVisitors.length === 1">
        <!-- Single Visitor Details -->
        <div class="text-center mb-6">
          <div class="position-relative d-inline-block">
            <VAvatar 
              size="80"
              :color="getStatusColor(selectedVisitors[0].status)"
            >
              <span class="text-h4">{{ selectedVisitors[0].queue_number }}</span>
            </VAvatar>
            <!-- Info tooltip positioned at avatar -->
            <VTooltip location="bottom">
              <template #activator="{ props }">
                <VBtn
                  v-bind="props"
                  icon
                  variant="text"
                  size="x-small"
                  class="position-absolute"
                  style="top: -4px; right: -4px; z-index: 10;"
                  color="primary"
                >
                  <VIcon icon="ri-information-line" size="14" />
                </VBtn>
              </template>
              <div class="pa-3" style="max-width: 250px;">
                <p class="font-weight-medium mb-2">Contact Information:</p>
                <div v-if="selectedVisitors[0]?.pst_user.email" class="mb-1">
                  <strong>Email:</strong> {{ selectedVisitors[0].pst_user.email }}
                </div>
                <div v-if="selectedVisitors[0]?.pst_user.phone" class="mb-1">
                  <strong>Phone:</strong> {{ selectedVisitors[0].pst_user.phone }}
                </div>
                <div v-if="selectedVisitors[0]?.pst_user.wa_id">
                  <strong>WhatsApp:</strong> {{ selectedVisitors[0].pst_user.wa_id }}
                </div>
              </div>
            </VTooltip>
          </div>
          <h6 class="text-h6 mt-2">{{ selectedVisitors[0].pst_user.name }}</h6>
          <VChip
            :color="getStatusColor(selectedVisitors[0].status)"
            class="mt-2"
          >
            {{ formatStatus(selectedVisitors[0].status) }}
          </VChip>
          
          <!-- Status Update Buttons -->
          <div class="d-flex justify-center gap-2 mt-4" v-if="selectedVisitors[0].status !== 'completed' && selectedVisitors[0].status !== 'cancelled' && selectedVisitors[0].status !== 'survey_sent'">
            <VBtn
              v-if="selectedVisitors[0].status === 'waiting'"
              color="info"
              size="small"
              prepend-icon="ri-play-line"
              @click="updateVisitorStatus(selectedVisitors[0].id, 'in_progress')"
              :loading="statusLoading"
            >
              Start Service
            </VBtn>
            <VBtn
              v-if="selectedVisitors[0].status === 'in_progress'"
              color="success"
              size="small"
              prepend-icon="ri-check-line"
              @click="updateVisitorStatus(selectedVisitors[0].id, 'completed')"
              :loading="statusLoading"
            >
              Complete
            </VBtn>
            <VBtn
              color="error"
              size="small"
              prepend-icon="ri-close-line"
              variant="outlined"
              @click="updateVisitorStatus(selectedVisitors[0].id, 'cancelled')"
              :loading="statusLoading"
            >
              Cancel
            </VBtn>
          </div>

          <!-- Send Survey Button for Completed Status -->
          <div class="d-flex justify-center gap-2 mt-4" v-if="selectedVisitors[0].status === 'completed'">
            <VBtn
              color="primary"
              size="small"
              prepend-icon="ri-survey-line"
              @click="showSurveyDialog = true"
              :loading="statusLoading"
            >
              Send Survey
            </VBtn>
          </div>
          
          <!-- Assigned User Info -->
          <div v-if="selectedVisitors[0].assigned_user" class="mt-3">
            <VChip size="small" color="primary" variant="outlined">
              <VIcon start icon="ri-user-line" />
              Assigned to: {{ selectedVisitors[0].assigned_user.name }}
            </VChip>
          </div>
        </div>

        <!-- Service Requests Section -->
        <VDivider class="my-4" />
        
        <div class="d-flex align-center mb-4">
          <h6 class="text-h6">Service Requests</h6>
          <VSpacer />
          <VBtn
            color="primary"
            prepend-icon="ri-add-line"
            @click="showServiceRequestForm = true"
          >
            New Request
          </VBtn>
        </div>

        <div v-if="loading" class="d-flex justify-center my-4">
          <VProgressCircular indeterminate />
        </div>
        <div v-else>
          <VList v-if="serviceRequests.length > 0">
            <VListItem
              v-for="request in serviceRequests"
              :key="request.id"
              :value="request"
              rounded="lg"
              class="mb-2"
            >
              <template #prepend>
                <VIcon :icon="getPriorityIcon(request.priority)" :color="getPriorityColor(request.priority)" />
              </template>

              <VListItemTitle>{{ request.title }}</VListItemTitle>
              <VListItemSubtitle>
                {{ request.service_type.name }} - {{ formatStatus(request.status) }}
                <div v-if="request.assigned_user" class="text-caption mt-1">Assigned to: {{ request.assigned_user.name }}</div>
              </VListItemSubtitle>

              <template #append>
                <VMenu>
                  <template #activator="{ props }">
                    <VBtn
                      icon
                      variant="text"
                      v-bind="props"
                    >
                      <VIcon icon="ri-more-2-fill" />
                    </VBtn>
                  </template>

                  <VList>
                    <VListItem
                      v-if="request.status === 'pending'"
                      @click="updateRequestStatus(request.id, 'in_progress')"
                    >
                      <template #prepend>
                        <VIcon icon="ri-play-line" class="me-2" />
                      </template>
                      <VListItemTitle>Start</VListItemTitle>
                    </VListItem>

                    <VListItem
                      v-if="request.status === 'in_progress'"
                      @click="updateRequestStatus(request.id, 'completed')"
                    >
                      <template #prepend>
                        <VIcon icon="ri-check-line" class="me-2" />
                      </template>
                      <VListItemTitle>Complete</VListItemTitle>
                    </VListItem>

                    <VListItem @click="editRequest(request)">
                      <template #prepend>
                        <VIcon icon="ri-edit-line" class="me-2" />
                      </template>
                      <VListItemTitle>Edit</VListItemTitle>
                    </VListItem>

                    <VListItem
                      color="error"
                      @click="deleteRequest(request.id)"
                    >
                      <template #prepend>
                        <VIcon icon="ri-delete-bin-line" class="me-2" />
                      </template>
                      <VListItemTitle>Delete</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </template>
            </VListItem>
          </VList>
          <div v-else class="text-center my-4">
            <p class="text-medium-emphasis">No service requests yet</p>
          </div>
        </div>

        <!-- Service Request Form Dialog -->
        <VDialog
          v-model="showServiceRequestForm"
          persistent
          width="500"
        >
          <template v-if="selectedVisitors[0]?.pst_user_id">
            <ServiceRequestForm
              v-if="showServiceRequestForm"
              v-model="editingRequest"
              :visitor-id="selectedVisitors[0].id"
              :pst-user-id="selectedVisitors[0].pst_user_id"
              @save="handleServiceRequestSave"
              @close="closeServiceRequestForm"
            />
          </template>
          <template v-else-if="showServiceRequestForm">
            <VCard>
              <VCardTitle class="d-flex justify-space-between align-center pa-4">
                Error
                <VBtn icon variant="text" @click="closeServiceRequestForm">
                  <VIcon icon="ri-close-line" />
                </VBtn>
              </VCardTitle>
              <VDivider />
              <VCardText class="pa-4">
                Cannot open the service request form: Visitor User ID is missing.
                Please ensure the visitor data is complete.
              </VCardText>
            </VCard>
          </template>
        </VDialog>

        <!-- Survey Dialog -->
        <VDialog
          v-model="showSurveyDialog"
          persistent
          width="500"
        >
          <VCard>
            <VCardTitle class="d-flex justify-space-between align-center pa-4">
              <span>Send Satisfaction Survey</span>
              <VBtn icon variant="text" @click="showSurveyDialog = false">
                <VIcon icon="ri-close-line" />
              </VBtn>
            </VCardTitle>
            <VDivider />
            <VCardText class="pa-4">
              <div class="text-center mb-4">
                <VIcon icon="ri-survey-line" size="48" color="primary" class="mb-2" />
                <h6 class="text-h6 mb-2">Send Survey to {{ selectedVisitors[0].pst_user.name }}</h6>
                <p class="text-body-2 text-medium-emphasis">
                  Are you sure you want to send a satisfaction survey to this visitor?
                </p>
              </div>
              
              <VAlert 
                v-if="selectedVisitors[0]?.pst_user.email || selectedVisitors[0]?.pst_user.phone || selectedVisitors[0]?.pst_user.wa_id"
                type="info" 
                variant="tonal" 
                class="mb-4"
              >
                Survey will be sent via:
                <ul class="mt-2">
                  <li v-if="selectedVisitors[0]?.pst_user.email">Email: {{ selectedVisitors[0].pst_user.email }}</li>
                  <li v-if="selectedVisitors[0]?.pst_user.phone">SMS: {{ selectedVisitors[0].pst_user.phone }}</li>
                  <li v-if="selectedVisitors[0]?.pst_user.wa_id">WhatsApp: {{ selectedVisitors[0].pst_user.wa_id }}</li>
                </ul>
              </VAlert>
              
              <VAlert 
                v-else
                type="warning" 
                variant="tonal" 
                class="mb-4"
              >
                No contact information available for this visitor. Please ensure contact details are updated before sending the survey.
              </VAlert>
            </VCardText>
            
            <VCardActions class="pa-4">
              <VSpacer />
              <VBtn
                variant="outlined"
                color="secondary"
                @click="showSurveyDialog = false"
              >
                Cancel
              </VBtn>
              <VBtn
                color="primary"
                @click="sendSurvey"
                :loading="statusLoading"
                :disabled="!selectedVisitors[0]?.pst_user.email && !selectedVisitors[0]?.pst_user.phone && !selectedVisitors[0]?.pst_user.wa_id"
              >
                Send Survey
              </VBtn>
            </VCardActions>
          </VCard>
        </VDialog>
      </template>

      <template v-else>
        <!-- Multiple Visitors Summary -->
        <div class="text-center mb-6">
          <VAvatar 
            size="80"
            color="primary"
          >
            <span class="text-h4">{{ selectedVisitors.length }}</span>
          </VAvatar>
          <h6 class="text-h6 mt-2">Selected Visitors</h6>
        </div>

        <VList>
          <VListItem
            v-for="visitor in selectedVisitors"
            :key="visitor.id"
            :title="visitor.pst_user.name"
            :subtitle="formatDateTime(visitor.checkin_time)"
          >
            <template #prepend>
              <VAvatar 
                size="40"
                :color="getStatusColor(visitor.status)"
              >
                <span class="text-subtitle-2">{{ visitor.queue_number }}</span>
              </VAvatar>
            </template>
            <template #append>
              <VChip
                :color="getStatusColor(visitor.status)"
                size="small"
              >
                {{ formatStatus(visitor.status) }}
              </VChip>
            </template>
          </VListItem>
        </VList>
      </template>
    </div>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Visitor, ServiceRequest } from '../types'
import { useVisitorService } from '../services/visitorService'
import { useWhatsAppService } from '../services/whatsappService'
import ServiceRequestForm from './ServiceRequestForm.vue'
import { supabase } from '@/plugins/supabase'

const props = defineProps<{
  modelValue: boolean
  selectedVisitors: (Visitor & {
    pst_user: { id: string; name: string; email: string | null; phone: string | null; wa_id: string | null };
    assigned_user: { id: string; name: string } | null;
  })[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'visitorUpdated'): void
}>()

const { loading, error, getServiceRequests, updateServiceRequest, deleteServiceRequest, updateVisitorStatus: updateVisitorStatusService } = useVisitorService()
const { sendSatisfactionSurvey, sendSimpleSurveyMessage, getSurveyUrl, loading: whatsappLoading } = useWhatsAppService()

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const serviceRequests = ref<(ServiceRequest & {
  service_type: { id: string; name: string };
  assigned_user: { id: string; name: string } | null;
})[]>([])

const showServiceRequestForm = ref(false)
const editingRequest = ref<Partial<ServiceRequest> | undefined>(undefined)
const statusLoading = ref(false)
const showSurveyDialog = ref(false)

const getStatusColor = (status: Visitor['status']): string => {
  const colors: Record<Visitor['status'], string> = {
    waiting: 'warning',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'error',
    survey_sent: 'primary',
  }
  return colors[status]
}

const getPriorityColor = (priority: ServiceRequest['priority']): string => {
  const colors: Record<ServiceRequest['priority'], string> = {
    low: 'success',
    normal: 'info',
    high: 'warning',
    urgent: 'error',
  }
  return colors[priority]
}

const getPriorityIcon = (priority: ServiceRequest['priority']): string => {
  const icons: Record<ServiceRequest['priority'], string> = {
    low: 'ri-arrow-down-line',
    normal: 'ri-minus-line',
    high: 'ri-arrow-up-line',
    urgent: 'ri-alert-line',
  }
  return icons[priority]
}

const formatStatus = (status: string): string => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const formatDateTime = (datetime: string): string => {
  return new Date(datetime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const loadServiceRequests = async () => {
  if (props.selectedVisitors.length !== 1) return
  
  const requests = await getServiceRequests(props.selectedVisitors[0].id)
  serviceRequests.value = requests
}

const updateRequestStatus = async (requestId: string, status: ServiceRequest['status']) => {
  await updateServiceRequest(requestId, { status })
  await loadServiceRequests()
}

const editRequest = (request: ServiceRequest) => {
  editingRequest.value = request
  showServiceRequestForm.value = true
}

const deleteRequest = async (requestId: string) => {
  if (!confirm('Are you sure you want to delete this request?')) return
  
  await deleteServiceRequest(requestId)
  await loadServiceRequests()
}

const handleServiceRequestSave = async () => {
  closeServiceRequestForm()
  await loadServiceRequests()
}

const closeServiceRequestForm = () => {
  showServiceRequestForm.value = false
  editingRequest.value = undefined
}

const updateVisitorStatus = async (visitorId: string, newStatus: Visitor['status']) => {
  try {
    statusLoading.value = true
    
    // Get current user ID from auth state and lookup in users table
    let currentUserId = null
    if (newStatus === 'in_progress') {
      // Import the auth service to get current user
      const { useAuthService } = await import('@/features/auth/services/authService')
      const { authState } = useAuthService()
      
      if (authState.value.user?.id) {
        // Get the users table ID based on auth_uid
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_uid', authState.value.user.id)
          .single()
        
        currentUserId = userData?.id || null
      }
    }
    
    await updateVisitorStatusService(visitorId, newStatus, currentUserId)
    
    // Emit event to refresh data in parent component
    emit('visitorUpdated')
  } catch (err) {
    console.error('Error updating visitor status:', err)
  } finally {
    statusLoading.value = false
  }
}

const sendSurvey = async () => {
  try {
    statusLoading.value = true
    
    const visitor = props.selectedVisitors[0]
    
    // Cek apakah visitor memiliki WhatsApp ID
    if (visitor.pst_user.wa_id) {
      try {
        // Format tanggal kunjungan
        const visitDate = new Date(visitor.checkin_time).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long', 
          year: 'numeric'
        })
        
        console.log('Sending WhatsApp survey flow to:', visitor.pst_user.wa_id)
        
        // Kirim WhatsApp Flow untuk survei
        await sendSatisfactionSurvey(
          visitor.pst_user.wa_id,
          visitor.pst_user.name,
          visitDate,
          'Pelayanan Statistik Terpadu'
        )
        
        console.log('WhatsApp survey flow sent successfully')
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp survey, trying fallback:', whatsappError)
        
        // Fallback: kirim pesan teks sederhana dengan link survei
        try {
          const surveyUrl = getSurveyUrl(visitor.id)
          await sendSimpleSurveyMessage(
            visitor.pst_user.wa_id,
            visitor.pst_user.name,
            surveyUrl
          )
          
          console.log('WhatsApp fallback message sent successfully')
        } catch (fallbackError) {
          console.error('Failed to send WhatsApp fallback message:', fallbackError)
          throw new Error('Failed to send WhatsApp survey')
        }
      }
    } else if (visitor.pst_user.email) {
      // TODO: Implementasi kirim email survei
      console.log('Sending email survey to:', visitor.pst_user.email)
      console.log('Email survey feature coming soon')
      // Untuk sekarang hanya log, bisa ditambahkan service email nanti
    } else if (visitor.pst_user.phone) {
      // TODO: Implementasi kirim SMS survei  
      console.log('Sending SMS survey to:', visitor.pst_user.phone)
      console.log('SMS survey feature coming soon')
      // Untuk sekarang hanya log, bisa ditambahkan service SMS nanti
    } else {
      throw new Error('No contact information available for survey')
    }
    
    // Update visitor status to 'survey_sent'
    await updateVisitorStatusService(visitor.id, 'survey_sent', null)
    
    // Close the dialog
    showSurveyDialog.value = false
    
    // Emit event to refresh data in parent component
    emit('visitorUpdated')
    
    console.log('Survey sent and visitor status updated successfully')
  } catch (err) {
    console.error('Error sending survey:', err)
    // Error akan ditangani oleh parent component yang memiliki notification system
    throw err
  } finally {
    statusLoading.value = false
  }
}

// Load service requests when a single visitor is selected
watch(() => props.selectedVisitors, async (newVisitors) => {
  if (newVisitors.length === 1) {
    await loadServiceRequests()
  } else {
    serviceRequests.value = []
  }
}, { immediate: true })
</script>

<style lang="scss">
.visitor-details-sidebar {
  .v-list-item {
    min-height: 44px;
  }
}
</style>
