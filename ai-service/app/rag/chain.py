import ollama
import re
from app.rag.ingestor import _load_meta, JOBS_META_PATH, search_platform


def is_all_jobs_query(question: str) -> bool:
    q = question.lower()
    has_specific = any(k in q for k in [
        'java', 'python', 'react', 'angular', 'devops', 'data', 'mobile',
        'flutter', 'node', 'php', 'net', 'frontend', 'backend', 'fullstack',
        'above', 'below', 'salary', 'salaire', 'tnd', 'stage', 'internship',
        'tunis', 'sousse', 'sfax', 'ariana', 'category', 'experience'
    ])
    triggers = ['all jobs', 'all offers', 'all positions', 'gimme all',
                'show all', 'list all', 'tous les', 'toutes les offres']
    return any(k in q for k in triggers) and not has_specific


def is_salary_query(question: str) -> bool:
    keywords = ['salary', 'salaire', 'above', 'below', 'more than', 'less than',
                'over', 'under', 'plus de', 'moins de', 'supérieur', 'inférieur',
                'combien', 'wage', 'tnd', 'rémunération', 'pay', 'earn']
    return any(k in question.lower() for k in keywords)


def is_job_listing_query(question: str) -> bool:
    keywords = ['job', 'jobs', 'offer', 'offers', 'offre', 'offres', 'position',
                'available', 'liste', 'list', 'show', 'find', 'search', 'developer',
                'engineer', 'data', 'frontend', 'backend', 'fullstack', 'devops',
                'mobile', 'python', 'java', 'react', 'angular', 'stage', 'internship',
                'emploi', 'poste', 'travail', 'cherche', 'looking for', 'hiring', 'want']
    return any(k in question.lower() for k in keywords)


def extract_salary_threshold(question: str):
    question_lower = question.lower()

    # "90k" → 90, "100k" → 100 (keep in thousands to match DB)
    match = re.search(r'(\d+)\s*k', question_lower)
    if match:
        threshold = int(match.group(1))
    else:
        # plain number like "90000" → 90, "90" → 90
        match = re.search(r'(\d+)', question_lower)
        if match:
            raw = int(match.group(1))
            threshold = raw // 1000 if raw >= 1000 else raw
        else:
            threshold = None

    if not threshold:
        return None, None

    if any(w in question_lower for w in ['above', 'over', 'more than', 'plus de', 'supérieur', 'greater']):
        return threshold, 'above'
    if any(w in question_lower for w in ['below', 'under', 'less than', 'moins de', 'inférieur']):
        return threshold, 'below'
    return threshold, 'above'


def filter_jobs_by_salary(meta: list, threshold: int, direction: str) -> list:
    results = []
    for job in meta:
        salary_max = job.get("salary_max", 0)
        salary_min = job.get("salary_min", 0)
        if direction == 'above' and salary_max >= threshold:
            results.append(job)
        elif direction == 'below' and salary_min <= threshold:
            results.append(job)
    return results


def search_jobs_meta(query: str, n: int = 10) -> list:
    meta = _load_meta(JOBS_META_PATH)
    if not meta:
        return []

    query_lower = query.lower()
    stopwords = {'a', 'the', 'all', 'jobs', 'job', 'give', 'me', 'show',
                 'find', 'related', 'to', 'about', 'want', 'i', 'for',
                 'gimme', 'please', 'can', 'you', 'any', 'some', 'get',
                 'offers', 'offer', 'positions', 'position', 'available'}
    keywords = [w for w in re.findall(r'\w+', query_lower) if w not in stopwords and len(w) > 2]

    if not keywords:
        return meta[:n]

    results = []
    for job in meta:
        job_title = job.get("title", "").lower()
        job_skills = job.get("skills", "").lower()
        job_location = job.get("location", "").lower()
        job_category = job.get("category", "").lower()
        job_experience = job.get("experience_level", "").lower()
        job_contract = job.get("type_contrat", "").lower()

        if any(
            kw in job_title or kw in job_skills or kw in job_location
            or kw in job_category or kw in job_experience or kw in job_contract
            for kw in keywords
        ):
            results.append(job)

    return results[:n] if results else []


def format_jobs_from_meta(meta_list: list) -> str:
    if not meta_list:
        return "No jobs found matching your criteria."

    lines = [f"Here are the matching job offers ({len(meta_list)} found):\n"]
    for job in meta_list:
        salary_min = job.get("salary_min", 0)
        salary_max = job.get("salary_max", 0)
        salary_display = f"{salary_min}k - {salary_max}k TND" if salary_min and salary_max else "Not specified"

        lines.append(
            f"🏢 {job.get('title', 'N/A')}\n"
            f"🏛️ Company: {job.get('company', 'Not specified')}\n"
            f"📍 Location: {job.get('location', 'Not specified')}\n"
            f"💰 Salary: {salary_display}\n"
            f"🎓 Experience: {job.get('experience_level', 'Not specified')}\n"
            f"📋 Contract: {job.get('type_contrat', 'Not specified')}\n"
            f"🛠️ Skills: {job.get('skills', 'Not specified')}\n"
            f"---"
        )
    lines.append("\n💡 To apply, create a candidate account on JobBoard and upload your CV!")
    return "\n".join(lines)


def ask_chatbot(question: str, history: list = []) -> str:

    # SALARY QUERY → exact integer comparison
    if is_salary_query(question):
        threshold, direction = extract_salary_threshold(question)
        all_meta = _load_meta(JOBS_META_PATH)
        if threshold:
            filtered = filter_jobs_by_salary(all_meta, threshold, direction)
        else:
            filtered = all_meta
        return format_jobs_from_meta(filtered)

    # SPECIFIC JOB LISTING → keyword search on metadata fields
    if is_job_listing_query(question):
        matched_meta = search_jobs_meta(question, n=10)
        return format_jobs_from_meta(matched_meta)

    # ALL JOBS → return everything
    if is_all_jobs_query(question):
        all_meta = _load_meta(JOBS_META_PATH)
        return format_jobs_from_meta(all_meta)

    # CONVERSATIONAL → LLM with platform knowledge
    platform_results = search_platform(question, n=3)
    context = "PLATFORM INFORMATION:\n" + "\n---\n".join(platform_results) if platform_results else "No relevant information found."

    system_prompt = """You are a helpful assistant for JobBoard, an AI-powered recruitment platform.
Answer ONLY based on the context provided.
If the answer is not in the context, say you don't have that information.
Be concise, friendly, and professional.
Respond in the same language the user is writing in."""

    prompt = f"""CONTEXT:
{context}

USER QUESTION:
{question}

ANSWER:"""

    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        messages.append(msg)
    messages.append({"role": "user", "content": prompt})

    response = ollama.chat(model="qwen2.5:3b", messages=messages)
    return response["message"]["content"].strip()