import reflex as rx

from ..core.models import ChatSummary
from ..core.chat_state import ChatState

def chat_item(chat: ChatSummary):
    """Элемент списка чатов"""
    return rx.hstack(
        # Кликабельная область с текстом
        rx.hstack(
            rx.tooltip(
                rx.text(
                    chat.title,
                    style={
                        "overflow": "hidden",
                        "text_overflow": "ellipsis",
                        "white_space": "nowrap",
                        "width": "100%",
                    }
                ),
                content=chat.title,
            ),
            on_click=lambda: ChatState.load_chat_messages(chat.id),
            flex="1",
            min_width="0",
            align="center",
            cursor="pointer",
            padding="0.5em",
            border_radius="0.5em",
            _hover={"bg": rx.color("gray", 4)},
            bg=rx.cond(
                ChatState.current_chat_id == chat.id,
                rx.color("gray", 5),
                "transparent"
            ),
        ),
        # Меню
        rx.menu.root(
            rx.menu.trigger(
                rx.icon_button(
                    rx.icon("ellipsis"),
                    size="1",
                    variant="ghost",
                    flex_shrink="0",
                )
            ),
            rx.menu.content(
                rx.menu.item(
                    rx.icon("pencil_line"),
                    rx.text("Переименовать", font_size="14px"),
                    on_click=lambda: ChatState.open_rename_dialog(chat.id, chat.title),
                    style={
                        "padding": "12px 12px",
                        "height": "42px",
                        "display": "flex",
                        "alignItems": "center",
                        "gap": "8px",
                    },
                ),
                rx.menu.item(
                    rx.icon("trash"),
                    rx.text("Удалить", font_size="14px"),
                    on_click=lambda: ChatState.delete_chat(chat.id),
                    style={
                        "padding": "12px 12px",
                        "height": "42px",
                        "display": "flex",
                        "alignItems": "center",
                        "gap": "8px",
                    },
                ),
                width="fit-content"
            )
        ),
        width="100%",
        align="center",
        overflow="hidden",
    )