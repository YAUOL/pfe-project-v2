from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")


def get_embedding(text: str):
    """
    Retourne l'embedding normalisé d'un texte.
    """
    if not text or not text.strip():
        return []

    return model.encode(text, normalize_embeddings=True).tolist()