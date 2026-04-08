import logging
from flask import Flask

from app.extensions import db, migrate, cors
from app.errors import register_error_handlers
from app.routes import BLUEPRINTS
from config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Blueprints
    for bp in BLUEPRINTS:
        app.register_blueprint(bp)

    # Error handlers
    register_error_handlers(app)

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    return app
