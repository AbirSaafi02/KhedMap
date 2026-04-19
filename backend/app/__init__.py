from flask import Flask, g, session
from flask_cors import CORS
from pymongo.errors import PyMongoError

from app.config import Config
from app.extensions import init_extensions
from app.repositories import users
from app.routes.api import api_bp
from app.routes.web import web_bp
from app.services.seed import ensure_seed_data
from app.utils.formatting import friendly_date, format_money


def create_app() -> Flask:
    app = Flask(__name__, template_folder="../templates", static_folder="../static")
    app.config.from_object(Config)

    init_extensions(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    @app.before_request
    def load_current_user() -> None:
        user_id = session.get("user_id")
        g.current_user = users.find_user_by_id(user_id) if user_id else None
        if g.current_user and g.current_user.get("status") != "approved":
            session.pop("user_id", None)
            session.pop("role", None)
            g.current_user = None

    app.register_blueprint(web_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    app.jinja_env.filters["money"] = format_money
    app.jinja_env.filters["friendly_date"] = friendly_date

    @app.context_processor
    def inject_globals() -> dict:
        return {"current_user": getattr(g, "current_user", None)}

    @app.cli.command("seed-demo")
    def seed_demo_command() -> None:
        created = ensure_seed_data()
        print("Seeded demo data." if created else "Demo data already present.")

    if app.config["AUTO_SEED"]:
        with app.app_context():
            try:
                ensure_seed_data()
            except PyMongoError:
                app.logger.warning("MongoDB is unavailable; skipping automatic demo seed.")

    return app
