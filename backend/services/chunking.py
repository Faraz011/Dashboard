# backend/services/chunking.py
def chunk_document(text, chunk_size=300, overlap=50):
    """Breaks a document into overlapping chunks of words."""
    if not text:
        return []
        
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk_words = words[i:i + chunk_size]
        chunk_text = " ".join(chunk_words)
        chunks.append(chunk_text)
    
    return chunks
