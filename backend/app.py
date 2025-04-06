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

def get_pdf_text(pdf_path):
    """Extract text from a given PDF."""
    text = ""
    pdf_reader = PdfReader(pdf_path)
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

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

    # Send the prompt to Gemini API using chat interface
    chat = genai.Client(api_key=os.getenv("GEMINI_API_KEY")).chats.create(model="gemini-2.0-flash")
    response = chat.send_message(prompt)

    # Return the response text
    return response.text

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
