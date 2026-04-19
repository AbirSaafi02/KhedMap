import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BASE_DIR / ".env"

def _load_env_file() -> None:
    if not ENV_FILE.exists():
        return

    for raw_line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        key, separator, value = line.partition("=")
        if not separator:
            continue

        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env_file()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-khedmap-secret")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "khedmap")
    MONGO_TIMEOUT_MS = int(os.getenv("MONGO_TIMEOUT_MS", "2000"))
    SESSION_COOKIE_NAME = os.getenv("SESSION_COOKIE_NAME", "khedmap_session")
    AUTO_SEED = os.getenv("AUTO_SEED", "true").lower() in {"1", "true", "yes", "on"}
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:8100,http://127.0.0.1:8100,http://localhost:4200,http://127.0.0.1:4200",
        ).split(",")
        if origin.strip()
    ]
    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() in {"1", "true", "yes", "on"}
    SMTP_TIMEOUT_SEC = int(os.getenv("SMTP_TIMEOUT_SEC", "10"))
    MAIL_FROM_EMAIL = os.getenv("MAIL_FROM_EMAIL", "noreply@khedmap.local")
    MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "KhedMap")
    PUBLIC_LOGIN_URL = os.getenv("PUBLIC_LOGIN_URL", "http://127.0.0.1:8100/login")