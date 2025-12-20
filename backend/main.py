
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

# Import your service modules
from services.file_processing import process_uploaded_file
from services.chunking import chunk_document
from services.embeddings import configure_gemini, get_embedding, find_similar_chunks
from services.chat import generate_chat_response
from services.topic_modeling import analyze_topics

# --- Initialization ---
load_dotenv()

app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": [
        "https://dashboard-theta-opal-48.vercel.app",
        "https://dashboard-btf7vfyh6-virasat.vercel.app"
    ]}},
    supports_credentials=True
)


# Initialize Firebase Admin SDK
firebase_json= os.getenv("FIREBASE_SERVICE_ACCOUNT")
service_account_info = json.loads(firebase_json)
cred = credentials.Certificate(service_account_info)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize Gemini AI
print("Loading environment variables...")
print(f"Available env vars: {os.environ}")
gemini_api_key = os.getenv("GEMINI_API_KEY")
print(f"GEMINI_API_KEY loaded: {'*' * (len(gemini_api_key) if gemini_api_key else 0)}")

if not gemini_api_key:
    print("ERROR: GEMINI_API_KEY is not set in environment variables")
else:
    print("Configuring Gemini with API key...")
    configure_gemini(gemini_api_key)
    print("Gemini configuration complete")


# --- API Endpoints ---

@app.route("/api/health", methods=["GET", "OPTIONS"])
@cross_origin(
    origins=[
        "https://dashboard-theta-opal-48.vercel.app",
        "https://dashboard-btf7vfyh6-virasat.vercel.app"
    ],
    supports_credentials=True
)
def health_check():
    if request.method == "OPTIONS":
        return "", 204
    return jsonify({"status": "ok"}), 200

# Endpoint to process an uploaded file and chunk it
@app.route("/api/process-file", methods=["POST", "OPTIONS"])
@cross_origin(
    origins=[
        "https://dashboard-theta-opal-48.vercel.app",
        "https://dashboard-btf7vfyh6-virasat.vercel.app"
    ],
    supports_credentials=True
)
def handle_process_file():
    if request.method == "OPTIONS":
        return "", 204
        
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    processed = process_uploaded_file(file)
    chunks = chunk_document(processed["text"])
    
    return jsonify({
        "text": processed["text"],
        "fileType": processed["file_type"],
        "chunks": chunks
    }), 200


@app.route("/api/embed-resource", methods=["POST", "OPTIONS"])
@cross_origin(
    origins=[
        "https://dashboard-theta-opal-48.vercel.app",
        "https://dashboard-btf7vfyh6-virasat.vercel.app"
    ],
    supports_credentials=True
)
def handle_embed_resource():
    if request.method == "OPTIONS":
        return "", 204
        
    data = request.get_json()
    chunks = data.get("chunks", [])
    
    if not chunks:
        return jsonify({"error": "No chunks provided"}), 400
        
    embedded_chunks = []
    for i, chunk_text in enumerate(chunks):
        if not chunk_text or not chunk_text.strip():
            print(f"Skipping empty chunk at index {i}")
            continue
            
        try:
            embedding = get_embedding(chunk_text)
            if embedding:
                embedded_chunks.append({
                    "index": i,
                    "text": chunk_text,
                    "embedding": embedding
                })
            else:
                print(f"Failed to generate embedding for chunk {i}")
        except Exception as e:
            print(f"Error generating embedding for chunk {i}: {str(e)}")
            continue
            
    return jsonify({
        "embeddedChunks": embedded_chunks,
        "totalEmbedded": len(embedded_chunks)
    }), 200
    
# Endpoint to generate a single embedding
@app.route("/api/embed", methods=["POST", "OPTIONS"])
@cross_origin(
    origins=[
        "https://dashboard-theta-opal-48.vercel.app",
        "https://dashboard-btf7vfyh6-virasat.vercel.app"
    ],
    supports_credentials=True
)
def handle_embed():
    if request.method == "OPTIONS":
        return "", 204
        
    text = request.json.get("text")
    embedding = get_embedding(text)
    if not embedding:
        return jsonify({"error": "Failed to generate embedding"}), 500
    return jsonify({"embedding": embedding}), 200

# Main chat endpoint with semantic search
@app.route("/api/chat", methods=["POST", "OPTIONS"])
@cross_origin(
    origins=[
        "https://dashboard-theta-opal-48.vercel.app",
        "https://dashboard-btf7vfyh6-virasat.vercel.app"
    ],
    supports_credentials=True
)
def handle_chat():
    if request.method == "OPTIONS":
        return "", 204
        
    data = request.get_json()
    message = data.get("message")
    user_id = data.get("userId")

    # 1. Embed the user's query
    query_embedding = get_embedding(message)
    if not query_embedding:
        return jsonify({"response": "Sorry, I couldn't process your question.", "sourceResources": []})

    # 2. Fetch all resource chunks from Firestore
    all_chunks = []
    resources_ref = db.collection('resources').stream()
    for resource in resources_ref:
        res_data = resource.to_dict()
        for chunk in res_data.get('chunks', []):
            chunk['resourceName'] = res_data.get('name', 'Unknown')
            all_chunks.append(chunk)

    # 3. Find top N similar chunks (semantic search)
    similar_chunks = find_similar_chunks(query_embedding, all_chunks, top_k=3)

    # 4. Generate a response using the context
    response_text = generate_chat_response(message, similar_chunks)
    source_names = list(set([c['resourceName'] for c in similar_chunks]))

    # 5. Save chat history to Firestore
    db.collection('chats').add({
        'userId': user_id,
        'message': message,
        'response': response_text,
        'sourceResources': source_names,
        'timestamp': firestore.SERVER_TIMESTAMP,
    })

    return jsonify({"response": response_text, "sourceResources": source_names})

# Endpoint for topic modeling
@app.route("/api/topics", methods=["POST", "OPTIONS"])
@cross_origin(
    origins=[
        "https://dashboard-theta-opal-48.vercel.app",
        "https://dashboard-btf7vfyh6-virasat.vercel.app"
    ],
    supports_credentials=True
)
def handle_topics():
    if request.method == "OPTIONS":
        return "", 204
        
    texts = request.json.get("texts", [])
    if len(texts) < 2:
        return jsonify({"error": "Need at least 2 documents for topic modeling"}), 400
    topics = analyze_topics(texts)
    return jsonify({"topics": topics})

# Analytics endpoints
@app.route("/api/analytics/stats", methods=["GET", "OPTIONS"])
@cross_origin(
    origins=[
        "https://dashboard-theta-opal-48.vercel.app",
        "https://dashboard-btf7vfyh6-virasat.vercel.app"
    ],
    supports_credentials=True
)
def get_stats():
    if request.method == "OPTIONS":
        return "", 204
        
    stats = {
        "totalResources": len(list(db.collection('resources').stream())),
        "totalModels": len(list(db.collection('models').stream())),
        "totalIdeas": len(list(db.collection('ideas').stream())),
        "totalChats": len(list(db.collection('chats').stream())),
    }
    return jsonify({"stats": stats})

@app.route("/api/analytics/resource-distribution", methods=["GET", "OPTIONS"])
@cross_origin(
    origins=[
        "https://dashboard-theta-opal-48.vercel.app",
        "https://dashboard-btf7vfyh6-virasat.vercel.app"
    ],
    supports_credentials=True
)
def get_resource_distribution():
    if request.method == "OPTIONS":
        return "", 204
        
    distribution = {}
    resources_ref = db.collection('resources').stream()
    for doc in resources_ref:
        res_type = doc.to_dict().get('type', 'other')
        distribution[res_type] = distribution.get(res_type, 0) + 1
    return jsonify({"distribution": distribution})
