<template>
  <VNavigationDrawer
    v-model="isDrawerOpen"
    :width="370"
    absolute
    touchless
    border="none"
    :permanent="mdAndUp"
    class="member-list-sidebar"
    :temporary="!mdAndUp"
  >
    <div class="px-6 py-4">
      <VTextField
        v-model="searchQuery"
        density="compact"
        placeholder="Search members..."
        prepend-inner-icon="ri-search-line"
        class="mb-2"
      />
      <div class="d-flex align-center">
        <VCheckbox
          v-model="selectAll"
          label="Select All"
          hide-details
          density="compact"
          @change="toggleSelectAll"
        />
        <VSpacer />
        <span class="text-caption">{{ selectedCount }} selected</span>
      </div>
    </div>
    <VDivider />

    <PerfectScrollbar tag="ul" class="member-list px-3" :options="{ wheelPropagation: false }">
      <li
        v-for="member in filteredMembers"
        :key="member.id"
        class="member-list-item mb-3 pa-3 cursor-pointer"
        :class="{ 'selected-member': isSelected(member.id) }"
        @click="toggleMemberSelection(member.id)"
      >
        <div class="d-flex align-center">
          <VCheckbox
            :model-value="isSelected(member.id)"
            hide-details
            density="compact"
            class="me-2"
            @click.stop="toggleMemberSelection(member.id)"
          />
          <VAvatar 
            size="40"
            :color="getAvatarColor(member.id)"
            :class="['me-4', { 'avatar-selected': isSelected(member.id) }]"
          >
            <span class="text-h6">{{ getInitials(member.name) }}</span>
          </VAvatar>
          <div class="flex-grow-1 overflow-hidden">
            <h6 class="text-h6 font-weight-regular" :class="{ 'text-on-primary': isSelected(member.id) }">
              {{ member.name }}
            </h6>
            <p class="mb-0 text-truncate" :class="isSelected(member.id) ? 'text-on-primary' : 'text-disabled'">
              {{ member.organization || member.occupation || 'No details' }}
            </p>
          </div>
        </div>
      </li>
      <div v-if="!filteredMembers.length" class="text-center py-4">
        <p class="text-disabled">No members found.</p>
      </div>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useDisplay } from 'vuetify'
import type { Member, SelectedMembers } from '../types'

const props = defineProps<{
  modelValue: boolean
  members: Member[]
  selectedMembers: SelectedMembers
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:selectedMembers', value: SelectedMembers): void
}>()

const { mdAndUp } = useDisplay()

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const searchQuery = ref('')
const selectAll = ref(false)

const filteredMembers = computed(() => {
  return props.members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (member.organization && member.organization.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (member.occupation && member.occupation.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const selectedCount = computed(() => {
  return Object.values(props.selectedMembers).filter(Boolean).length
})

const isSelected = (memberId: string) => {
  return props.selectedMembers[memberId] || false
}

const toggleMemberSelection = (memberId: string) => {
  const newSelectedMembers = { ...props.selectedMembers }
  newSelectedMembers[memberId] = !newSelectedMembers[memberId]
  emit('update:selectedMembers', newSelectedMembers)
}

const toggleSelectAll = () => {
  const newSelectedMembers = { ...props.selectedMembers }
  filteredMembers.value.forEach(member => {
    newSelectedMembers[member.id] = selectAll.value
  })
  emit('update:selectedMembers', newSelectedMembers)
}

// Update selectAll when selectedMembers changes
watch(() => props.selectedMembers, () => {
  selectAll.value = filteredMembers.value.length > 0 && 
    filteredMembers.value.every(member => props.selectedMembers[member.id])
}, { deep: true })

const getInitials = (fullName: string): string => {
  if (!fullName) return ''
  const names = fullName.split(' ')
  let initials = names[0].substring(0, 1).toUpperCase()
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase()
  }
  return initials
}

const avatarColors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
const getAvatarColor = (id: string): string => {
  const numId = parseInt(id.replace(/-/g, '').substring(0, 8), 16)
  return avatarColors[numId % avatarColors.length]
}

watch(mdAndUp, val => {
  if(val) isDrawerOpen.value = true
  else isDrawerOpen.value = false
}, { immediate: true })
</script>

<style lang="scss">
.member-list-sidebar {
  .member-list {
    height: calc(100% - 120px);
  }
  .member-list-item {
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
    }

    &.selected-member {
      background-color: rgb(var(--v-theme-primary));
      opacity: 0.9;
    }
  }

  .avatar-selected {
    border: 2px solid rgb(var(--v-theme-on-primary));
    box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
  }
}
</style>
