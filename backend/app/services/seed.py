from datetime import UTC, datetime, timedelta

from bson import ObjectId
from werkzeug.security import generate_password_hash

from app.extensions import get_db
from app.repositories import admin, conversations, gigs, jobs, notifications, orders, products, users

DEMO_PASSWORD = "demo1234"


def ensure_seed_data() -> bool:
    db = get_db()
    _ensure_indexes()

    if db["users"].count_documents({}) > 0:
        return False

    now = datetime.now(UTC)
    password_hash = generate_password_hash(DEMO_PASSWORD)

    user_documents = [
        {
            "name": "Aya Admin",
            "email": "admin@khedmap.local",
            "password_hash": password_hash,
            "role": "admin",
            "phone": "+216 20 000 001",
            "title": "Operations Lead",
            "bio": "Keeps approvals, trust, and payouts moving.",
            "specialties": ["Moderation", "Support"],
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
            "title": "Startup Founder",
            "bio": "Builds product MVPs and hires designers fast.",
            "specialties": ["SaaS", "Product"],
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
            "title": "UI/UX Designer",
            "bio": "Designs clean mobile flows, systems, and launch-ready interfaces.",
            "specialties": ["Design", "Figma", "Prototype"],
            "resume_url": "mayssa-cv.pdf",
            "avatar_url": "",
            "status": "approved",
            "created_at": now - timedelta(days=6),
            "updated_at": now - timedelta(days=1),
        },
        {
            "name": "Adam Trabelsi",
            "email": "adam@khedmap.local",
            "password_hash": password_hash,
            "role": "freelancer",
            "phone": "+216 20 000 004",
            "title": "Full Stack Developer",
            "bio": "Builds APIs and dashboards for early-stage products.",
            "specialties": ["Development", "Flask", "MongoDB"],
            "resume_url": "adam-cv.pdf",
            "avatar_url": "",
            "status": "pending",
            "created_at": now - timedelta(days=3),
            "updated_at": now - timedelta(days=1),
        },
    ]

    inserted_users = db["users"].insert_many(user_documents)
    user_ids = {
        "admin": str(inserted_users.inserted_ids[0]),
        "client": str(inserted_users.inserted_ids[1]),
        "freelancer": str(inserted_users.inserted_ids[2]),
        "pending_freelancer": str(inserted_users.inserted_ids[3]),
    }

    job_documents = [
        {
            "client_id": user_ids["client"],
            "title": "Fintech landing redesign",
            "category": "Design",
            "employment_type": "Freelance",
            "budget": 1200,
            "currency": "DT",
            "description": "Need a clean hero, pricing block, and responsive handoff in five days.",
            "status": "open",
            "applicant_count": 1,
            "shortlisted_count": 0,
            "created_at": now - timedelta(days=2),
            "updated_at": now - timedelta(days=1),
        },
        {
            "client_id": user_ids["client"],
            "title": "Mobile onboarding screens",
            "category": "Design",
            "employment_type": "Part Time",
            "budget": 750,
            "currency": "DT",
            "description": "Three onboarding screens with a polished motion handoff.",
            "status": "interviewing",
            "applicant_count": 1,
            "shortlisted_count": 1,
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
                "cover_letter": "I can turn this landing page into a polished conversion flow.",
                "cv_filename": "mayssa-cv.pdf",
                "status": "pending",
                "created_at": now - timedelta(days=1, hours=2),
                "updated_at": now - timedelta(days=1, hours=2),
            },
            {
                "job_id": job_ids[1],
                "freelancer_id": user_ids["freelancer"],
                "full_name": "Mayssa Sayah",
                "cover_letter": "Strong fit for onboarding UX and component systems.",
                "cv_filename": "mayssa-cv.pdf",
                "status": "shortlisted",
                "created_at": now - timedelta(days=2),
                "updated_at": now - timedelta(days=1),
            },
        ]
    )

    gig_documents = [
        {
            "freelancer_id": user_ids["freelancer"],
            "title": "I will design a modern mobile UI",
            "category": "Design",
            "description": "Mobile UI package with flows, components, and Figma handoff.",
            "price": 150,
            "currency": "DT",
            "delivery": "3 days",
            "status": "approved",
            "rating": 4.9,
            "order_count": 1,
            "in_store": True,
            "allow_messaging": True,
            "created_at": now - timedelta(days=5),
            "updated_at": now - timedelta(days=1),
        },
        {
            "freelancer_id": user_ids["pending_freelancer"],
            "title": "I will build a Flask API with MongoDB",
            "category": "Development",
            "description": "REST API, auth, and dashboard setup for fast-moving MVPs.",
            "price": 320,
            "currency": "DT",
            "delivery": "7 days",
            "status": "pending",
            "rating": 4.8,
            "order_count": 0,
            "in_store": True,
            "allow_messaging": True,
            "created_at": now - timedelta(days=2),
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
            "description": "A complete UI kit for admin and marketplace dashboards.",
            "price": 60,
            "currency": "DT",
            "status": "approved",
            "rating": 4.9,
            "sales_count": 1,
            "created_at": now - timedelta(days=5),
            "updated_at": now - timedelta(days=1),
        },
        {
            "seller_id": user_ids["pending_freelancer"],
            "title": "API starter template",
            "category": "Templates",
            "description": "Starter structure for Flask services, repos, and blueprints.",
            "price": 45,
            "currency": "DT",
            "status": "pending",
            "rating": 4.7,
            "sales_count": 0,
            "created_at": now - timedelta(days=1),
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
                "title": "I will design a modern mobile UI",
                "client_id": user_ids["client"],
                "seller_id": user_ids["freelancer"],
                "message": "Need a fintech app redesign for launch week.",
                "price": 150,
                "currency": "DT",
                "delivery": "3 days",
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
                "message": "Instant digital purchase.",
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
                        "content": "Hi Mayssa, I loved your UI work. Are you available this week?",
                        "created_at": now - timedelta(hours=12),
                    },
                    {
                        "id": "seed-2",
                        "sender_id": user_ids["freelancer"],
                        "content": "Yes, I can start on the onboarding flow tomorrow morning.",
                        "created_at": now - timedelta(hours=11, minutes=30),
                    },
                ],
                "last_message": "Yes, I can start on the onboarding flow tomorrow morning.",
                "updated_at": now - timedelta(hours=11, minutes=30),
            }
        },
    )

    notifications.create_notification(
        user_ids["client"],
        "New application",
        "Mayssa applied to your fintech landing redesign brief.",
        kind="job",
        status="pending",
    )
    notifications.create_notification(
        user_ids["freelancer"],
        "Gig order in progress",
        "Mustapha purchased your mobile UI gig.",
        kind="order",
        status="approved",
    )
    notifications.create_notification(
        user_ids["admin"],
        "Pending approvals",
        "A new freelancer, gig, and product are waiting for review.",
        kind="admin",
        status="pending",
    )

    admin.create_report(
        user_ids["client"],
        {
            "target_type": "gig",
            "target_label": "Late response on gig delivery",
            "reason": "Seller has not replied in 24 hours.",
            "status": "pending",
        },
    )
    return True


def _ensure_indexes() -> None:
    users.ensure_indexes()
    jobs.ensure_indexes()
    gigs.ensure_indexes()
    products.ensure_indexes()
    orders.ensure_indexes()
    conversations.ensure_indexes()
    notifications.ensure_indexes()
    admin.ensure_indexes()
