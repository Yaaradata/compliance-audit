from pathlib import Path
from pydantic_settings import BaseSettings

_env_file = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5432
    DB_NAME: str = "compliance"
    DB_USER: str = "postgres"
    DB_USER_APP: str = "compliance-audit"
    DB_PASSWORD: str = ""
    DB_SSL: bool = False

    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = {"env_file": str(_env_file), "env_file_encoding": "utf-8"}

    @property
    def database_url(self) -> str:
        ssl = "?sslmode=require" if self.DB_SSL else ""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}{ssl}"


settings = Settings()
