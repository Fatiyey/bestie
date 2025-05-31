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
      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center py-4">
        <VProgressCircular indeterminate size="24" />
      </div>
      
      <!-- Chats List -->
      <div v-else>
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
                {{ contact.lastMessage || 'No messages yet' }}
              </p>
            </div>
            <div class="d-flex flex-column align-self-start">
              <span class="text-sm mb-2" :class="isActiveChat(contact.id) ? 'text-white' : 'text-disabled'">
                {{ formatLastMessageTime(contact.lastMessageAt) }}
              </span>
              <VBadge v-if="contact.unseenMsgs" color="error" :content="contact.unseenMsgs" inline />
            </div>
          </div>
        </li>
        
        <!-- Empty State -->
        <div v-if="!filteredChats.length" class="text-center py-4">
          <p class="text-disabled">No chats found.</p>
        </div>
      </div>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useDisplay } from 'vuetify'
import type { ChatContact, ChatUserProfile } from '@/features/chat/types'
import { ChatService } from '@/features/chat/services/chatService'

const props = defineProps<{
  modelValue: boolean
  userProfile?: ChatUserProfile // Logged-in user's profile
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'openUserProfile'): void
  (e: 'openActiveChatUserProfile'): void
  (e: 'selectChat', contactId: string): void // Changed to string for UUID
}>()

const { mdAndUp } = useDisplay()

const isDrawerOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const searchQuery = ref('')
const activeChatId = ref<string | null>(null) // Changed to string for UUID
const chats = ref<ChatContact[]>([])
const loading = ref(false)

// Load contacts from Supabase
const loadContacts = async () => {
  // console.log('🔍 ChatListSidebar: Starting to load contacts...')
  loading.value = true
  
  try {
    // console.log('📞 ChatListSidebar: Calling ChatService.getContacts()...')
    const contacts = await ChatService.getContacts()
    
    // console.log('📊 ChatListSidebar: Contacts received from service:', contacts)
    // console.log(`📈 ChatListSidebar: Total contacts loaded: ${contacts.length}`)
    
    chats.value = contacts
    
    if (contacts.length === 0) {
      // console.log('⚠️ ChatListSidebar: No contacts found in database')
    } else {
      // console.log('✅ ChatListSidebar: Contacts successfully loaded:', chats.value)
    }
    
  } catch (error) {
    // console.error('❌ ChatListSidebar: Error loading contacts:', error)
  } finally {
    loading.value = false
    // console.log('🏁 ChatListSidebar: Loading contacts completed')
  }
}

const filteredChats = computed(() => {
  const filtered = chats.value.filter(chat =>
    chat.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
  
  // console.log(`🔍 ChatListSidebar: Filtering chats with search query: "${searchQuery.value}""`)
  // console.log(`📊 ChatListSidebar: Filtered chats result:`, filtered)
  // console.log(`📈 ChatListSidebar: ${filtered.length} out of ${chats.value.length} chats match filter`)
  
  return filtered
})

const resolveAvatarBadgeVariant = (status: string) => {
  if (status === 'online') return 'success'
  if (status === 'busy') return 'error'
  if (status === 'away') return 'warning'
  return 'secondary'
}

const isActiveChat = (contactId: string) => {
  return activeChatId.value === contactId
}

const openChat = (contactId: string) => {
  // console.log(`🎯 ChatListSidebar: Opening chat for contact ID: ${contactId}`)
  
  activeChatId.value = contactId
  // console.log(`✅ ChatListSidebar: Active chat ID set to: ${activeChatId.value}`)
  
  emit('selectChat', contactId)
  // console.log(`📡 ChatListSidebar: Emitted selectChat event with contact ID: ${contactId}`)
  
  // On small screens, close the sidebar after selecting a chat
  if (!mdAndUp.value) {
    isDrawerOpen.value = false
    // console.log('📱 ChatListSidebar: Closed sidebar on small screen')
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
const getAvatarColor = (id: string): string => {
  const hash = id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const formatLastMessageTime = (timestamp?: string) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

// Real-time subscription
let contactsSubscription: any = null

onMounted(async () => {
  // console.log('🚀 ChatListSidebar: Component mounted, starting initialization...')
  
  await loadContacts()
  
  console.log('📡 ChatListSidebar: Setting up real-time subscription for contacts...')
  
  // Subscribe to contact updates
  contactsSubscription = ChatService.subscribeToContacts((updatedContact) => {
    console.log('🔄 ChatListSidebar: Received real-time contact update:', updatedContact)
    
    const index = chats.value.findIndex(c => c.id === updatedContact.id)
    if (index !== -1) {
      // console.log(`✏️ ChatListSidebar: Updating existing contact at index ${index}`)
      chats.value[index] = updatedContact
    } else {
      // console.log('➕ ChatListSidebar: Adding new contact to list')
      chats.value.unshift(updatedContact) // Add to the beginning for visibility
    }
    
    // Sort by last message time to ensure the most recent chat is on top
    chats.value.sort((a, b) => {
      if (!a.lastMessageAt) return 1 // Contacts without lastMessageAt go to bottom
      if (!b.lastMessageAt) return -1 // Contacts without lastMessageAt go to bottom
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })
    
    // console.log('📊 ChatListSidebar: Updated chats list after real-time update:', chats.value)
  })
  
  // console.log('✅ ChatListSidebar: Initialization completed')
})

onUnmounted(() => {
  if (contactsSubscription) {
    contactsSubscription.unsubscribe()
  }
})

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
