import reflex as rx
from typing import List, Optional, Dict, Any

from ..api.client import api_client

class ChatState(rx.State):
        
    # Текущий пользователь (можно брать из auth)
    user_id: str = "default_user"
    
    # Список чатов
    chats: List[Dict[str, Any]] = []
    
    # Текущий выбранный чат
    current_chat_id: Optional[str] = None
    
    # Сообщения текущего чата
    messages: List[Dict[str, Any]] = []
    
    # Текущее вводимое сообщение
    current_message: str = ""
    
    # Флаг генерации ответа
    is_loading: bool = False
    
    async def load_chats(self):
        self.chats = await api_client.get_user_chats(self.user_id)
    
    async def create_new_chat(self):
        chat = await api_client.create_chat(self.user_id)
        self.current_chat_id = chat["id"]
        self.messages = []
        await self.load_chats()
    
    async def load_chat_messages(self, chat_id: str):
        self.current_chat_id = chat_id
        self.messages = await api_client.get_chat_messages(chat_id)
    
    async def send_message(self):
        if not self.current_message.strip() or not self.current_chat_id:
            return
        
        # Добавляем сообщение пользователя
        user_message = {
            "role": "user",
            "content": self.current_message,
            "timestamp": str(rx.utils.format.datetime_now())
        }
        self.messages.append(user_message)
        
        # Очищаем поле ввода
        message_to_send = self.current_message
        self.current_message = ""
        
        # Создаем placeholder для ответа ассистента
        assistant_message = {
            "role": "assistant",
            "content": "",
            "timestamp": str(rx.utils.format.datetime_now()),
            "is_streaming": True
        }
        self.messages.append(assistant_message)
        self.is_loading = True
        
        # Отправляем запрос и получаем поток
        async for chunk in api_client.stream_chat(
            self.current_chat_id, 
            message_to_send
        ):
            # Обновляем последнее сообщение
            self.messages[-1]["content"] += chunk
            yield
        
        self.messages[-1]["is_streaming"] = False
        self.is_loading = False
    
    async def delete_chat(self, chat_id: str):
        success = await api_client.delete_chat(chat_id)
        if success:
            if self.current_chat_id == chat_id:
                self.current_chat_id = None
                self.messages = []
            await self.load_chats()
    
    async def delete_all_chats(self):
        await api_client.delete_all_chats(self.user_id)
        self.current_chat_id = None
        self.messages = []
        self.chats = []
        
    async def send_message_on_key_down(self, event):
        if event.key == "Enter" and event.key != "Shift":
            self.send_message()