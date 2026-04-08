from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from app.extensions import db
from app.models import Expense, Category
from app.schemas import ExpenseSchema, ExpenseFilterSchema

bp = Blueprint("expenses", __name__, url_prefix="/api/expenses")
schema = ExpenseSchema()
filter_schema = ExpenseFilterSchema()


@bp.route("", methods=["GET"])
def list_expenses():
    filters = filter_schema.load(request.args)
    query = Expense.query

    if "category_id" in filters:
        query = query.filter_by(category_id=filters["category_id"])
    if "start_date" in filters:
        query = query.filter(Expense.date >= filters["start_date"])
    if "end_date" in filters:
        query = query.filter(Expense.date <= filters["end_date"])

    page = filters["page"]
    per_page = filters["per_page"]
    pagination = query.order_by(Expense.date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "items": schema.dump(pagination.items, many=True),
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }
    )


@bp.route("", methods=["POST"])
def create_expense():
    data = schema.load(request.get_json())

    if not db.session.get(Category, data["category_id"]):
        return jsonify({"error": "Category not found"}), 400

    expense = Expense(
        description=data["description"],
        amount=data["amount"],
        date=data["date"],
        category_id=data["category_id"],
    )
    db.session.add(expense)
    db.session.commit()
    return jsonify(schema.dump(expense)), 201


@bp.route("/<int:expense_id>", methods=["GET"])
def get_expense(expense_id):
    expense = db.session.get(Expense, expense_id)
    if not expense:
        return jsonify({"error": "Expense not found"}), 404
    return jsonify(schema.dump(expense))


@bp.route("/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):
    expense = db.session.get(Expense, expense_id)
    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    data = schema.load(request.get_json())

    if not db.session.get(Category, data["category_id"]):
        return jsonify({"error": "Category not found"}), 400

    expense.description = data["description"]
    expense.amount = data["amount"]
    expense.date = data["date"]
    expense.category_id = data["category_id"]
    db.session.commit()
    return jsonify(schema.dump(expense))


@bp.route("/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    expense = db.session.get(Expense, expense_id)
    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    db.session.delete(expense)
    db.session.commit()
    return "", 204


@bp.route("/summary", methods=["GET"])
def expense_summary():
    """Returns total spending grouped by category."""
    filters = filter_schema.load(request.args)
    query = db.session.query(
        Category.name, db.func.sum(Expense.amount).label("total")
    ).join(Expense)

    if "start_date" in filters:
        query = query.filter(Expense.date >= filters["start_date"])
    if "end_date" in filters:
        query = query.filter(Expense.date <= filters["end_date"])

    results = query.group_by(Category.name).all()
    return jsonify(
        {
            "by_category": [
                {"category": name, "total": round(total, 2)}
                for name, total in results
            ],
            "grand_total": round(sum(t for _, t in results), 2),
        }
    )
