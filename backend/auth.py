from flask import Blueprint, request, jsonify, current_app
from models import User, Product, History
from db import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt
)
from utils.roles import role_required
import datetime

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp.route("/register", methods=["POST"])
def register():
    """
    JSON: { "username": "...", "password": "...", "role": "manufacturer" }
    """
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "manufacturer")

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already exists"}), 400

    hashed = generate_password_hash(password)
    user = User(username=username, password_hash=hashed, role=role)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "user registered", "user": user.to_dict()}), 201

@bp.route("/login", methods=["POST"])
def login():
    """
    JSON: { "username": "...", "password": "..." }
    """
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "username": user.username,
            "role": user.role
        },
        expires_delta=datetime.timedelta(hours=12)
    )

    return jsonify({"access_token": access_token, "user": user.to_dict()}), 200

@bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """
    Get current user info from JWT
    """
    claims = get_jwt()
    return jsonify({
        "id": get_jwt_identity(),
        "username": claims.get("username"),
        "role": claims.get("role")
    }), 200

@bp.route("/users", methods=["GET"])
@jwt_required()
@role_required(["super_admin"])
def list_users():
    """
    Super admin: list all users (basic info).
    """
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@bp.route("/users/<username>", methods=["DELETE"])
@jwt_required()
@role_required(["super_admin"])
def delete_user(username):
    """
    Super admin can delete a user account.
    Optional query param: cascade=true -> also delete their products & histories.
    """
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "user not found"}), 404

    cascade = request.args.get("cascade", "false").lower() in ("1", "true", "yes")

    deleted_products = []
    if cascade:
        prods = Product.query.filter_by(owner=username).all()
        for p in prods:
            pid = p.product_id
            History.query.filter_by(product_id=pid).delete()
            db.session.delete(p)
            deleted_products.append(pid)

    db.session.delete(user)
    db.session.commit()

    bc = current_app.config.get("BLOCKCHAIN")
    if bc:
        actor = get_jwt().get("username")
        block = bc.add_block({
            "type": "delete_user",
            "deleted_user": username,
            "deleted_by": actor,
            "cascade_deleted_products": deleted_products
        })
        block_info = block.to_dict()
    else:
        block_info = None

    return jsonify({
        "message": f"user '{username}' deleted",
        "cascade": cascade,
        "deleted_products": deleted_products,
        "block": block_info
    }), 200