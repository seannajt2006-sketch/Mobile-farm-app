from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "Farm Connect API"
    api_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg2://user:password@localhost:5432/farm_connect"
    cloudinary_url: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
