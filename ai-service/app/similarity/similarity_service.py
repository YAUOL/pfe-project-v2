from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def compute_similarity(vec1, vec2):
    vec1 = np.array(vec1).reshape(1, -1)
    vec2 = np.array(vec2).reshape(1, -1)

    score = cosine_similarity(vec1, vec2)[0][0]

    # convert to percentage
    return round(float(score) * 100, 2)