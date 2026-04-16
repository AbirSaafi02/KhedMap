from datetime import UTC, datetime

from pymongo import ASCENDING, DESCENDING

from app.extensions import get_db
from app.utils.formatting import coerce_float
from app.utils.serialization import object_id_from_string, serialize_document

COLLECTION = "products"


def collection():
    return get_db()[COLLECTION]


def ensure_indexes() -> None:
    collection().create_index([("seller_id", ASCENDING), ("status", ASCENDING)])
    collection().create_index([("created_at", DESCENDING)])


def create_product(seller_id: str, payload: dict):
    now = datetime.now(UTC)
    document = {
        "seller_id": seller_id,
        "title": payload["title"].strip(),
        "category": payload.get("category", "Templates").strip(),
        "description": payload.get("description", "").strip(),
        "price": coerce_float(payload.get("price")),
        "currency": payload.get("currency", "DT").strip() or "DT",
        "status": payload.get("status", "pending"),
        "rating": coerce_float(payload.get("rating")),
        "sales_count": int(payload.get("sales_count", 0)),
        "created_at": now,
        "updated_at": now,
    }
    result = collection().insert_one(document)
    return find_product_by_id(result.inserted_id)


def list_products(status: str | None = None, seller_id: str | None = None, limit: int = 24):
    query = {}
    if status:
        query["status"] = status
    if seller_id:
        query["seller_id"] = seller_id
    cursor = collection().find(query).sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def find_product_by_id(product_id):
    object_id = object_id_from_string(product_id)
    if not object_id:
        return None
    return serialize_document(collection().find_one({"_id": object_id}))


def update_status(product_id: str, status: str):
    object_id = object_id_from_string(product_id)
    if not object_id:
        return None
    collection().update_one(
        {"_id": object_id},
        {"$set": {"status": status, "updated_at": datetime.now(UTC)}},
    )
    return find_product_by_id(product_id)


def increment_sales_count(product_id: str):
    object_id = object_id_from_string(product_id)
    if not object_id:
        return None
    collection().update_one(
        {"_id": object_id},
        {"$inc": {"sales_count": 1}, "$set": {"updated_at": datetime.now(UTC)}},
    )
    return find_product_by_id(product_id)
