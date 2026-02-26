import reflex as rx

from ..core.models import ChatSummary
from ..core.chat_state import ChatState

def chat_item(chat: ChatSummary):
    """Элемент списка чатов"""
    return rx.hstack(
        rx.icon(tag="chat"),
        rx.text(chat.title),
        rx.spacer(),
        rx.icon_button(
            rx.icon(tag="delete"),
            on_click=lambda: ChatState.delete_chat(chat.id),
            size="1",
            variant="ghost",
        ),
        padding="0.5em",
        width="100%",
        border_radius="0.5em",
        _hover={"bg": rx.color("gray", 4)},
        cursor="pointer",
        on_click=lambda: ChatState.load_chat_messages(chat.id),
        bg=rx.cond(
            ChatState.current_chat_id == chat.id,
            rx.color("gray", 5),
            "transparent"
        )
    )
