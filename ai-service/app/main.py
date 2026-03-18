from fastapi import FastAPI, UploadFile, File, Form
import os

from app.extractors.pdf_extractor import extract_text_from_pdf
from app.extractors.docx_extractor import extract_text_from_docx
from app.cleaners.text_cleaner import clean_text
from app.embeddings.embedding_service import get_embedding
from app.similarity.similarity_service import compute_similarity

app = FastAPI(title="AI Recruitment Service")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/analyze-cv")
async def analyze_cv(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    if file.filename.endswith(".pdf"):
        raw_text = extract_text_from_pdf(file_path)
    elif file.filename.endswith(".docx"):
        raw_text = extract_text_from_docx(file_path)
    else:
        return {"error": "Unsupported file"}

    clean_cv = clean_text(raw_text)
    clean_job = clean_text(job_description)

    cv_vec = get_embedding(clean_cv)
    job_vec = get_embedding(clean_job)

    score = compute_similarity(cv_vec, job_vec)

    return {
        "similarity_score": score,
        "message": "Analysis completed"
    }