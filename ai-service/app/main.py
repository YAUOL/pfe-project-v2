from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Import Ollama (optionnel)
try:
    import ollama
    OLLAMA_AVAILABLE = True
    print("✅ Ollama disponible - Nettoyage intelligent activé")
except ImportError:
    OLLAMA_AVAILABLE = False
    print("⚠️ Ollama non disponible - Nettoyage basique uniquement")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MatchingRequest(BaseModel):
    cv_text: str
    job_description: str
    required_skills: str

class MatchingResponse(BaseModel):
    score: float
    matched_skills: list[str]
    missing_skills: list[str]


# ========================================
# NETTOYAGE DE TEXTE AVEC LLM
# ========================================

def clean_text_with_llm(text: str) -> str:
    """
    Nettoyage intelligent de CV avec LLM (version améliorée)
    """
    if not OLLAMA_AVAILABLE:
        print("⚠️ Ollama non disponible, utilisation du nettoyage basique")
        return clean_text_basic(text)

    prompt = f"""
Tu es un expert RH et ATS (Applicant Tracking System).

OBJECTIF :
Extraire et structurer les informations IMPORTANTES d'un CV pour le recrutement.

GARDE UNIQUEMENT :
- Compétences techniques (ex: Java, Python, React…)
- Soft skills (ex: communication, teamwork…)
- Expériences professionnelles (poste, entreprise, missions, dates)
- Formation (diplômes, écoles, dates)
- Langues
- Certifications

SUPPRIME :
- Emails, numéros de téléphone, adresses
- Symboles inutiles (•, -, *, etc.)
- Texte répétitif ou vide
- Paragraphes inutiles

FORMAT DE SORTIE (IMPORTANT) :
Retourne un texte STRUCTURÉ comme ceci :

COMPETENCES:
...

EXPERIENCES:
...

FORMATION:
...

LANGUES:
...

CERTIFICATIONS:
...

RÈGLES :
- Texte propre et lisible
- Pas de symboles inutiles
- Garde les mots clés importants pour matching IA
- Ne résume pas trop, garde les infos utiles

TEXTE CV :
{text}

RÉSULTAT :
"""

    try:
        print("🤖 Appel à Ollama pour nettoyage CV...")
        response = ollama.chat(
            model='llama3.2-vision:11b',
            messages=[{
                'role': 'user',
                'content': prompt
            }]
        )

        cleaned = response['message']['content'].strip()
        print(f"✅ CV nettoyé avec Ollama ({len(cleaned)} caractères)")
        return cleaned

    except Exception as e:
        print(f"❌ Erreur Ollama : {e}")
        print("⚠️ Fallback vers nettoyage basique")
        return clean_text_basic(text)


def clean_text_basic(text: str) -> str:
    """
    Nettoyage fallback amélioré (garde les infos importantes)
    """
    # garder majuscules utiles
    text = re.sub(r'\s+', ' ', text)

    # enlever symboles bizarres mais garder . , -
    text = re.sub(r'[^\w\s.,\-]', '', text)

    # supprimer emails
    text = re.sub(r'\S+@\S+', '', text)

    # supprimer numéros (tel)
    text = re.sub(r'\b\d{8,}\b', '', text)

    return text.strip()


def clean_text(text: str) -> str:
    """
    Point d'entrée
    """
    return clean_text_with_llm(text)


# ========================================
# MATCHING SCORE
# ========================================

def extract_skills(text: str, skill_list: list[str]) -> list[str]:
    """Extraire les compétences présentes dans le texte"""
    text_lower = text.lower()
    found_skills = []
    for skill in skill_list:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    return found_skills


@app.get("/")
def read_root():
    return {
        "message": "AI Recruitment Service is running",
        "ollama_available": OLLAMA_AVAILABLE,
        "cleaning_mode": "intelligent" if OLLAMA_AVAILABLE else "basic"
    }


@app.post("/api/match", response_model=MatchingResponse)
async def calculate_matching_score(request: MatchingRequest):
    """
    Calculer le score de compatibilité entre un CV et une offre d'emploi
    """
    try:
        print(f"\n🎯 Calcul du matching score...")
        print(f"📄 CV: {len(request.cv_text)} caractères")
        print(f"💼 Job: {len(request.job_description)} caractères")
        
        # ✅ Nettoyer le CV avec LLM
        cv_cleaned = clean_text(request.cv_text)
        job_cleaned = clean_text(request.job_description)
        
        print(f"✨ CV nettoyé: {len(cv_cleaned)} caractères")
        
        # Parser les compétences requises
        required_skills_list = [s.strip() for s in request.required_skills.split(',') if s.strip()]
        print(f"🔍 Compétences requises: {required_skills_list}")
        
        # 1. Calcul du score de similarité textuelle (60% du score)
        vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        try:
            tfidf_matrix = vectorizer.fit_transform([cv_cleaned, job_cleaned])
            text_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            print(f"📊 Similarité textuelle: {text_similarity:.2%}")
        except:
            text_similarity = 0.3  # Score par défaut si erreur
            print(f"⚠️ Erreur TF-IDF, score par défaut: {text_similarity:.2%}")
        
        # 2. Calcul du score de compétences (40% du score)
        matched_skills = extract_skills(request.cv_text, required_skills_list)
        missing_skills = [s for s in required_skills_list if s not in matched_skills]
        
        print(f"✅ Compétences trouvées: {matched_skills}")
        print(f"❌ Compétences manquantes: {missing_skills}")
        
        if len(required_skills_list) > 0:
            skills_score = len(matched_skills) / len(required_skills_list)
        else:
            skills_score = 0.5
        
        print(f"📊 Score compétences: {skills_score:.2%}")
        
        # Score final (pondéré)
        final_score = (text_similarity * 0.6) + (skills_score * 0.4)
        
        # Convertir en pourcentage (0-100)
        final_score_percentage = round(final_score * 100, 2)
        
        print(f"🎯 SCORE FINAL: {final_score_percentage}%\n")
        
        return MatchingResponse(
            score=final_score_percentage,
            matched_skills=matched_skills,
            missing_skills=missing_skills
        )
        
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating match: {str(e)}")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ollama_available": OLLAMA_AVAILABLE
    }