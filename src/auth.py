"""
Authentication and User Management Module for EcommerceConsumerIntelligence.
Provides SQLite database persistence, bcrypt password hashing, and JWT tokens.
Kept separate from ML inference modules.
"""

import os
import sqlite3
import datetime
from pathlib import Path
from typing import Optional, Dict, Any
import bcrypt
import jwt

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT_ROOT / "data" / "auth.db"

# Secret key and algorithm for JWT (can be overridden via environment variables)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "ecommerce_consumer_intelligence_secret_key_2026_dev_mode_token")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours


def get_db_connection() -> sqlite3.Connection:
    """Creates a connection to the SQLite database with row factory."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the users and analysis_history tables if they do not already exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL COLLATE NOCASE,
            full_name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            analysis_type TEXT NOT NULL,
            title TEXT NOT NULL,
            summary TEXT,
            details_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    """)
    conn.commit()
    conn.close()


def hash_password(password: str) -> str:
    """Hashes a password securely using bcrypt with automatic salt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Generates a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates a signed JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieves a user record by email (case-insensitive)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name, password_hash, created_at FROM users WHERE email = ?;", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a user record by user ID including password hash."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name, password_hash, created_at FROM users WHERE id = ?;", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def create_user(email: str, full_name: str, password: str) -> Dict[str, Any]:
    """Inserts a new user record into SQLite with hashed password."""
    clean_email = email.strip().lower()
    clean_name = full_name.strip()
    pw_hash = hash_password(password)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?);",
        (clean_email, clean_name, pw_hash)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": user_id,
        "email": clean_email,
        "full_name": clean_name
    }


def change_password(user_id: int, old_password: str, new_password: str) -> bool:
    """Verifies old password and updates to new password hash."""
    user = get_user_by_id(user_id)
    if not user:
        return False
    if not verify_password(old_password, user["password_hash"]):
        return False

    new_hash = hash_password(new_password)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?;", (new_hash, user_id))
    conn.commit()
    conn.close()
    return True


def add_history(user_id: int, analysis_type: str, title: str, summary: str, details_json: str) -> int:
    """Saves an analysis record to the user's history."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO analysis_history (user_id, analysis_type, title, summary, details_json) VALUES (?, ?, ?, ?, ?);",
        (user_id, analysis_type, title, summary, details_json)
    )
    history_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return history_id


def get_user_history(user_id: int, limit: int = 50) -> list:
    """Retrieves analysis history records for a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, analysis_type, title, summary, details_json, created_at FROM analysis_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?;",
        (user_id, limit)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_user_history(user_id: int, history_id: int) -> bool:
    """Deletes a specific history record belonging to a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM analysis_history WHERE id = ? AND user_id = ?;", (history_id, user_id))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


# Initialize database upon import
init_db()
