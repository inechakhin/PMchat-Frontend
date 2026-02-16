import reflex as rx

def message_component(message: dict):
    """Компонент отдельного сообщения"""
    return rx.hstack(
        rx.vstack(
            rx.hstack(
                rx.icon(
                    tag=rx.cond(
                        message["role"] == "user",
                        "user",
                        "bot"
                    ),
                    color=rx.cond(
                        message["role"] == "user",
                        rx.color("blue", 9),
                        rx.color("green", 9)
                    ),
                ),
                rx.text(
                    rx.cond(
                        message["role"] == "user",
                        "Вы",
                        "Ассистент"
                    ),
                    font_weight="bold",
                    size="2",
                ),
                rx.cond(
                    message.get("is_streaming", False),
                    rx.spinner(size="1"),
                ),
                width="100%",
            ),
            rx.text(
                message["content"],
                white_space="pre-wrap",
                width="100%",
                size="2",
            ),
            rx.text(
                message.get("timestamp", ""),
                size="1",
                color=rx.color("gray", 11),
            ),
            align_items="start",
            width="100%",
        ),
        padding="1em",
        border_radius="0.5em",
        bg=rx.cond(
            message["role"] == "user",
            rx.color("blue", 3),
            rx.color("gray", 3)
        ),
        width=rx.cond(
            message["role"] == "user",
            "80%",
            "100%"
        ),
        margin_left=rx.cond(
            message["role"] == "user",
            "auto",
            "0"
        ),
        box_shadow="sm",
    )