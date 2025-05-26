<template>
  <VLayout class="visitors-layout bg-surface">
    <!-- Visitor List Sidebar -->
    <VisitorListSidebar 
      v-model="isVisitorListSidebarOpen"
      :visitors="visitors"
      v-model:selected-visitors="selectedVisitorsMap"
    />

    <!-- Main Content -->
    <VMain class="visitors-content-container">
      <div class="d-flex flex-column h-100">
        <!-- Header -->
        <div class="visitors-header d-flex align-center text-medium-emphasis pa-4">
          <VBtn 
            icon 
            variant="text" 
            class="d-md-none me-4" 
            @click="isVisitorListSidebarOpen = !isVisitorListSidebarOpen"
          >
            <VIcon icon="ri-menu-line" />
          </VBtn>
          <h6 class="text-h6 font-weight-regular mb-0">Visitors</h6>
          <VSpacer />
        </div>
        <VDivider />

        <!-- Content -->
        <div class="flex-grow-1">
          <div v-if="loading" class="d-flex justify-center align-center h-100">
            <VProgressCircular indeterminate />
          </div>
          <div v-else-if="error" class="d-flex justify-center align-center h-100 text-error">
            {{ error }}
          </div>
          <div v-else-if="!selectedVisitor" class="d-flex justify-center align-center h-100">
            <div class="text-center">
              <VIcon icon="ri-user-line" size="48" class="text-disabled mb-2" />
              <p class="text-h6 text-disabled">Select a visitor to view details</p>
            </div>
          </div>
          <div v-else class="pa-4">
            <!-- Visitor Details -->
            <div class="d-flex align-center mb-6">
              <div class="position-relative me-4">
                <VAvatar 
                  size="80"
                  :color="getStatusColor(selectedVisitor.status)"
                >
                  <span class="text-h4">{{ selectedVisitor.queue_number }}</span>
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
                    <div v-if="selectedVisitor?.pst_user.email" class="mb-1">
                      <strong>Email:</strong> {{ selectedVisitor.pst_user.email }}
                    </div>
                    <div v-if="selectedVisitor?.pst_user.phone" class="mb-1">
                      <strong>Phone:</strong> {{ selectedVisitor.pst_user.phone }}
                    </div>
                    <div v-if="selectedVisitor?.pst_user.wa_id">
                      <strong>WhatsApp:</strong> {{ selectedVisitor.pst_user.wa_id }}
                    </div>
                  </div>
                </VTooltip>
              </div>
              <div class="flex-grow-1 d-flex justify-space-between align-start">
                <!-- Left Column -->
                <div>
                  <h4 class="text-h4 mb-1">{{ selectedVisitor.pst_user.name }}</h4>
                  <div class="d-flex align-center mb-2">
                    <VChip
                      :color="getStatusColor(selectedVisitor.status)"
                      size="small"
                      class="me-2"
                    >
                      {{ formatStatus(selectedVisitor.status) }}
                    </VChip>
                    <span class="text-medium-emphasis">{{ formatDate(selectedVisitor.checkin_time) }}</span>
                  </div>
                </div>
                
                <!-- Right Column -->
                <div>
                  <!-- Assigned User Info -->
                  <div v-if="selectedVisitor.assigned_user" class="mb-2">
                    <VChip size="small" color="primary" variant="outlined">
                      <VIcon start icon="ri-user-line" />
                      Assigned to: {{ selectedVisitor.assigned_user.name }}
                    </VChip>
                  </div>
                  
                  <!-- Status Update Buttons -->
                  <div class="d-flex gap-2" v-if="selectedVisitor.status !== 'completed' && selectedVisitor.status !== 'cancelled'">
                    <VBtn
                      v-if="selectedVisitor.status === 'waiting'"
                      color="info"
                      size="small"
                      prepend-icon="ri-play-line"
                      @click="updateVisitorStatus(selectedVisitor.id, 'in_progress')"
                      :loading="statusLoading"
                    >
                      Start Service
                    </VBtn>
                    <VBtn
                      v-if="selectedVisitor.status === 'in_progress'"
                      color="success"
                      size="small"
                      prepend-icon="ri-check-line"
                      @click="updateVisitorStatus(selectedVisitor.id, 'completed')"
                      :loading="statusLoading"
                    >
                      Complete
                    </VBtn>
                    <VBtn
                      color="error"
                      size="small"
                      prepend-icon="ri-close-line"
                      variant="outlined"
                      @click="updateVisitorStatus(selectedVisitor.id, 'cancelled')"
                      :loading="statusLoading"
                    >
                      Cancel
                    </VBtn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Service Requests -->
            <VCard>
              <VCardTitle class="d-flex justify-space-between align-center">
                <span>Service Requests</span>
                <VBtn
                  color="primary"
                  prepend-icon="ri-add-line"
                  @click="showServiceRequestForm = true"
                >
                  New Request
                </VBtn>
              </VCardTitle>
              <VCardText>
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
              </VCardText>
            </VCard>
          </div>
        </div>
      </div>
    </VMain>

    <!-- Service Request Form Dialog -->
    <VDialog
      v-model="showServiceRequestForm"
      persistent
      width="500"
    >
      <ServiceRequestForm
        v-if="showServiceRequestForm && selectedVisitor?.id && selectedVisitor?.pst_user_id"
        v-model="editingRequest"
        :visitor-id="selectedVisitor.id"
        :pst-user-id="selectedVisitor.pst_user_id"
        @save="handleServiceRequestSave"
        @close="closeServiceRequestForm"
      />
    </VDialog>

    <!-- Snackbar for notifications -->
    <VSnackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="1000"
      location="bottom"
    >
      {{ snackbarText }}
    </VSnackbar>
  </VLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { supabase } from '@/plugins/supabase'
import type { Visitor, SelectedVisitors, ServiceRequest, ServiceType } from '../types'
import { useVisitorService } from '../services/visitorService'
import VisitorListSidebar from '../components/VisitorListSidebar.vue'
import ServiceRequestForm from '../components/ServiceRequestForm.vue'

interface ExtendedServiceRequest extends ServiceRequest {
  service_type: ServiceType
  assigned_user: { id: string; name: string } | null
}

const { mdAndUp } = useDisplay()
const { loading, error, getVisitors, getServiceRequests, updateServiceRequest, deleteServiceRequest, updateVisitorStatus: updateVisitorStatusService } = useVisitorService()

const visitors = ref<ExtendedVisitor[]>([])
const selectedVisitorsMap = ref<SelectedVisitors>({})
const isVisitorListSidebarOpen = ref(true)
const showServiceRequestForm = ref(false)
const editingRequest = ref<Partial<ServiceRequest>>()
const serviceRequests = ref<ExtendedServiceRequest[]>([])
const statusLoading = ref(false)

// Snackbar
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const showNotification = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  showSnackbar.value = true
  setTimeout(() => {
    showSnackbar.value = false
  }, 1000)
}

type ExtendedVisitor = Visitor & {
  pst_user: { 
    id: string
    name: string
    email: string | null
    phone: string | null
    wa_id: string | null 
  }
  assigned_user: { 
    id: string
    name: string 
  } | null
  pst_user_id: string
}

const selectedVisitor = computed<ExtendedVisitor | undefined>(() => {
  const selectedId = Object.entries(selectedVisitorsMap.value).find(([_, selected]) => selected)?.[0]
  if (!selectedId) return undefined

  const visitor = visitors.value.find(v => v.id === selectedId)
  if (!visitor) return undefined

  return {
    ...visitor,
    pst_user_id: visitor.pst_user.id
  }
})

const selectedVisitorsArray = computed(() => {
  const selectedIds = Object.entries(selectedVisitorsMap.value)
    .filter(([_, selected]) => selected)
    .map(([id]) => id)
  
  return visitors.value.filter(v => selectedIds.includes(v.id))
})

const getStatusColor = (status: Visitor['status']): string => {
  const colors: Record<Visitor['status'], string> = {
    waiting: 'warning',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'error',
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

const formatDate = (time: string): string => {
  return new Date(time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const loadServiceRequests = async () => {
  if (!selectedVisitor.value) return
  
  const requests = await getServiceRequests(selectedVisitor.value.id)
  serviceRequests.value = requests
}

const updateRequestStatus = async (requestId: string, status: ServiceRequest['status']) => {
  try {
    await updateServiceRequest(requestId, { status })
    await loadServiceRequests()
    showNotification(`Request ${status === 'completed' ? 'completed' : 'started'}`)
  } catch (err) {
    showNotification('Failed to update request status', 'error')
  }
}

const editRequest = (request: ServiceRequest) => {
  editingRequest.value = request
  showServiceRequestForm.value = true
}

const deleteRequest = async (requestId: string) => {
  try {
    await deleteServiceRequest(requestId)
    await loadServiceRequests()
    showNotification('Request deleted')
  } catch (err) {
    showNotification('Failed to delete request', 'error')
  }
}

const handleServiceRequestSave = async (request: any) => {
  try {
    closeServiceRequestForm()
    await loadServiceRequests()
    showNotification(request.id ? 'Request updated' : 'Request created')
  } catch (err: any) {
    console.error('Error saving service request:', err)
    showNotification(err.message, 'error')
  }
}

const closeServiceRequestForm = () => {
  showServiceRequestForm.value = false
  editingRequest.value = undefined
}

const handleVisitorUpdated = async () => {
  // Refresh visitors data when a visitor status is updated
  const data = await getVisitors()
  visitors.value = data
  showNotification('Visitor status updated')
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
    
    // Refresh visitors data 
    await handleVisitorUpdated()
  } catch (err) {
    console.error('Error updating visitor status:', err)
    showNotification('Failed to update visitor status', 'error')
  } finally {
    statusLoading.value = false
  }
}

// Fetch visitors on component mount
onMounted(async () => {
  const data = await getVisitors()
  visitors.value = data
})

// Adjust sidebar visibility based on screen size
watch(mdAndUp, val => {
  isVisitorListSidebarOpen.value = val
}, { immediate: true })

// Load service requests when visitor selection changes
watch(selectedVisitor, async () => {
  if (selectedVisitor.value) {
    await loadServiceRequests()
  } else {
    serviceRequests.value = []
  }
})
</script>

<style lang="scss">
.visitors-layout {
  height: calc(100vh - 64px - 48px - 24px);
}

.visitors-content-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>
