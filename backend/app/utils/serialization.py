from datetime import datetime, timezone

from bson import ObjectId


def object_id_from_string(value):
    if isinstance(value, ObjectId):
        return value
    if not value:
        return None
    try:
        return ObjectId(str(value))
    except Exception:
        return None


def serialize_value(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
    if isinstance(value, list):
        return [serialize_value(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize_value(item) for key, item in value.items()}
    return value


def serialize_document(document):
    if not document:
        return None
    prepared = dict(document)
    if "_id" in prepared:
        prepared["id"] = str(prepared.pop("_id"))
    return serialize_value(prepared)
