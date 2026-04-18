from datetime import UTC, datetime

from pymongo import ASCENDING, DESCENDING

from app.extensions import get_db
from app.utils.formatting import coerce_bool, coerce_float
from app.utils.serialization import object_id_from_string, serialize_document

COLLECTION = "gigs"


def collection():
    return get_db()[COLLECTION]


def ensure_indexes() -> None:
    collection().create_index([("freelancer_id", ASCENDING), ("status", ASCENDING)])
    collection().create_index([("created_at", DESCENDING)])


def create_gig(freelancer_id: str, payload: dict):
    now = datetime.now(UTC)
    document = {
        "freelancer_id": freelancer_id,
        "title": payload["title"].strip(),
        "category": payload.get("category", "General").strip(),
        "description": payload.get("description", "").strip(),
        "price": coerce_float(payload.get("price")),
        "currency": payload.get("currency", "DT").strip() or "DT",
        "delivery": payload.get("delivery", "3 days").strip(),
        "status": payload.get("status", "pending"),
        "rating": coerce_float(payload.get("rating")),
        "order_count": int(payload.get("order_count", 0)),
        "in_store": coerce_bool(payload.get("in_store", True)),
        "allow_messaging": coerce_bool(payload.get("allow_messaging", True)),
        "created_at": now,
        "updated_at": now,
    }
    result = collection().insert_one(document)
    return find_gig_by_id(result.inserted_id)


def list_gigs(status: str | None = None, freelancer_id: str | None = None, limit: int = 24):
    query = {}
    if status:
        query["status"] = status
    if freelancer_id:
        query["freelancer_id"] = freelancer_id
    cursor = collection().find(query).sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def find_gig_by_id(gig_id):
    object_id = object_id_from_string(gig_id)
    if not object_id:
        return None
    return serialize_document(collection().find_one({"_id": object_id}))


def update_status(gig_id: str, status: str):
    object_id = object_id_from_string(gig_id)
    if not object_id:
        return None
    collection().update_one(
        {"_id": object_id},
        {"$set": {"status": status, "updated_at": datetime.now(UTC)}},
    )
    return find_gig_by_id(gig_id)


def increment_order_count(gig_id: str):
    object_id = object_id_from_string(gig_id)
    if not object_id:
        return None
    collection().update_one(
        {"_id": object_id},
        {"$inc": {"order_count": 1}, "$set": {"updated_at": datetime.now(UTC)}},
    )
    return find_gig_by_id(gig_id)
