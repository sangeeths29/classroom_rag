/**
 * API Client for WPC300 Course Assistant Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Send a chat message and get a streaming response
 */
export async function sendChatMessage(question, onChunk, onComplete, onError) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete(fullResponse);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      onChunk(chunk, fullResponse);
    }
  } catch (error) {
    console.error('Chat API error:', error);
    onError(error.message);
  }
}

/**
 * Send a syllabus question and get a streaming response
 */
export async function sendSyllabusQuestion(question, onChunk, onComplete, onError) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/syllabus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete(fullResponse);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      onChunk(chunk, fullResponse);
    }
  } catch (error) {
    console.error('Syllabus API error:', error);
    onError(error.message);
  }
}

/**
 * Check if the backend is healthy
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Re-index documents (admin function)
 */
export async function reindexDocuments() {
  const response = await fetch(`${API_BASE_URL}/api/index`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to re-index');
  }
  
  return response.json();
}
