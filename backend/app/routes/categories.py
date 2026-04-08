from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from app.extensions import db
from app.models import Category
from app.schemas import CategorySchema

bp = Blueprint("categories", __name__, url_prefix="/api/categories")
schema = CategorySchema()


@bp.route("", methods=["GET"])
def list_categories():
    categories = Category.query.order_by(Category.name).all()
    return jsonify(schema.dump(categories, many=True))


@bp.route("", methods=["POST"])
def create_category():
    data = schema.load(request.get_json())
    if Category.query.filter_by(name=data["name"]).first():
        return jsonify({"error": "Category already exists"}), 409

    category = Category(name=data["name"])
    db.session.add(category)
    db.session.commit()
    return jsonify(schema.dump(category)), 201


@bp.route("/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404

    db.session.delete(category)
    db.session.commit()
    return "", 204
