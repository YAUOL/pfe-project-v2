import json
import os
import faiss
import numpy as np
from app.embeddings.embedding_service import get_embedding

DATA_DIR = "./rag_data"
os.makedirs(DATA_DIR, exist_ok=True)

JOBS_INDEX_PATH = f"{DATA_DIR}/jobs.index"
JOBS_META_PATH = f"{DATA_DIR}/jobs_meta.json"
PLATFORM_INDEX_PATH = f"{DATA_DIR}/platform.index"
PLATFORM_META_PATH = f"{DATA_DIR}/platform_meta.json"

EMBEDDING_DIM = 384


def _load_index(path: str):
    if os.path.exists(path):
        return faiss.read_index(path)
    return faiss.IndexFlatL2(EMBEDDING_DIM)


def _load_meta(path: str) -> list:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _save_index(index, path: str):
    faiss.write_index(index, path)


def _save_meta(meta: list, path: str):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)


def _embed(text: str) -> np.ndarray:
    emb = get_embedding(text)
    return np.array(emb, dtype="float32").reshape(1, -1)


def ingest_job(
    job_id: str, title: str, description: str, skills: str,
    location: str = "", salary: str = "",
    salary_min: int = 0, salary_max: int = 0,
    company: str = "", category: str = "",
    experience_level: str = "", type_contrat: str = ""
):
    index = _load_index(JOBS_INDEX_PATH)
    meta = _load_meta(JOBS_META_PATH)

    meta = [m for m in meta if m["job_id"] != job_id]

    text = (
        f"Job Title: {title}\n"
        f"Company: {company}\n"
        f"Description: {description}\n"
        f"Required Skills: {skills}\n"
        f"Location: {location}\n"
        f"Salary: {salary_min}k - {salary_max}k TND\n"
        f"Category: {category}\n"
        f"Experience Level: {experience_level}\n"
        f"Contract Type: {type_contrat}"
    )

    embedding = _embed(text)
    index.add(embedding)

    meta.append({
        "job_id": job_id,
        "title": title,
        "text": text,
        "skills": skills,
        "location": location,
        "salary": f"{salary_min}k - {salary_max}k TND",
        "salary_min": salary_min,
        "salary_max": salary_max,
        "company": company,
        "category": category,
        "experience_level": experience_level,
        "type_contrat": type_contrat,
        "index_pos": index.ntotal - 1
    })

    _save_index(index, JOBS_INDEX_PATH)
    _save_meta(meta, JOBS_META_PATH)
    print(f"✅ Job ingested: {title} (id: {job_id})")


def delete_job(job_id: str):
    meta = _load_meta(JOBS_META_PATH)
    meta = [m for m in meta if m["job_id"] != job_id]
    _save_meta(meta, JOBS_META_PATH)
    print(f"🗑️ Job removed: {job_id}")


def get_all_jobs() -> list:
    meta = _load_meta(JOBS_META_PATH)
    return [m["text"] for m in meta]


def search_jobs(query: str, n: int = 10) -> list:
    meta = _load_meta(JOBS_META_PATH)
    if not meta:
        return []
    index = _load_index(JOBS_INDEX_PATH)
    if index.ntotal == 0:
        return []
    embedding = _embed(query)
    k = min(n, index.ntotal)
    _, indices = index.search(embedding, k)
    return [meta[i]["text"] for i in indices[0] if 0 <= i < len(meta)]


def ingest_platform_knowledge():
    index = _load_index(PLATFORM_INDEX_PATH)
    meta = _load_meta(PLATFORM_META_PATH)

    if meta:
        print("✅ Platform knowledge already loaded")
        return

    docs = [
        {"id": "platform_001", "text": "JobBoard is an AI-powered recruitment platform. Candidates can create an account, upload their CV, and apply to job offers. The AI system automatically analyzes the CV and calculates a matching score against the job requirements."},
        {"id": "platform_002", "text": "How to apply for a job on JobBoard: 1. Create a candidate account. 2. Go to Job Listings. 3. Click on a job offer. 4. Upload your CV in PDF format. 5. The AI will analyze your CV and calculate your matching score. 6. The recruiter will review your application."},
        {"id": "platform_003", "text": "CV Tips for candidates: Always include your technical skills clearly. List your tools and technologies such as React, Java, Python, Docker. Describe your professional experiences with concrete responsibilities. Include certifications and formations. Keep your CV clean and use PDF format."},
        {"id": "platform_004", "text": "How recruiters use JobBoard: Recruiters can post job offers with required skills and view all candidates ranked by AI matching score. Each candidate profile shows matched skills, missing skills, and CV text. Recruiters can accept or reject applications from the dashboard."},
        {"id": "platform_005", "text": "The AI matching score is calculated based on two factors: Skills score (60%) measures how many required skills are found in the CV. Semantic similarity (40%) measures how closely the candidate profile matches the job description. A score above 70% is considered a strong match."},
    ]

    for doc in docs:
        embedding = _embed(doc["text"])
        index.add(embedding)
        meta.append({"id": doc["id"], "text": doc["text"]})

    _save_index(index, PLATFORM_INDEX_PATH)
    _save_meta(meta, PLATFORM_META_PATH)
    print(f"✅ Platform knowledge ingested ({len(docs)} documents)")


def search_platform(query: str, n: int = 2) -> list:
    meta = _load_meta(PLATFORM_META_PATH)
    if not meta:
        return []
    index = _load_index(PLATFORM_INDEX_PATH)
    if index.ntotal == 0:
        return []
    embedding = _embed(query)
    k = min(n, index.ntotal)
    _, indices = index.search(embedding, k)
    return [meta[i]["text"] for i in indices[0] if 0 <= i < len(meta)]