import reflex as rx

from ..core.chat_state import ChatState

def chat_item(chat: dict):
    """Элемент списка чатов"""
    return rx.hstack(
        rx.icon(tag="chat"),
        rx.text(chat.get("title", "Новый чат")),
        rx.spacer(),
        rx.icon_button(
            rx.icon(tag="delete"),
            on_click=lambda: ChatState.delete_chat(chat["id"]),
            size="1",
            variant="ghost",
        ),
        padding="0.5em",
        width="100%",
        border_radius="0.5em",
        _hover={"bg": rx.color("gray", 4)},
        cursor="pointer",
        on_click=lambda: ChatState.load_chat_messages(chat["id"]),
        bg=rx.cond(
            ChatState.current_chat_id == chat["id"],
            rx.color("gray", 5),
            "transparent"
        )
    )

def sidebar():
    """Боковая панель с историей чатов"""
    return rx.vstack(
        rx.hstack(
            rx.heading("Чаты", size="3"),
            rx.spacer(),
            rx.button(
                rx.icon(tag="add"),
                "Новый чат",
                on_click=ChatState.create_new_chat,
                size="2",
            ),
            width="100%",
            padding="1em",
        ),
        rx.divider(),
        rx.vstack(
            rx.foreach(
                ChatState.chats,
                chat_item
            ),
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