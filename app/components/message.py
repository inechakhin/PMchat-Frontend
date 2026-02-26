import reflex as rx

from ..core.models import Message

class MessageState(rx.State):
    """Локальное состояние для отслеживания открытых источников в сообщении."""
    expanded_message_ids: set[str] = set()

    def toggle_sources(self, message_id: str):
        if message_id in self.expanded_message_ids:
            self.expanded_message_ids.remove(message_id)
        else:
            self.expanded_message_ids.add(message_id)

def message_component(message: Message):
    return rx.vstack(
        # Основной блок сообщения (как и раньше)
        rx.hstack(
            rx.vstack(
                rx.hstack(
                    rx.icon(
                        tag=rx.cond(message.role == "user", "user", "bot"),
                        color=rx.cond(
                            message.role == "user",
                            rx.color("blue", 9),
                            rx.color("green", 9)
                        ),
                    ),
                    rx.text(
                        rx.cond(message.role == "user", "Вы", "Ассистент"),
                        font_weight="bold",
                        size="2",
                    ),
                    rx.cond(
                        message.is_streaming,
                        rx.spinner(size="1"),
                    ),
                    width="100%",
                ),
                rx.text(
                    message.content,
                    white_space="pre-wrap",
                    width="100%",
                    size="2",
                ),
                rx.moment(message.created_at, format="HH:mm"),
                align_items="start",
                width="100%",
            ),
            padding="1em",
            border_radius="0.5em",
            bg=rx.cond(
                message.role == "user",
                rx.color("blue", 3),
                rx.color("gray", 3)
            ),
            width=rx.cond(
                message.role == "user",
                "80%",
                "100%"
            ),
            margin_left=rx.cond(
                message.role == "user",
                "auto",
                "0"
            ),
            box_shadow="sm",
        ),
        # Кнопка "Источники" и список (только для сообщений ассистента с вложениями)
        rx.cond(
            (message.role == "assistant") & (message.attachments.length() > 0),
            rx.vstack(
                rx.button(
                    "📚 Источники",
                    on_click=lambda: MessageState.toggle_sources(message.id),
                    size="1",
                    variant="ghost",
                    color_scheme="gray",
                    font_size="0.8em",
                    padding="0.2em 0.5em",
                ),
                rx.cond(
                    MessageState.expanded_message_ids.contains(message.id),
                    rx.vstack(
                        rx.foreach(
                            message.attachments,
                            lambda att: rx.text(
                                f"• {att.title}",
                                font_size="0.8em",
                                color=rx.color("gray", 11),
                            )
                        ),
                        spacing="1",
                        align_items="start",
                        padding_left="1em",
                    ),
                ),
                spacing="1",
                align_items="start",
                width="100%",
            ),
        ),
        spacing="1",
        width="100%",
    )
