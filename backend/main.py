"""
FastAPI Backend for WPC300 Course Assistant
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio

# Load environment variables
load_dotenv()

# Verify API key is set
if not os.getenv("OPENAI_API_KEY"):
    print("⚠️  WARNING: OPENAI_API_KEY not set!")
    print("Please copy env_template.txt to .env and add your API key")

from rag import get_answer, get_answer_stream, create_vectorstore
from auth.routes import router as auth_router

# Initialize FastAPI app
app = FastAPI(
    title="WPC300 Course Assistant API",
    description="RAG-powered AI assistant for Problem Solving and Actionable Analytics",
    version="1.0.0"
)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
        "https://classroom-rag.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(auth_router)


# Request/Response models
class QuestionRequest(BaseModel):
    question: str
    stream: bool = True


class AnswerResponse(BaseModel):
    answer: str
    question: str


# Initialize vector store on startup
@app.on_event("startup")
async def startup_event():
    """Initialize the vector store on startup"""
    print("🚀 Starting WPC300 Course Assistant API...")
    
    if os.getenv("OPENAI_API_KEY"):
        try:
            print("📚 Initializing vector store...")
            create_vectorstore()
            print("✅ Vector store ready!")
        except Exception as e:
            print(f"⚠️  Error initializing vector store: {e}")
    else:
        print("⚠️  Skipping vector store initialization - no API key")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "WPC300 Course Assistant",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/chat")
async def chat(request: QuestionRequest):
    """
    Answer a question about the course using RAG
    """
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=500, 
            detail="OpenAI API key not configured. Please add it to .env file."
        )
    
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    try:
        if request.stream:
            # Return streaming response
            async def generate():
                async for chunk in get_answer_stream(request.question):
                    yield chunk
            
            return StreamingResponse(
                generate(),
                media_type="text/plain"
            )
        else:
            # Return complete response
            answer = get_answer(request.question)
            return AnswerResponse(answer=answer, question=request.question)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/syllabus")
async def syllabus_question(request: QuestionRequest):
    """
    Answer a question specifically about the syllabus
    Adds context to focus on syllabus-related queries
    """
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured. Please add it to .env file."
        )
    
    # Enhance the question to focus on syllabus
    enhanced_question = f"Based on the course syllabus: {request.question}"
    
    try:
        if request.stream:
            async def generate():
                async for chunk in get_answer_stream(enhanced_question):
                    yield chunk
            
            return StreamingResponse(
                generate(),
                media_type="text/plain"
            )
        else:
            answer = get_answer(enhanced_question)
            return AnswerResponse(answer=answer, question=request.question)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/index")
async def reindex_documents():
    """
    Re-index all documents in the documents folder
    Useful after adding new documents
    """
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured"
        )
    
    try:
        create_vectorstore(force_recreate=True)
        return {"status": "success", "message": "Documents re-indexed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
