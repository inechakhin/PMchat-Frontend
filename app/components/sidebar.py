import reflex as rx

from ..core.chat_state import ChatState
from .chat_item import chat_item

def sidebar():
    """Боковая панель с историей чатов"""
    return rx.vstack(
        rx.hstack(
            rx.heading("Чаты", size="3"),
            rx.spacer(),
            rx.button(
                rx.icon(tag="add"),
                "Новый чат",
                on_click=ChatState.reset_to_new_chat,
                size="2",
            ),
            width="100%",
            padding="1em",
        ),
        rx.divider(),
        rx.vstack(
            rx.foreach(ChatState.chats, chat_item),
            width="100%",
            spacing="1",
            overflow_y="auto",
        ),
        rx.spacer(),
        rx.button(
            "Очистить все чаты",
            on_click=ChatState.delete_all_chats,
            color_scheme="red",
            variant="ghost",
            size="1",
        ),
        width="300px",
        height="100vh",
        bg=rx.color("gray", 2),
        border_right=f"1px solid {rx.color('gray', 5)}",
        position="sticky",
        top="0",
    )
