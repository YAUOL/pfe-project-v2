from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import re
import asyncio

from app.cleaners.text_cleaner import extract_and_clean_cv, clean_text_basic
from app.embeddings.embedding_service import get_embedding
from app.similarity.similarity_service import compute_similarity
from app.rag.ingestor import ingest_job, delete_job, ingest_platform_knowledge
from app.rag.chain import ask_chatbot
from app.rag.db_sync import sync_all_jobs

try:
    import ollama
    OLLAMA_AVAILABLE = True
    print("✅ Ollama disponible")
except ImportError:
    OLLAMA_AVAILABLE = False
    print("⚠️ Ollama non disponible")

app = FastAPI(title="AI Recruitment Service", version="3.0.0")

# ========================================
# CORS
# ========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================================
# STARTUP
# ========================================
@app.on_event("startup")
async def startup_event():
    ingest_platform_knowledge()
    print("✅ Platform knowledge loaded into ChromaDB")
    await asyncio.to_thread(sync_all_jobs)

# ========================================
# DTOs — MATCHING
# ========================================
class MatchingRequest(BaseModel):
    cv_text: str
    job_description: str
    required_skills: str


class MatchingResponse(BaseModel):
    score: float
    matched_skills: List[str]
    missing_skills: List[str]
    skills_score: float
    semantic_similarity: float


# ========================================
# DTOs — CHAT
# ========================================
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    answer: str


# ========================================
# DTOs — JOB SYNC
# ========================================
class JobSyncRequest(BaseModel):
    job_id: str
    title: str
    description: str
    skills: str
    location: str = ""
    salary: str = ""


# ========================================
# SKILL ALIASES
# ========================================
SKILL_ALIASES = {
    "rest apis": ["rest api", "rest apis", "restful api", "restful apis", "rest services", "web services"],
    "spring boot": ["spring boot", "springboot"],
    "node.js": ["node.js", "nodejs"],
    "postgresql": ["postgresql", "postgres", "postgre"],
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "docker": ["docker", "containerization", "containers"],
    "git": ["git", "github", "gitlab"],
}

# ========================================
# SKILLS HELPERS
# ========================================
def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    return text


def get_skill_variations(skill: str) -> List[str]:
    skill_normalized = normalize_text(skill)
    variations = {
        skill_normalized,
        skill_normalized.replace(" ", ""),
        skill_normalized.replace(".", ""),
    }
    if skill_normalized in SKILL_ALIASES:
        variations.update(SKILL_ALIASES[skill_normalized])
    return list(variations)


def extract_skills(text: str, skill_list: List[str]) -> List[str]:
    text_normalized = normalize_text(text)
    found_skills = []
    for skill in skill_list:
        variations = get_skill_variations(skill)
        if any(
            re.search(r'\b' + re.escape(v) + r'\b', text_normalized)
            for v in variations
        ):
            found_skills.append(skill)
    return found_skills


def calculate_skills_score(required: List[str], matched: List[str]) -> float:
    if not required:
        return 0.0
    return round((len(matched) / len(required)) * 100, 2)


# ========================================
# ROUTES — INFO
# ========================================
@app.get("/")
def read_root():
    return {
        "message": "AI Recruitment Service is running",
        "version": "3.0.0",
        "ollama_available": OLLAMA_AVAILABLE,
        "extraction_mode": "vision LLM — extract + clean in one call",
        "similarity_mode": "sentence-transformers embeddings",
        "rag_chatbot": "enabled"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ollama_available": OLLAMA_AVAILABLE,
        "embedding_model": "all-MiniLM-L6-v2",
        "vision_model": "llama3.2-vision:11b",
        "chat_model": "mistral"
    }


# ========================================
# ROUTES — CV EXTRACTION
# ========================================
@app.post("/api/extract-cv")
async def extract_cv(file: UploadFile = File(...)):
    if not OLLAMA_AVAILABLE:
        raise HTTPException(status_code=503, detail="Ollama not available")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported")

    pdf_bytes = await file.read()
    extracted_text = await extract_and_clean_cv(pdf_bytes)

    return {
        "extracted_text": extracted_text,
        "filename": file.filename,
        "length": len(extracted_text)
    }


# ========================================
# ROUTES — MATCHING
# ========================================
@app.post("/api/match", response_model=MatchingResponse)
async def calculate_matching_score(request: MatchingRequest):
    try:
        print("\n🎯 === CALCUL MATCHING SCORE ===")
        print(f"📄 CV text: {len(request.cv_text)} chars")
        print(f"💼 Job text: {len(request.job_description)} chars")

        required_skills = [
            s.strip() for s in request.required_skills.split(",") if s.strip()
        ]
        print(f"🔍 Required skills: {required_skills}")

        matched_skills = extract_skills(request.cv_text, required_skills)
        missing_skills = [s for s in required_skills if s not in matched_skills]

        print(f"✅ Matched: {matched_skills}")
        print(f"❌ Missing: {missing_skills}")

        skills_score = calculate_skills_score(required_skills, matched_skills)
        print(f"📊 Skills score: {skills_score}%")

        job_cleaned = clean_text_basic(request.job_description)

        cv_embedding = get_embedding(request.cv_text)
        job_embedding = get_embedding(job_cleaned)
        semantic_similarity = compute_similarity(cv_embedding, job_embedding)
        print(f"📊 Semantic similarity: {semantic_similarity}%")

        final_score = round((skills_score * 0.6) + (semantic_similarity * 0.4), 2)
        print(f"🎯 === FINAL SCORE: {final_score}% ===\n")

        return MatchingResponse(
            score=final_score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            skills_score=skills_score,
            semantic_similarity=semantic_similarity
        )

    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# ========================================
# ROUTES — CHATBOT
# ========================================
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        print(f"\n💬 Chat question: {request.question}")
        history = [{"role": m.role, "content": m.content} for m in request.history]
        answer = await asyncio.to_thread(ask_chatbot, request.question, history)
        print(f"🤖 Answer: {answer[:100]}...")
        return ChatResponse(answer=answer)
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


# ========================================
# ROUTES — JOB SYNC
# ========================================
@app.post("/api/sync-job")
async def sync_job(request: JobSyncRequest):
    try:
        await asyncio.to_thread(
            ingest_job,
            request.job_id,
            request.title,
            request.description,
            request.skills,
            request.location,
            request.salary
        )
        return {"message": f"Job {request.job_id} synced successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync error: {str(e)}")


@app.delete("/api/sync-job/{job_id}")
async def remove_job(job_id: str):
    try:
        await asyncio.to_thread(delete_job, job_id)
        return {"message": f"Job {job_id} removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete error: {str(e)}")