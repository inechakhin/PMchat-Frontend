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

    # Для диалога переименования
    rename_dialog_open: bool = False
    rename_chat_id: str = ""
    rename_current_title: str = ""
    new_chat_title: str = ""

    def set_current_message(self, value: str):
        """Обновить текущее сообщение при вводе."""
        self.current_message = value
        if self.current_chat_id:
            self.drafts[self.current_chat_id] = value
        else:
            self._draft_new_chat = value
     
    def set_new_chat_title(self, value: str):
        """Обновить текущее название чата при вводе."""
        self.new_chat_title = value
       
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
                    token = data.get("token", "")
                    self.messages[-1].content += token
                elif event == "source":
                    title = data.get("title", "")
                    if not any(att.title == title for att in self.messages[-1].attachments):
                        self.messages[-1].attachments.append(Attachment(title=title))
                elif event == "chat-title":
                    title = data.get("title", "")
                    for chat in self.chats:
                        if chat.id == self.current_chat_id:
                            chat.title = title
                            break
                elif event == "error":
                    error_msg = data.get("message", str(data))
                    self.messages[-1].content += f"\n\n[Ошибка: {error_msg}]"
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

    def open_rename_dialog(self, chat_id: str, current_title: str):
        """Открыть диалог переименования с предзаполненным названием."""
        self.rename_dialog_open = True
        self.rename_chat_id = chat_id
        self.rename_current_title = current_title
        self.new_chat_title = current_title
        return rx.call_script("setTimeout(() => document.getElementById('rename-input')?.focus(), 100)")

    def close_rename_dialog(self):
        """Закрыть диалог и сбросить данные."""
        self.rename_dialog_open = False
        self.rename_chat_id = ""
        self.rename_current_title = ""
        self.new_chat_title = ""

    async def rename_chat(self):
        """Отправить запрос на переименование и обновить список."""
        if not self.new_chat_title.strip():
            # Можно показать ошибку, но пока просто закрываем
            self.close_rename_dialog()
            return
        try:
            # Отправляем запрос на сервер
            updated_chat = await api_client.rename_chat(
                self.rename_chat_id,
                self.new_chat_title.strip()
            )
            # Обновляем название в локальном списке
            for chat in self.chats:
                if chat.id == self.rename_chat_id:
                    chat.title = updated_chat["title"]
                    break
        except Exception as e:
            self.error = f"Ошибка переименования: {e}"
        finally:
            self.close_rename_dialog()
            await self.load_chats()
    
    async def delete_chat(self, chat_id: str):
        """Удалить конкретный чат."""
        try:
            success = await api_client.delete_chat(chat_id)
            if success:
                if self.current_chat_id == chat_id:
                    self.reset_to_new_chat()
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
    
    async def handle_rename_key_down(self, event: str):
        """Enter в поле переименования."""
        if event == "Enter":
            return await self.rename_chat()
        elif event == "Escape":
            return self.close_rename_dialog()