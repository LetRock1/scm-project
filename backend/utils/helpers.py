import time
import uuid

def now_ts():
    return float(time.time())

def gen_product_id():
    return str(uuid.uuid4())