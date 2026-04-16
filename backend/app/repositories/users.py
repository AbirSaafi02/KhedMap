from datetime import UTC, datetime

from pymongo import ASCENDING, DESCENDING
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import get_db
from app.utils.serialization import object_id_from_string, serialize_document

COLLECTION = "users"


def collection():
    return get_db()[COLLECTION]


def ensure_indexes() -> None:
    collection().create_index([("email", ASCENDING)], unique=True)
    collection().create_index([("role", ASCENDING), ("status", ASCENDING)])
    collection().create_index([("created_at", DESCENDING)])


def create_user(payload: dict):
    now = datetime.now(UTC)
    document = {
        "name": payload["name"].strip(),
        "email": payload["email"].strip().lower(),
        "password_hash": generate_password_hash(payload["password"]),
        "role": payload.get("role", "freelancer"),
        "phone": payload.get("phone", "").strip(),
        "title": payload.get("title", "").strip(),
        "bio": payload.get("bio", "").strip(),
        "specialties": payload.get("specialties", []),
        "resume_url": payload.get("resume_url", "").strip(),
        "avatar_url": payload.get("avatar_url", "").strip(),
        "status": payload.get("status", "approved"),
        "created_at": now,
        "updated_at": now,
    }
    result = collection().insert_one(document)
    return find_user_by_id(result.inserted_id)


def find_user_by_email(email: str):
    if not email:
        return None
    return serialize_document(collection().find_one({"email": email.strip().lower()}))


def find_user_by_id(user_id):
    object_id = object_id_from_string(user_id)
    if not object_id:
        return None
    return serialize_document(collection().find_one({"_id": object_id}))


def find_users_by_ids(user_ids: list[str]):
    object_ids = [object_id_from_string(user_id) for user_id in user_ids]
    object_ids = [item for item in object_ids if item]
    if not object_ids:
        return []
    cursor = collection().find({"_id": {"$in": object_ids}})
    return [serialize_document(document) for document in cursor]


def authenticate(email: str, password: str):
    user = find_user_by_email(email)
    if not user:
        return None

    stored = collection().find_one({"_id": object_id_from_string(user["id"])})
    if stored and check_password_hash(stored["password_hash"], password):
        return serialize_document(stored)
    return None


def update_user_profile(user_id: str, payload: dict):
    object_id = object_id_from_string(user_id)
    if not object_id:
        return None

    updates = {}
    for field in ["name", "phone", "title", "bio", "resume_url", "avatar_url"]:
        if field in payload:
            updates[field] = str(payload[field]).strip()

    if "specialties" in payload:
        updates["specialties"] = payload["specialties"]

    if not updates:
        return find_user_by_id(user_id)

    updates["updated_at"] = datetime.now(UTC)
    collection().update_one({"_id": object_id}, {"$set": updates})
    return find_user_by_id(user_id)


def update_status(user_id: str, status: str):
    object_id = object_id_from_string(user_id)
    if not object_id:
        return None
    collection().update_one(
        {"_id": object_id},
        {"$set": {"status": status, "updated_at": datetime.now(UTC)}},
    )
    return find_user_by_id(user_id)


def list_freelancers(limit: int = 12, status: str | None = "approved"):
    query = {"role": "freelancer"}
    if status:
        query["status"] = status
    cursor = collection().find(query).sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def list_users_by_status(status: str, roles: tuple[str, ...] | None = None, limit: int = 20):
    query = {"status": status}
    if roles:
        query["role"] = {"$in": list(roles)}
    cursor = collection().find(query).sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def list_recent_users(limit: int = 8):
    cursor = collection().find().sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def count_by_role() -> dict:
    counts = {"freelancer": 0, "client": 0, "admin": 0}
    for role in counts:
        counts[role] = collection().count_documents({"role": role})
    return counts
