# backend/services/chat.py
import google.generativeai as genai

def generate_chat_response(message, context_chunks, model_name="gemini-pro"):
    """Generates a chat response using Gemini with provided context."""
    
    context_text = "\n".join([c.get("text", "") for c in context_chunks])

    prompt = f"""You are a helpful AI assistant for a trading research team.
    
Use this context from the team's internal resources to answer the user question.
If the context is not relevant, say that you could not find an answer in the knowledge base.

CONTEXT FROM TEAM RESOURCES:
---
{context_text}
---

USER QUESTION: {message}

ANSWER:
"""

    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating response from AI model: {str(e)}"

