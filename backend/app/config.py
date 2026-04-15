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
    # SQLAlchemy QueuePool (single shared engine for app + swift_2026 evidence). Raise if many parallel API calls (e.g. GCP dashboard).
    DB_POOL_SIZE: int = 15
    DB_MAX_OVERFLOW: int = 30
    DB_POOL_TIMEOUT: int = 60
    # Cloud Run: set to instance connection name (e.g. project:region:instance) to use Unix socket
    CLOUD_SQL_INSTANCE: str | None = None

    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440

    VERTEX_AI_MODEL: str = "gemini-2.5-flash-lite"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    GOOGLE_CLOUD_PROJECT: str | None = None
    VERTEX_AI_LOCATION: str = "us-central1"
    # Path to a service-account JSON key used exclusively for Vertex AI (LLM inference).
    # When set, Vertex auth uses this key instead of ADC / workload identity.
    # GCP evidence collection uses its own per-cycle user OAuth and does NOT read this.
    VERTEX_AI_SERVICE_ACCOUNT_KEY: str = ""
    # suggest-from-aws/gcp/azure: cap rows + JSON size sent to Vertex (huge prompts stall for many minutes).
    LLM_EVIDENCE_FETCH_LIMIT: int = 80
    LLM_EVIDENCE_BUNDLE_MAX_CHARS: int = 120_000
    LLM_EVIDENCE_ROW_JSON_MAX_CHARS: int = 14_000
    LLM_SUGGEST_MAX_OUTPUT_TOKENS: int = 8192
    # Hard timeout (seconds) for a single model.generate_content() call.
    VERTEX_GENERATE_TIMEOUT_S: int = 300
    # SWIFT 2026 GCP evidence (test/setup): project to scan using Application Default Credentials.
    GCP_EVIDENCE_PROJECT_ID: str | None = None
    # Optional: path to GCP_Evidence_CollectionforSWIFT_v2026_Updated.xlsx for structured / workbook APIs.
    GCP_EVIDENCE_WORKBOOK_PATH: str | None = None
    # Optional: path to Azure_Evidence_Collection_SWIFT_v2026.xlsx (reference for operators).
    AZURE_EVIDENCE_WORKBOOK_PATH: str | None = None
    # Optional global service principal when cycle-level secret is not stored (same as Azure CLI env vars).
    AZURE_TENANT_ID: str = ""
    AZURE_CLIENT_ID: str = ""
    AZURE_CLIENT_SECRET: str = ""
    # Microsoft Entra ID OAuth (authorization code + refresh) for per-user delegated ARM / Resource Graph access.
    AZURE_OAUTH_CLIENT_ID: str = ""
    AZURE_OAUTH_CLIENT_SECRET: str = ""
    AZURE_OAUTH_REDIRECT_URI: str = ""
    # Optional and rarely needed: home-directory GUID of the *platform* Entra app registration (single-tenant apps only).
    # Leave empty — do not put a customer or per-cycle tenant here; after sign-in, tenant/subscription are stored in the DB.
    # When empty, sign-in uses the multi-tenant "organizations" authority (typical).
    AZURE_OAUTH_LOGIN_TENANT: str = ""
    # Optional: base or full URL for browser return after Microsoft OAuth (default: first CORS origin + /azure/dashboard).
    # Example: http://localhost:3000/azure/dashboard
    AZURE_OAUTH_FRONTEND_REDIRECT_URL: str = ""
    # When true, always try DefaultAzureCredential as last resort (e.g. local dev with az login in same shell).
    AZURE_FORCE_DEFAULT_CREDENTIAL: bool = False

    GCS_BUCKET_NAME: str = ""
    GCS_PREFIX: str = "compliance-audit"
    STORAGE_BACKEND: str = "gcs"

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://compliance-audit.vercel.app",
    ]

    # Optional: upstream SWIFT AWS Evidence service base URL (e.g. http://127.0.0.1:8001)
    SWIFT_AWS_BASE_URL: str | None = None

    # Fernet key for encrypting sensitive tenant data at rest (AWS + GCP OAuth refresh tokens + Azure secrets). Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    TENANT_AWS_ENCRYPTION_KEY: str = ""

    # Fixed External ID used when connecting via Role ARN (no per-tenant ID in UI). Tenant role trust policy must use this value. Default: Swift-Audit
    AWS_ASSUME_ROLE_EXTERNAL_ID: str = "Swift-Audit"

    # Google OAuth for per-user GCP API access (optional). When client id is set, Connect UI requires project + Google sign-in.
    GOOGLE_OAUTH_CLIENT_ID: str = ""
    GOOGLE_OAUTH_CLIENT_SECRET: str = ""
    # Exact redirect URI registered in Google Cloud Console (e.g. http://127.0.0.1:8000/api/v1/cloud/gcp/auth/oauth/callback)
    GOOGLE_OAUTH_REDIRECT_URI: str = ""
    # Browser redirect after OAuth completes (path should be /gcp; query gcp_oauth= is appended).
    # If empty: first non-localhost entry in CORS_ORIGINS, else first origin, else localhost.
    GCP_OAUTH_FRONTEND_REDIRECT_URL: str = ""
    # If true, GCP Connect stays "not configured" until IAM check finds a direct user:email on the project (groups not expanded).
    GCP_REQUIRE_IAM_USER_FOUND_FOR_CONNECT: bool = False

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
