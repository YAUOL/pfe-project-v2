import requests
import base64
import json


# ========================================
# CONFIGURATION
# ========================================
OLLAMA_URL = "http://localhost:11434/api/generate"
IMAGE_PATH = "facture.png"
OUTPUT_FILE = "facture_extracted.json"
MODEL_NAME = "llama3.2-vision:11b"

EXTRACTION_PROMPT = """Extract all information from this invoice and format as JSON with these fields:
- invoice_number
- date
- due_date
- seller (name, address)
- buyer (name, address)
- items (list with description, quantity, unit_price, total)
- subtotal
- tax_rate
- tax_amount
- total (totale de la facture)
- payment_terms
- bank_details (iban, swift)"""


# ========================================
# FUNCTIONS
# ========================================
def load_image_as_base64(image_path: str) -> str:
    """Load an image file and convert it to base64."""
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    return base64.b64encode(image_bytes).decode("utf-8")


def call_ollama_vision(image_base64: str) -> dict:
    """Send image to Ollama Vision API and return extracted data."""
    payload = {
        "model": MODEL_NAME,
        "prompt": EXTRACTION_PROMPT,
        "images": [image_base64],
        "format": "json",
        "stream": False,
    }

    headers = {"Content-Type": "application/json"}
    response = requests.post(OLLAMA_URL, headers=headers, json=payload)

    if response.status_code != 200:
        raise RuntimeError(f"Ollama API error {response.status_code}: {response.text}")

    result = response.json()
    return json.loads(result.get("response", "{}"))


def display_invoice_data(data: dict) -> None:
    """Display extracted invoice data in a readable format."""
    print("\n=== INFORMATIONS EXTRAITES ===\n")

    # General info
    print(f"Facture N°: {data.get('invoice_number', 'N/A')}")
    print(f"Date: {data.get('date', 'N/A')}")
    print(f"Échéance: {data.get('due_date', 'N/A')}")

    # Seller
    seller = data.get("seller", {})
    print(f"\nVendeur: {seller.get('name', 'N/A')}")
    print(f"Adresse: {seller.get('address', 'N/A')}")

    # Buyer
    buyer = data.get("buyer", {})
    print(f"\nAcheteur: {buyer.get('name', 'N/A')}")
    print(f"Adresse: {buyer.get('address', 'N/A')}")

    # Items
    print("\n--- Articles ---")
    for item in data.get("items", []):
        description = item.get("description", "N/A")
        quantity = item.get("quantity", "N/A")
        unit_price = item.get("unit_price", "N/A")
        total = item.get("total", "N/A")
        print(f"  - {description}: {quantity} x {unit_price}€ = {total}€")

    # Totals
    print(f"\nSous-total HT: {data.get('subtotal', 'N/A')}€")
    print(f"TVA ({data.get('tax_rate', 'N/A')}): {data.get('tax_amount', 'N/A')}€")
    print(f"Total TTC: {data.get('total', 'N/A')}€")

    # Payment
    print(f"\nConditions: {data.get('payment_terms', 'N/A')}")
    bank = data.get("bank_details", {})
    print(f"IBAN: {bank.get('iban', 'N/A')}")
    print(f"SWIFT: {bank.get('swift', 'N/A')}")


def save_to_json(data: dict, output_file: str) -> None:
    """Save extracted data to a JSON file."""
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Données sauvegardées dans '{output_file}'")


# ========================================
# MAIN
# ========================================
def main():
    try:
        # 1. Load image
        print(f"📄 Chargement de l'image: {IMAGE_PATH}")
        image_base64 = load_image_as_base64(IMAGE_PATH)

        # 2. Call Ollama Vision API
        print(f"🤖 Appel du modèle {MODEL_NAME}...")
        extracted_data = call_ollama_vision(image_base64)

        # 3. Display results
        display_invoice_data(extracted_data)

        # 4. Save to JSON
        save_to_json(extracted_data, OUTPUT_FILE)

    except FileNotFoundError:
        print(f"❌ Erreur: Le fichier '{IMAGE_PATH}' n'existe pas")

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de l'appel à l'API Ollama: {e}")

    except json.JSONDecodeError as e:
        print(f"❌ Erreur de parsing JSON: {e}")

    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")


if __name__ == "__main__":
    main()