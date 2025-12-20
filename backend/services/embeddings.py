# backend/services/embeddings.py
import google.generativeai as genai
import numpy as np

def configure_gemini(api_key):
    """Initializes the Gemini client."""
    genai.configure(api_key=api_key)

def get_embedding(text, model="models/embedding-001"):
    """Generates an embedding for a given text."""
    if not text or not text.strip():
        print("Error: Empty or whitespace-only text provided for embedding")
        return None
    
    try:
        print(f"Generating embedding for text of length: {len(text)}")
        print(f"Using model: {model}")
        print(f"First 100 chars: {text[:100]}...")
        
        # Check if genai is properly configured
        if not hasattr(genai, 'embed_content'):
            print("Error: genai.embed_content is not available. Check if google-generativeai package is installed correctly.")
            return None
            
        # Make the API call
        result = genai.embed_content(
            model=model,
            content=text,
            task_type="retrieval_document"  # Specify task type for better results
        )
        
        if not result:
            print("Error: Empty response from Gemini API")
            return None
            
        if "embedding" not in result:
            print(f"Error: 'embedding' key not in response. Full response: {result}")
            return None
            
        embedding = result["embedding"]
        if not embedding or len(embedding) == 0:
            print("Error: Empty embedding received")
            return None
            
        print(f"Successfully generated embedding of length: {len(embedding)}")
        return embedding
        
    except Exception as e:
        import traceback
        print(f"Error generating embedding: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        print("Traceback:")
        traceback.print_exc()
        return None

def find_similar_chunks(query_embedding, resource_chunks, top_k=3):
    """Finds the most similar chunks using cosine similarity."""
    if not query_embedding or not resource_chunks:
        return []

    similarities = []
    for chunk in resource_chunks:
        chunk_embedding = chunk.get("embedding")
        if chunk_embedding and isinstance(chunk_embedding, list):
            # Cosine similarity calculation
            similarity = np.dot(query_embedding, chunk_embedding) / (np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding))
            similarities.append({
                "similarity": similarity,
                "text": chunk.get("text", ""),
                "resourceName": chunk.get("resourceName", "Unknown")
            })

    # Sort by similarity and return top results
    similarities.sort(key=lambda x: x["similarity"], reverse=True)
    return similarities[:top_k]
