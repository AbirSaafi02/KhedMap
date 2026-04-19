from flask import Blueprint, flash, g, redirect, render_template, request, url_for
from pymongo.errors import DuplicateKeyError

from app.repositories import admin, conversations, gigs, jobs, notifications, orders, products, users
from app.services.dashboard import (
    EMPLOYMENT_TYPES,
    GIG_CATEGORIES,
    JOB_CATEGORIES,
    PRODUCT_CATEGORIES,
    build_admin_dashboard,
    build_client_dashboard,
    build_freelancer_dashboard,
)
from app.services.emailing import send_account_status_email, send_pending_account_email
from app.services.seed import DEMO_PASSWORD
from app.utils.auth import login_required, login_user, logout_user, role_home_endpoint, role_required

web_bp = Blueprint("web", __name__)
REGISTRABLE_ROLES = {"freelancer", "client", "admin"}


def _normalize_role(value: str) -> str:
    return value if value in REGISTRABLE_ROLES else "freelancer"


def _normalize_specialties(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def _account_access_message(status: str) -> str:
    if status == "pending":
        return "Your account is pending admin approval."
    if status == "rejected":
        return "Your account has been rejected. Please contact an administrator."
    return "Your account is not allowed to sign in."


@web_bp.get("/")
def index():
    if g.current_user:
        return redirect(url_for("web.dashboard"))
    return render_template("index.html", demo_password=DEMO_PASSWORD)


@web_bp.route("/register", methods=["GET", "POST"])
def register():
    if g.current_user:
        return redirect(url_for("web.dashboard"))

    if request.method == "POST":
        role = _normalize_role(request.form.get("role", "freelancer"))

        payload = {
            "name": request.form.get("name", ""),
            "email": request.form.get("email", ""),
            "password": request.form.get("password", ""),
            "role": role,
            "phone": request.form.get("phone", ""),
            "title": request.form.get("title", ""),
            "bio": request.form.get("bio", ""),
            "specialties": _normalize_specialties(request.form.get("specialties", "")),
            "avatar_url": request.form.get("avatar_url", ""),
            "status": "pending",
        }

        if not payload["name"] or not payload["email"] or not payload["password"]:
            flash("Name, email, and password are required.", "error")
            return render_template("auth/register.html", job_categories=JOB_CATEGORIES)

        try:
            user = users.create_user(payload)
        except DuplicateKeyError:
            flash("That email already exists.", "error")
            return render_template("auth/register.html", job_categories=JOB_CATEGORIES)

        send_pending_account_email(user)
        flash("Account created. An admin must approve it before you can sign in.", "success")
        return redirect(url_for("web.login"))

    return render_template("auth/register.html", job_categories=JOB_CATEGORIES)


@web_bp.route("/login", methods=["GET", "POST"])
def login():
    if g.current_user:
        return redirect(url_for("web.dashboard"))

    if request.method == "POST":
        user = users.authenticate(
            request.form.get("email", ""),
            request.form.get("password", ""),
        )
        if not user:
            flash("Invalid email or password.", "error")
            return render_template("auth/login.html")
        if user.get("status") != "approved":
            flash(_account_access_message(user.get("status", "")), "error")
            return render_template("auth/login.html")

        login_user(user)
        flash(f"Welcome back, {user['name']}.", "success")
        return redirect(url_for("web.dashboard"))

    return render_template("auth/login.html")


@web_bp.post("/logout")
def logout():
    logout_user()
    flash("You are signed out.", "success")
    return redirect(url_for("web.login"))


@web_bp.get("/dashboard")
@login_required
def dashboard():
    return redirect(url_for(role_home_endpoint(g.current_user["role"])))


@web_bp.get("/dashboard/client")
@role_required("client")
def client_dashboard():
    dashboard_data = build_client_dashboard(g.current_user)
    return render_template(
        "dashboard/client.html",
        dashboard=dashboard_data,
        job_categories=JOB_CATEGORIES,
        employment_types=EMPLOYMENT_TYPES,
    )


@web_bp.get("/dashboard/freelancer")
@role_required("freelancer")
def freelancer_dashboard():
    dashboard_data = build_freelancer_dashboard(g.current_user)
    return render_template(
        "dashboard/freelancer.html",
        dashboard=dashboard_data,
        gig_categories=GIG_CATEGORIES,
        product_categories=PRODUCT_CATEGORIES,
    )


@web_bp.get("/dashboard/admin")
@role_required("admin")
def admin_dashboard():
    dashboard_data = build_admin_dashboard(g.current_user)
    return render_template("dashboard/admin.html", dashboard=dashboard_data)


@web_bp.post("/jobs/new")
@role_required("client")
def create_job():
    title = request.form.get("title", "").strip()
    if not title:
        flash("Job title is required.", "error")
        return redirect(url_for("web.client_dashboard"))

    jobs.create_job(
        g.current_user["id"],
        {
            "title": title,
            "category": request.form.get("category", "Design"),
            "employment_type": request.form.get("employment_type", "Freelance"),
            "budget": request.form.get("budget", "0"),
            "description": request.form.get("description", ""),
        },
    )
    notifications.create_notification(
        g.current_user["id"],
        "Job published",
        f"{title} is now live in your hiring dashboard.",
        kind="job",
        status="approved",
    )
    flash("Job published successfully.", "success")
    return redirect(url_for("web.client_dashboard"))


@web_bp.post("/jobs/<job_id>/apply")
@role_required("freelancer")
def apply_to_job(job_id: str):
    job = jobs.find_job_by_id(job_id)
    if not job:
        flash("Job not found.", "error")
        return redirect(url_for("web.freelancer_dashboard"))

    existing = jobs.find_application(job_id, g.current_user["id"])
    if existing:
        flash("You already applied to this job.", "error")
        return redirect(url_for("web.freelancer_dashboard"))

    jobs.create_application(
        job_id,
        g.current_user["id"],
        {
            "full_name": request.form.get("full_name", g.current_user["name"]),
            "cover_letter": request.form.get("cover_letter", ""),
            "cv_filename": request.form.get("cv_filename", ""),
        },
    )
    notifications.create_notification(
        job["client_id"],
        "New application",
        f"{g.current_user['name']} applied to {job['title']}.",
        kind="application",
        status="pending",
    )
    flash("Application sent.", "success")
    return redirect(url_for("web.freelancer_dashboard"))


@web_bp.post("/gigs/new")
@role_required("freelancer")
def create_gig():
    title = request.form.get("title", "").strip()
    if not title:
        flash("Gig title is required.", "error")
        return redirect(url_for("web.freelancer_dashboard"))

    gigs.create_gig(
        g.current_user["id"],
        {
            "title": title,
            "category": request.form.get("category", "Design"),
            "description": request.form.get("description", ""),
            "price": request.form.get("price", "0"),
            "delivery": request.form.get("delivery", "3 days"),
            "in_store": request.form.get("in_store") == "on",
            "allow_messaging": request.form.get("allow_messaging") == "on",
        },
    )
    flash("Gig submitted for admin review.", "success")
    return redirect(url_for("web.freelancer_dashboard"))


@web_bp.post("/products/new")
@role_required("freelancer")
def create_product():
    title = request.form.get("title", "").strip()
    if not title:
        flash("Product title is required.", "error")
        return redirect(url_for("web.freelancer_dashboard"))

    products.create_product(
        g.current_user["id"],
        {
            "title": title,
            "category": request.form.get("category", "Templates"),
            "description": request.form.get("description", ""),
            "price": request.form.get("price", "0"),
        },
    )
    flash("Store product submitted for admin review.", "success")
    return redirect(url_for("web.freelancer_dashboard"))


@web_bp.post("/gigs/<gig_id>/order")
@role_required("client")
def order_gig(gig_id: str):
    gig = gigs.find_gig_by_id(gig_id)
    if not gig or gig["status"] != "approved":
        flash("This gig is not available yet.", "error")
        return redirect(url_for("web.client_dashboard"))

    orders.create_order(
        {
            "source_type": "gig",
            "source_id": gig["id"],
            "title": gig["title"],
            "client_id": g.current_user["id"],
            "seller_id": gig["freelancer_id"],
            "message": request.form.get("message", "New gig order"),
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
    flash("Gig order created.", "success")
    return redirect(url_for("web.client_dashboard"))


@web_bp.post("/products/<product_id>/buy")
@role_required("client")
def buy_product(product_id: str):
    product = products.find_product_by_id(product_id)
    if not product or product["status"] != "approved":
        flash("This product is not available yet.", "error")
        return redirect(url_for("web.client_dashboard"))

    orders.create_order(
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
        "New product sale",
        f"{g.current_user['name']} bought {product['title']}.",
        kind="product",
        status="approved",
    )
    flash("Product purchased successfully.", "success")
    return redirect(url_for("web.client_dashboard"))


@web_bp.post("/orders/<order_id>/status")
@role_required("freelancer")
def update_order_status(order_id: str):
    status = request.form.get("status", "Pending")
    if status not in {"Pending", "In Progress", "Completed", "Refused"}:
        flash("Invalid order status.", "error")
        return redirect(url_for("web.freelancer_dashboard"))

    order = orders.update_order_status(order_id, status)
    if order:
        notifications.create_notification(
            order["client_id"],
            "Order status updated",
            f"{order['title']} is now {status}.",
            kind="order",
            status="approved" if status == "Completed" else "pending",
        )
        flash("Order updated.", "success")
    else:
        flash("Order not found.", "error")
    return redirect(url_for("web.freelancer_dashboard"))


@web_bp.route("/messages/<partner_id>", methods=["GET", "POST"])
@login_required
def conversation_detail(partner_id: str):
    partner = users.find_user_by_id(partner_id)
    if not partner:
        flash("Conversation partner not found.", "error")
        return redirect(url_for("web.dashboard"))

    conversation = conversations.get_or_create_conversation(g.current_user["id"], partner_id)
    if request.method == "POST":
        content = request.form.get("content", "").strip()
        if content:
            conversations.append_message(conversation["id"], g.current_user["id"], content)
            notifications.create_notification(
                partner_id,
                "New message",
                f"{g.current_user['name']} sent you a message.",
                kind="message",
                status="info",
            )
            flash("Message sent.", "success")
        return redirect(url_for("web.conversation_detail", partner_id=partner_id))

    refreshed_conversation = conversations.get_or_create_conversation(g.current_user["id"], partner_id)
    return render_template("conversations/detail.html", partner=partner, conversation=refreshed_conversation)


@web_bp.get("/notifications")
@login_required
def notification_center():
    recent_notifications = notifications.list_notifications_for_user(g.current_user["id"], limit=30)
    return render_template("notifications/index.html", notifications=recent_notifications)


@web_bp.post("/notifications/read-all")
@login_required
def mark_notifications_read():
    notifications.mark_all_as_read(g.current_user["id"])
    flash("Notifications marked as read.", "success")
    return redirect(url_for("web.notification_center"))


@web_bp.post("/reports")
@login_required
def create_report():
    reason = request.form.get("reason", "").strip()
    target_label = request.form.get("target_label", "").strip()
    if not reason:
        flash("Please provide a reason for the report.", "error")
        return redirect(url_for("web.dashboard"))

    admin.create_report(
        g.current_user["id"],
        {
            "target_type": request.form.get("target_type", "general"),
            "target_label": target_label,
            "reason": reason,
        },
    )
    flash("Report submitted to admin.", "success")
    return redirect(url_for("web.dashboard"))


@web_bp.post("/admin/review/<item_type>/<item_id>")
@role_required("admin")
def review_item(item_type: str, item_id: str):
    action = request.form.get("action", "approved")
    if item_type == "user":
        user = users.update_status(item_id, action)
        if user:
            send_account_status_email(user)
    elif item_type == "gig":
        gigs.update_status(item_id, action)
    elif item_type == "product":
        products.update_status(item_id, action)
    elif item_type == "report":
        admin.update_report_status(item_id, action)
    else:
        flash("Unsupported review item.", "error")
        return redirect(url_for("web.admin_dashboard"))

    flash("Review updated.", "success")
    return redirect(url_for("web.admin_dashboard"))
