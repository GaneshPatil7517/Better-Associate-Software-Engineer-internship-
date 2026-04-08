from marshmallow import Schema, fields, validate, validates, ValidationError


class CategorySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=50),
    )
    created_at = fields.DateTime(dump_only=True)


class ExpenseSchema(Schema):
    id = fields.Int(dump_only=True)
    description = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=200),
    )
    amount = fields.Float(required=True)
    date = fields.Date(required=True)
    category_id = fields.Int(required=True)
    category_name = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

    @validates("amount")
    def validate_amount(self, value):
        if value <= 0:
            raise ValidationError("Amount must be greater than zero.")
        if value > 1_000_000:
            raise ValidationError("Amount cannot exceed 1,000,000.")


class ExpenseFilterSchema(Schema):
    category_id = fields.Int()
    start_date = fields.Date()
    end_date = fields.Date()
    page = fields.Int(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Int(load_default=20, validate=validate.Range(min=1, max=100))
