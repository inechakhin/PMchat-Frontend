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

export async function sendMessage(
  chatId: string,
  text: string,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
) {
  const response = await fetch(`/api/chats/${chatId}/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ text }),
    signal,
  })

  if (!response.ok || !response.body) {
    onEvent({ type: "error", message: "Stream error" })
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    let boundary
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)

      const eventLine = chunk.split("\n").find(l => l.startsWith("event:"))
      const dataLine = chunk.split("\n").find(l => l.startsWith("data:"))

      const event = eventLine?.replace("event:", "").trim()
      const raw = dataLine?.replace("data:", "").trim()

      if (!event || !raw) continue

      const data = JSON.parse(raw)

      onEvent({ type: event as any, ...data })
    }
  }
}