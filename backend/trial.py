import json
import os
from dotenv import load_dotenv
from PIL import Image
from google import genai

# Load environment variables
load_dotenv()

# Configure the Google Gemini API
API_KEY = "AIzaSyDckR-YVG5ghGYo2LBu7okmpp2eqxVWLQY"
client = genai.Client(api_key=API_KEY)

# Function to send data to Gemini and get a response (Updated to use genai Client)
def get_gemini_response(data):
    # Prepare the prompt with the data
    prompt = f"""
    You are an AI financial assistant tasked with determining whether a given transaction is tax-deductible based on the analysis of the transaction type (withdrawals or deposits). For each transaction, provide an explanation and determine if it is tax-deductible or not. Also, include optimization strategies for tax savings.

    Please consider the following guidelines:
    - Withdrawals may be tax-deductible depending on the purpose (e.g., business-related withdrawals may be deductible).
    - Deposits are generally not tax-deductible unless specifically stated (e.g., tax-exempt donations).
    - Consider the description of each transaction and provide an explanation for your decision.
    - Provide suggestions on how to optimize tax savings based on the transactions.

    Here's the data:
    {data}

    Please return the analysis for each transaction, followed by whether it is tax-deductible or not, and optimization strategies, in the following format:
    Transaction description: [Tax-deductible or not] 
    Explanation: [A brief explanation of why or why not]
    Tax Optimization Strategy: [Brief suggestion for tax-saving strategies]
    """

    # The `generate_content` method in the `genai.Client` sends the prompt to Gemini
    response = client.models.generate_content(
        model="gemini-2.0-flash",  # Specify the model to use
        contents=[prompt]  # Content is sent as a list, with the prompt inside
    )

    # Check if response was successful and return the response text
    return response.text

# Function to generate graph data points
def generate_graph_data(data):
    # Prepare data points for plotting the graph in the requested format
    graph_data = []
    for i, entry in enumerate(data):
        name = entry['description']  # Using the description as 'name' for the graph
        amt = entry['withdrawals'] if 'withdrawals' in entry else entry['deposits']
        uv = amt  # Assuming uv value is the same as amt for simplicity
        pv = amt * 0.6  # Just a mock calculation for pv (could be something like 60% of the amt)

        graph_data.append({
            'name': name,
            'uv': uv,
            'pv': pv,
            'amt': amt
        })

    # Return the graph data in the requested format
    return graph_data

# Function to process and generate results
def process_transactions(data):
    # Step 1: Get tax explanation and optimization strategy from Gemini
    gemini_response = get_gemini_response(data)
    print("Gemini Explanation with Tax Optimization Strategies:")
    print(gemini_response)

    # Step 2: Generate graph data
    graph_data = generate_graph_data(data)
    print("\nGraph Data Points for Visualization:")
    print(json.dumps(graph_data, indent=2))

# Function to simulate dynamic data input (for uploaded image or dynamic source)
def extract_data_from_image(image_file_path):
    # For the purpose of this code, we're simulating the extraction of data
    # This function would typically involve image processing (e.g., OCR) to extract text data
    # Here, we're directly passing a hypothetical dynamic data source
    extracted_data = [
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
    return extracted_data

# Main function for executing logic
def main():
    # Simulate extracting data from an uploaded image (dynamic source)
    image_file_path = "img.jpeg"  # Replace with actual image path
    extracted_data = extract_data_from_image(image_file_path)

    # Process the extracted transaction data
    process_transactions(extracted_data)

if __name__ == '__main__':
    main()
