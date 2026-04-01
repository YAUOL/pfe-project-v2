from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def compute_similarity(vec1, vec2):
    """
    Calcule la similarité cosinus entre deux vecteurs
    et retourne un pourcentage entre 0 et 100.
    """
    if not vec1 or not vec2:
        return 0.0

    vec1 = np.array(vec1).reshape(1, -1)
    vec2 = np.array(vec2).reshape(1, -1)

    score = cosine_similarity(vec1, vec2)[0][0]

    # sécurité
    score = max(0.0, min(float(score), 1.0))

    return round(score * 100, 2)