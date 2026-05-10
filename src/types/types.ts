export type ErrorDto = {
  detail: string | any
}

export type SignUpRequest = {
  first_name: string
  last_name: string
  email: string
  password: string
}

export type SignInRequest = {
  email: string
  password: string
}

export type AuthStatusResponse = {
  status: string
}

export type User = {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export type UpdateProfileRequest = {
  first_name?: string
  last_name?: string
}

export type Chat = {
  id: string
  user_id: string
  type: string
  title: string
  created_at: string
  updated_at: string
  is_pinned: boolean
}

export type ChatPreview = {
  id: string
  title: string
  type: string
  updated_at: string
}

export type Attachment = {
  id: string
  title: string
  content_type: string
  size: number
}

export type Source = {
  id: string
  title: string
}

export type Message = {
  id: string
  sender_type: "user" | "assistant"
  text: string
  attachments: Attachment[]
  sources: Source[]
  created_at: string
}

export type StreamEvent =
  | { type: "ready" }
  | { type: "ping" }
  | { type: "message"; token: string }
  | { type: "attachment"; id: string; title: string; size: number; content_type: string }
  | { type: "source"; id: string; title: string }
  | { type: "chat-title"; title: string }
  | { type: "error"; message: string }
  | { type: "finish" }