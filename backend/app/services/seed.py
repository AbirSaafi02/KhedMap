from datetime import UTC, datetime, timedelta

from bson import ObjectId
from werkzeug.security import generate_password_hash

from app.extensions import get_db
from app.repositories import admin, conversations, gigs, jobs, notifications, orders, products, users

DEMO_PASSWORD = "demo1234"
DEMO_COLLECTIONS = (
    "users",
    "jobs",
    "applications",
    "gigs",
    "products",
    "orders",
    "conversations",
    "notifications",
    "reports",
)
SHOWCASE_PROFILES = {
    "admin@khedmap.local": {
        "name": "Aya Ben Salem",
        "phone": "+216 20 000 001",
        "title": "Trust & Operations Lead",
        "bio": "Leads trust, approvals, payouts, and marketplace quality for KhedMap.",
        "specialties": ["Moderation", "Compliance", "Support"],
        "avatar_url": "",
        "status": "approved",
    },
    "client@khedmap.local": {
        "name": "Mustapha Ben Ali",
        "phone": "+216 20 000 002",
        "title": "Fintech Product Lead",
        "bio": "Building a polished Tunisian fintech experience and hiring trusted freelance design support.",
        "specialties": ["Product Strategy", "Hiring", "Fintech"],
        "avatar_url": "",
        "status": "approved",
    },
    "freelancer@khedmap.local": {
        "name": "Mayssa Sayah",
        "phone": "+216 20 000 003",
        "title": "Senior UI/UX Designer",
        "bio": "Designs elegant onboarding flows, conversion-ready landing pages, and mobile-first design systems.",
        "specialties": ["Product Design", "Mobile UX", "Design Systems"],
        "resume_url": "mayssa-cv.pdf",
        "avatar_url": "",
        "status": "approved",
    },
}


def ensure_seed_data() -> bool:
    db = get_db()
    _ensure_indexes()
    _upgrade_existing_records(db)

    if db["users"].count_documents({}) > 0:
        return False

    _seed_showcase_data(db)
    _upgrade_existing_records(db)
    return True


def reset_showcase_demo_data() -> bool:
    db = get_db()

    for collection_name in DEMO_COLLECTIONS:
        db[collection_name].delete_many({})

    _ensure_indexes()
    _seed_showcase_data(db)
    _upgrade_existing_records(db)
    return True


def _seed_showcase_data(db) -> None:
    now = datetime.now(UTC)
    password_hash = generate_password_hash(DEMO_PASSWORD)

    user_documents = [
        {
            "name": "Aya Ben Salem",
            "email": "admin@khedmap.local",
            "password_hash": password_hash,
            "role": "admin",
            "phone": "+216 20 000 001",
            "title": "Trust & Operations Lead",
            "bio": "Leads trust, approvals, payouts, and marketplace quality for KhedMap.",
            "specialties": ["Moderation", "Compliance", "Support"],
            "resume_url": "",
            "avatar_url": "",
            "status": "approved",
            "created_at": now - timedelta(days=10),
            "updated_at": now - timedelta(days=1),
        },
        {
            "name": "Mustapha Ben Ali",
            "email": "client@khedmap.local",
            "password_hash": password_hash,
            "role": "client",
            "phone": "+216 20 000 002",
            "title": "Fintech Product Lead",
            "bio": "Building a polished Tunisian fintech experience and hiring trusted freelance design support.",
            "specialties": ["Product Strategy", "Hiring", "Fintech"],
            "resume_url": "",
            "avatar_url": "",
            "status": "approved",
            "created_at": now - timedelta(days=7),
            "updated_at": now - timedelta(days=1),
        },
        {
            "name": "Mayssa Sayah",
            "email": "freelancer@khedmap.local",
            "password_hash": password_hash,
            "role": "freelancer",
            "phone": "+216 20 000 003",
            "title": "Senior UI/UX Designer",
            "bio": "Designs elegant onboarding flows, conversion-ready landing pages, and mobile-first design systems.",
            "specialties": ["Product Design", "Mobile UX", "Design Systems"],
            "resume_url": "mayssa-cv.pdf",
            "avatar_url": "",
            "status": "approved",
            "created_at": now - timedelta(days=6),
            "updated_at": now - timedelta(days=1),
        },
    ]

    inserted_users = db["users"].insert_many(user_documents)
    user_ids = {
        "admin": str(inserted_users.inserted_ids[0]),
        "client": str(inserted_users.inserted_ids[1]),
        "freelancer": str(inserted_users.inserted_ids[2]),
    }

    job_documents = [
        {
            "client_id": user_ids["client"],
            "title": "Fintech onboarding refresh",
            "category": "Design",
            "employment_type": "Freelance",
            "budget": 1400,
            "currency": "DT",
            "description": "Need a polished onboarding flow, trust-building UI, and a launch-ready Figma handoff.",
            "status": "interviewing",
            "applicant_count": 1,
            "shortlisted_count": 1,
            "created_at": now - timedelta(days=2),
            "updated_at": now - timedelta(days=1),
        },
        {
            "client_id": user_ids["client"],
            "title": "Fintech landing page polish",
            "category": "Design",
            "employment_type": "Freelance",
            "budget": 950,
            "currency": "DT",
            "description": "Looking for a conversion-focused landing page with crisp hierarchy and responsive sections.",
            "status": "open",
            "applicant_count": 1,
            "shortlisted_count": 0,
            "created_at": now - timedelta(days=4),
            "updated_at": now - timedelta(days=2),
        },
    ]
    inserted_jobs = db["jobs"].insert_many(job_documents)
    job_ids = [str(item) for item in inserted_jobs.inserted_ids]

    db["applications"].insert_many(
        [
            {
                "job_id": job_ids[0],
                "freelancer_id": user_ids["freelancer"],
                "full_name": "Mayssa Sayah",
                "cover_letter": "I can redesign the onboarding flow into a premium, mobile-first journey with clean handoff.",
                "cv_filename": "mayssa-cv.pdf",
                "status": "accepted",
                "created_at": now - timedelta(days=1, hours=2),
                "updated_at": now - timedelta(days=1, hours=1),
            },
            {
                "job_id": job_ids[1],
                "freelancer_id": user_ids["freelancer"],
                "full_name": "Mayssa Sayah",
                "cover_letter": "Strong fit for fintech landing pages with a UI system that feels fast and trustworthy.",
                "cv_filename": "mayssa-cv.pdf",
                "status": "pending",
                "created_at": now - timedelta(days=2),
                "updated_at": now - timedelta(days=1),
            },
        ]
    )

    gig_documents = [
        {
            "freelancer_id": user_ids["freelancer"],
            "title": "I will design a smooth fintech mobile onboarding flow",
            "category": "Design",
            "description": "Premium onboarding UX with flow mapping, polished screens, and a reusable design system.",
            "price": 220,
            "currency": "DT",
            "delivery": "4 days",
            "status": "approved",
            "rating": 4.9,
            "order_count": 2,
            "in_store": True,
            "allow_messaging": True,
            "created_at": now - timedelta(days=5),
            "updated_at": now - timedelta(days=1),
        },
        {
            "freelancer_id": user_ids["freelancer"],
            "title": "I will redesign your SaaS landing page for better conversion",
            "category": "Design",
            "description": "Conversion-focused sections, cleaner content hierarchy, and a complete Figma delivery.",
            "price": 180,
            "currency": "DT",
            "delivery": "3 days",
            "status": "approved",
            "rating": 4.8,
            "order_count": 1,
            "in_store": True,
            "allow_messaging": True,
            "created_at": now - timedelta(days=3),
            "updated_at": now - timedelta(days=1),
        },
    ]
    inserted_gigs = db["gigs"].insert_many(gig_documents)
    gig_ids = [str(item) for item in inserted_gigs.inserted_ids]

    product_documents = [
        {
            "seller_id": user_ids["freelancer"],
            "title": "Dashboard UI Kit",
            "category": "UI Kits",
            "description": "A polished dashboard UI kit for marketplace, analytics, and admin flows.",
            "price": 60,
            "currency": "DT",
            "status": "approved",
            "rating": 4.9,
            "sales_count": 2,
            "created_at": now - timedelta(days=5),
            "updated_at": now - timedelta(days=1),
        },
        {
            "seller_id": user_ids["freelancer"],
            "title": "Mobile onboarding wireframe pack",
            "category": "Templates",
            "description": "A focused set of onboarding wireframes and UX notes for faster mobile MVP launches.",
            "price": 40,
            "currency": "DT",
            "status": "approved",
            "rating": 4.7,
            "sales_count": 1,
            "created_at": now - timedelta(days=2),
            "updated_at": now - timedelta(days=1),
        },
    ]
    inserted_products = db["products"].insert_many(product_documents)
    product_ids = [str(item) for item in inserted_products.inserted_ids]

    db["orders"].insert_many(
        [
            {
                "source_type": "gig",
                "source_id": gig_ids[0],
                "title": "I will design a smooth fintech mobile onboarding flow",
                "client_id": user_ids["client"],
                "seller_id": user_ids["freelancer"],
                "message": "Need a premium onboarding flow for a fintech launch next week.",
                "price": 220,
                "currency": "DT",
                "delivery": "4 days",
                "status": "In Progress",
                "created_at": now - timedelta(days=1, hours=6),
                "updated_at": now - timedelta(days=1, hours=2),
            },
            {
                "source_type": "product",
                "source_id": product_ids[0],
                "title": "Dashboard UI Kit",
                "client_id": user_ids["client"],
                "seller_id": user_ids["freelancer"],
                "message": "Instant digital purchase for the internal admin dashboard.",
                "price": 60,
                "currency": "DT",
                "delivery": "Instant",
                "status": "Completed",
                "created_at": now - timedelta(hours=10),
                "updated_at": now - timedelta(hours=10),
            },
        ]
    )

    conversation = conversations.get_or_create_conversation(user_ids["client"], user_ids["freelancer"])
    db["conversations"].update_one(
        {"_id": ObjectId(conversation["id"])},
        {
            "$set": {
                "messages": [
                    {
                        "id": "seed-1",
                        "sender_id": user_ids["client"],
                        "content": "Hi Mayssa, I really like how refined your onboarding work feels. Are you available this week?",
                        "created_at": now - timedelta(hours=14),
                        "read_by": [user_ids["client"], user_ids["freelancer"]],
                    },
                    {
                        "id": "seed-2",
                        "sender_id": user_ids["freelancer"],
                        "content": "Yes, absolutely. I can start tomorrow and shape the flow around trust, clarity, and conversion.",
                        "created_at": now - timedelta(hours=13, minutes=20),
                        "read_by": [user_ids["freelancer"], user_ids["client"]],
                    },
                    {
                        "id": "seed-3",
                        "sender_id": user_ids["client"],
                        "content": "Perfect. I just shared the onboarding brief, the budget, and the key friction points from our current flow.",
                        "created_at": now - timedelta(hours=6),
                        "read_by": [user_ids["client"], user_ids["freelancer"]],
                    },
                    {
                        "id": "seed-4",
                        "sender_id": user_ids["freelancer"],
                        "content": "Great. I already see a cleaner first-run experience with fewer steps and a much smoother visual rhythm.",
                        "created_at": now - timedelta(hours=3, minutes=10),
                        "read_by": [user_ids["client"]],
                    },
                    {
                        "id": "seed-5",
                        "sender_id": user_ids["client"],
                        "content": "That sounds exactly right. Let us keep the UI premium but still very simple for first-time users.",
                        "created_at": now - timedelta(minutes=45),
                        "read_by": [user_ids["client"]],
                    },
                ],
                "last_message": "That sounds exactly right. Let us keep the UI premium but still very simple for first-time users.",
                "updated_at": now - timedelta(minutes=45),
            }
        },
    )

    notifications.create_notification(
        user_ids["client"],
        "Freelancer accepted",
        "Mayssa is now shortlisted on the fintech onboarding refresh brief.",
        kind="job",
        status="approved",
    )
    notifications.create_notification(
        user_ids["freelancer"],
        "Gig order in progress",
        "Mustapha purchased your fintech onboarding gig.",
        kind="order",
        status="approved",
    )
    notifications.create_notification(
        user_ids["freelancer"],
        "Application accepted",
        "Mustapha shortlisted your onboarding refresh application.",
        kind="application",
        status="approved",
    )
    _upgrade_existing_records(db)


def _ensure_indexes() -> None:
    users.ensure_indexes()
    jobs.ensure_indexes()
    gigs.ensure_indexes()
    products.ensure_indexes()
    orders.ensure_indexes()
    conversations.ensure_indexes()
    notifications.ensure_indexes()
    admin.ensure_indexes()


def _upgrade_existing_records(db) -> None:
    _upgrade_showcase_profiles(db)
    _upgrade_order_financials(db)
    _upgrade_conversation_read_state(db)
    _upgrade_application_statuses(db)


def _upgrade_showcase_profiles(db) -> None:
    for email, updates in SHOWCASE_PROFILES.items():
        db["users"].update_one({"email": email}, {"$set": updates})


def _upgrade_order_financials(db) -> None:
    for order in db["orders"].find():
        price = float(order.get("price", 0) or 0)
        platform_fee = round(price * orders.PLATFORM_FEE_RATE, 2)
        seller_earnings = round(price - platform_fee, 2)
        db["orders"].update_one(
            {"_id": order["_id"]},
            {
                "$set": {
                    "platform_fee_rate": order.get("platform_fee_rate", orders.PLATFORM_FEE_RATE),
                    "platform_fee": order.get("platform_fee", platform_fee),
                    "seller_earnings": order.get("seller_earnings", seller_earnings),
                }
            },
        )


def _upgrade_conversation_read_state(db) -> None:
    demo_client = db["users"].find_one({"email": "client@khedmap.local"})
    demo_freelancer = db["users"].find_one({"email": "freelancer@khedmap.local"})

    for conversation in db["conversations"].find():
        messages = []
        changed = False
        for message in conversation.get("messages", []):
            prepared = dict(message)
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
            messages.append(prepared)

        if (
            demo_client
            and demo_freelancer
            and set(conversation.get("participant_ids", []))
            == {str(demo_client["_id"]), str(demo_freelancer["_id"])}
            and not any(message.get("id") == "seed-5" for message in messages)
        ):
            messages.extend(
                [
                    {
                        "id": "seed-3",
                        "sender_id": str(demo_client["_id"]),
                        "content": "Perfect. I just shared the onboarding brief, the budget, and the key friction points from our current flow.",
                        "created_at": datetime.now(UTC) - timedelta(hours=6),
                        "read_by": [str(demo_client["_id"]), str(demo_freelancer["_id"])],
                    },
                    {
                        "id": "seed-4",
                        "sender_id": str(demo_freelancer["_id"]),
                        "content": "Great. I already see a cleaner first-run experience with fewer steps and a much smoother visual rhythm.",
                        "created_at": datetime.now(UTC) - timedelta(hours=3, minutes=10),
                        "read_by": [str(demo_freelancer["_id"])],
                    },
                    {
                        "id": "seed-5",
                        "sender_id": str(demo_client["_id"]),
                        "content": "That sounds exactly right. Let us keep the UI premium but still very simple for first-time users.",
                        "created_at": datetime.now(UTC) - timedelta(minutes=45),
                        "read_by": [str(demo_client["_id"])],
                    },
                ]
            )
            conversation["last_message"] = (
                "That sounds exactly right. Let us keep the UI premium but still very simple for first-time users."
            )
            conversation["updated_at"] = datetime.now(UTC) - timedelta(minutes=45)
            changed = True

        if changed:
            db["conversations"].update_one(
                {"_id": conversation["_id"]},
                {
                    "$set": {
                        "messages": messages,
                        "last_message": conversation.get("last_message", ""),
                        "updated_at": conversation.get("updated_at"),
                    }
                },
            )


def _upgrade_application_statuses(db) -> None:
    db["applications"].update_many({"status": "shortlisted"}, {"$set": {"status": "accepted"}})

    for job in db["jobs"].find():
        job_id = str(job["_id"])
        applicant_count = db["applications"].count_documents({"job_id": job_id})
        shortlisted_count = db["applications"].count_documents({"job_id": job_id, "status": {"$in": ["accepted"]}})
        next_status = job.get("status", "open")
        if next_status != "closed":
            next_status = "interviewing" if shortlisted_count else "open"

        db["jobs"].update_one(
            {"_id": job["_id"]},
            {
                "$set": {
                    "applicant_count": applicant_count,
                    "shortlisted_count": shortlisted_count,
                    "status": next_status,
                }
            },
        )
