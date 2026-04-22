import psycopg2
from app.rag.ingestor import ingest_job, _load_meta, JOBS_META_PATH

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "recrutement_db",
    "user": "postgres",
    "password": "postgres123"
}


def sync_all_jobs():
    existing = _load_meta(JOBS_META_PATH)
    if existing:
        print(f"✅ Jobs already in FAISS ({len(existing)} jobs) — skipping sync")
        return

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                id, titre, description, competences_requises,
                localisation, salary_min, salary_max,
                company, category, experience_level, type_contrat
            FROM offres
            WHERE status = 'ACTIVE'
        """)

        rows = cursor.fetchall()
        print(f"📦 Found {len(rows)} active jobs in PostgreSQL")

        for row in rows:
            job_id, titre, description, competences, localisation, salary_min, salary_max, company, category, experience_level, type_contrat = row

            ingest_job(
                job_id=str(job_id),
                title=titre or "",
                description=description or "",
                skills=competences or "",
                location=localisation or "",
                salary=f"{salary_min}k - {salary_max}k TND",
                salary_min=salary_min or 0,
                salary_max=salary_max or 0,
                company=company or "",
                category=category or "",
                experience_level=experience_level or "",
                type_contrat=type_contrat or ""
            )

        cursor.close()
        conn.close()
        print(f"✅ {len(rows)} jobs synced to FAISS")

    except Exception as e:
        print(f"❌ DB sync error: {e}")