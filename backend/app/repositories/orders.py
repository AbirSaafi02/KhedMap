from datetime import UTC, datetime

from pymongo import ASCENDING, DESCENDING

from app.extensions import get_db
from app.utils.formatting import coerce_float
from app.utils.serialization import object_id_from_string, serialize_document

COLLECTION = "orders"
PLATFORM_FEE_RATE = 0.15


def collection():
    return get_db()[COLLECTION]


def ensure_indexes() -> None:
    collection().create_index([("seller_id", ASCENDING), ("status", ASCENDING)])
    collection().create_index([("client_id", ASCENDING), ("status", ASCENDING)])
    collection().create_index([("source_type", ASCENDING), ("created_at", DESCENDING)])
    collection().create_index([("created_at", DESCENDING)])


def _financials(price: float) -> tuple[float, float]:
    normalized_price = coerce_float(price)
    platform_fee = round(normalized_price * PLATFORM_FEE_RATE, 2)
    seller_earnings = round(normalized_price - platform_fee, 2)
    return platform_fee, seller_earnings


def _serialize_order(document):
    order = serialize_document(document)
    if not order:
        return None

    platform_fee, seller_earnings = _financials(order.get("price", 0))
    order["platform_fee_rate"] = float(order.get("platform_fee_rate", PLATFORM_FEE_RATE))
    order["platform_fee"] = coerce_float(order.get("platform_fee", platform_fee))
    order["seller_earnings"] = coerce_float(order.get("seller_earnings", seller_earnings))
    return order


def create_order(payload: dict):
    now = datetime.now(UTC)
    price = coerce_float(payload.get("price"))
    platform_fee, seller_earnings = _financials(price)
    document = {
        "source_type": payload["source_type"],
        "source_id": payload["source_id"],
        "title": payload["title"].strip(),
        "client_id": payload["client_id"],
        "seller_id": payload["seller_id"],
        "message": payload.get("message", "").strip(),
        "price": price,
        "currency": payload.get("currency", "DT").strip() or "DT",
        "delivery": payload.get("delivery", "").strip(),
        "status": payload.get("status", "Pending"),
        "platform_fee_rate": PLATFORM_FEE_RATE,
        "platform_fee": platform_fee,
        "seller_earnings": seller_earnings,
        "created_at": now,
        "updated_at": now,
    }
    result = collection().insert_one(document)
    return find_order_by_id(result.inserted_id)


def find_order_by_id(order_id):
    object_id = object_id_from_string(order_id)
    if not object_id:
        return None
    return _serialize_order(collection().find_one({"_id": object_id}))


def list_orders_for_client(client_id: str, limit: int = 20):
    cursor = collection().find({"client_id": client_id}).sort("created_at", DESCENDING).limit(limit)
    return [_serialize_order(document) for document in cursor]


def list_orders_for_seller(seller_id: str, limit: int = 20):
    cursor = collection().find({"seller_id": seller_id}).sort("created_at", DESCENDING).limit(limit)
    return [_serialize_order(document) for document in cursor]


def list_recent_orders(limit: int = 12):
    cursor = collection().find().sort("created_at", DESCENDING).limit(limit)
    return [_serialize_order(document) for document in cursor]


def update_order_status(order_id: str, status: str):
    object_id = object_id_from_string(order_id)
    if not object_id:
        return None
    collection().update_one(
        {"_id": object_id},
        {"$set": {"status": status, "updated_at": datetime.now(UTC)}},
    )
    return find_order_by_id(order_id)


def summarize_wallet() -> dict:
    summary = {
        "gross_volume": 0.0,
        "wallet_balance": 0.0,
        "released_balance": 0.0,
        "pending_balance": 0.0,
        "seller_payouts": 0.0,
        "orders_count": 0,
        "completed_orders": 0,
        "active_orders": 0,
        "refused_orders": 0,
    }

    for document in collection().find():
        order = _serialize_order(document)
        if not order:
            continue

        summary["orders_count"] += 1
        status = order.get("status", "")
        if status == "Refused":
            summary["refused_orders"] += 1
            continue

        summary["gross_volume"] += order.get("price", 0)
        summary["wallet_balance"] += order.get("platform_fee", 0)
        summary["seller_payouts"] += order.get("seller_earnings", 0)

        if status == "Completed":
            summary["completed_orders"] += 1
            summary["released_balance"] += order.get("platform_fee", 0)
        elif status in {"Pending", "In Progress"}:
            summary["active_orders"] += 1
            summary["pending_balance"] += order.get("platform_fee", 0)

    for key in ("gross_volume", "wallet_balance", "released_balance", "pending_balance", "seller_payouts"):
        summary[key] = round(summary[key], 2)

    return summary
