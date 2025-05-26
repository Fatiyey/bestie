<template>
  <VNavigationDrawer
    v-model="isDrawerOpen"
    temporary
    location="end"
    width="370"
    absolute
    class="active-chat-user-profile-sidebar"
  >
    <template v-if="contact">
      <div class="pt-2 me-2 text-end">
        <VBtn icon variant="text" @click="isDrawerOpen = false">
          <VIcon icon="ri-close-line" class="text-medium-emphasis" />
        </VBtn>
      </div>

      <div class="text-center px-6">
        <VBadge bordered :color="resolveAvatarBadgeVariant(contact.status)" location="bottom right" offset-x="10" offset-y="10" class="chat-user-profile-badge mb-4">
          <VAvatar size="84" :variant="contact.avatar ? 'flat' : 'tonal'" :color="contact.avatar ? undefined : 'primary'">
            <VImg v-if="contact.avatar" :src="contact.avatar" />
            <span v-else>{{ contact.fullName.slice(0,2).toUpperCase() }}</span>
          </VAvatar>
        </VBadge>
        <h5 class="text-h5">{{ contact.fullName }}</h5>
        <p class="text-body-1 text-capitalize mb-0">{{ contact.role }}</p>
      </div>

      <VDivider class="my-4" />

      <PerfectScrollbar class="ps-chat-user-profile-sidebar-content pb-5 px-5" :options="{ wheelPropagation: false }">
        <div class="my-6 text-medium-emphasis">
          <p class="text-base text-disabled mb-0 text-uppercase">About</p>
          <p class="text-body-1 mt-1">{{ contact.about }}</p>
        </div>

        <div class="mb-6 text-medium-emphasis">
          <p class="text-base text-disabled mb-1 text-uppercase">Personal Information</p>
          <div class="d-flex align-center my-1">
            <VIcon icon="ri-mail-line" class="me-2" />
            <span class="text-body-1">{{ contact.email || 'Not available' }}</span>
          </div>
          <div class="d-flex align-center my-1">
            <VIcon icon="ri-phone-line" class="me-2" />
            <span class="text-body-1">{{ contact.phone || 'Not available' }}</span>
          </div>
        </div>

        <div class="text-medium-emphasis">
          <p class="text-base text-disabled mb-1 text-uppercase">Settings</p>
          <div class="d-flex align-center my-1">
            <VIcon icon="ri-forbid-2-line" class="me-2" />
            <span class="text-body-1">Block Contact</span>
          </div>
          <div class="d-flex align-center my-1">
            <VIcon icon="ri-delete-bin-7-line" class="me-2" color="error" />
            <span class="text-body-1 text-error">Delete Chat</span>
          </div>
        </div>
      </PerfectScrollbar>
    </template>
    <div v-else class="d-flex justify-center align-center h-100">
        <p>No contact selected.</p>
    </div>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { ChatContact } from '@/features/chat/types'

const props = defineProps<{
  modelValue: boolean
  contact?: ChatContact // The active chat contact
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const resolveAvatarBadgeVariant = (status?: string) => {
  if (status === 'online') return 'success'
  if (status === 'busy') return 'error'
  if (status === 'away') return 'warning'
  return 'secondary'
}
</script>

<style lang="scss">
.active-chat-user-profile-sidebar {
  .ps-chat-user-profile-sidebar-content {
    height: calc(100% - 200px); // Adjust based on header/footer inside sidebar
  }
}
</style>
