import { computed } from 'vue'
import { useAuthService } from '@/features/auth/services/authService'
import type { ChatUserProfile } from '@/features/chat/types'

export function useChatAuth() {
  const authService = useAuthService()

  const currentUser = computed<ChatUserProfile>(() => {
    const user = authService.authState.value.user
    if (!user) {
      return {
        id: '',
        fullName: 'Guest User',
        avatar: '/images/avatars/avatar-1.png',
        role: 'Guest',
        about: 'Welcome to chat.',
        status: 'offline',
        settings: { isTwoStepAuthVerificationEnabled: false, isNotificationEnabled: false }
      }
    }
    
    return {
      id: user.id,
      fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      avatar: user.user_metadata?.avatar_url || '/images/avatars/avatar-1.png',
      role: user.user_metadata?.role || 'User',
      about: user.user_metadata?.about || 'Hello there!',
      status: 'online',
      settings: { isTwoStepAuthVerificationEnabled: true, isNotificationEnabled: false }
    }
  })

  const isAuthenticated = computed(() => {
    return !!authService.authState.value.user
  })

  return {
    currentUser,
    isAuthenticated
  }
}
