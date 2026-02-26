import reflex as rx

from ..components.sidebar import sidebar
from ..components.chat_area import chat_area
from ..core.chat_state import ChatState

def chat_page():
    """Основная страница чата"""
    return rx.hstack(
        sidebar(),
        chat_area(),
        width="100%",
        height="100vh",
        spacing="0",
        on_mount=ChatState.load_chats,
    )