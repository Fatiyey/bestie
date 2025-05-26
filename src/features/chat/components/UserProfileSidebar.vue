<template>
  <VNavigationDrawer
    v-model="isDrawerOpen"
    temporary
    location="left"
    width="370"
    absolute
    class="user-profile-sidebar"
  >
    <div class="pt-2 me-2 text-end">
      <VBtn icon variant="text" @click="isDrawerOpen = false">
        <VIcon icon="ri-close-line" class="text-medium-emphasis" />
      </VBtn>
    </div>

    <div class="text-center px-6">
      <VBadge bordered :color="user.status === 'online' ? 'success' : 'secondary'" location="bottom right" offset-x="10" offset-y="10" class="chat-user-profile-badge mb-4">
        <VAvatar size="84" :variant="user.avatar ? 'flat' : 'tonal'" :color="user.avatar ? undefined : 'primary'">
          <VImg v-if="user.avatar" :src="user.avatar" />
          <span v-else>{{ user.name.slice(0,2).toUpperCase() }}</span>
        </VAvatar>
      </VBadge>
      <h5 class="text-h5">{{ user.name }}</h5>
      <p class="text-body-1 text-capitalize mb-0">{{ user.role }}</p>
    </div>

    <VDivider class="my-4" />

    <PerfectScrollbar class="ps-chat-user-profile-sidebar-content pb-5 px-5" :options="{ wheelPropagation: false }">
      <div class="my-6 text-medium-emphasis">
        <p class="text-base text-disabled mb-0 text-uppercase">About</p>
        <VTextarea
          v-model="user.about"
          auto-grow
          readonly
          variant="outlined"
          class="mt-1"
          rows="3"
        />
      </div>

      <div class="mb-6">
        <p class="text-base text-disabled mb-1 text-uppercase">Status</p>
        <VRadioGroup v-model="user.status" readonly>
          <VRadio label="Online" value="online" color="success" />
          <VRadio label="Away" value="away" color="warning" />
          <VRadio label="Do not disturb" value="busy" color="error" />
          <VRadio label="Offline" value="offline" color="secondary" />
        </VRadioGroup>
      </div>

      <div class="text-medium-emphasis chat-settings-section">
        <p class="text-base text-disabled mb-0 text-uppercase">Settings</p>
        <div class="d-flex align-center pa-2">
          <VIcon icon="ri-lock-password-line" class="me-2" size="22" />
          <h6 class="text-h6 font-weight-regular">Two-step Verification</h6>
          <VSpacer />
          <VSwitch :model-value="true" density="compact" inset readonly />
        </div>
        <div class="d-flex align-center pa-2">
          <VIcon icon="ri-notification-line" class="me-2" size="22" />
          <h6 class="text-h6 font-weight-regular">Notification</h6>
          <VSpacer />
          <VSwitch density="compact" inset readonly />
        </div>
        <div class="d-flex align-center pa-2 cursor-pointer">
          <VIcon icon="ri-user-add-line" class="me-2" size="22" />
          <h6 class="text-h6 font-weight-regular">Invite Friends</h6>
        </div>
        <div class="d-flex align-center pa-2 cursor-pointer">
          <VIcon icon="ri-delete-bin-7-line" class="me-2" size="22" />
          <h6 class="text-h6 font-weight-regular">Delete Account</h6>
        </div>
      </div>

      <VBtn block color="primary" class="mt-11" @click="handleLogout">
        Logout
        <template #append>
          <VIcon icon="ri-logout-box-r-line" />
        </template>
      </VBtn>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useAuthService } from '@/features/auth/services/authService'
import { useRouter } from 'vue-router'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const authService = useAuthService()
const router = useRouter()

// Placeholder user data - replace with actual logged-in user data from your auth service
const user = ref({
  name: authService.authState.value.user?.email?.split('@')[0] || 'John Doe',
  role: 'Admin', // This should come from user data
  avatar: '/images/avatars/avatar-1.png', // This should come from user data or be a placeholder
  about: 'Dessert chocolate cake lemon drops jujubes. Biscuit cupcake ice cream bear claw brownie marshmallow.',
  status: 'online', // This should come from user data
})

const handleLogout = async () => {
  await authService.signOut()
  if (!authService.authState.value.error) {
    router.push('/login')
  }
}

</script>

<style lang="scss">
.user-profile-sidebar {
  .ps-chat-user-profile-sidebar-content {
    height: calc(100% - 200px); // Adjust based on header/footer inside sidebar
  }
  // Add other specific styles from your HTML if needed
}
</style>
