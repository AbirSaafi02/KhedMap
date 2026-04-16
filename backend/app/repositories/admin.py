from datetime import UTC, datetime

from pymongo import ASCENDING, DESCENDING

from app.extensions import get_db
from app.utils.serialization import object_id_from_string, serialize_document

COLLECTION = "reports"


def collection():
    return get_db()[COLLECTION]


def ensure_indexes() -> None:
    collection().create_index([("status", ASCENDING), ("created_at", DESCENDING)])


def create_report(reporter_id: str, payload: dict):
    now = datetime.now(UTC)
    document = {
        "reporter_id": reporter_id,
        "target_type": payload.get("target_type", "general").strip(),
        "target_label": payload.get("target_label", "").strip(),
        "reason": payload.get("reason", "").strip(),
        "status": payload.get("status", "pending"),
        "created_at": now,
        "updated_at": now,
    }
    result = collection().insert_one(document)
    return find_report_by_id(result.inserted_id)


def list_reports(status: str | None = None, limit: int = 20):
    query = {}
    if status:
        query["status"] = status
    cursor = collection().find(query).sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def find_report_by_id(report_id):
    object_id = object_id_from_string(report_id)
    if not object_id:
        return None
    return serialize_document(collection().find_one({"_id": object_id}))


def update_report_status(report_id: str, status: str):
    object_id = object_id_from_string(report_id)
    if not object_id:
        return None
    collection().update_one(
        {"_id": object_id},
        {"$set": {"status": status, "updated_at": datetime.now(UTC)}},
    )
    return find_report_by_id(report_id)
