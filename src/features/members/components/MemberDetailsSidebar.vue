<template>
  <VNavigationDrawer
    v-model="isDrawerOpen"
    location="right"
    :width="400"
    absolute
    touchless
    temporary
    class="member-details-sidebar"
  >
    <div class="pa-4">
      <div class="d-flex align-center mb-4">
        <h6 class="text-h6">Member Details</h6>
        <VSpacer />
        <VBtn icon variant="text" @click="isDrawerOpen = false">
          <VIcon icon="ri-close-line" />
        </VBtn>
      </div>

      <template v-if="selectedMembers.length === 1">
        <!-- Single Member Details -->
        <div class="text-center mb-6">
          <VAvatar 
            size="80"
            :color="getAvatarColor(selectedMembers[0].id)"
          >
            <span class="text-h4">{{ getInitials(selectedMembers[0].name) }}</span>
          </VAvatar>
          <h6 class="text-h6 mt-2">{{ selectedMembers[0].name }}</h6>
          <p class="text-body-2 text-medium-emphasis">
            {{ selectedMembers[0].organization || selectedMembers[0].occupation || 'No details' }}
          </p>
        </div>

        <VList>
          <VListItem v-if="selectedMembers[0].email">
            <template #prepend>
              <VIcon icon="ri-mail-line" class="me-2" />
            </template>
            <VListItemTitle>{{ selectedMembers[0].email }}</VListItemTitle>
          </VListItem>

          <VListItem v-if="selectedMembers[0].phone">
            <template #prepend>
              <VIcon icon="ri-phone-line" class="me-2" />
            </template>
            <VListItemTitle>{{ selectedMembers[0].phone }}</VListItemTitle>
          </VListItem>

          <VListItem v-if="selectedMembers[0].wa_id">
            <template #prepend>
              <VIcon icon="ri-whatsapp-line" class="me-2" />
            </template>
            <VListItemTitle>{{ selectedMembers[0].wa_id }}</VListItemTitle>
          </VListItem>

          <VListItem v-if="selectedMembers[0].address">
            <template #prepend>
              <VIcon icon="ri-map-pin-line" class="me-2" />
            </template>
            <VListItemTitle>{{ selectedMembers[0].address }}</VListItemTitle>
          </VListItem>

          <VDivider class="my-4" />

          <VListItem v-if="selectedMembers[0].birth_year">
            <template #prepend>
              <VIcon icon="ri-calendar-line" class="me-2" />
            </template>
            <VListItemTitle>Birth Year: {{ selectedMembers[0].birth_year }}</VListItemTitle>
          </VListItem>

          <VListItem v-if="selectedMembers[0].gender">
            <template #prepend>
              <VIcon icon="ri-user-line" class="me-2" />
            </template>
            <VListItemTitle>Gender: {{ selectedMembers[0].gender }}</VListItemTitle>
          </VListItem>

          <VListItem v-if="selectedMembers[0].education">
            <template #prepend>
              <VIcon icon="ri-book-open-line" class="me-2" />
            </template>
            <VListItemTitle>Education: {{ selectedMembers[0].education }}</VListItemTitle>
          </VListItem>

          <VListItem v-if="selectedMembers[0].service_purpose">
            <template #prepend>
              <VIcon icon="ri-flag-line" class="me-2" />
            </template>
            <VListItemTitle>Purpose: {{ selectedMembers[0].service_purpose }}</VListItemTitle>
          </VListItem>
        </VList>
      </template>

      <template v-else>
        <!-- Multiple Members Summary -->
        <div class="text-center mb-6">
          <VAvatar 
            size="80"
            color="primary"
          >
            <span class="text-h4">{{ selectedMembers.length }}</span>
          </VAvatar>
          <h6 class="text-h6 mt-2">Selected Members</h6>
        </div>

        <VList>
          <VListItem
            v-for="member in selectedMembers"
            :key="member.id"
            :title="member.name"
            :subtitle="member.organization || member.occupation || 'No details'"
          >
            <template #prepend>
              <VAvatar 
                size="40"
                :color="getAvatarColor(member.id)"
              >
                <span class="text-subtitle-2">{{ getInitials(member.name) }}</span>
              </VAvatar>
            </template>
          </VListItem>
        </VList>
      </template>
    </div>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Member } from '../types'

const props = defineProps<{
  modelValue: boolean
  selectedMembers: Member[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

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
</script>

<style lang="scss">
.member-details-sidebar {
  .v-list-item {
    min-height: 44px;
  }
}
</style>
