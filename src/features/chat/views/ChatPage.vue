<template>
  <VLayout class="chat-app-layout bg-surface">
    <!-- User Profile Sidebar -->
    <UserProfileSidebar v-model="isUserProfileSidebarOpen" :user-profile="currentUserProfile" />

    <!-- Chat List Sidebar -->
    <ChatListSidebar 
      v-model="isChatListSidebarOpen" 
      :user-profile="currentUserProfile"
      @open-user-profile="isUserProfileSidebarOpen = true" 
      @open-active-chat-user-profile="isActiveChatUserProfileOpen = true"
      @select-chat="handleSelectChat"
    />

    <!-- Main Chat Content -->
    <VMain class="chat-content-container">
      <div v-if="activeContact" class="d-flex flex-column h-100">
        <!-- Active Chat Header -->
        <div class="active-chat-header d-flex align-center text-medium-emphasis pa-4">
          <VBtn icon variant="text" class="d-md-none me-4" @click="isChatListSidebarOpen = !isChatListSidebarOpen">
            <VIcon icon="ri-menu-line" />
          </VBtn>
          <div class="d-flex align-center cursor-pointer" @click="isActiveChatUserProfileOpen = true">
            <VBadge dot :color="resolveAvatarBadgeVariant(activeContact.status)" location="bottom right" offset-x="3" offset-y="3" bordered class="me-4">
              <VAvatar :image="activeContact.avatar || '/images/avatars/avatar-placeholder.png'" size="40" />
            </VBadge>
            <div class="flex-grow-1 overflow-hidden">
              <h6 class="text-h6 font-weight-regular">{{ activeContact.fullName }}</h6>
              <p class="text-body-2 text-truncate mb-0">{{ activeContact.role }}</p>
            </div>
          </div>
          <VSpacer />
          <div class="d-sm-flex align-center d-none">
            <VBtn icon variant="text">
              <VIcon icon="ri-phone-line" />
            </VBtn>
            <VBtn icon variant="text">
              <VIcon icon="ri-vidicon-line" />
            </VBtn>
            <VBtn icon variant="text">
              <VIcon icon="ri-search-line" />
            </VBtn>
          </div>
          <VBtn icon variant="text">
            <VIcon icon="ri-more-2-line" />
            <!-- <VMenu activator="parent"> ... More options menu ... </VMenu> -->
          </VBtn>
        </div>
        <VDivider />

        <!-- Chat Log -->
        <ChatLog :chat-log="currentChatMessages" :contact="activeContact" class="flex-grow-1" />

        <!-- Message Input -->
        <ChatMessageInput @send-message="sendMessage" />
      </div>
      <div v-else class="d-flex justify-center align-center h-100">
        <p class="text-h6 text-disabled">Select a chat to start messaging</p>
      </div>
    </VMain>

    <!-- Active Chat User Profile Sidebar -->
    <ActiveChatUserProfileSidebar v-model="isActiveChatUserProfileOpen" :user="activeContact" />
  </VLayout>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { ChatLogEntry, ChatContact, ChatUserProfile, ChatMessage } from '@/features/chat/types'

// Components
import UserProfileSidebar from '@/features/chat/components/UserProfileSidebar.vue'
import ChatListSidebar from '@/features/chat/components/ChatListSidebar.vue'
import ChatLog from '@/features/chat/components/ChatLog.vue'
import ChatMessageInput from '@/features/chat/components/ChatMessageInput.vue'
import ActiveChatUserProfileSidebar from '@/features/chat/components/ActiveChatUserProfileSidebar.vue'

const isUserProfileSidebarOpen = ref(false)
const isActiveChatUserProfileOpen = ref(false)
const isChatListSidebarOpen = ref(true) // Default to open on larger screens

const { mdAndUp } = useDisplay()

// Adjust sidebar visibility based on screen size
watch(mdAndUp, val => {
  isChatListSidebarOpen.value = val
}, { immediate: true })

// --- Mock Data --- 
// Current Logged-in User (Placeholder)
const currentUserProfile = ref<ChatUserProfile>({
  id: 0, // Assuming 0 is the current user, or fetch from auth
  fullName: 'Nasrul Islam',
  avatar: '/images/avatars/avatar-1.png',
  role: 'Admin',
  about: 'Focused and dedicated.',
  status: 'online',
  settings: { isTwoStepAuthVerificationEnabled: true, isNotificationEnabled: false }
});

// All contacts (chats and other contacts)
const allContacts = ref<ChatContact[]>([
  {
    id: 1,
    fullName: 'Felecia Rower',
    role: 'Frontend Developer',
    about: 'Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing',
    avatar: '/images/avatars/avatar-2.png',
    status: 'online',
  },
  {
    id: 2,
    fullName: 'Adalberto Granzin',
    role: 'UI/UX Designer',
    about: 'Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy',
    avatar: '/images/avatars/avatar-3.png',
    status: 'online',
  },
  {
    id: 3,
    fullName: 'Gavin Griffith',
    role: 'Backend Developer',
    about: 'Cupcake sugar plum bourbon pita bread faworki jujubes. Candy wafer tiramisu sugar plum sweet.',
    avatar: '/images/avatars/avatar-4.png',
    status: 'offline',
  },
  {
    id: 4,
    fullName: 'Curtis Fletcher',
    role: 'Full Stack Developer',
    about: 'Macaroon candy canes tootsie roll wafer I love chocolate. Wafer lollipop dessert cookie wafer.',
    avatar: '/images/avatars/avatar-5.png',
    status: 'busy',
  },
]);

// Store for all chat logs, keyed by contact ID
const allChatLogs = ref<Record<number, ChatLogEntry[]>>({
  1: [
    {
      isSender: false,
      message: { id: '1-1', message: 'Hi! How are you, Felecia?', time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), senderId: 0, feedback: { isSent: true, isDelivered: true, isSeen: true } },
    },
    {
      isSender: true,
      message: { id: '1-2', message: 'I am good, thanks for asking!', time: new Date(Date.now() - 1000 * 60 * 4).toISOString(), senderId: 1, feedback: { isSent: true, isDelivered: true, isSeen: true } },
    },
  ],
  2: [
    {
      isSender: false,
      message: { id: '2-1', message: 'Hey Adalberto, got a minute for a design review?', time: new Date(Date.now() - 1000 * 60 * 10).toISOString(), senderId: 0, feedback: { isSent: true, isDelivered: true, isSeen: true } },
    },
  ],
  3: [
    {
      isSender: false,
      message: { id: '3-1', message: 'Hello Gavin! How can I help you today?', time: new Date().toISOString(), senderId: 3, feedback: { isSent: true, isDelivered: true, isSeen: false } },
    },
    {
      isSender: true,
      message: { id: '3-2', message: 'I need help with my account.', time: new Date(Date.now() + 1000 * 60).toISOString(), senderId: 0, feedback: { isSent: true, isDelivered: true, isSeen: true } },
    },
    {
      isSender: true,
      message: { id: '3-3', message: 'Thanks, From our official site 😇', time: new Date(Date.now() + 1000 * 120).toISOString(), senderId: 0, feedback: { isSent: true, isDelivered: true, isSeen: true } },
    },
  ],
  // No messages for contact 4 initially
});

const activeContactId = ref<number | null>(null);
const activeContact = computed(() => allContacts.value.find(c => c.id === activeContactId.value) || null);

const currentChatMessages = computed<ChatLogEntry[]>(() => {
  if (activeContactId.value === null) return [];
  return allChatLogs.value[activeContactId.value] || [];
});

const handleSelectChat = (contactId: number) => {
  activeContactId.value = contactId;
  // If no chat log exists for this contact, create an empty one
  if (!allChatLogs.value[contactId]) {
    allChatLogs.value[contactId] = [];
  }
  // Optionally, mark messages as seen or fetch new messages here
};

const sendMessage = (messageContent: string) => {
  if (activeContactId.value === null || currentUserProfile.value === null) return;

  const currentLog = allChatLogs.value[activeContactId.value];
  if (!currentLog) return; // Should not happen if handleSelectChat initializes it

  const newIdSuffix = currentLog.length + 1;
  const newMessage: ChatMessage = {
    id: `${activeContactId.value}-${newIdSuffix}`,
    message: messageContent,
    time: new Date().toISOString(),
    senderId: currentUserProfile.value.id, // Current user is the sender
    feedback: { isSent: true, isDelivered: false, isSeen: false },
  };

  currentLog.push({ isSender: true, message: newMessage });
  // Here you would also send the message to your backend/Supabase
};

const resolveAvatarBadgeVariant = (status?: 'online' | 'offline' | 'away' | 'busy') => {
  if (status === 'online') return 'success'
  if (status === 'busy') return 'error'
  if (status === 'away') return 'warning'
  return 'secondary' // For offline or undefined
}

</script>

<style lang="scss">
.chat-app-layout {
  height: calc(100vh - 64px - 48px - 24px); 
}

.chat-content-container {
  // CSS variables might be needed if VMain doesn't adjust to VNavigationDrawer automatically
}

.v-main.chat-content-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>
