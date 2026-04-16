import os


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
            "http://localhost:8100,http://127.0.0.1:8100",
        ).split(",")
        if origin.strip()
    ]
