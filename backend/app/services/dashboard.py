from app.repositories import admin, conversations, gigs, jobs, notifications, orders, products, users

JOB_CATEGORIES = ["Design", "Development", "Marketing", "Video Editing", "Translation", "DevOps"]
EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Freelance", "Internship"]
GIG_CATEGORIES = [
    "Design",
    "Development",
    "Marketing",
    "Video Editing",
    "Translation",
    "DevOps",
    "Content Writing",
    "Tech & AI",
]
PRODUCT_CATEGORIES = ["UI Kits", "Templates", "Logos", "Photos", "Videos"]
ORDER_STATUSES = ["Pending", "In Progress", "Completed", "Refused"]


def _user_map(user_ids: list[str]) -> dict:
    return {user["id"]: user for user in users.find_users_by_ids(user_ids)}


def _job_map(job_ids: list[str]) -> dict:
    return {job["id"]: job for job in jobs.find_jobs_by_ids(job_ids)}


def _decorate_conversations(items: list[dict], current_user_id: str) -> list[dict]:
    partner_ids = [
        next((participant for participant in item["participant_ids"] if participant != current_user_id), None)
        for item in items
    ]
    partner_map = _user_map([partner_id for partner_id in partner_ids if partner_id])

    decorated = []
    for item in items:
        partner_id = next(
            (participant for participant in item["participant_ids"] if participant != current_user_id),
            None,
        )
        item["partner"] = partner_map.get(partner_id)
        decorated.append(item)
    return decorated


def build_client_dashboard(current_user: dict) -> dict:
    client_jobs = jobs.list_jobs(client_id=current_user["id"], limit=12)
    approved_gigs = gigs.list_gigs(status="approved", limit=6)
    approved_products = products.list_products(status="approved", limit=6)
    recommended_freelancers = users.list_freelancers(limit=6)
    client_orders = orders.list_orders_for_client(current_user["id"], limit=8)
    recent_notifications = notifications.list_notifications_for_user(current_user["id"], limit=6)
    recent_conversations = conversations.list_conversations_for_user(current_user["id"], limit=6)

    user_ids = [item["freelancer_id"] for item in approved_gigs]
    user_ids.extend(item["seller_id"] for item in approved_products)
    user_ids.extend(item["seller_id"] for item in client_orders)
    user_map = _user_map(user_ids)

    for gig in approved_gigs:
        gig["owner"] = user_map.get(gig["freelancer_id"])
    for product in approved_products:
        product["seller"] = user_map.get(product["seller_id"])
    for order in client_orders:
        order["seller"] = user_map.get(order["seller_id"])

    return {
        "stats": {
            "active_jobs": len([job for job in client_jobs if job["status"] != "closed"]),
            "total_applicants": sum(job.get("applicant_count", 0) for job in client_jobs),
            "spend": sum(order.get("price", 0) for order in client_orders),
            "unread_notifications": notifications.count_unread(current_user["id"]),
        },
        "jobs": client_jobs,
        "gigs": approved_gigs,
        "products": approved_products,
        "freelancers": recommended_freelancers,
        "orders": client_orders,
        "notifications": recent_notifications,
        "conversations": _decorate_conversations(recent_conversations, current_user["id"]),
        "job_categories": JOB_CATEGORIES,
        "employment_types": EMPLOYMENT_TYPES,
    }


def build_freelancer_dashboard(current_user: dict) -> dict:
    open_jobs = jobs.list_jobs(status="open", limit=10)
    my_gigs = gigs.list_gigs(freelancer_id=current_user["id"], limit=12)
    my_products = products.list_products(seller_id=current_user["id"], limit=12)
    my_orders = orders.list_orders_for_seller(current_user["id"], limit=12)
    my_applications = jobs.list_applications_for_freelancer(current_user["id"], limit=12)
    recent_notifications = notifications.list_notifications_for_user(current_user["id"], limit=6)
    recent_conversations = conversations.list_conversations_for_user(current_user["id"], limit=6)

    job_map = _job_map([item["job_id"] for item in my_applications])
    client_ids = [job["client_id"] for job in open_jobs]
    client_ids.extend(order["client_id"] for order in my_orders)
    client_ids.extend(job_map[item["job_id"]]["client_id"] for item in my_applications if item["job_id"] in job_map)
    client_map = _user_map(client_ids)

    for job in open_jobs:
        job["client"] = client_map.get(job["client_id"])
    for order in my_orders:
        order["client"] = client_map.get(order["client_id"])
    for application in my_applications:
        related_job = job_map.get(application["job_id"])
        application["job"] = related_job
        application["client"] = client_map.get(related_job["client_id"]) if related_job else None

    return {
        "stats": {
            "active_gigs": len([gig for gig in my_gigs if gig["status"] == "approved"]),
            "submitted_applications": len(my_applications),
            "open_orders": len([order for order in my_orders if order["status"] in {"Pending", "In Progress"}]),
            "earnings": sum(order.get("price", 0) for order in my_orders if order["status"] == "Completed"),
        },
        "open_jobs": open_jobs,
        "gigs": my_gigs,
        "products": my_products,
        "orders": my_orders,
        "applications": my_applications,
        "notifications": recent_notifications,
        "conversations": _decorate_conversations(recent_conversations, current_user["id"]),
        "gig_categories": GIG_CATEGORIES,
        "product_categories": PRODUCT_CATEGORIES,
        "order_statuses": ORDER_STATUSES,
    }


def build_admin_dashboard(current_user: dict) -> dict:
    pending_accounts = users.list_users_by_status("pending", roles=("freelancer", "client"), limit=8)
    pending_gigs = gigs.list_gigs(status="pending", limit=8)
    pending_products = products.list_products(status="pending", limit=8)
    open_reports = admin.list_reports(status="pending", limit=8)
    recent_orders = orders.list_recent_orders(limit=8)
    recent_users = users.list_recent_users(limit=8)

    user_map = _user_map(
        [item["freelancer_id"] for item in pending_gigs]
        + [item["seller_id"] for item in pending_products]
        + [item["reporter_id"] for item in open_reports]
        + [item["client_id"] for item in recent_orders]
        + [item["seller_id"] for item in recent_orders]
    )

    for gig in pending_gigs:
        gig["owner"] = user_map.get(gig["freelancer_id"])
    for product in pending_products:
        product["seller"] = user_map.get(product["seller_id"])
    for report in open_reports:
        report["reporter"] = user_map.get(report["reporter_id"])
    for order in recent_orders:
        order["client"] = user_map.get(order["client_id"])
        order["seller"] = user_map.get(order["seller_id"])

    revenue = sum(order.get("price", 0) for order in recent_orders) * 0.15

    return {
        "stats": {
            "pending_accounts": len(pending_accounts),
            "pending_gigs": len(pending_gigs),
            "pending_products": len(pending_products),
            "open_reports": len(open_reports),
            "estimated_revenue": revenue,
        },
        "pending_accounts": pending_accounts,
        "pending_gigs": pending_gigs,
        "pending_products": pending_products,
        "reports": open_reports,
        "recent_orders": recent_orders,
        "recent_users": recent_users,
        "user_counts": users.count_by_role(),
    }
