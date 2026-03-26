from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime

class Attachment(BaseModel):
    title: str

class Message(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime
    attachments: List[Attachment] = []
    is_streaming: bool = False  # локальный флаг для UI

class ChatSummary(BaseModel):
    id: str
    title: str
    updated_at: datetime