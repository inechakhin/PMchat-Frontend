import reflex as rx

from ..core.chat_state import ChatState

def input_area():
    """Область ввода сообщения"""
    return rx.hstack(
        rx.input(
            placeholder="Введите сообщение...",
            value=ChatState.current_message,
            on_change=ChatState.set_current_message,
            on_key_down=ChatState.handle_key_down,
            width="100%",
            is_disabled=ChatState.is_loading,
        ),
        rx.button(
            rx.cond(
                ChatState.is_loading,
                rx.spinner(size="1"),
                rx.icon(tag="arrow_up"),
            ),
            on_click=ChatState.send_message,
            is_disabled=ChatState.is_loading,
            color_scheme="blue",
            border_radius="md",
        ),
        width="100%",
        padding="1em",
        border_top=f"1px solid {rx.color('gray', 5)}",
        bg=rx.color("gray", 2),
    )
