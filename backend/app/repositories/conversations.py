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


def _normalized_messages(messages: list[dict]) -> tuple[list[dict], bool]:
    normalized = []
    changed = False

    for item in messages:
        prepared = dict(item)
        read_by = prepared.get("read_by")
        if not isinstance(read_by, list):
            read_by = []

        sender_id = prepared.get("sender_id")
        unique_readers = []
        for reader_id in [*read_by, sender_id]:
            if reader_id and reader_id not in unique_readers:
                unique_readers.append(reader_id)

        if unique_readers != prepared.get("read_by"):
            changed = True

        prepared["read_by"] = unique_readers
        normalized.append(prepared)

    return normalized, changed


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
        "read_by": [sender_id],
    }
    collection().update_one(
        {"_id": object_id},
        {
            "$push": {"messages": message},
            "$set": {"last_message": content.strip(), "updated_at": now},
        },
    )
    return get_conversation_by_id(conversation_id)


def mark_conversation_read(conversation_id: str, user_id: str):
    object_id = object_id_from_string(conversation_id)
    if not object_id:
        return None

    document = collection().find_one({"_id": object_id})
    if not document:
        return None

    messages, normalized = _normalized_messages(document.get("messages", []))
    changed = normalized

    for message in messages:
        if message.get("sender_id") == user_id:
            continue
        if user_id not in message["read_by"]:
            message["read_by"].append(user_id)
            changed = True

    if changed:
        collection().update_one(
            {"_id": object_id},
            {"$set": {"messages": messages, "updated_at": document.get("updated_at", datetime.now(UTC))}},
        )

    return get_conversation_by_id(conversation_id)


def unread_count(conversation: dict, user_id: str) -> int:
    messages, _ = _normalized_messages(conversation.get("messages", []))
    return len(
        [
            message
            for message in messages
            if message.get("sender_id") != user_id and user_id not in message.get("read_by", [])
        ]
    )
