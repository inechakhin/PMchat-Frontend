import reflex as rx

from ..core.chat_state import ChatState
from .message import message_component
from .input_area import input_area

def chat_area():
    """Основная область чата с сообщениями и полем ввода, прижатым к низу."""
    return rx.vstack(
        rx.cond(
            ChatState.current_chat_id,
            rx.vstack(
                rx.vstack(
                    rx.foreach(ChatState.messages, message_component),
                    width="100%",
                    spacing="4",
                    padding="1em",
                    overflow_y="auto", # скролл для длинных сообщений
                    overflow_x="hidden", # скрываем горизонтальный скролл
                    flex="1", # растягивается на всё свободное место
                    min_height="0", # необходимо для flex-контейнера
                ),
                input_area(),
                width="100%",
                height="100vh",
                spacing="0",
                justify="between",
            ),
            rx.vstack(
                rx.center(
                    rx.vstack(
                        rx.heading("Какую сегодня проектную документацию создаем?", size="4"),
                        rx.text("Напишите сообщение, чтобы начать новый диалог"),
                        spacing="4",
                        text_align="center",
                    ),
                    width="100%",
                    flex="1",
                ),
                input_area(),
                width="100%",
                height="100vh",
                spacing="0",
                justify="start",
            )
        ),
        width="100%",
        flex="1", # занимает оставшееся место
        min_width="0", # позволяет сжиматься меньше содержимого
    )