import hashlib
import json
import time
from models import Block as BlockModel
from db import db
from sqlalchemy import asc

class Block:
    def __init__(self, index, timestamp, data, previous_hash, hash_value=None):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = hash_value or self.calculate_hash()

    def calculate_hash(self):
        block_string = f"{self.index}{self.timestamp}{json.dumps(self.data, sort_keys=True)}{self.previous_hash}"
        return hashlib.sha256(block_string.encode()).hexdigest()

    def to_dict(self):
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
        }

class Blockchain:
    def __init__(self, app=None):
        self.chain = []
        if app:
            self.init_from_db()

    def init_from_db(self):
        rows = BlockModel.query.order_by(asc(BlockModel.index)).all()
        if not rows or rows[0].index != 0:
            genesis = self.create_genesis_block()
            self.chain.append(genesis)
            self.persist_block(genesis)
        for r in rows:
            try:
                data_parsed = json.loads(r.data)
            except:
                data_parsed = r.data
            self.chain.append(Block(r.index, r.timestamp, data_parsed, r.previous_hash, r.hash))

    def create_genesis_block(self):
        return Block(0, time.time(), {"type": "genesis"}, "0")

    def get_last_block(self):
        return self.chain[-1]

    def add_block(self, data):
        prev = self.get_last_block()
        new_index = prev.index + 1
        block_obj = Block(new_index, time.time(), data, prev.hash)
        self.chain.append(block_obj)
        self.persist_block(block_obj)
        return block_obj

    def persist_block(self, block_obj):
        b = BlockModel(
            index=block_obj.index,
            timestamp=block_obj.timestamp,
            data=json.dumps(block_obj.data, sort_keys=True),
            previous_hash=block_obj.previous_hash,
            hash=block_obj.hash,
        )
        db.session.add(b)
        db.session.commit()

    def is_valid_chain(self):
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i - 1]
            if curr.hash != curr.calculate_hash():
                return False, f"Hash mismatch at index {curr.index}"
            if curr.previous_hash != prev.hash:
                return False, f"Previous hash mismatch at index {curr.index}"
        return True, "Blockchain is valid"