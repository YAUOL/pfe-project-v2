import ollama
import re
import fitz
import base64
import asyncio


# ========================================
# VISION EXTRACTION + CLEANING (CVs)
# ========================================
EXTRACTION_AND_CLEAN_PROMPT = """Tu es un expert RH et ATS (Applicant Tracking System).

Extrais et structure TOUTES les informations importantes de cette page de CV.

GARDE UNIQUEMENT :
- Compétences techniques et outils
- Soft skills
- Expériences professionnelles et responsabilités
- Formation et certifications
- Langues
- Projets

SUPPRIME :
- Emails, téléphones, adresses, URLs
- Symboles inutiles (•, -, *, |, etc.)
- Texte répétitif ou vide

FORMAT DE SORTIE (obligatoire) :
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

PROJETS:
...

RÈGLES :
- Retourne UNIQUEMENT le texte structuré ci-dessus
- Pas de commentaires, pas d'introduction
- Garde tous les mots clés importants pour le matching IA
- Ne résume pas trop, garde les infos utiles"""


def _page_to_base64(page) -> str:
    mat = fitz.Matrix(2, 2)
    pix = page.get_pixmap(matrix=mat)
    return base64.b64encode(pix.tobytes("png")).decode()


async def _process_page(page, page_num: int, total: int) -> str:
    img_b64 = _page_to_base64(page)

    response = await asyncio.to_thread(
        ollama.chat,
        model="llama3.2-vision:11b",
        messages=[{
            "role": "user",
            "content": EXTRACTION_AND_CLEAN_PROMPT,
            "images": [img_b64]
        }]
    )

    page_text = response["message"]["content"].strip()
    print(f"✅ Page {page_num + 1}/{total} — extracted & cleaned ({len(page_text)} chars)")
    return page_text


async def extract_and_clean_cv(pdf_bytes: bytes) -> str:
    """
    Main entry point for CV processing.
    PDF bytes → vision LLM → extracted + cleaned structured text in one call.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    total_pages = len(doc)
    print(f"📄 Processing CV — {total_pages} page(s)")

    pages_text = []
    for i, page in enumerate(doc):
        page_text = await _process_page(page, i, total_pages)
        pages_text.append(page_text)

    doc.close()

    full_text = "\n\n".join(pages_text)
    print(f"✅ CV fully processed — {len(full_text)} chars total")
    return full_text


# ========================================
# BASIC CLEANING (job descriptions only)
# ========================================
def clean_text_basic(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s.,\-]', '', text)
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'\b\d{8,}\b', '', text)
    return text.strip()