import os

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Config(BaseSettings):
    
    # Пути и директории
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    # Backend
    BACKEND_HOST: str = Field("localhost", env="BACKEND_HOST")
    BACKEND_PORT: int = Field(8008, env="BACKEND_PORT")
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
settings = Config()