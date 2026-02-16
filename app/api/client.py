import httpx
from typing import AsyncGenerator, List, Dict, Any

from ..core.config import settings

class ChatAPIClient:
    
    def __init__(
        self,
        host: str = settings.BACKEND_HOST,
        port: int = settings.BACKEND_PORT,
    ):
        self.backend_base_url = f"http://{host}:{port}"
        self.client = httpx.AsyncClient(timeout=None)
    
    async def create_chat(self, user_id: str) -> Dict[str, Any]:
        response = await self.client.post(
            f"{self.backend_base_url}/internal/api/chats/create",
            params={"user_id": user_id}
        )
        response.raise_for_status()
        return response.json()
    
    async def get_user_chats(self, user_id: str) -> List[Dict[str, Any]]:
        response = await self.client.get(
            f"{self.backend_base_url}/internal/api/chats/all",
            params={"user_id": user_id}
        )
        response.raise_for_status()
        return response.json()
    
    async def get_chat_messages(self, chat_id: str) -> List[Dict[str, Any]]:
        response = await self.client.get(
            f"{self.backend_base_url}/internal/api/chats/{chat_id}"
        )
        response.raise_for_status()
        return response.json()
    
    async def stream_chat(self, chat_id: str, message: str) -> AsyncGenerator[Dict[str, str], None]:
        async with self.client.stream(
            "POST",
            f"{self.backend_base_url}/internal/api/chats/{chat_id}/stream",
            json={"text": message}
        ) as response:
            response.raise_for_status()
            current_event = "message"
            current_data = []
            async for line in response.aiter_lines():
                line = line.strip()
                if not line:
                    if current_data:
                        yield {
                            "event": current_event,
                            "data": "\n".join(current_data)
                        }
                        current_data = []
                        current_event = "message"
                elif line.startswith("event: "):
                    current_event = line[7:]
                elif line.startswith("data: "):
                    current_data.append(line[6:])
    
    async def delete_chat(self, chat_id: str) -> bool:
        response = await self.client.delete(
            f"{self.backend_base_url}/internal/api/chats/{chat_id}"
        )
        response.raise_for_status()
        return response.json()
    
    async def delete_all_chats(self, user_id: str) -> None:
        response = await self.client.delete(
            f"{self.backend_base_url}/internal/api/chats/all",
            params={"user_id": user_id}
        )
        response.raise_for_status()
    
    async def close(self):
        await self.client.aclose()
        
api_client = ChatAPIClient()