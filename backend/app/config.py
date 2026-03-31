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
    # Cloud Run: set to instance connection name (e.g. project:region:instance) to use Unix socket
    CLOUD_SQL_INSTANCE: str | None = None

    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    VERTEX_AI_MODEL: str = "gemini-2.5-flash-lite"
    GOOGLE_CLOUD_PROJECT: str | None = None
    VERTEX_AI_LOCATION: str = "us-central1"
    # SWIFT 2026 GCP evidence (test/setup): project to scan using Application Default Credentials.
    GCP_EVIDENCE_PROJECT_ID: str | None = None
    # Optional: path to GCP_Evidence_CollectionforSWIFT_v2026_Updated.xlsx for structured / workbook APIs.
    GCP_EVIDENCE_WORKBOOK_PATH: str | None = None

    GCS_BUCKET_NAME: str = ""
    GCS_PREFIX: str = "compliance-audit"
    STORAGE_BACKEND: str = "gcs"

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "https://compliance-audit.vercel.app"]

    # Optional: upstream SWIFT AWS Evidence service base URL (e.g. http://127.0.0.1:8001)
    SWIFT_AWS_BASE_URL: str | None = None

    # Encrypt tenant AWS credentials at rest. Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    TENANT_AWS_ENCRYPTION_KEY: str = ""

    # Fixed External ID used when connecting via Role ARN (no per-tenant ID in UI). Tenant role trust policy must use this value. Default: Swift-Audit
    AWS_ASSUME_ROLE_EXTERNAL_ID: str = "Swift-Audit"

    model_config = {
        "env_file": str(_env_file),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @property
    def database_url(self) -> str:
        if self.CLOUD_SQL_INSTANCE:
            # Cloud Run: connect via Unix socket (no proxy needed)
            ssl = "&sslmode=require" if self.DB_SSL else ""
            return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@/{self.DB_NAME}?host=/cloudsql/{self.CLOUD_SQL_INSTANCE}{ssl}"
        ssl = "?sslmode=require" if self.DB_SSL else ""
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}{ssl}"


settings = Settings()


def get_jwt_secret() -> str:
    """Return JWT_SECRET_KEY; raise if not set or too short (used when auth is actually needed)."""
    key = settings.JWT_SECRET_KEY
    if not key or len(key) < 32:
        raise ValueError(
            "JWT_SECRET_KEY must be set (e.g. in Cloud Run env) and at least 32 characters. "
            "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
        )
    return key
