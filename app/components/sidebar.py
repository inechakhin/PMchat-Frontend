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
                rx.icon(tag="message_circle_plus"),
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
        # Диалог переименования
        rx.dialog.root(
            rx.dialog.content(
                rx.dialog.title("Переименовать чат"),
                rx.dialog.description("Введите новое название для чата"),
                rx.input(
                    value=ChatState.new_chat_title,
                    on_change=ChatState.set_new_chat_title,
                    on_key_down=ChatState.handle_rename_key_down,
                    placeholder="Название чата",
                    auto_focus=True,
                    id="rename-input",
                ),
                rx.flex(
                    rx.dialog.close(
                        rx.button(
                            "Отмена",
                            variant="soft",
                            color_scheme="gray",
                            on_click=ChatState.close_rename_dialog,
                        ),
                    ),
                    rx.dialog.close(
                        rx.button(
                            "Сохранить", 
                            on_click=ChatState.rename_chat
                        ),
                    ),
                    spacing="3",
                    justify="end",
                ),
            ),
            open=ChatState.rename_dialog_open,
        ),
        width="250px",
        flex_shrink="0", # фиксируем ширину
        height="100vh",
        bg=rx.color("gray", 2),
        border_right=f"1px solid {rx.color('gray', 5)}",
        position="sticky",
        top="0",
    )
