import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Process file via backend (extraction & chunking)
export const processFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${BACKEND_URL}/api/process-file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return {
    text: response.data.text,
    chunks: response.data.chunks,
    fileType: response.data.fileType
  };
};

// Generate embeddings for resource chunks
export const embedResource = async (resourceText, chunks) => {
  const response = await axios.post(`${BACKEND_URL}/api/embed-resource`, {
    text: resourceText,
    chunks
  });
  return response.data.embeddedChunks;
};

// Chat with AI using context
export const chatWithAI = async (message) => {
  // The backend handles semantic search and context injection
  const response = await axios.post(`${BACKEND_URL}/api/chat`, {
    message,
    userId: auth.currentUser?.uid
  });
  return response.data.response;
};
