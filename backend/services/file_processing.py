# backend/services/file_processing.py
import PyPDF2
import json
import csv
import io

def process_uploaded_file(file):
    """Extracts text content from various file types (PDF, TXT, CSV, JSON)."""
    filename = file.filename
    content = file.read()
    text = ""
    file_type = "unknown"

    if filename.endswith(".pdf"):
        file_type = "pdf"
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                text += page.extract_text() or ""
        except Exception:
            # Fallback for corrupted PDFs
            text = "Could not extract text from PDF."
    elif filename.endswith(".txt"):
        file_type = "txt"
        text = content.decode("utf-8")
    elif filename.endswith(".csv"):
        file_type = "csv"
        decoded_content = content.decode("utf-8")
        reader = csv.reader(io.StringIO(decoded_content))
        # Simple text conversion: join all cells
        text = "\n".join([",".join(row) for row in reader])
    elif filename.endswith(".json"):
        file_type = "json"
        # Pretty print the JSON content as the text
        data = json.loads(content)
        text = json.dumps(data, indent=2)
    
    return {"text": text, "file_type": file_type}
