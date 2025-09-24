from flask import Blueprint, current_app, jsonify
bp = Blueprint("chain", __name__, url_prefix="/api/chain")

@bp.route("/", methods=["GET"])
def get_chain():
    bc = current_app.config["BLOCKCHAIN"]
    chain_data = [b.to_dict() for b in bc.chain]
    valid, msg = bc.is_valid_chain()
    return jsonify({"chain": chain_data, "valid": valid, "message": msg})

@bp.route("/validate", methods=["GET"])
def validate_chain():
    bc = current_app.config["BLOCKCHAIN"]
    valid, msg = bc.is_valid_chain()
    return jsonify({"valid": valid, "message": msg})