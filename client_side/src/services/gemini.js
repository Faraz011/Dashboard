import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Process file via backend (extraction & chunking)
export const processFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Ensure the URL is properly formed
  const apiUrl = `${BACKEND_URL.replace(/\/+$/, '')}/api/process-file`;
  const response = await axios.post(apiUrl, formData, {
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
  const apiUrl = `${BACKEND_URL.replace(/\/+$/, '')}/api/embed-resource`;
  const response = await axios.post(apiUrl, {
    text: resourceText,
    chunks
  });
  return response.data.embeddedChunks;
};

// Chat with AI using context
export const chatWithAI = async (message) => {
  const apiUrl = `${BACKEND_URL.replace(/\/+$/, '')}/api/chat`;
  const response = await axios.post(apiUrl, {
    message,
    userId: auth.currentUser?.uid
  });
  return response.data.response;
};
