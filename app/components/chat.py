import reflex as rx

from ..core.chat_state import ChatState
from .message import message_component
from .input_area import input_area

def chat_area():
    """Основная область чата"""
    return rx.vstack(
        rx.cond(
            ChatState.current_chat_id,
            rx.vstack(
                rx.vstack(
                    rx.foreach(
                        ChatState.messages,
                        message_component
                    ),
                    width="100%",
                    spacing="4",
                    padding="1em",
                ),
                rx.spacer(),
                input_area(),
                width="100%",
                height="100vh",
                overflow_y="auto",
            ),
            rx.center(
                rx.vstack(
                    rx.heading("Добро пожаловать в чат!", size="4"),
                    rx.text("Начните новый диалог или выберите существующий"),
                    rx.button(
                        "Создать новый чат",
                        on_click=ChatState.create_new_chat,
                        size="3",
                        margin_top="2em",
                    ),
                    text_align="center",
                ),
                width="100%",
                height="100vh",
            )
        ),
        width="100%",
    )