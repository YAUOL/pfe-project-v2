import re

def clean_text(text):
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)     # remove extra spaces
    text = re.sub(r'[^a-z0-9\s]', '', text)  # remove symbols
    return text.strip()
