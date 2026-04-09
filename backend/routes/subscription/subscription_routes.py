from flask import Blueprint, request, jsonify
from services.subscription_service import add_subscription

subscription_bp = Blueprint("subscription", __name__)

@subscription_bp.route("/api/subscribe", methods=["POST"])
def subscribe():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email required"}), 400

    result = add_subscription(email)

    if result:
        return jsonify({"message": "Subscribed"}), 201
    else:
        return jsonify({"error": "Already subscribed or failed"}), 400