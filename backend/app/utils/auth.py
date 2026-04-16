from functools import wraps

from flask import flash, g, jsonify, redirect, request, session, url_for


def wants_json_response() -> bool:
    return request.path.startswith("/api/") or request.accept_mimetypes.best == "application/json"


def login_user(user: dict) -> None:
    session["user_id"] = user["id"]
    session["role"] = user["role"]


def logout_user() -> None:
    session.pop("user_id", None)
    session.pop("role", None)


def role_home_endpoint(role: str) -> str:
    mapping = {
        "client": "web.client_dashboard",
        "freelancer": "web.freelancer_dashboard",
        "admin": "web.admin_dashboard",
    }
    return mapping.get(role, "web.index")


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if g.current_user:
            return view(*args, **kwargs)

        if wants_json_response():
            return jsonify({"error": "Authentication required"}), 401

        flash("Please log in to continue.", "error")
        return redirect(url_for("web.login"))

    return wrapped


def role_required(*roles: str):
    def decorator(view):
        @wraps(view)
        @login_required
        def wrapped(*args, **kwargs):
            if g.current_user and g.current_user["role"] in roles:
                return view(*args, **kwargs)

            if wants_json_response():
                return jsonify({"error": "Forbidden"}), 403

            flash("You do not have access to that page.", "error")
            return redirect(url_for(role_home_endpoint(g.current_user["role"])))

        return wrapped

    return decorator
