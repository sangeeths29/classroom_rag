"""
Authentication routes for the API
"""
import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt

from .database import (
    create_user, get_user_by_email, get_user_by_username,
    get_user_by_id, get_user_by_google_id, update_last_login,
    save_chat_session, get_user_chat_sessions, delete_chat_session
)

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["authentication"])

# Pydantic models
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str  # Can be username or email
    password: str

class GoogleAuth(BaseModel):
    credential: str  # Google ID token

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class ChatSessionSave(BaseModel):
    session_id: str
    title: str
    messages: str  # JSON string

# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_from_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return get_user_by_id(int(user_id))
    except JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to get current authenticated user"""
    user = get_user_from_token(credentials.credentials)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def sanitize_user(user: dict) -> dict:
    """Remove sensitive fields from user dict"""
    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "full_name": user["full_name"],
        "avatar_url": user["avatar_url"],
        "auth_provider": user["auth_provider"],
        "created_at": user["created_at"],
    }

# Routes
@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    """Register a new user with email/password"""
    # Check if email already exists
    if get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if get_user_by_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    password_hash = get_password_hash(user_data.password)
    user = create_user(
        email=user_data.email,
        username=user_data.username,
        password_hash=password_hash,
        full_name=user_data.full_name,
        auth_provider='local'
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # Create token
    access_token = create_access_token(data={"sub": str(user["id"])})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": sanitize_user(user)
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login with username/email and password"""
    # Try to find user by username or email
    user = get_user_by_username(credentials.username)
    if not user:
        user = get_user_by_email(credentials.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Check if user has password (might be Google-only user)
    if not user.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses Google sign-in"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Update last login
    update_last_login(user["id"])
    
    # Create token
    access_token = create_access_token(data={"sub": str(user["id"])})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": sanitize_user(user)
    }

@router.post("/google", response_model=Token)
async def google_auth(data: GoogleAuth):
    """Authenticate with Google ID token"""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        
        # Verify the Google token
        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
        
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google authentication not configured"
            )
        
        idinfo = id_token.verify_oauth2_token(
            data.credential,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        google_id = idinfo['sub']
        email = idinfo['email']
        full_name = idinfo.get('name', '')
        avatar_url = idinfo.get('picture', '')
        
        # Check if user exists
        user = get_user_by_google_id(google_id)
        
        if not user:
            # Check if email exists (link accounts)
            user = get_user_by_email(email)
            if user:
                # Update existing user with Google ID
                # For simplicity, we'll create a new user
                pass
            
            # Create new user
            user = create_user(
                email=email,
                full_name=full_name,
                auth_provider='google',
                google_id=google_id,
                avatar_url=avatar_url
            )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to authenticate with Google"
            )
        
        # Update last login
        update_last_login(user["id"])
        
        # Create token
        access_token = create_access_token(data={"sub": str(user["id"])})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": sanitize_user(user)
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return sanitize_user(current_user)

# Chat session sync routes
@router.post("/sessions/save")
async def save_session(data: ChatSessionSave, current_user: dict = Depends(get_current_user)):
    """Save a chat session for the current user"""
    save_chat_session(
        session_id=data.session_id,
        user_id=current_user["id"],
        title=data.title,
        messages=data.messages
    )
    return {"status": "saved"}

@router.get("/sessions")
async def get_sessions(current_user: dict = Depends(get_current_user)):
    """Get all chat sessions for the current user"""
    sessions = get_user_chat_sessions(current_user["id"])
    return {"sessions": sessions}

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a chat session"""
    delete_chat_session(session_id, current_user["id"])
    return {"status": "deleted"}
