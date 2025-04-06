import os
from datetime import datetime
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
import google.generativeai as genai
from PyPDF2 import PdfReader
from datetime import datetime
from dateutil.relativedelta import relativedelta
import time

app = Flask(__name__)

# Helper function to calculate time difference in a readable format
def time_ago(upload_time):
    delta = relativedelta(datetime.now(), upload_time)
    if delta.years > 0:
        return f"{delta.years} year{'s' if delta.years > 1 else ''} ago"
    elif delta.months > 0:
        return f"{delta.months} month{'s' if delta.months > 1 else ''} ago"
    elif delta.days > 0:
        return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
    elif delta.hours > 0:
        return f"{delta.hours} hour{'s' if delta.hours > 1 else ''} ago"
    elif delta.minutes > 0:
        return f"{delta.minutes} minute{'s' if delta.minutes > 1 else ''} ago"
    else:
        return "Just now"
# Load environment variables from .env file
load_dotenv()

# Initialize the Groq client with API key from environment variables
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

# Configure the Gemini API with API key from environment variables
genai.configure(api_key="AIzaSyDckR-YVG5ghGYo2LBu7okmpp2eqxVWLQY")

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)


def get_gemini_response(data):
    prompt = f"""
You are a smart AI assistant helping people understand financial records, especially whether a transaction is tax-deductible or not.

Please review the given data and do the following:

1. For each **transaction**, determine:
    - ✅ Whether it is Tax-Deductible or ❌ Not Deductible
    - A simple explanation (like "ATM withdrawals are usually personal and not related to business.")
    - One short tax-saving tip if applicable

Use this format for each transaction:
Transaction: [Short Description]  
✅ Tax-Deductible or ❌ Not Deductible  
Why: [Simple Explanation]  
Tip: [One-liner advice if possible]

2. If you find **non-transactional text** (such as notes, summaries, income details, or general descriptions), analyze it briefly in everyday language. 
Explain what it means and mention if it might be relevant for taxes (e.g., income notes, deductions, reimbursements, donations, etc.)

Keep all responses short, clear, and helpful for a non-expert. Here's the data to analyze:
{data}
"""
    response = genai.GenerativeModel('gemini-2.0-flash').generate_content([prompt])
    return response.text




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


def extract_data_from_image(image_file_path):
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


def extract_data_from_text(text):
    lines = text.strip().splitlines()
    data = []
    for line in lines:
        parts = line.split(',')
        if len(parts) < 3:
            continue
        date, description, amount = parts[0].strip(), parts[1].strip(), parts[2].strip()
        try:
            amt_val = float(amount)
        except ValueError:
            continue
        if amt_val < 0:
            data.append({'date': date, 'description': description, 'withdrawals': abs(amt_val)})
        else:
            data.append({'date': date, 'description': description, 'deposits': amt_val})
    return data


def process_text_input(content):
    lines = content.strip().split("\n")
    parsed = []
    for line in lines:
        parts = line.strip().split()
        if len(parts) < 3:
            continue
        date = parts[0]
        desc = " ".join(parts[1:-1])
        amount_str = parts[-1].replace("$", "").replace(",", "")
        try:
            amount = float(amount_str)
            if "deposit" in desc.lower() or "refund" in desc.lower():
                parsed.append({"date": date, "description": desc, "deposits": amount})
            else:
                parsed.append({"date": date, "description": desc, "withdrawals": amount})
        except ValueError:
            continue
    return parsed
@app.route('/insights', methods=['POST'])
def analyze_image_and_text():
    try:
        attachment = request.files.get('attachment')
        message = request.form.get('message')

        if not attachment and not message:
            return jsonify({'error': 'No message or attachment provided'}), 400

        extracted_data = []

        if attachment:
            filename = attachment.filename.lower()

            if filename.endswith(('.png', '.jpg', '.jpeg')):
                extracted_data = extract_data_from_image(attachment)

            elif filename.endswith(('.txt', '.csv')):
                file_content = attachment.read().decode('utf-8')
                extracted_data = extract_data_from_text(file_content)

            elif filename.endswith('.pdf'):
                # Save the uploaded PDF temporarily
                timestamp = datetime.now()
                file_name = f"{os.path.splitext(attachment.filename)[0]}_{timestamp.strftime('%d-%m-%y')}.pdf"
                file_path = os.path.join('uploads', file_name)
                attachment.save(file_path)

                # Extract text and process like text
                pdf_text = get_pdf_text(file_path)
                extracted_data = extract_data_from_text(pdf_text)

            else:
                return jsonify({'error': 'Unsupported file type'}), 400

        elif message:
            extracted_data = extract_data_from_text(message)

        # Gemini analysis
        gemini_response = get_gemini_response(extracted_data)

        # Graph data
        graph_data = generate_graph_data(extracted_data)

        return jsonify({
            'gemini_response': gemini_response,
            'graph_data': graph_data
        })

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({'error': str(e)}), 500

def get_pdf_text(pdf_path):
    """Extract text from a given PDF."""
    text = ""
    pdf_reader = PdfReader(pdf_path)
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text
# Configure the Gemini API with API key from environment variables
genai.configure(api_key="AIzaSyDckR-YVG5ghGYo2LBu7okmpp2eqxVWLQY")

def query_gemini(data):
    """Create a custom prompt and query the Gemini API for analysis."""
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

    # Send the prompt to Gemini API using the correct method
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")  # You can use gemini-1.5-pro if needed
        response = model.generate_content(prompt)
        return response.text
        # Return the response text
        return response.text

    except Exception as e:
        print(f"Error interacting with Gemini API: {e}")
        return "Failed to connect to Gemini."
@app.route('/api/whisper-transcribe', methods=['POST'])
def transcribe_audio():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        file_data = file.read()  
        file.seek(0)

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        transcription = client.audio.transcriptions.create(
            file=('audio.wav', file_data),
            model="whisper-large-v3-turbo",
            prompt="Specify context or spelling",
            response_format="verbose_json",
            timestamp_granularities=["word", "segment"],
            language="en",
            temperature=0.0
        )

        transcription_text = transcription.text
        gemini_response = send_to_gemini(transcription_text)
        return jsonify({'gemini_response': gemini_response})

    except Exception as e:
        print(f"Error processing the request: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/pdf-upload', methods=['POST'])
def pdf_upload():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Get the current timestamp
        timestamp = datetime.now()

        # Save the file with timestamped filename
        file_name = f"{os.path.splitext(file.filename)[0]}_{timestamp.strftime('%d-%m-%y')}{os.path.splitext(file.filename)[1]}"
        file_path = os.path.join('uploads', file_name)
        file.save(file_path)

        # Extract PDF text
        pdf_text = get_pdf_text(file_path)

        # Query Gemini API with PDF text
        gemini_response = query_gemini(pdf_text)

        # Get the time difference in a readable format
        uploaded_time = time_ago(timestamp)

        # Return the response
        return jsonify({
            'gemini_response': gemini_response,
            'saved_timestamp': timestamp.strftime('%d-%m-%y'),
            'uploaded_time': uploaded_time,
            'file_name': os.path.splitext(file.filename)[0],  # Filename without timestamp
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def send_to_gemini(transcription_text):
    """Function to send transcription text to Gemini LLM with a prompt."""
    prompt = f"""
    You are a text analyzer. The task is to analyze the provided text and categorize it based on the following labels:
    
    - **Dashboard**: If the text refers to anything related to the dashboard, such as "Dashboard", "overview", "control panel", "settings", "user interface", etc., return "Dashboard".
    - **Login**: If the text refers to anything related to logging in, such as "Login", "Sign In", "authentication", "username", "password", "login page", "signin", etc., return "Login".
    - **Signup**: If the text refers to anything related to user sign-up or account creation, such as "Signup", "register", "sign up", "create account", etc., return "Signup".
    - **Home**: If the text refers to anything related to the homepage, landing page, or general entry point of a website, such as "Home", "Landing", "welcome page", "homepage", etc., return "Home".
    
    NOTE: If the text refers to anything related to the following : [Insights, Kanban, Social, FAQ], anything close to these options in given then ONLY return back the words
    "Insights", "Kanban", "Social", "FAQ" respectively and nothing else.
    If nothing is matching any of the above categories, return "None" Only.
    
    Please review the following text and based on the context or keywords, return only the word representing the category (dashboard, login, signup, or home). Do not return anything else.
    
    Text:
    {transcription_text}
    
    Return the category (dashboard, login, signup, or home) OR (insights, kanban, social, faq) only, without any additional text or explanation.:
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content([transcription_text, prompt])
        return response.text

    except Exception as e:
        print(f"Error interacting with Gemini API: {e}")
        return "Failed to connect to Gemini."

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True, host='0.0.0.0', port=5000)
