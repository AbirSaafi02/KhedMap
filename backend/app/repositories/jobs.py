from datetime import UTC, datetime

from pymongo import ASCENDING, DESCENDING

from app.extensions import get_db
from app.utils.formatting import coerce_float
from app.utils.serialization import object_id_from_string, serialize_document

JOBS_COLLECTION = "jobs"
APPLICATIONS_COLLECTION = "applications"


def jobs_collection():
    return get_db()[JOBS_COLLECTION]


def applications_collection():
    return get_db()[APPLICATIONS_COLLECTION]


def ensure_indexes() -> None:
    jobs_collection().create_index([("client_id", ASCENDING), ("status", ASCENDING)])
    jobs_collection().create_index([("created_at", DESCENDING)])
    applications_collection().create_index(
        [("job_id", ASCENDING), ("freelancer_id", ASCENDING)],
        unique=True,
    )
    applications_collection().create_index([("freelancer_id", ASCENDING), ("created_at", DESCENDING)])


def create_job(client_id: str, payload: dict):
    now = datetime.now(UTC)
    document = {
        "client_id": client_id,
        "title": payload["title"].strip(),
        "category": payload.get("category", "General").strip(),
        "employment_type": payload.get("employment_type", "Freelance").strip(),
        "budget": coerce_float(payload.get("budget")),
        "currency": payload.get("currency", "DT").strip() or "DT",
        "description": payload.get("description", "").strip(),
        "status": payload.get("status", "open"),
        "applicant_count": 0,
        "shortlisted_count": 0,
        "created_at": now,
        "updated_at": now,
    }
    result = jobs_collection().insert_one(document)
    return find_job_by_id(result.inserted_id)


def list_jobs(status: str | None = None, client_id: str | None = None, limit: int = 24):
    query = {}
    if status:
        query["status"] = status
    if client_id:
        query["client_id"] = client_id
    cursor = jobs_collection().find(query).sort("created_at", DESCENDING).limit(limit)
    return [serialize_document(document) for document in cursor]


def find_job_by_id(job_id):
    object_id = object_id_from_string(job_id)
    if not object_id:
        return None
    return serialize_document(jobs_collection().find_one({"_id": object_id}))


def find_jobs_by_ids(job_ids: list[str]):
    object_ids = [object_id_from_string(job_id) for job_id in job_ids]
    object_ids = [item for item in object_ids if item]
    if not object_ids:
        return []
    cursor = jobs_collection().find({"_id": {"$in": object_ids}})
    return [serialize_document(document) for document in cursor]


def create_application(job_id: str, freelancer_id: str, payload: dict):
    now = datetime.now(UTC)
    document = {
        "job_id": job_id,
        "freelancer_id": freelancer_id,
        "full_name": payload.get("full_name", "").strip(),
        "cover_letter": payload.get("cover_letter", "").strip(),
        "cv_filename": payload.get("cv_filename", "").strip(),
        "status": payload.get("status", "pending"),
        "created_at": now,
        "updated_at": now,
    }
    result = applications_collection().insert_one(document)
    applicant_count = applications_collection().count_documents({"job_id": job_id})
    jobs_collection().update_one(
        {"_id": object_id_from_string(job_id)},
        {"$set": {"applicant_count": applicant_count, "updated_at": now}},
    )
    return find_application_by_id(result.inserted_id)


def find_application(job_id: str, freelancer_id: str):
    document = applications_collection().find_one({"job_id": job_id, "freelancer_id": freelancer_id})
    return serialize_document(document)


def find_application_by_id(application_id):
    object_id = object_id_from_string(application_id)
    if not object_id:
        return None
    return serialize_document(applications_collection().find_one({"_id": object_id}))


def list_applications_for_freelancer(freelancer_id: str, limit: int = 20):
    cursor = (
        applications_collection()
        .find({"freelancer_id": freelancer_id})
        .sort("created_at", DESCENDING)
        .limit(limit)
    )
    return [serialize_document(document) for document in cursor]
