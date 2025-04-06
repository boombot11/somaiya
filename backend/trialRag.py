import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from google import genai
import json
import os
from dotenv import load_dotenv
from PIL import Image
from google import genai

# Load environment variables (make sure to set the GEMINI_API_KEY in your .env file)
load_dotenv()

# Configure the Gemini API client
API_KEY = "AIzaSyDckR-YVG5ghGYo2LBu7okmpp2eqxVWLQY"
client = genai.Client(api_key=API_KEY)

def get_pdf_text(pdf_path):
    """Extract text from a given PDF."""
    text = ""
    pdf_reader = PdfReader(pdf_path)
    for page_num, page in enumerate(pdf_reader.pages):
        page_text = page.extract_text()
        print(f"📄 Page {page_num + 1} extracted text:\n{page_text}\n")
        if page_text:
            text += page_text
    return text

def query_gemini(data):
    """Create a custom prompt and query the Gemini API for tax-deductibility analysis."""
    prompt = f"""
    You are an AI financial assistant tasked with determining whether a given transaction is tax-deductible based on the analysis of the transaction type (withdrawals or deposits). For each transaction, provide an explanation and determine if it is tax-deductible or not. Also, include optimization strategies for tax savings.

    Please consider the following guidelines:
    - Withdrawals may be tax-deductible depending on the purpose (e.g., business-related withdrawals may be deductible).
    - Deposits are generally not tax-deductible unless specifically stated (e.g., tax-exempt donations).
    - Consider the description of each transaction and provide an explanation for your decision.
    - Provide suggestions on how to optimize tax savings based on the transactions.

    Here's the data:
    {data}
    """

    # Send the prompt to Gemini API using chat interface
    chat = client.chats.create(model="gemini-2.0-flash")
    response = chat.send_message(prompt)

    # Return the response text
    return response.text

def main(pdf_path):
    """Main function to process the PDF and run RAG-based analysis with Gemini."""
    
    # Step 1: Extract text from the PDF
    raw_text = get_pdf_text(pdf_path)
    
    # Step 2: Query Gemini with the full text (raw text) from the PDF
    response = query_gemini(raw_text)
    
    # Step 3: Print the response from Gemini
    print("Gemini Response:")
    print(response)

# Example usage
def main(pdf_path):
    """Main function to process the PDF and run RAG-based analysis with Gemini."""
    
    # Step 1: Extract text from the PDF
    raw_text = get_pdf_text(pdf_path)

    if not raw_text or raw_text.strip() == "":
        print("⚠️ No text extracted from PDF. Using hardcoded sample data for analysis.\n")
        raw_text = """
        2023-05-01 | Withdrawal | $1,200 | Office rent payment
        2023-05-03 | Deposit    | $3,000 | Client payment for design services
        2023-05-07 | Withdrawal | $150   | Business lunch with potential client
        2023-05-10 | Withdrawal | $250   | Personal groceries
        2023-05-12 | Deposit    | $500   | Refund from business software
        """

    else:
        print("✅ PDF text extracted successfully. Sending to Gemini...\n")

    # Step 2: Query Gemini with the text
    response = query_gemini(raw_text)

    # Step 3: Print the response from Gemini
    print("🧠 Gemini Response:\n")
    print(response)
