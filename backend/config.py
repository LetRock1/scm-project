import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "default-dev-secret")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-jwt-secret")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///scm.db")
FRONTEND_PUBLIC_BASE_URL = os.getenv("FRONTEND_PUBLIC_BASE_URL")
BACKEND_PUBLIC_BASE_URL = os.getenv("BACKEND_PUBLIC_BASE_URL")