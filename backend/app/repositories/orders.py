from datetime import UTC, datetime

from pymongo import ASCENDING, DESCENDING

from app.extensions import get_db
from app.utils.formatting import coerce_float
from app.utils.serialization import object_id_from_string, serialize_document

COLLECTION = "orders"


def collection():
    return get_db()[COLLECTION]


def ensure_indexes() -> None:
    collection().create_index([("seller_id", ASCENDING), ("status", ASCENDING)])
    collection().create_index([("client_id", ASCENDING), ("status", ASCENDING)])
    collection().create_index([("created_at", DESCENDING)])


def create_order(payload: dict):
    now = datetime.now(UTC)
    document = {
        "source_type": payload["source_type"],
        "source_id": payload["source_id"],
        "title": payload["title"].strip(),
        "client_id": payload["client_id"],
        "seller_id": payload["seller_id"],
        "message": payload.get("message", "").strip(),
        "price": coerce_float(payload.get("price")),
        "currency": payload.get("currency", "DT").strip() or "DT",
        "delivery": payload.get("delivery", "").strip(),
        "status": payload.get("status", "Pending"),
        "created_at": now,
        "updated_at": now,
    }
    result = collection().insert_one(document)
    return find_order_by_id(result.inserted_id)


def find_order_by_id(order_id):
    object_id = object_id_from_string(order_id)
    if not object_id:
        return None
    return serialize_document(collection().find_one({"_id": object_id}))


def list_orders_for_client(client_id: str, limit: int = 20):
    cursor = collection().find({"client_id": client_id}).sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def list_orders_for_seller(seller_id: str, limit: int = 20):
    cursor = collection().find({"seller_id": seller_id}).sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def list_recent_orders(limit: int = 12):
    cursor = collection().find().sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def update_order_status(order_id: str, status: str):
    object_id = object_id_from_string(order_id)
    if not object_id:
        return None
    collection().update_one(
        {"_id": object_id},
        {"$set": {"status": status, "updated_at": datetime.now(UTC)}},
    )
    return find_order_by_id(order_id)
