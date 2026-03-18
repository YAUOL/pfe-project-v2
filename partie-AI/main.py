import os
from extractors.pdf_extractor import extract_text_from_pdf
from extractors.docx_extractor import extract_text_from_docx
from cleaners.text_cleaner import clean_text


def process_cv(file_path):
    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        raw_text = extract_text_from_pdf(file_path)

    elif extension == ".docx":
        raw_text = extract_text_from_docx(file_path)

    else:
        raise ValueError("Unsupported file format. Use PDF or DOCX.")

    cleaned_text = clean_text(raw_text)

    return cleaned_text


if __name__ == "__main__":
    file_path = input("Enter CV file path: ").strip().strip('"')

    try:
        result = process_cv(file_path)
        print("\n----- CLEANED CV TEXT -----\n")
        print(result)

    except Exception as e:
        print(f"Error: {e}")
