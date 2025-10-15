from flask import Flask
from flask_cors import CORS
from config import SECRET_KEY, JWT_SECRET_KEY, DATABASE_URL, FRONTEND_PUBLIC_BASE_URL, BACKEND_PUBLIC_BASE_URL
from db import db
from flask_jwt_extended import JWTManager
from blockchain import Blockchain
from flask import redirect
import os

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
    if FRONTEND_PUBLIC_BASE_URL:
        app.config["FRONTEND_PUBLIC_BASE_URL"] = FRONTEND_PUBLIC_BASE_URL.rstrip("/")
    if BACKEND_PUBLIC_BASE_URL:
        app.config["BACKEND_PUBLIC_BASE_URL"] = BACKEND_PUBLIC_BASE_URL.rstrip("/")

    CORS(app)
    db.init_app(app)
    jwt = JWTManager(app)

    # Import routes inside to avoid circular imports
    from routes.auth_routes import auth_bp
    from routes.product_routes import bp as products_bp
    from routes.chain_routes import bp as chain_bp
    from routes.user_routes import bp as users_bp   

    app.register_blueprint(users_bp)     
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(chain_bp)

    # Create DB & tables if not exist, then initialize blockchain
    with app.app_context():
        db.create_all()
        bc = Blockchain(app)
        app.config["BLOCKCHAIN"] = bc

    @app.route("/")
    def home():
        return {"message": "SCM Blockchain Backend running"}
    

    @app.route("/verify/<product_id>")
    def redirect_to_frontend(product_id):
        LOCAL_IP = "10.122.180.147"  
        FRONTEND_PORT = 5173          
    # When QR code is scanned, Flask will redirect to frontend verify page
        frontend_url = f"http://{LOCAL_IP}:{FRONTEND_PORT}/verify/{product_id}"
        return redirect(frontend_url)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)