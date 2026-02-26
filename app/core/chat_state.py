import reflex as rx
from typing import List, Optional, Dict
from datetime import datetime

from ..api.client import api_client
from .models import ChatSummary, Message, Attachment

class ChatState(rx.State):
    # Текущий пользователь (заменить на данные из auth)
    user_id: str = "123"

    # Список чатов (объекты ChatSummary)
    chats: List[ChatSummary] = []

    # ID текущего открытого чата
    current_chat_id: Optional[str] = None

    # Сообщения текущего чата (объекты Message)
    messages: List[Message] = []

    # Текст в поле ввода
    current_message: str = ""
    
    # Черновики для каждого чата
    drafts: Dict[str, str] = {}
    # Черновик для нового (ещё не созданного) чата
    _draft_new_chat: str = ""            

    # Флаг, показывающий, идёт ли генерация ответа
    is_loading: bool = False

    # Опционально: поле для ошибок
    error: Optional[str] = None

    def set_current_message(self, value: str):
        """Обновить текущее сообщение при вводе."""
        self.current_message = value
        if self.current_chat_id:
            self.drafts[self.current_chat_id] = value
        else:
            self._draft_new_chat = value
        
    def reset_to_new_chat(self):
        """Сбросить текущий чат, не создавая нового на сервере."""
        self.current_chat_id = None
        self.messages = []
        self.current_message = self._draft_new_chat
    
    async def on_mount(self):
        """Загрузить список чатов при старте."""
        await self.load_chats()

    async def load_chats(self):
        """Получить все чаты пользователя и преобразовать в ChatSummary."""
        try:
            data = await api_client.get_user_chats(self.user_id)
            self.chats = [ChatSummary(**item) for item in data]
        except Exception as e:
            self.error = f"Ошибка загрузки чатов: {e}"
            print(self.error)

    async def create_new_chat(self):
        """Создать новый чат и переключиться на него."""
        try:
            data = await api_client.create_chat(self.user_id)
            new_chat = ChatSummary(
                id=data["id"],
                title=data["title"],
                updated_at=datetime.fromisoformat(data["updated_at"])
            )
            self.chats.insert(0, new_chat)
            self.current_chat_id = new_chat.id
            self.messages = []
            return new_chat.id
        except Exception as e:
            self.error = f"Ошибка создания чата: {e}"
            return None

    async def load_chat_messages(self, chat_id: str):
        """Загрузить сообщения выбранного чата."""
        self.current_chat_id = chat_id
        try:
            data = await api_client.get_chat_messages(chat_id)
            messages = []
            for msg in data:
                attachments = [Attachment(title=att["title"]) for att in msg.get("attachments", [])]
                message = Message(
                    id=msg["id"],
                    role=msg["sender_type"],
                    content=msg["text"],
                    created_at=datetime.fromisoformat(msg["created_at"]),
                    attachments=attachments,
                    is_streaming=False
                )
                messages.append(message)
            self.messages = messages
            self.current_message = self.drafts.get(chat_id, "")
            yield
        except Exception as e:
            self.error = f"Ошибка загрузки сообщений: {e}"
            self.messages = []

    async def send_message(self):
        """Отправить сообщение и обработать стриминг ответа."""
        if not self.current_message.strip():
            return

        if not self.current_chat_id:
            chat_id = await self.create_new_chat()
            if not chat_id:
                return
            self.drafts[chat_id] = self._draft_new_chat
            self._draft_new_chat = ""
            yield

        user_msg = Message(
            id="temp_" + str(datetime.now().timestamp()), # временный ID
            role="user",
            content=self.current_message,
            created_at=datetime.now(),
            attachments=[],
            is_streaming=False
        )
        self.messages.append(user_msg)

        text_to_send = self.current_message
        self.current_message = ""
        if self.current_chat_id:
            self.drafts[self.current_chat_id] = ""

        # Заготовка для ответа ассистента
        assistant_msg = Message(
            id="temp_assistant",
            role="assistant",
            content="",
            created_at=datetime.now(),
            attachments=[],
            is_streaming=True
        )
        self.messages.append(assistant_msg)
        self.is_loading = True
        yield

        try:
            async for event, data in api_client.stream_chat(self.current_chat_id, text_to_send):
                if event == "message":
                    self.messages[-1].content += data
                elif event == "source":
                    title = data
                    if not any(att.title == title for att in self.messages[-1].attachments):
                        self.messages[-1].attachments.append(Attachment(title=title))
                elif event == "chat-title":
                    for chat in self.chats:
                        if chat.id == self.current_chat_id:
                            chat.title = data
                            break
                elif event == "error":
                    self.messages[-1].content += f"\n\n[Ошибка: {data}]"
                elif event == "finish":
                    break
                yield
        except Exception as e:
            self.messages[-1].content += f"\n\n[Ошибка: {str(e)}]"
            yield
        finally:
            self.messages[-1].is_streaming = False
            self.is_loading = False
            await self.load_chats()
            yield

    async def delete_chat(self, chat_id: str):
        """Удалить конкретный чат."""
        try:
            success = await api_client.delete_chat(chat_id)
            if success:
                if self.current_chat_id == chat_id:
                    self.current_chat_id = None
                    self.messages = []
                self.chats = [chat for chat in self.chats if chat.id != chat_id]
        except Exception as e:
            self.error = f"Ошибка удаления чата: {e}"

    async def delete_all_chats(self):
        """Удалить все чаты пользователя."""
        try:
            await api_client.delete_all_chats(self.user_id)
            self.chats = []
            self.current_chat_id = None
            self.messages = []
        except Exception as e:
            self.error = f"Ошибка удаления всех чатов: {e}"

    async def handle_key_down(self, event):
        """Обработчик нажатия Enter в поле ввода."""
        if event == "Enter":
            async for _ in self.send_message():
                yield
        else:
            yield