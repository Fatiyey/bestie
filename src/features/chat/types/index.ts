export interface ChatUserProfile {
  id: number
  avatar?: string
  fullName: string
  role: string
  about: string
  status: 'online' | 'offline' | 'away' | 'busy'
  settings?: {
    isTwoStepAuthVerificationEnabled: boolean
    isNotificationEnabled: boolean
  }
}

export interface ChatContact {
  id: number
  fullName: string
  role: string
  about: string
  avatar?: string
  status: 'online' | 'offline' | 'away' | 'busy'
  chat?: {
    id: string // or number
    unseenMsgs: number
    lastMessage?: ChatMessage
  }
  // Adding these from your example for contacts list
  email?: string
  phone?: string
  lastMessage?: ChatMessage // For chat list display
  unseenMsgs?: number // For chat list display
}

export interface ChatMessage {
  id: string | number // Added for unique keying
  message: string
  time: string | number // Could be a timestamp or a formatted string
  senderId: number
  feedback: {
    isSent: boolean
    isDelivered: boolean
    isSeen: boolean
  }
}

export interface ChatLogEntry {
  message: ChatMessage
  isSender: boolean
}

// For UI display, after formatting time, etc.
export interface FormattedChatLogMessage extends ChatMessage {
  isSender: boolean
  // time will be a string here
}
