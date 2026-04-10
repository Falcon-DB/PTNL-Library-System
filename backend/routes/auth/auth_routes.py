from flask import Blueprint, request, jsonify
from services.auth_service import create_user, login_user

auth_bp = Blueprint("auth", __name__)


#SIGNUP
@auth_bp.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.json

    user = create_user(data)

    if user:
        return jsonify({"success": True}), 201

    return jsonify({"error": "Signup failed"}), 400


#LOGIN
@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json

    user = login_user(data["email"], data["password"])

    if user:
        return jsonify(user), 200

    return jsonify({"error": "Invalid credentials"}), 401