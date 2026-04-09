from flask import Blueprint, request, jsonify
from services.query_service import create_query

query_bp = Blueprint("query", __name__)

@query_bp.route("/api/query", methods=["POST"])
def submit_query():
    data = request.get_json()

    user_id = data.get("user_id")
    message = data.get("message")

    if not user_id or not message:
        return jsonify({"error": "Missing data"}), 400

    result = create_query(user_id, message)

    if result:
        return jsonify({"message": "Query submitted"}), 201
    else:
        return jsonify({"error": "Failed"}), 500