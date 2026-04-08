import logging
from flask import jsonify
from marshmallow import ValidationError

logger = logging.getLogger(__name__)


def register_error_handlers(app):
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        logger.warning("Validation error: %s", error.messages)
        return jsonify({"error": "Validation failed", "details": error.messages}), 400

    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def handle_internal_error(error):
        logger.error("Internal server error: %s", error)
        return jsonify({"error": "Internal server error"}), 500
