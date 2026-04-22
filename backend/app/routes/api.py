from flask import Blueprint, g, jsonify, request
from pymongo.errors import DuplicateKeyError, PyMongoError

from app.extensions import get_db
from app.repositories import admin, conversations, gigs, jobs, notifications, orders, products, users
from app.services.dashboard import build_admin_dashboard, build_client_dashboard, build_freelancer_dashboard
from app.services.emailing import send_account_status_email, send_pending_account_email
from app.utils.auth import login_required, login_user, logout_user, role_required

api_bp = Blueprint("api", __name__)
REGISTRABLE_ROLES = {"freelancer", "client", "admin"}
APPLICATION_REVIEW_STATUSES = {"accepted", "rejected", "shortlisted"}
ORDER_STATUSES = {"Pending", "In Progress", "Completed", "Refused"}


def _payload() -> dict:
    return request.get_json(silent=True) or {}


def _normalize_role(value: str) -> str:
    return value if value in REGISTRABLE_ROLES else "freelancer"


def _normalize_specialties(value) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return []


def _account_access_message(status: str) -> str:
    if status == "pending":
        return "Your account is pending admin approval."
    if status == "rejected":
        return "Your account has been rejected. Please contact an administrator."
    return "Your account is not allowed to sign in."


def _user_map(user_ids: list[str]) -> dict[str, dict]:
    ids = [user_id for user_id in user_ids if user_id]
    return {user["id"]: user for user in users.find_users_by_ids(ids)}


def _decorate_jobs(items: list[dict]) -> list[dict]:
    client_map = _user_map([item.get("client_id", "") for item in items])
    decorated = []
    for item in items:
        prepared = dict(item)
        prepared["client"] = client_map.get(item.get("client_id"))
        decorated.append(prepared)
    return decorated


def _decorate_gigs(items: list[dict]) -> list[dict]:
    owner_map = _user_map([item.get("freelancer_id", "") for item in items])
    decorated = []
    for item in items:
        prepared = dict(item)
        prepared["owner"] = owner_map.get(item.get("freelancer_id"))
        decorated.append(prepared)
    return decorated


def _decorate_products(items: list[dict]) -> list[dict]:
    seller_map = _user_map([item.get("seller_id", "") for item in items])
    decorated = []
    for item in items:
        prepared = dict(item)
        prepared["seller"] = seller_map.get(item.get("seller_id"))
        decorated.append(prepared)
    return decorated


def _decorate_conversations(items: list[dict], current_user_id: str) -> list[dict]:
    partner_ids = [
        next((participant for participant in item.get("participant_ids", []) if participant != current_user_id), None)
        for item in items
    ]
    partner_map = _user_map([partner_id for partner_id in partner_ids if partner_id])

    decorated = []
    for item in items:
        prepared = dict(item)
        partner_id = next(
            (participant for participant in item.get("participant_ids", []) if participant != current_user_id),
            None,
        )
        prepared["partner"] = partner_map.get(partner_id)
        prepared["unread_count"] = conversations.unread_count(item, current_user_id)
        decorated.append(prepared)
    return decorated


def _decorate_applications(items: list[dict]) -> list[dict]:
    freelancer_map = _user_map([item.get("freelancer_id", "") for item in items])
    job_map = {job["id"]: job for job in jobs.find_jobs_by_ids([item.get("job_id", "") for item in items])}
    client_map = _user_map([job.get("client_id", "") for job in job_map.values()])

    decorated = []
    for item in items:
        prepared = dict(item)
        prepared["freelancer"] = freelancer_map.get(item.get("freelancer_id"))

        related_job = job_map.get(item.get("job_id"))
        if related_job:
            prepared_job = dict(related_job)
            prepared_job["client"] = client_map.get(related_job.get("client_id"))
            prepared["job"] = prepared_job
        else:
            prepared["job"] = None

        decorated.append(prepared)
    return decorated


@api_bp.get("/health")
def health():
    db = get_db()
    payload = {
        "service": "khedmap-backend",
        "status": "ok",
        "database": {
            "name": db.name,
            "status": "ok",
        },
    }

    try:
        db.command("ping")
    except PyMongoError as exc:
        payload["status"] = "degraded"
        payload["database"]["status"] = "unavailable"
        payload["database"]["error"] = str(exc)
        return jsonify(payload), 503

    return jsonify(payload)


@api_bp.post("/auth/register")
def api_register():
    payload = _payload()
    if not payload.get("name") or not payload.get("email") or not payload.get("password"):
        return jsonify({"error": "name, email, and password are required"}), 400

    role = _normalize_role(payload.get("role", "freelancer"))

    try:
        user = users.create_user(
            {
                "name": payload["name"],
                "email": payload["email"],
                "password": payload["password"],
                "role": role,
                "phone": payload.get("phone", ""),
                "title": payload.get("title", ""),
                "bio": payload.get("bio", ""),
                "specialties": _normalize_specialties(payload.get("specialties", [])),
                "avatar_url": payload.get("avatar_url", ""),
                "status": "pending",
            }
        )
    except DuplicateKeyError:
        return jsonify({"error": "Email already exists"}), 409

    send_pending_account_email(user)

    return (
        jsonify(
            {
                "data": {
                    "user": user,
                    "requires_approval": True,
                    "message": "Account created. An admin must approve it before you can sign in.",
                }
            }
        ),
        201,
    )


@api_bp.post("/auth/login")
def api_login():
    payload = _payload()
    user = users.authenticate(payload.get("email", ""), payload.get("password", ""))
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
    if user.get("status") != "approved":
        return jsonify({"error": _account_access_message(user.get("status", ""))}), 403

    login_user(user)
    return jsonify({"data": user})


@api_bp.post("/auth/logout")
def api_logout():
    logout_user()
    return jsonify({"data": {"ok": True}})


@api_bp.get("/me")
@login_required
def api_me():
    return jsonify({"data": g.current_user})


@api_bp.patch("/me")
@login_required
def api_update_me():
    payload = _payload()
    user = users.update_user_profile(g.current_user["id"], payload)
    return jsonify({"data": user})


@api_bp.get("/freelancers")
@login_required
def api_freelancers():
    return jsonify({"data": users.list_freelancers(limit=20)})


@api_bp.get("/freelancers/<freelancer_id>")
@login_required
def api_freelancer_detail(freelancer_id: str):
    user = users.find_user_by_id(freelancer_id)
    if not user or user.get("role") != "freelancer":
        return jsonify({"error": "Freelancer not found"}), 404
    return jsonify({"data": user})


@api_bp.get("/jobs")
@login_required
def api_jobs():
    status = request.args.get("status")
    client_id = request.args.get("client_id")
    data = jobs.list_jobs(status=status, client_id=client_id, limit=30)
    return jsonify({"data": _decorate_jobs(data)})


@api_bp.get("/jobs/<job_id>")
@login_required
def api_job_detail(job_id: str):
    job = jobs.find_job_by_id(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify({"data": _decorate_jobs([job])[0]})


@api_bp.post("/jobs")
@role_required("client")
def api_create_job():
    payload = _payload()
    if not payload.get("title"):
        return jsonify({"error": "title is required"}), 400

    job = jobs.create_job(g.current_user["id"], payload)
    return jsonify({"data": job}), 201


@api_bp.post("/jobs/<job_id>/apply")
@role_required("freelancer")
def api_apply_job(job_id: str):
    job = jobs.find_job_by_id(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    if job.get("status") == "closed":
        return jsonify({"error": "This job is closed"}), 409
    if jobs.find_application(job_id, g.current_user["id"]):
        return jsonify({"error": "Application already exists"}), 409

    application = jobs.create_application(job_id, g.current_user["id"], _payload())
    notifications.create_notification(
        job["client_id"],
        "New application received",
        f"{g.current_user['name']} applied to {job['title']}.",
        kind="application",
        status="pending",
    )
    return jsonify({"data": application}), 201


@api_bp.get("/jobs/<job_id>/applications")
@login_required
def api_job_applications(job_id: str):
    job = jobs.find_job_by_id(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    if g.current_user["role"] != "admin" and job.get("client_id") != g.current_user["id"]:
        return jsonify({"error": "Forbidden"}), 403

    applications = jobs.list_applications_for_job(job_id, limit=50)
    return jsonify({"data": _decorate_applications(applications)})


@api_bp.patch("/applications/<application_id>")
@login_required
def api_update_application(application_id: str):
    payload = _payload()
    status = str(payload.get("status", "")).strip().lower()
    if status not in APPLICATION_REVIEW_STATUSES:
        return jsonify({"error": "Unsupported application status"}), 400

    application = jobs.find_application_by_id(application_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    job = jobs.find_job_by_id(application["job_id"])
    if not job:
        return jsonify({"error": "Job not found"}), 404
    if g.current_user["role"] != "admin" and job.get("client_id") != g.current_user["id"]:
        return jsonify({"error": "Forbidden"}), 403

    updated = jobs.update_application_status(application_id, status)
    if not updated:
        return jsonify({"error": "Application not found"}), 404

    title_status = "accepted" if status in {"accepted", "shortlisted"} else "rejected"
    notifications.create_notification(
        updated["freelancer_id"],
        f"Application {title_status}",
        f"Your application for {job['title']} was {title_status} by {g.current_user['name']}.",
        kind="application",
        status="approved" if title_status == "accepted" else "rejected",
    )
    return jsonify({"data": _decorate_applications([updated])[0]})


@api_bp.get("/gigs")
@login_required
def api_gigs():
    status = request.args.get("status")
    freelancer_id = request.args.get("freelancer_id")
    data = gigs.list_gigs(status=status, freelancer_id=freelancer_id, limit=30)
    return jsonify({"data": _decorate_gigs(data)})


@api_bp.get("/gigs/<gig_id>")
@login_required
def api_gig_detail(gig_id: str):
    gig = gigs.find_gig_by_id(gig_id)
    if not gig:
        return jsonify({"error": "Gig not found"}), 404
    return jsonify({"data": _decorate_gigs([gig])[0]})


@api_bp.post("/gigs")
@role_required("freelancer")
def api_create_gig():
    payload = _payload()
    if not payload.get("title"):
        return jsonify({"error": "title is required"}), 400

    gig = gigs.create_gig(g.current_user["id"], payload)
    return jsonify({"data": gig}), 201


@api_bp.post("/gigs/<gig_id>/order")
@role_required("client")
def api_order_gig(gig_id: str):
    gig = gigs.find_gig_by_id(gig_id)
    if not gig:
        return jsonify({"error": "Gig not found"}), 404
    if gig["status"] != "approved":
        return jsonify({"error": "Gig is not approved yet"}), 409

    payload = _payload()
    order = orders.create_order(
        {
            "source_type": "gig",
            "source_id": gig["id"],
            "title": gig["title"],
            "client_id": g.current_user["id"],
            "seller_id": gig["freelancer_id"],
            "message": payload.get("message", "New gig order"),
            "price": gig["price"],
            "currency": gig["currency"],
            "delivery": gig["delivery"],
            "status": "Pending",
        }
    )
    gigs.increment_order_count(gig["id"])
    notifications.create_notification(
        gig["freelancer_id"],
        "New gig order",
        f"{g.current_user['name']} ordered {gig['title']}.",
        kind="order",
        status="pending",
    )
    return jsonify({"data": order}), 201


@api_bp.get("/products")
@login_required
def api_products():
    status = request.args.get("status")
    seller_id = request.args.get("seller_id")
    data = products.list_products(status=status, seller_id=seller_id, limit=30)
    return jsonify({"data": _decorate_products(data)})


@api_bp.get("/products/<product_id>")
@login_required
def api_product_detail(product_id: str):
    product = products.find_product_by_id(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({"data": _decorate_products([product])[0]})


@api_bp.post("/products")
@role_required("freelancer")
def api_create_product():
    payload = _payload()
    if not payload.get("title"):
        return jsonify({"error": "title is required"}), 400

    product = products.create_product(g.current_user["id"], payload)
    return jsonify({"data": product}), 201


@api_bp.post("/products/<product_id>/buy")
@role_required("client")
def api_buy_product(product_id: str):
    product = products.find_product_by_id(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    if product["status"] != "approved":
        return jsonify({"error": "Product is not approved yet"}), 409

    order = orders.create_order(
        {
            "source_type": "product",
            "source_id": product["id"],
            "title": product["title"],
            "client_id": g.current_user["id"],
            "seller_id": product["seller_id"],
            "message": "Instant digital purchase",
            "price": product["price"],
            "currency": product["currency"],
            "delivery": "Instant",
            "status": "Completed",
        }
    )
    products.increment_sales_count(product["id"])
    notifications.create_notification(
        product["seller_id"],
        "New store purchase",
        f"{g.current_user['name']} bought {product['title']}.",
        kind="order",
        status="approved",
    )
    return jsonify({"data": order}), 201


@api_bp.get("/orders")
@login_required
def api_orders():
    if g.current_user["role"] == "freelancer":
        data = orders.list_orders_for_seller(g.current_user["id"], limit=30)
    else:
        data = orders.list_orders_for_client(g.current_user["id"], limit=30)
    return jsonify({"data": data})


@api_bp.patch("/orders/<order_id>")
@role_required("freelancer")
def api_update_order(order_id: str):
    payload = _payload()
    status = str(payload.get("status", "")).strip()
    if not status:
        return jsonify({"error": "status is required"}), 400
    if status not in ORDER_STATUSES:
        return jsonify({"error": "Unsupported order status"}), 400

    order = orders.update_order_status(order_id, status)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    notifications.create_notification(
        order["client_id"],
        "Order status updated",
        f"{order['title']} is now {status}.",
        kind="order",
        status="approved" if status == "Completed" else "rejected" if status == "Refused" else "pending",
    )
    return jsonify({"data": order})


@api_bp.get("/conversations")
@login_required
def api_conversations():
    data = conversations.list_conversations_for_user(g.current_user["id"], limit=20)
    return jsonify({"data": _decorate_conversations(data, g.current_user["id"])})


@api_bp.get("/conversations/<partner_id>")
@login_required
def api_conversation_detail(partner_id: str):
    conversation = conversations.get_or_create_conversation(g.current_user["id"], partner_id)
    conversation = conversations.mark_conversation_read(conversation["id"], g.current_user["id"]) or conversation
    return jsonify({"data": _decorate_conversations([conversation], g.current_user["id"])[0]})


@api_bp.post("/conversations/<partner_id>/messages")
@login_required
def api_send_message(partner_id: str):
    payload = _payload()
    if not payload.get("content"):
        return jsonify({"error": "content is required"}), 400

    conversation = conversations.get_or_create_conversation(g.current_user["id"], partner_id)
    conversation = conversations.append_message(conversation["id"], g.current_user["id"], payload["content"])
    notifications.create_notification(
        partner_id,
        "New message",
        f"{g.current_user['name']} sent you a message.",
        kind="message",
        status="info",
    )
    return jsonify({"data": _decorate_conversations([conversation], g.current_user["id"])[0]})


@api_bp.get("/notifications")
@login_required
def api_notifications():
    return jsonify({"data": notifications.list_notifications_for_user(g.current_user["id"], limit=30)})


@api_bp.post("/notifications/mark-read")
@login_required
def api_mark_notifications_read():
    notifications.mark_all_as_read(g.current_user["id"])
    return jsonify({"data": {"ok": True}})


@api_bp.post("/reports")
@login_required
def api_create_report():
    payload = _payload()
    if not payload.get("reason"):
        return jsonify({"error": "reason is required"}), 400
    report = admin.create_report(g.current_user["id"], payload)
    return jsonify({"data": report}), 201


@api_bp.get("/dashboard")
@login_required
def api_dashboard():
    role = g.current_user["role"]
    if role == "client":
        data = build_client_dashboard(g.current_user)
    elif role == "freelancer":
        data = build_freelancer_dashboard(g.current_user)
    else:
        data = build_admin_dashboard(g.current_user)
    return jsonify({"data": data})


@api_bp.get("/admin/overview")
@role_required("admin")
def api_admin_overview():
    return jsonify({"data": build_admin_dashboard(g.current_user)})


@api_bp.post("/admin/review/<item_type>/<item_id>")
@role_required("admin")
def api_admin_review(item_type: str, item_id: str):
    payload = _payload()
    status = payload.get("status", "approved")

    if item_type == "user":
        data = users.update_status(item_id, status)
        if data:
            send_account_status_email(data)
            notifications.create_notification(
                data["id"],
                f"Account {status}",
                f"Your KhedMap account has been {status}.",
                kind="account",
                status="approved" if status == "approved" else "rejected",
            )
    elif item_type == "gig":
        data = gigs.update_status(item_id, status)
        if data:
            notifications.create_notification(
                data["freelancer_id"],
                f"Gig {status}",
                f"Your gig \"{data['title']}\" was {status} by the admin team.",
                kind="gig",
                status="approved" if status == "approved" else "rejected",
            )
    elif item_type == "product":
        data = products.update_status(item_id, status)
        if data:
            notifications.create_notification(
                data["seller_id"],
                f"Store item {status}",
                f"Your product \"{data['title']}\" was {status} by the admin team.",
                kind="product",
                status="approved" if status == "approved" else "rejected",
            )
    elif item_type == "report":
        data = admin.update_report_status(item_id, status)
    else:
        return jsonify({"error": "Unsupported item type"}), 400

    return jsonify({"data": data})
