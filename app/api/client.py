import httpx
import json
from typing import AsyncGenerator, List, Dict, Any, Optional

from ..core.config import settings

class ChatAPIClient:
    
    def __init__(
        self, 
        host: str = settings.BACKEND_HOST, 
        port: int = settings.BACKEND_PORT,
    ):
        self.backend_base_url = f"http://{host}:{port}"
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0, connect=10.0, read=None),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
        )

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

    async def stream_chat(self, chat_id: str, message: str) -> AsyncGenerator[tuple[Optional[str], str], None]:
        try:
            async with self.client.stream(
                "POST",
                f"{self.backend_base_url}/internal/api/chats/{chat_id}/stream",
                json={"text": message},
                headers={"Accept": "text/event-stream"},
            ) as response:
                response.raise_for_status()
                buffer = ""
                async for chunk in response.aiter_bytes():
                    if not chunk:
                        continue
                    buffer += chunk.decode("utf-8")
                    while "\n\n" in buffer:
                        msg_end = buffer.find("\n\n")
                        complete_msg = buffer[:msg_end]
                        buffer = buffer[msg_end + 2 :]

                        event = None
                        data_str = ""
                        for line in complete_msg.split("\n"):
                            line = line.strip()
                            if line.startswith("event: "):
                                event = line[7:].strip()
                            elif line.startswith("data: "):
                                data_str = line[6:]

                        if event and data_str:
                            try:
                                data = json.loads(data_str)
                            except json.JSONDecodeError:
                                data = {}  # fallback
                        
                        yield (event, data)
                        
                        if event == "finish":
                            return

        except httpx.RemoteProtocolError as e:
            raise Exception(f"Connection closed unexpectedly: {e}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"HTTP error: {e.response.status_code}")
        except Exception as e:
            raise Exception(f"Streaming error: {str(e)}")

    async def rename_chat(self, chat_id: str, title: str) -> Dict[str, Any]:
        response = await self.client.patch(
            f"{self.backend_base_url}/internal/api/chats/{chat_id}",
            json={"title": title}
        )
        response.raise_for_status()
        return response.json()

    async def delete_chat(self, chat_id: str) -> bool:
        response = await self.client.delete(
            f"{self.backend_base_url}/internal/api/chats/{chat_id}"
        )
        response.raise_for_status()
        return True

    async def delete_all_chats(self, user_id: str) -> None:
        response = await self.client.delete(
            f"{self.backend_base_url}/internal/api/chats/all",
            params={"user_id": user_id}
        )
        response.raise_for_status()

    async def close(self):
        await self.client.aclose()

api_client = ChatAPIClient()
