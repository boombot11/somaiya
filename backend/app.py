import os
import csv
from io import StringIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from datetime import datetime
from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv
import google.generativeai as genai

# Setup
app = Flask(__name__)
CORS(app)
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def time_ago(upload_time):
    delta = relativedelta(datetime.now(), upload_time)
    if delta.years: return f"{delta.years} year{'s' if delta.years > 1 else ''} ago"
    if delta.months: return f"{delta.months} month{'s' if delta.months > 1 else ''} ago"
    if delta.days: return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
    if delta.hours: return f"{delta.hours} hour{'s' if delta.hours > 1 else ''} ago"
    if delta.minutes: return f"{delta.minutes} minute{'s' if delta.minutes > 1 else ''} ago"
    return "Just now"

def get_pdf_text(pdf_path):
    print(f"[DEBUG] Extracting text from PDF: {pdf_path}")
    text = ""
    reader = PdfReader(pdf_path)
    for page in reader.pages:
        text += page.extract_text()
    print(f"[DEBUG] Extracted PDF text length: {len(text)}")
    return text

def extract_data_from_text(text):
    print("[DEBUG] Extracting data from text")
    data = []
    reader = csv.reader(StringIO(text))
    for row in reader:
        if len(row) < 3:
            continue
        date, desc, amount = row[0].strip(), row[1].strip(), row[2].strip().replace("$", "").replace(",", "")
        try:
            val = float(amount)
            if val < 0:
                data.append({'date': date, 'description': desc, 'withdrawals': abs(val)})
            else:
                data.append({'date': date, 'description': desc, 'deposits': val})
        except Exception as e:
            print(f"[DEBUG] Failed to parse row: {row} | Error: {e}")
            continue
    print(f"[DEBUG] Extracted {len(data)} transactions")
    return data

def generate_graph_data(data):
    print("[DEBUG] Generating graph data")
    graph = []
    for entry in data:
        val = entry.get("withdrawals", entry.get("deposits", 0))
        graph.append({
            'name': entry['description'],
            'uv': val,
            'pv': val * 0.6,
            'amt': val
        })
    return graph

def get_gemini_response(data_or_text):
    print("[DEBUG] Generating Gemini response")

    model = genai.GenerativeModel('gemini-2.0-flash')

    # Case 1: If input is structured (from CSV or PDF)
    if isinstance(data_or_text, list) and data_or_text:
        prompt = f"""
You are a smart AI tax assistant. The user submitted transaction data:

{data_or_text}

Summarize with key tax insights:
• Only use bullet points
• Max 8 lines
• Focus on deductions, tax tips, filing suggestions
• No emojis, no repetition, no fluff
• Use simple language with context
"""
    
    # Case 2: If it's just user text (freeform, no file)
    elif isinstance(data_or_text, str) and data_or_text.strip():
        prompt = f"""
You are a financial advisor helping a young Indian (age 18–25).

User message:
\"\"\"{data_or_text}\"\"\"

Reply with:
• 8 lines max
• Bullet points only (•)
• Tax advice, investment options, and filing tips
• Use simple, sharp language
• Include warnings or opportunities

No emojis. No long explanations.
"""

    else:
        return "No valid input to analyze."

    # Generate and return Gemini's response
    try:
        response = model.generate_content(prompt)
        print("[DEBUG] Gemini response ready")
        return response.text.strip()
    except Exception as e:
        print(f"[ERROR] Gemini API Error: {e}")
        return "Sorry, I couldn't generate a response right now."


@app.route('/insights', methods=['POST'])
def analyze_file_or_text():
    print("[DEBUG] /insights endpoint hit")
    try:
        attachment = request.files.get('attachment')
        message = request.form.get('message')
        print(f"[DEBUG] attachment: {attachment is not None}, message: {bool(message)}")

        if not attachment and not message:
            return jsonify({'error': 'No input provided'}), 400

        extracted_data = []
        raw_text = ""

        if attachment:
            filename = attachment.filename.lower()
            print(f"[DEBUG] Uploaded file: {filename}")

            if filename.endswith(('.txt', '.csv')):
                file_content = attachment.read().decode('utf-8')
                extracted_data = extract_data_from_text(file_content)
                raw_text = file_content

            elif filename.endswith('.pdf'):
                timestamp = datetime.now()
                filepath = os.path.join("uploads", f"{os.path.splitext(attachment.filename)[0]}_{timestamp.strftime('%d-%m-%y')}.pdf")
                os.makedirs('uploads', exist_ok=True)
                attachment.save(filepath)
                raw_text = get_pdf_text(filepath)
                extracted_data = extract_data_from_text(raw_text)

            else:
                return jsonify({'error': 'Unsupported file type'}), 400

        elif message:
            raw_text = message
            extracted_data = extract_data_from_text(message)

        content_to_analyze = extracted_data if extracted_data else raw_text
        gemini_response = get_gemini_response(content_to_analyze)
        graph_data = generate_graph_data(extracted_data)

        return jsonify({
            'gemini_response': gemini_response,
            'graph_data': graph_data
        })

    except Exception as e:
        print(f"[ERROR] {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/pdf-upload', methods=['POST'])
def handle_pdf_upload():
    print("[DEBUG] /pdf-upload triggered")
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        timestamp = datetime.now()
        filename = f"{os.path.splitext(file.filename)[0]}_{timestamp.strftime('%d-%m-%y')}.pdf"
        filepath = os.path.join("uploads", filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(filepath)

        pdf_text = get_pdf_text(filepath)
        gemini_response = get_gemini_response(pdf_text)
        uploaded_time = time_ago(timestamp)

        return jsonify({
            'gemini_response': gemini_response,
            'saved_timestamp': timestamp.strftime('%d-%m-%y'),
            'uploaded_time': uploaded_time,
            'file_name': os.path.splitext(file.filename)[0]
        })

    except Exception as e:
        print(f"[ERROR] {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    os.makedirs('uploads', exist_ok=True)
    print("[DEBUG] Starting Flask server on port 5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
