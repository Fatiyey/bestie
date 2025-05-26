<template>
  <VNavigationDrawer
    v-model="isDrawerOpen"
    :width="370"
    absolute
    touchless
    border="none"
    :permanent="mdAndUp"
    class="visitor-list-sidebar"
    :temporary="!mdAndUp"
  >
    <div class="px-6 py-4">
      <VTextField
        v-model="searchQuery"
        density="compact"
        placeholder="Search visitors..."
        prepend-inner-icon="ri-search-line"
        class="mb-2"
      />
      <div class="d-flex align-center">
        <VSelect
          v-model="statusFilter"
          :items="statusOptions"
          label="Status"
          density="compact"
          hide-details
          class="me-2"
        />
      </div>
    </div>
    <VDivider />

    <PerfectScrollbar tag="ul" class="visitor-list px-3" :options="{ wheelPropagation: false }">
      <li
        v-for="visitor in filteredVisitors"
        :key="visitor.id"
        class="visitor-list-item mb-3 pa-3 cursor-pointer"
        :class="{ 'selected-visitor': isSelected(visitor.id) }"
        @click="toggleVisitorSelection(visitor.id)"
      >
        <div class="d-flex align-center">
          <VAvatar 
            size="40"
            :color="getStatusColor(visitor.status)"
            :class="['me-4', { 'avatar-selected': isSelected(visitor.id) }]"
            rounded
          >
            <span class="text-h6">{{ visitor.queue_number }}</span>
          </VAvatar>
          <div class="flex-grow-1 overflow-hidden">
            <h6 class="text-h6 font-weight-regular" :class="{ 'text-white': isSelected(visitor.id) }">
              {{ visitor.pst_user.name }}
            </h6>
            <div class="d-flex align-center">
              <VChip
                :color="getStatusColor(visitor.status)"
                size="small"
                class="me-2"
                :class="{ 'status-chip-selected': isSelected(visitor.id) }"
              >
                {{ formatStatus(visitor.status) }}
              </VChip>
              <p class="mb-0 text-truncate" :class="isSelected(visitor.id) ? 'text-white' : 'text-disabled'">
                {{ formatDate(visitor.checkin_time) }}
              </p>
            </div>
          </div>
        </div>
      </li>
      <div v-if="!filteredVisitors.length" class="text-center py-4">
        <p class="text-disabled">No visitors found.</p>
      </div>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useDisplay } from 'vuetify'
import type { Visitor, SelectedVisitors } from '../types'

const props = defineProps<{
  modelValue: boolean
  visitors: (Visitor & {
    pst_user: { id: string; name: string; email: string | null; phone: string | null; wa_id: string | null };
    assigned_user: { id: string; name: string } | null;
  })[]
  selectedVisitors: SelectedVisitors
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:selectedVisitors', value: SelectedVisitors): void
}>()

const { mdAndUp } = useDisplay()

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const searchQuery = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { title: 'All', value: 'all' },
  { title: 'Waiting', value: 'waiting' },
  { title: 'In Progress', value: 'in_progress' },
  { title: 'Completed', value: 'completed' },
  { title: 'Cancelled', value: 'cancelled' },
]

const filteredVisitors = computed(() => {
  return props.visitors.filter(visitor => {
    const matchesSearch = visitor.pst_user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      visitor.queue_number.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === 'all' || visitor.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

const isSelected = (visitorId: string) => {
  return props.selectedVisitors[visitorId] || false
}

const toggleVisitorSelection = (visitorId: string) => {
  // Clear previous selection and set new one
  const newSelectedVisitors: SelectedVisitors = {}
  if (!props.selectedVisitors[visitorId]) {
    newSelectedVisitors[visitorId] = true
  }
  emit('update:selectedVisitors', newSelectedVisitors)
}

const formatDate = (time: string): string => {
  return new Date(time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const getStatusColor = (status: Visitor['status']): string => {
  const colors: Record<Visitor['status'], string> = {
    waiting: 'warning',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'error',
  }
  return colors[status]
}

const formatStatus = (status: string): string => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

watch(mdAndUp, val => {
  if(val) isDrawerOpen.value = true
  else isDrawerOpen.value = false
}, { immediate: true })
</script>

<style lang="scss">
.visitor-list-sidebar {
  .visitor-list {
    height: calc(100% - 120px);
  }
  .visitor-list-item {
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
    }

    &.selected-visitor {
      background-color: rgb(var(--v-theme-primary));
      opacity: 0.9;
    }
  }

  .avatar-selected {
    border: 2px solid rgb(var(--v-theme-on-primary));
    box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
  }

  .status-chip-selected {
    border: 1px solid rgb(var(--v-theme-on-primary));
  }
}
</style>
