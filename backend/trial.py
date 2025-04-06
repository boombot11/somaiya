import json
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from PIL import Image
from google import genai

# Load environment variables
load_dotenv()

# Configure the Google Gemini API
API_KEY = "AIzaSyDckR-YVG5ghGYo2LBu7okmpp2eqxVWLQY"
client = genai.Client(api_key=API_KEY)

# Function to send data to Gemini and get a response
def get_gemini_response(data):
    # Prepare the prompt with the data
    prompt = f"""
    You are an AI financial assistant tasked with determining whether a given transaction is tax-deductible based on the analysis of the transaction type (withdrawals or deposits). For each transaction, provide an explanation and determine if it is tax-deductible or not. Also, include optimization strategies for tax savings.

    Guidelines:
    - Withdrawals may be tax-deductible depending on the purpose (e.g., business-related withdrawals may be deductible).
    - Deposits are generally not tax-deductible unless specifically stated (e.g., tax-exempt donations).
    - Analyze the description and provide reasoning.

    Transactions:
    {data}

    Return format:
    Transaction description: [Tax-deductible or not] 
    Explanation: [Brief reason]
    Tax Optimization Strategy: [Brief suggestion]
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[prompt]
    )

    return response.text

# Generate graph data points
def generate_graph_data(data):
    graph_data = []
    for entry in data:
        name = entry['description']
        amt = entry.get('withdrawals', entry.get('deposits', 0))
        uv = amt
        pv = amt * 0.6
        graph_data.append({
            'name': name,
            'uv': uv,
            'pv': pv,
            'amt': amt
        })
    return graph_data

# Process transactions
def process_transactions(data, source_label):
    print(f"\n🔍 Processing Transactions from {source_label}...\n")
    gemini_response = get_gemini_response(data)
    print("🧠 Gemini Explanation with Tax Optimization Strategies:")
    print(gemini_response)

    graph_data = generate_graph_data(data)
    print("\n📊 Graph Data Points:")
    print(json.dumps(graph_data, indent=2))

# Simulated image data
def extract_data_from_image(image_path):
    print(f"📷 Simulating OCR for image: {image_path}")
    return [
        { "date": "03-10-16", "description": "ATMW", "withdrawals": 21.25 },
        { "date": "03-10-16", "description": "ATMF", "withdrawals": 1.50 },
        { "date": "03-10-20", "description": "DEBP", "withdrawals": 2.99 },
        { "date": "03-10-21", "description": "WEBP", "withdrawals": 300.00 },
        { "date": "03-10-22", "description": "ATMW", "withdrawals": 100.00 },
        { "date": "03-10-23", "description": "DEBP", "withdrawals": 29.08 },
        { "date": "03-10-24", "description": "DEBR", "deposits": 2.99 },
        { "date": "03-10-27", "description": "TELP", "withdrawals": 6.77 },
        { "date": "03-10-28", "description": "PYRL", "deposits": 694.81 },
        { "date": "03-10-30", "description": "WEBT", "deposits": 50.00 }
    ]

# Simulated PDF data
def extract_data_from_pdf(pdf_path):
    print(f"📄 Simulating text extraction for PDF: {pdf_path}")
    return [
        { "date": "2023-05-01", "description": "Office Rent", "withdrawals": 1200 },
        { "date": "2023-05-03", "description": "Client Payment", "deposits": 3000 },
        { "date": "2023-05-07", "description": "Business Lunch", "withdrawals": 150 },
        { "date": "2023-05-10", "description": "Groceries", "withdrawals": 250 },
        { "date": "2023-05-12", "description": "Software Refund", "deposits": 500 }
    ]

# Main function
def main():
    image_path = "img.jpeg"
    pdf_path = "finance1.pdf"

    # Simulate both PDF and image-based transaction inputs
    image_data = extract_data_from_image(image_path)
    pdf_data = extract_data_from_pdf(pdf_path)

    # Process both sources
    process_transactions(image_data, "Image")
    process_transactions(pdf_data, "PDF")

if __name__ == '__main__':
    main()
