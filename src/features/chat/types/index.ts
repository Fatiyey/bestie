// Database types based on Supabase schema
export interface DbContact {
  id: string
  wa_id: string | null
  name: string | null
  profile_pic_url: string | null
  last_message_at: string | null
  last_message: string | null
  welcome_sent: boolean | null
  metadata: any | null
  created_at: string | null
  updated_at: string | null
  chatbot_state: string | null
  chatbot_context: any | null
  last_interaction: string | null
  prefer_agent: boolean | null
}

export interface DbMessage {
  id: string
  contact_id: string | null
  user_id: string | null
  message_id: string | null
  content: string | null // For text messages, or caption for images/interactive messages
  type: string | null // 'text', 'image', 'audio', 'video', 'file', 'interactive'
  media_url: string | null
  status: string | null
  status_timestamp: number | null
  reply_to: string | null
  direction: string | null // 'incoming' | 'outgoing'
  timestamp: number | null
  created_at: string | null
  interactive_data?: InteractiveMessageContent | null; // Added for interactive messages
}

// UI/Component types (transformed from DB types)
export interface ChatUserProfile {
  id: string
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

export interface InteractiveMessageAction {
  type: 'button' | 'list_reply';
  id: string;
  title: string;
}

export interface InteractiveMessageContent {
  type: 'list' | 'button' | 'product' | 'product_list';
  header?: { type: 'text' | 'image' | 'video' | 'document'; content: string; media_url?: string };
  body: string;
  footer?: string;
  actions?: InteractiveMessageAction[]; // For button messages
  sections?: Array<{ title?: string; rows: InteractiveMessageAction[] }>; // For list messages
}

export interface ChatContact {
  id: string
  fullName: string
  role: string
  about: string
  avatar?: string
  status: 'online' | 'offline' | 'away' | 'busy'
  wa_id?: string
  lastMessage?: string
  lastMessageAt?: string
  unseenMsgs?: number
  email?: string
  phone?: string
}

export interface ChatMessage {
  id: string
  message: string // Text content or caption
  time: string
  senderId: string
  feedback: {
    isSent: boolean
    isDelivered: boolean
    isSeen: boolean
  }
  type?: 'text' | 'image' | 'audio' | 'video' | 'file' | 'interactive'; // Added 'interactive'
  mediaUrl?: string
  direction: 'incoming' | 'outgoing'
  interactiveData?: InteractiveMessageContent; // Added for interactive messages
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
