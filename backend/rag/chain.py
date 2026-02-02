"""
RAG Chain for answering questions about the course
"""
import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from .embeddings import get_retriever

# System prompt for the AI assistant
SYSTEM_PROMPT = """You are an AI teaching assistant for WPC300 - Problem Solving and Actionable Analytics at Arizona State University's W. P. Carey School of Business.

Your job is to help students by answering questions using ONLY the course materials provided below.

Context from course materials:
{context}

INSTRUCTIONS:
1. Answer using ONLY information from the context above
2. Use EXACT dates, percentages, and details from the context
3. If asked about exams/midterms, provide:
   - The exam date (e.g., "Midterm Exam: February 28, 2026")
   - What modules/topics are covered (Modules 1-3 for midterm)
   - The weight in grading (e.g., "Midterm: 20%")
4. If asked about assignments, list the specific due dates
5. If asked about grading, give exact percentages
6. Format answers with bullet points for clarity
7. If the specific answer truly isn't in the context, say what related information IS available

Remember: Students need specific dates and facts, not general advice.
"""

USER_PROMPT = """Student Question: {question}

Please provide a helpful response based on the course materials."""


def format_docs(docs):
    """Format retrieved documents into a single string"""
    return "\n\n---\n\n".join(doc.page_content for doc in docs)


def create_rag_chain():
    """Create the RAG chain for answering questions"""
    
    # Get the model name from environment
    model_name = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
    # Initialize the LLM
    llm = ChatOpenAI(
        model=model_name,
        temperature=0.3,  # Lower temperature for more factual responses
        streaming=True
    )
    
    # Create the prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", USER_PROMPT)
    ])
    
    # Get the retriever - use more chunks for better context
    retriever = get_retriever(k=6)
    
    # Build the chain
    chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return chain


def get_answer(question: str) -> str:
    """Get an answer to a question using RAG"""
    chain = create_rag_chain()
    return chain.invoke(question)


async def get_answer_stream(question: str):
    """Get a streaming answer to a question using RAG"""
    chain = create_rag_chain()
    async for chunk in chain.astream(question):
        yield chunk
