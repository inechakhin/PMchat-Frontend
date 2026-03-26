import reflex as rx

from .pages.chat_page import chat_page
from .styles.styles import base_style

app = rx.App(
    style=base_style,
)

app.add_page(
    chat_page,
    route="/",
    title="Chat Service",
)