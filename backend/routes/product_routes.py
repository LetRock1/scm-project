from flask import Blueprint, request, jsonify, current_app, send_file, Response
from flask_jwt_extended import jwt_required, get_jwt
from db import db
from models import Product, History, User 
from utils.helpers import gen_product_id, now_ts
from utils.roles import role_required
import qrcode
import io
import base64
import csv
from sqlalchemy import desc, asc, or_, and_

bp = Blueprint("products", __name__, url_prefix="/api/products")

STATUS_ORDER = [
    "Created", "ReadyForShipping", "Shipped", "InTransit", 
    "DeliveredToRetailer", "AvailableForSale", "Sold", "Recalled"
]
ROLE_ALLOWED = {
    "manufacturer": ["Created", "ReadyForShipping"],
    "distributor": ["Shipped", "InTransit", "DeliveredToRetailer"],
    "retailer": ["AvailableForSale", "Sold"]
}
NEXT_ROLE_MAP = {
    "ReadyForShipping": "distributor",
    "DeliveredToRetailer": "retailer",
}
DISTRIBUTOR_SEQUENCE_MAP = {
    "InTransit": "Shipped",
    "DeliveredToRetailer": "InTransit" 
}

def status_index(s):
    try: return STATUS_ORDER.index(s)
    except ValueError: return None

@bp.route("/", methods=["POST"])
@jwt_required()
@role_required(["manufacturer"])
def create_product():
    """ Creates a new product, setting the creator as both owner and initial custodian. """
    claims = get_jwt()
    actor = claims.get("username")
    data = request.json or {}
    name = data.get("name")
    if not name: return jsonify({"error": "Product name is required"}), 400

    pid = gen_product_id()
    
    product = Product(
        product_id=pid, name=name, owner=actor, custodian=actor, 
        description=data.get("description", "")
    )
    db.session.add(product)

    # Capture location if provided on create
    lat, lon = data.get("latitude"), data.get("longitude")
    hist = History(product_id=pid, status="Created", by_who=actor, timestamp=now_ts(), latitude=lat, longitude=lon)
    db.session.add(hist)
    db.session.commit()

    bc = current_app.config["BLOCKCHAIN"]
    block = bc.add_block({
        "type": "create_product", "product_id": pid, "action": "Product Created",
        "owner": actor, "initial_custodian": actor,
        "location": f"{lat},{lon}" if lat is not None else "N/A"
    })

    # Build absolute QR target to frontend public verify page
    base_url = current_app.config.get("FRONTEND_PUBLIC_BASE_URL")
    if not base_url:
      # derive from request host if not set (works on LAN too)
      scheme = request.headers.get('X-Forwarded-Proto', request.scheme)
      host = request.headers.get('X-Forwarded-Host', request.host)
      base_url = f"{scheme}://{host}"
    # Pass backend base to frontend via query param to ensure phone uses correct API host
    backend_base = current_app.config.get("BACKEND_PUBLIC_BASE_URL") or base_url
    qr_data = f"{base_url}/verify/{pid}?api_base_url={backend_base}"
    img = qrcode.make(qr_data)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return jsonify({
        "message": "Product created successfully", "product": product.to_dict(),
        "block": block.to_dict(), "qr_code_base64": qr_b64,
        "qr_url": f"{backend_base}/api/products/{pid}/qrcode", "history_url": f"{backend_base}/api/products/{pid}/history",
        "public_verify_url": f"{base_url}/verify/{pid}?api_base_url={backend_base}"
    }), 201

@bp.route("/update", methods=["POST"])
@jwt_required()
@role_required(["manufacturer", "distributor", "retailer"])
def explicit_custody_transfer():
    """ Updates status and performs custody transfer, now with strict sequence validation. """
    claims, actor, role = get_jwt(), get_jwt().get("username"), get_jwt().get("role")
    data = request.json or {}
    pid, new_status, transfer_to, lat, lon = data.get("product_id"), data.get("status"), data.get("transfer_to_username"), data.get("latitude"), data.get("longitude")

    if not pid or not new_status: return jsonify({"error": "product_id and status are required"}), 400
    p = Product.query.filter_by(product_id=pid).first()
    if not p: return jsonify({"error": "Product not found"}), 404

    if p.custodian != actor and role != "super_admin": return jsonify({"error": f"Action failed: You are not the current custodian ('{p.custodian}')"}), 403
    if new_status not in ROLE_ALLOWED.get(role, []): return jsonify({"error": f"Your role '{role}' cannot set status '{new_status}'"}), 403
    if status_index(new_status) <= status_index(p.current_status): return jsonify({"error": f"Invalid transition from '{p.current_status}' to '{new_status}'"}), 403

    if role == "distributor" and new_status in DISTRIBUTOR_SEQUENCE_MAP:
        required_previous_status = DISTRIBUTOR_SEQUENCE_MAP[new_status]
        if p.current_status != required_previous_status:
            return jsonify({"error": f"Invalid sequence: To set status to '{new_status}', product must first be in '{required_previous_status}' status."}), 403

    new_custodian = actor
    if new_status in NEXT_ROLE_MAP:
        if not transfer_to: return jsonify({"error": f"'transfer_to_username' is required for status '{new_status}'"}), 400
        recipient = User.query.filter_by(username=transfer_to).first()
        if not recipient: return jsonify({"error": f"Recipient '{transfer_to}' not found"}), 404
        expected_role = NEXT_ROLE_MAP[new_status]
        if recipient.role != expected_role: return jsonify({"error": f"Can only transfer to '{expected_role}', but '{recipient.username}' is a '{recipient.role}'"}), 400
        new_custodian = recipient.username
    
    p.custodian = new_custodian
    p.current_status = new_status
    hist = History(product_id=pid, status=new_status, by_who=actor, latitude=lat, longitude=lon)
    db.session.add(hist)
    db.session.commit()

    block_info = None
    try:
        bc = current_app.config["BLOCKCHAIN"]
        block = bc.add_block({
            "type": "custody_transfer" if new_status in NEXT_ROLE_MAP else "status_update", 
            "product_id": pid, "status": new_status,
            "actor": actor, "new_custodian": new_custodian, 
            "location": f"{lat},{lon}" if lat is not None else "N/A"
        })
        block_info = block.to_dict()
    except Exception as e: print(f"BLOCKCHAIN_FAILURE: {e}")

    return jsonify({"message": "Update successful", "product": p.to_dict(), "block": block_info}), 200

@bp.route("/<product_id>", methods=["GET"])
@jwt_required(optional=True)
def get_product(product_id):
    p = Product.query.filter_by(product_id=product_id).first()
    if not p: return jsonify({"error": "not found"}), 404
    return jsonify(p.to_dict()), 200

@bp.route("/", methods=["GET"])
@jwt_required()
def list_products():
    page, per_page = int(request.args.get("page", 1)), int(request.args.get("per_page", 10))
    status = request.args.get("status")
    owner = request.args.get("owner")
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    sort = request.args.get("sort", "created_at:desc")

    query = Product.query
    claims = get_jwt()
    if claims.get("role") != "super_admin":
        query = query.filter(or_(Product.custodian == claims.get("username"), Product.owner == claims.get("username")))
    
    if status: query = query.filter_by(current_status=status)
    if owner: query = query.filter_by(owner=owner)
    if from_date and to_date: query = query.filter(and_(Product.created_at >= from_date, Product.created_at <= to_date))
    
    field, direction = sort.split(":") if ":" in sort else (sort, "asc")
    if hasattr(Product, field):
        col = getattr(Product, field)
        query = query.order_by(desc(col) if direction == "desc" else asc(col))

    items = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "page": page, "per_page": per_page, "total": items.total,
        "products": [p.to_dict() for p in items.items]
    }), 200

@bp.route("/search", methods=["GET"])
@jwt_required()
def search_products():
    q = request.args.get("query", "")
    status = request.args.get("status")
    owner = request.args.get("owner")

    query = Product.query.filter(or_(Product.name.ilike(f"%{q}%"), Product.description.ilike(f"%{q}%")))
    if status: query = query.filter_by(current_status=status)
    if owner: query = query.filter_by(owner=owner)

    results = query.all()
    return jsonify([p.to_dict() for p in results]), 200

@bp.route("/<product_id>", methods=["DELETE"])
@jwt_required()
@role_required(["super_admin"])
def delete_product(product_id):
    product = Product.query.filter_by(product_id=product_id).first()
    if not product: return jsonify({"error": "product not found"}), 404
    History.query.filter_by(product_id=product_id).delete()
    db.session.delete(product)
    db.session.commit()
    
    bc, block_info = current_app.config.get("BLOCKCHAIN"), None
    if bc:
        block = bc.add_block({
            "type": "delete_product", "product_id": product_id,
            "deleted_by": get_jwt().get("username")
        })
        block_info = block.to_dict()
    return jsonify({"message": "product deleted", "product_id": product_id, "block": block_info}), 200

@bp.route("/<product_id>/export", methods=["GET"])
@jwt_required()
@role_required(["super_admin"])
def export_history(product_id):
    rows = History.query.filter_by(product_id=product_id).order_by(History.timestamp.asc()).all()
    if not rows: return jsonify({"error": "no history found"}), 404
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(["status", "by_who", "timestamp", "latitude", "longitude"])
    for r in rows:
        cw.writerow([r.status, r.by_who, r.timestamp, r.latitude, r.longitude])
    output = si.getvalue()
    return Response(output, mimetype="text/csv", headers={"Content-Disposition": f"attachment;filename={product_id}_history.csv"})

@bp.route("/blockchain", methods=["GET"])
@jwt_required()
def get_blockchain():
    bc = current_app.config["BLOCKCHAIN"]
    chain = [b.to_dict() for b in bc.chain]
    return jsonify(chain), 200

@bp.route("/blockchain/<product_id>", methods=["GET"])
@jwt_required()
def get_product_blockchain(product_id):
    bc = current_app.config["BLOCKCHAIN"]
    product_blocks = [b.to_dict() for b in bc.chain if b.data.get("product_id") == product_id]
    return jsonify(product_blocks), 200

@bp.route("/blockchain/verify", methods=["GET"])
@jwt_required()
def verify_blockchain():
    bc = current_app.config["BLOCKCHAIN"]
    valid, msg = (False, "Validation method not found")
    if hasattr(bc, "is_valid_chain"):
        valid, msg = bc.is_valid_chain()
    return jsonify({"valid": valid, "message": msg}), 200

@bp.route("/<product_id>/qrcode", methods=["GET"])
@jwt_required(optional=True)
def get_product_qrcode(product_id):
    product = Product.query.filter_by(product_id=product_id).first()
    if not product: return jsonify({"error": "product not found"}), 404
    base_url = current_app.config.get("FRONTEND_PUBLIC_BASE_URL")
    if not base_url:
      scheme = request.headers.get('X-Forwarded-Proto', request.scheme)
      host = request.headers.get('X-Forwarded-Host', request.host)
      base_url = f"{scheme}://{host}"
    backend_base = current_app.config.get("BACKEND_PUBLIC_BASE_URL") or base_url
    qr_data = f"{base_url}/verify/{product_id}?api_base_url={backend_base}"
    img = qrcode.make(qr_data)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png")

@bp.route("/<product_id>/history", methods=["GET"])
@jwt_required(optional=True)
def get_product_history_from_blockchain(product_id):
    """
    Provides the product's full, verified history directly from the blockchain.
    """
    product = Product.query.filter_by(product_id=product_id).first()
    if not product: return jsonify({"error": "Product not found"}), 404
    bc = current_app.config["BLOCKCHAIN"]
    product_history_blocks = [
        b.to_dict() for b in bc.chain 
        if isinstance(b.data, dict) and b.data.get("product_id") == product_id
    ]
    timeline = [block['data'] for block in product_history_blocks]
    
    valid, msg = (False, "Validation method not found")
    if hasattr(bc, "is_valid_chain"):
        valid, msg = bc.is_valid_chain()

    return jsonify({
        "product_details": product.to_dict(include_history=False),
        "verified_history_timeline": timeline,
        "blockchain_verified": valid,
        "verification_message": msg
    }), 200