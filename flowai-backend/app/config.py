from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "FLOWAI"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "flowai"

    SQLITE_DATABASE_URL: str = "sqlite:///./flowai.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    CORS_ORIGINS: list[str] = ["*"]

    GROQ_API_KEY: str | None = None
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_DEFAULT_MODEL: str = "openai/gpt-oss-20b"
    GROQ_POWERFUL_MODEL: str = "openai/gpt-oss-120b"
    LLM_REQUEST_TIMEOUT_SECONDS: float = 60.0
    DOCUMENT_STORAGE_PATH: str = "./storage/documents"
    CHROMA_PERSIST_PATH: str = "./storage/chroma"
    DOCUMENT_MAX_SIZE_BYTES: int = 10 * 1024 * 1024
    EMBEDDING_DIMENSIONS: int = 384
    QUEUE_ENABLED: bool = True
    CELERY_TASK_ALWAYS_EAGER: bool = False
    JOB_MAX_RETRIES: int = 3

    # Website / commerce settings (Phase 2+)
    PUBLIC_STORE_URL: str = "http://localhost:3000"
    VERIFY_EMAIL_EXPIRE_HOURS: int = 24
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30
    PAYMENT_PROVIDER: str = "test"
    STRIPE_SECRET_KEY: str | None = None
    STRIPE_WEBHOOK_SECRET: str | None = None
    WEBHOOK_SECRET: str | None = None
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM: str = "FLOWAI Store <noreply@localhost>"
    SMTP_STARTTLS: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def postgres_database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
