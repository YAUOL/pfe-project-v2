import re

def clean_text(text):
    # 1️ Lowercase
    text = text.lower()
    
    # 2️ Remove emails
    text = re.sub(r'\S+@\S+', '', text)
    
    # 3️ Remove special characters
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    
    # 4️ Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text
