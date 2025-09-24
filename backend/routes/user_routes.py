from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models import User
from utils.roles import role_required

bp = Blueprint("users", __name__, url_prefix="/api/users")

@bp.route("/list_by_role", methods=["GET"])
@jwt_required()
@role_required(["manufacturer", "distributor", "retailer", "super_admin"])
def list_users_by_role():
    """
    Returns a list of users filtered by a specific role.
    Example Usage: GET /api/users/list_by_role?role=distributor
    """
    role = request.args.get("role")
    if not role:
        return jsonify({"error": "Role query parameter is required"}), 400

    users = User.query.filter_by(role=role).all()
    user_list = [{"username": user.username} for user in users]
    return jsonify(user_list), 200