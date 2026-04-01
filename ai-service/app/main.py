from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import re

from app.embeddings.embedding_service import get_embedding
from app.similarity.similarity_service import compute_similarity

# Import Ollama (optionnel)
try:
    import ollama
    OLLAMA_AVAILABLE = True
    print("✅ Ollama disponible - Nettoyage intelligent activé")
except ImportError:
    OLLAMA_AVAILABLE = False
    print("⚠️ Ollama non disponible - Nettoyage basique uniquement")

app = FastAPI(title="AI Recruitment Service", version="2.0.0")

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
# DTOs
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
# TEXT CLEANING
# ========================================
def clean_text_basic(text: str) -> str:
    """
    Nettoyage basique du texte.
    """
    if not text:
        return ""

    text = re.sub(r'\S+@\S+', ' ', text)               # emails
    text = re.sub(r'\+?\d[\d\s\-()]{7,}', ' ', text)   # phones
    text = re.sub(r'\s+', ' ', text)                   # extra spaces
    text = re.sub(r'[^\w\s.,:/\-+#]', ' ', text)
    return text.strip()


def clean_text_with_llm(text: str, text_type: str = "CV") -> str:
    """
    Nettoyage intelligent via Ollama.
    """
    if not text:
        return ""

    if not OLLAMA_AVAILABLE:
        return clean_text_basic(text)

    prompt = f"""
Tu es un expert RH et ATS.

OBJECTIF :
Nettoyer et restructurer un texte de type {text_type} pour améliorer l'analyse de matching candidat-offre.

GARDE UNIQUEMENT :
- Compétences techniques
- Outils et technologies
- Soft skills utiles
- Expériences professionnelles
- Formation et certifications
- Missions, responsabilités, projets

SUPPRIME :
- Emails, téléphones, adresses
- Informations inutiles ou répétitives
- Symboles parasites
- Mise en forme inutile

IMPORTANT :
- Préserve fidèlement le sens
- Ne pas inventer d'informations
- Ne pas supprimer les technologies importantes
- Retourne un texte propre, clair et structuré

TEXTE :
{text}

RÉSULTAT :
"""

    try:
        print(f"🤖 Appel à Ollama pour nettoyer le {text_type}...")
        response = ollama.chat(
            model="llama3.2-vision:11b",
            messages=[{"role": "user", "content": prompt}]
        )
        cleaned = response["message"]["content"].strip()
        print(f"✅ {text_type} nettoyé avec Ollama ({len(cleaned)} chars)")
        return cleaned
    except Exception as e:
        print(f"⚠️ Erreur Ollama ({text_type}) : {e}")
        return clean_text_basic(text)


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


def extract_skills_improved(text: str, skill_list: List[str]) -> List[str]:
    """
    Extraction améliorée des compétences depuis le texte brut.
    """
    text_normalized = normalize_text(text)
    found_skills = []

    for skill in skill_list:
        variations = get_skill_variations(skill)
        if any(variation in text_normalized for variation in variations):
            found_skills.append(skill)

    return found_skills


def calculate_skills_score(required_skills: List[str], matched_skills: List[str]) -> float:
    """
    Retourne un pourcentage entre 0 et 100.
    """
    if not required_skills:
        return 0.0

    return round((len(matched_skills) / len(required_skills)) * 100, 2)


# ========================================
# SEMANTIC SIMILARITY
# ========================================
def calculate_semantic_similarity(cv_text: str, job_text: str) -> float:
    """
    Similarité sémantique entre 2 textes avec embeddings.
    Retourne un pourcentage entre 0 et 100.
    """
    if not cv_text.strip() or not job_text.strip():
        return 0.0

    cv_embedding = get_embedding(cv_text)
    job_embedding = get_embedding(job_text)

    return compute_similarity(cv_embedding, job_embedding)


# ========================================
# ROUTES
# ========================================
@app.get("/")
def read_root():
    return {
        "message": "AI Recruitment Service is running",
        "version": "2.0.0",
        "ollama_available": OLLAMA_AVAILABLE,
        "similarity_mode": "sentence-transformers embeddings",
        "cleaning_mode": "intelligent" if OLLAMA_AVAILABLE else "basic"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ollama_available": OLLAMA_AVAILABLE,
        "embedding_model": "all-MiniLM-L6-v2"
    }


@app.post("/api/match", response_model=MatchingResponse)
async def calculate_matching_score(request: MatchingRequest):
    try:
        print("\n🎯 === CALCUL MATCHING SCORE ===")
        print(f"📄 CV brut: {len(request.cv_text)} caractères")
        print(f"💼 Job brut: {len(request.job_description)} caractères")

        # 1. Parse required skills
        required_skills_list = [
            s.strip() for s in request.required_skills.split(",") if s.strip()
        ]
        print(f"🔍 Compétences requises: {required_skills_list}")

        # 2. Extract skills from raw CV
        matched_skills = extract_skills_improved(request.cv_text, required_skills_list)
        missing_skills = [s for s in required_skills_list if s not in matched_skills]

        print(f"✅ Compétences trouvées: {matched_skills}")
        print(f"❌ Compétences manquantes: {missing_skills}")

        # 3. Skills score
        skills_score = calculate_skills_score(required_skills_list, matched_skills)
        print(f"📊 Score compétences: {skills_score}%")

        # 4. Clean texts for semantic comparison
        cv_cleaned = clean_text_with_llm(request.cv_text, "CV")
        job_cleaned = clean_text_with_llm(request.job_description, "OFFRE")

        print(f"✨ CV nettoyé: {len(cv_cleaned)} caractères")
        print(f"✨ Job nettoyé: {len(job_cleaned)} caractères")

        # 5. Semantic similarity
        semantic_similarity = calculate_semantic_similarity(cv_cleaned, job_cleaned)
        print(f"📊 Similarité sémantique: {semantic_similarity}%")

        # 6. Final weighted score
        final_score = round((skills_score * 0.8) + (semantic_similarity * 0.2), 2)

        print(f"🎯 === SCORE FINAL: {final_score}% ===\n")

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