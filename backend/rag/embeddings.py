"""
Document embedding and vector store management
"""
import os
from pathlib import Path
from langchain_community.document_loaders import TextLoader, PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# Paths
DOCUMENTS_DIR = Path(__file__).parent.parent / "documents"
VECTORSTORE_DIR = Path(__file__).parent.parent / "vectorstore"


def load_documents():
    """Load all documents from the documents directory"""
    documents = []
    
    # Load text files
    for txt_file in DOCUMENTS_DIR.glob("*.txt"):
        loader = TextLoader(str(txt_file))
        documents.extend(loader.load())
    
    # Load PDF files
    for pdf_file in DOCUMENTS_DIR.glob("*.pdf"):
        loader = PyPDFLoader(str(pdf_file))
        documents.extend(loader.load())
    
    return documents


def create_vectorstore(force_recreate: bool = False):
    """Create or load the vector store"""
    
    embeddings = OpenAIEmbeddings()
    
    # Check if vectorstore already exists
    if VECTORSTORE_DIR.exists() and not force_recreate:
        print("Loading existing vector store...")
        return Chroma(
            persist_directory=str(VECTORSTORE_DIR),
            embedding_function=embeddings
        )
    
    print("Creating new vector store...")
    
    # Load documents
    documents = load_documents()
    
    if not documents:
        raise ValueError("No documents found in the documents directory!")
    
    print(f"Loaded {len(documents)} documents")
    
    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks")
    
    # Create vector store
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=str(VECTORSTORE_DIR)
    )
    
    print("Vector store created and persisted!")
    return vectorstore


def get_retriever(k: int = 4):
    """Get a retriever from the vector store"""
    vectorstore = create_vectorstore()
    return vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k}
    )
