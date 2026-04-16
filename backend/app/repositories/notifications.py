from datetime import UTC, datetime

from pymongo import ASCENDING, DESCENDING

from app.extensions import get_db
from app.utils.serialization import serialize_document

COLLECTION = "notifications"


def collection():
    return get_db()[COLLECTION]


def ensure_indexes() -> None:
    collection().create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])


def create_notification(user_id: str, title: str, message: str, kind: str = "general", status: str = "info"):
    document = {
        "user_id": user_id,
        "title": title.strip(),
        "message": message.strip(),
        "kind": kind,
        "status": status,
        "is_read": False,
        "created_at": datetime.now(UTC),
    }
    result = collection().insert_one(document)
    return serialize_document(collection().find_one({"_id": result.inserted_id}))


def list_notifications_for_user(user_id: str, limit: int = 20):
    cursor = collection().find({"user_id": user_id}).sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def mark_all_as_read(user_id: str) -> None:
    collection().update_many({"user_id": user_id, "is_read": False}, {"$set": {"is_read": True}})


def count_unread(user_id: str) -> int:
    return collection().count_documents({"user_id": user_id, "is_read": False})
