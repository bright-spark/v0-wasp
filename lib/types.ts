export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export interface Chat {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface ChatWithMessages extends Chat {
  messages: Message[]
}
