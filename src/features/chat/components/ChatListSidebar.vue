<template>
  <VNavigationDrawer
    v-model="isDrawerOpen"
    :width="370"
    absolute
    touchless
    border="none"
    :permanent="mdAndUp"
    class="chat-list-sidebar"
    :temporary="!mdAndUp"
  >
    <div class="px-6 py-4 d-flex align-center">
      <VAvatar
        size="38"
        class="me-4 cursor-pointer"
        :color="userProfile && !userProfile.avatar ? getAvatarColor(userProfile.id) : undefined"
        @click="$emit('openUserProfile')"
      >
        <VImg v-if="userProfile?.avatar" :src="userProfile.avatar" />
        <span v-else-if="userProfile" class="text-h6">{{ getInitials(userProfile.fullName) }}</span>
      </VAvatar>
      <VTextField
        v-model="searchQuery"
        density="compact"
        placeholder="Search..."
        prepend-inner-icon="ri-search-line"
        class="me-2"
      />
      <VBtn icon variant="text" @click="$emit('openUserProfile')" class="d-md-none">
        <VIcon icon="ri-user-line" />
      </VBtn>
    </div>
    <VDivider />

    <PerfectScrollbar tag="ul" class="chat-contacts-list px-3" :options="{ wheelPropagation: false }">
      <div class="my-4">
        <span class="text-primary text-sm font-weight-medium">CHATS</span>
      </div>
      <li
        v-for="contact in filteredChats"
        :key="`chat-${contact.id}`"
        class="chat-contact-item mb-3 pa-3 cursor-pointer"
        :class="{ 'bg-primary': isActiveChat(contact.id) }"
        @click="openChat(contact.id)"
      >
        <div class="d-flex align-center">
          <VBadge
            dot
            :color="resolveAvatarBadgeVariant(contact.status)"
            location="bottom right"
            offset-x="3"
            offset-y="3"
            bordered
            class="me-4"
          >
            <VAvatar 
              size="40"
              :color="!contact.avatar ? getAvatarColor(contact.id) : undefined"
            >
              <VImg v-if="contact.avatar" :src="contact.avatar" />
              <span v-else class="text-h6">{{ getInitials(contact.fullName) }}</span>
            </VAvatar>
          </VBadge>
          <div class="flex-grow-1 overflow-hidden">
            <h6 class="text-h6 font-weight-regular" :class="{ 'text-white': isActiveChat(contact.id) }">{{ contact.fullName }}</h6>
            <p class="mb-0 text-truncate" :class="isActiveChat(contact.id) ? 'text-white' : 'text-disabled'">
              {{ contact.lastMessage?.message || 'No messages yet' }}
            </p>
          </div>
          <div class="d-flex flex-column align-self-start">
            <span class="text-sm mb-2" :class="isActiveChat(contact.id) ? 'text-white' : 'text-disabled'">
              {{ contact.lastMessage?.time }}
            </span>
            <VBadge v-if="contact.unseenMsgs" color="error" :content="contact.unseenMsgs" inline />
          </div>
        </div>
      </li>

      <div class="my-4">
        <span class="text-primary text-sm font-weight-medium">CONTACTS</span>
      </div>
      <li
        v-for="contact in filteredContacts"
        :key="`contact-${contact.id}`"
        class="chat-contact-item mb-3 pa-3 cursor-pointer"
        @click="openChat(contact.id)" 
      >
        <div class="d-flex align-center">
          <VBadge
            dot
            :color="resolveAvatarBadgeVariant(contact.status)"
            location="bottom right"
            offset-x="3"
            offset-y="3"
            bordered
            class="me-4"
          >
            <VAvatar 
              size="40"
              :color="!contact.avatar ? getAvatarColor(contact.id) : undefined"
            >
              <VImg v-if="contact.avatar" :src="contact.avatar" />
              <span v-else class="text-h6">{{ getInitials(contact.fullName) }}</span>
            </VAvatar>
          </VBadge>
          <div class="flex-grow-1 overflow-hidden">
            <h6 class="text-h6 font-weight-regular">{{ contact.fullName }}</h6>
            <p class="mb-0 text-truncate text-disabled">{{ contact.about }}</p>
          </div>
        </div>
      </li>
      <div v-if="!filteredChats.length && !filteredContacts.length" class="text-center py-4">
        <p class="text-disabled">No contacts or chats found.</p>
      </div>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useDisplay } from 'vuetify'
import type { ChatContact, ChatUserProfile } from '@/features/chat/types' // Assuming types are defined here

const props = defineProps<{
  modelValue: boolean
  userProfile?: ChatUserProfile // Logged-in user's profile
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'openUserProfile'): void
  (e: 'openActiveChatUserProfile'): void
  (e: 'selectChat', contactId: number): void // Emits when a chat/contact is selected
}>()

const { mdAndUp } = useDisplay()

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const searchQuery = ref('')
const activeChatId = ref<number | null>(null) // To track the active chat

// Placeholder data - replace with actual data from your service/store
const chats = ref<ChatContact[]>([
  {
    id: 1,
    fullName: 'Felecia Rower',
    role: 'Frontend Developer',
    about: 'Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing',
    // avatar: '/images/avatars/avatar-2.png',
    status: 'online',
    lastMessage: { message: 'Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing', time: '10:00 AM', senderId: 1, feedback: { isSent: true, isDelivered: true, isSeen: true } },
    unseenMsgs: 0,
  },
  {
    id: 2,
    fullName: 'Adalberto Granzin',
    role: 'UI/UX Designer',
    about: 'Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy',
    // avatar: '/images/avatars/avatar-3.png',
    status: 'online',
    lastMessage: { message: 'Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy', time: '10:30 AM', senderId: 2, feedback: { isSent: true, isDelivered: true, isSeen: true } },
    unseenMsgs: 2,
  },
])

const contacts = ref<ChatContact[]>([
  {
    id: 3,
    fullName: 'Gavin Griffith',
    role: 'Backend Developer',
    about: 'Cupcake sugar plum bourbon pita bread faworki jujubes. Candy wafer tiramisu sugar plum sweet.',
    // avatar: '/images/avatars/avatar-4.png',
    status: 'offline',
  },
  {
    id: 4,
    fullName: 'Curtis Fletcher',
    role: 'Full Stack Developer',
    about: 'Macaroon candy canes tootsie roll wafer I love chocolate. Wafer lollipop dessert cookie wafer.',
    // avatar: '/images/avatars/avatar-5.png',
    status: 'busy',
  },
])

const filteredChats = computed(() => {
  return chats.value.filter(chat =>
    chat.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const filteredContacts = computed(() => {
  return contacts.value.filter(contact =>
    contact.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const resolveAvatarBadgeVariant = (status: string) => {
  if (status === 'online') return 'success'
  if (status === 'busy') return 'error'
  if (status === 'away') return 'warning'
  return 'secondary'
}

const isActiveChat = (contactId: number) => {
  return activeChatId.value === contactId
}

const openChat = (contactId: number) => {
  activeChatId.value = contactId
  emit('selectChat', contactId)
  // On small screens, close the sidebar after selecting a chat
  if (!mdAndUp.value) {
    isDrawerOpen.value = false
  }
}

const getInitials = (fullName: string): string => {
  if (!fullName) return '';
  const names = fullName.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

const avatarColors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];
const getAvatarColor = (id: number | string): string => {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return avatarColors[numId % avatarColors.length];
};

watch(mdAndUp, val => {
  if(val) isDrawerOpen.value = true
  else isDrawerOpen.value = false
}, {immediate: true})

</script>

<style lang="scss">
.chat-list-sidebar {
  .chat-contacts-list {
    height: calc(100% - 100px); // Adjust based on header height in sidebar
  }
  .chat-contact-item {
    border-radius: 8px;
    &:hover {
      background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
    }
  }
}
</style>
