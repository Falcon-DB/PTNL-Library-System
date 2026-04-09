from flask import Blueprint, request, jsonify
from services.feedback_service import submit_feedback

feedback_bp = Blueprint("feedback", __name__)

@feedback_bp.route("/api/feedback", methods=["POST"])
def handle_feedback():
    try:
        data = request.get_json()

        user_id = data.get("user_id")
        rating = data.get("rating")
        comment = data.get("comment")

        # 🔥 VALIDATION
        if not user_id or not rating:
            return jsonify({"error": "User ID and rating are required"}), 400

        # 🔥 CALL SERVICE
        result = submit_feedback(user_id, rating, comment)

        if result:
            return jsonify({"message": "Feedback submitted successfully"}), 200
        else:
            return jsonify({"error": "Failed to submit feedback"}), 500

    except Exception as e:
        print("Route Error:", e)
        return jsonify({"error": "Server error"}), 500