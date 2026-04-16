from datetime import UTC, datetime

from bson import ObjectId
from pymongo import ASCENDING, DESCENDING

from app.extensions import get_db
from app.utils.serialization import object_id_from_string, serialize_document

COLLECTION = "conversations"


def collection():
    return get_db()[COLLECTION]


def ensure_indexes() -> None:
    collection().create_index([("participant_key", ASCENDING)], unique=True)
    collection().create_index([("participant_ids", ASCENDING), ("updated_at", DESCENDING)])


def conversation_key(user_a_id: str, user_b_id: str) -> str:
    return ":".join(sorted([user_a_id, user_b_id]))


def get_or_create_conversation(user_a_id: str, user_b_id: str):
    key = conversation_key(user_a_id, user_b_id)
    existing = collection().find_one({"participant_key": key})
    if existing:
        return serialize_document(existing)

    now = datetime.now(UTC)
    document = {
        "participant_ids": sorted([user_a_id, user_b_id]),
        "participant_key": key,
        "messages": [],
        "last_message": "",
        "created_at": now,
        "updated_at": now,
    }
    result = collection().insert_one(document)
    return get_conversation_by_id(result.inserted_id)


def get_conversation_by_id(conversation_id):
    object_id = object_id_from_string(conversation_id)
    if not object_id:
        return None
    return serialize_document(collection().find_one({"_id": object_id}))


def get_conversation_between(user_a_id: str, user_b_id: str):
    return serialize_document(collection().find_one({"participant_key": conversation_key(user_a_id, user_b_id)}))


def list_conversations_for_user(user_id: str, limit: int = 12):
    cursor = collection().find({"participant_ids": user_id}).sort("updated_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def append_message(conversation_id: str, sender_id: str, content: str):
    object_id = object_id_from_string(conversation_id)
    if not object_id:
        return None

    now = datetime.now(UTC)
    message = {
        "id": str(ObjectId()),
        "sender_id": sender_id,
        "content": content.strip(),
        "created_at": now,
    }
    collection().update_one(
        {"_id": object_id},
        {
            "$push": {"messages": message},
            "$set": {"last_message": content.strip(), "updated_at": now},
        },
    )
    return get_conversation_by_id(conversation_id)
