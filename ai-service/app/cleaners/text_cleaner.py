import ollama
import re

def clean_text_with_llm(text: str) -> str:
    """
    Nettoyage intelligent de CV avec LLM (version améliorée)
    """

    prompt = f"""
Tu es un expert RH et ATS (Applicant Tracking System).

OBJECTIF :
Extraire et structurer les informations IMPORTANTES d’un CV pour le recrutement.

GARDE UNIQUEMENT :
- Compétences techniques 
- Soft skills 
- Expériences professionnelles 
- Formation 
- Langues
- Certifications

SUPPRIME :
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
        response = ollama.chat(
            model='llama3.2-vision:11b',
            messages=[{
                'role': 'user',
                'content': prompt
            }]
        )

        cleaned = response['message']['content'].strip()
        return cleaned

    except Exception as e:
        print(f"❌ Erreur Llama : {e}")
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