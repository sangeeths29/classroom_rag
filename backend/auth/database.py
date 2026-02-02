"""
SQLite database setup for user authentication
"""
import sqlite3
import os
from datetime import datetime

DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'users.db')

def get_db():
    """Get database connection"""
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE,
            password_hash TEXT,
            full_name TEXT,
            avatar_url TEXT,
            auth_provider TEXT DEFAULT 'local',
            google_id TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # Chat sessions table (to sync across devices)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            title TEXT,
            messages TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def create_user(email: str, username: str = None, password_hash: str = None, 
                full_name: str = None, auth_provider: str = 'local', 
                google_id: str = None, avatar_url: str = None):
    """Create a new user"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (email, username, password_hash, full_name, auth_provider, google_id, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (email, username, password_hash, full_name, auth_provider, google_id, avatar_url))
        conn.commit()
        user_id = cursor.lastrowid
        return get_user_by_id(user_id)
    except sqlite3.IntegrityError as e:
        return None
    finally:
        conn.close()

def get_user_by_email(email: str):
    """Get user by email"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_username(username: str):
    """Get user by username"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: int):
    """Get user by ID"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_google_id(google_id: str):
    """Get user by Google ID"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE google_id = ?', (google_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_last_login(user_id: int):
    """Update user's last login timestamp"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE users SET last_login = ? WHERE id = ?',
        (datetime.utcnow(), user_id)
    )
    conn.commit()
    conn.close()

# Chat session functions
def save_chat_session(session_id: str, user_id: int, title: str, messages: str):
    """Save or update a chat session"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR REPLACE INTO chat_sessions (id, user_id, title, messages, updated_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (session_id, user_id, title, messages, datetime.utcnow()))
    
    conn.commit()
    conn.close()

def get_user_chat_sessions(user_id: int):
    """Get all chat sessions for a user"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC',
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def delete_chat_session(session_id: str, user_id: int):
    """Delete a chat session"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'DELETE FROM chat_sessions WHERE id = ? AND user_id = ?',
        (session_id, user_id)
    )
    conn.commit()
    conn.close()

# Initialize database on import
init_db()
