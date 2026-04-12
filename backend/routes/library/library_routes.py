from flask import Blueprint, request, jsonify
from services.library_service import get_overdue_books
from services.library_service import get_user_books

library_bp = Blueprint("library", __name__)

# MY BOOKS
@library_bp.route("/api/my-books", methods=["GET"])
def my_books():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    result = get_user_books(user_id)

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)

# OVERDUE BOOKS
@library_bp.route("/api/due-books", methods=["GET"])
def due_books():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    result = get_overdue_books(user_id)

    if "error" in result:
        return jsonify(result), 500

    return jsonify(result)