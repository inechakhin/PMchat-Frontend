import {
    ChatPreview,
    Chat,
    Message,
    StreamEvent,
} from "@/types/types"
import { apiClient } from "@/utils/axios"

export async function getChats(): Promise<ChatPreview[]> {
  const res = await apiClient.get("/api/chats/all")
  return res.data
}

export async function createChat(): Promise<Chat> {
  const res = await apiClient.post("/api/chats/create")
  return res.data
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const res = await apiClient.get(`/api/chats/${chatId}`)
  return res.data
}

export async function renameChat(chatId: string, title: string): Promise<Chat> {
  const res = await apiClient.patch(`/api/chats/${chatId}`, { title })
  return res.data
}

export async function deleteChat(chatId: string): Promise<void> {
  await apiClient.delete(`/api/chats/${chatId}`)
}

export async function deleteAllChats(): Promise<void> {
  await apiClient.delete("/api/chats/all")
}

const safeJson = (raw: string) => {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const parseSseBlock = (chunk: string) => {
  const lines = chunk.split('\n')
  const eventLine = lines.find(l => l.startsWith('event:'))
  const eventName = eventLine?.replace('event:', '').trim() ?? 'message'

  const dataLines = lines.filter(l => l.startsWith('data:'))
  const rawData = dataLines.map(l => l.replace('data:', '').trim()).join('\n')

  return { eventName, rawData }
}

export async function sendMessage(
  chatId: string,
  text: string,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
  onError?: (error: Error) => void
) {
  try {
    const getFetchConfig = (): RequestInit => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
      body: JSON.stringify({ text }),
      signal,
      credentials: 'include',
    })

    let response = await fetch(`/api/chats/${chatId}/stream`, getFetchConfig())

    if (response.status === 401) {
      try {
        await apiClient.post("/api/auth/refresh") 
        response = await fetch(`/api/chats/${chatId}/stream`, getFetchConfig())
      } catch (refreshError) {
        onError?.(new Error('Сессия истекла. Пожалуйста, авторизуйтесь заново.'))
        return
      }
    }

    if (!response.ok) {
      let errorMessage = 'Stream error'
      try {
        const errorData = await response.json()
        errorMessage = errorData?.detail || errorMessage
      } catch {
        errorMessage = (await response.text()) || errorMessage
      }
      onError?.(new Error(errorMessage))
      return
    }

    if (!response.body) {
      onError?.(new Error('Response body is null'))
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      let boundary: number
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const chunk = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)

        if (!chunk.trim()) continue

        const { eventName, rawData } = parseSseBlock(chunk)
        const payload = safeJson(rawData)
        onEvent({ type: eventName as any, ...payload })
      }
    }
  } catch (e) {
    if (!signal?.aborted) {
      onError?.(e instanceof Error ? e : new Error('Failed to start stream'))
    }
  }
}