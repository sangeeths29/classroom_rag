# WPC300 Course Assistant - Backend

FastAPI backend with RAG (Retrieval-Augmented Generation) for the WPC300 Problem Solving and Actionable Analytics course assistant.

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# On Mac/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure API Key

```bash
# Copy the template
cp env_template.txt .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 4. Add Documents (Optional)

Place any additional PDF or TXT files in the `documents/` folder. The syllabus is already included.

### 5. Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Health status |
| `/api/chat` | POST | General course Q&A |
| `/api/syllabus` | POST | Syllabus-specific Q&A |
| `/api/index` | POST | Re-index documents |

### Example Request

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is VLOOKUP?", "stream": false}'
```

## Project Structure

```
backend/
├── main.py              # FastAPI application
├── rag/
│   ├── __init__.py
│   ├── embeddings.py    # Document loading & vector store
│   └── chain.py         # LangChain RAG pipeline
├── documents/           # Course documents (syllabus, etc.)
├── vectorstore/         # ChromaDB storage (auto-generated)
├── requirements.txt     # Python dependencies
└── env_template.txt     # Environment template
```

## Troubleshooting

### "No API key" error
Make sure you've created the `.env` file with your OpenAI API key.

### Vector store errors
Try re-indexing: `POST /api/index`

### CORS errors
The frontend URL is configured in `.env`. Default is `http://localhost:5173`.
