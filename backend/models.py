from db import db
from datetime import datetime
import json

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default="manufacturer")
    created_at = db.Column(db.Float, default=lambda: datetime.utcnow().timestamp())

    def to_dict(self):
        return { "id": self.id, "username": self.username, "role": self.role, "created_at": self.created_at }

class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    owner = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default="")
    current_status = db.Column(db.String(100), default="Created")
    created_at = db.Column(db.Float, default=lambda: datetime.utcnow().timestamp())
    custodian = db.Column(db.String(200), nullable=False, default='owner')
    
    histories = db.relationship("History", backref="product", lazy=True, cascade="all, delete-orphan", order_by="History.timestamp.asc()")

    def to_dict(self, include_history=False):
        data = {
            "product_id": self.product_id, "name": self.name, "owner": self.owner,
            "description": self.description, "current_status": self.current_status,
            "created_at": self.created_at,
            "custodian": self.custodian
        }
        if include_history:
            data["history"] = [h.to_dict() for h in self.histories]
        return data

class History(db.Model):
    __tablename__ = "histories"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(120), db.ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    status = db.Column(db.String(120), nullable=False)
    by_who = db.Column(db.String(200), nullable=False)
    timestamp = db.Column(db.Float, default=lambda: datetime.utcnow().timestamp())
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "status": self.status, "by": self.by_who, "timestamp": self.timestamp,
            "latitude": self.latitude, "longitude": self.longitude
        }

class Block(db.Model):
    __tablename__ = "blocks"
    id = db.Column(db.Integer, primary_key=True)
    index = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.Float, nullable=False)
    data = db.Column(db.Text, nullable=False)
    previous_hash = db.Column(db.String(256), nullable=False)
    hash = db.Column(db.String(256), nullable=False)

    def to_dict(self):
        try: data_parsed = json.loads(self.data)
        except Exception: data_parsed = self.data
        return {
            "index": self.index, "timestamp": self.timestamp, "data": data_parsed,
            "previous_hash": self.previous_hash, "hash": self.hash
        }