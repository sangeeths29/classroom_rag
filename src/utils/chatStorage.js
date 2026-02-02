/**
 * Chat Session Storage Utility
 * Persists chat sessions to localStorage for persistence across page refreshes
 */

const STORAGE_KEY_PREFIX = 'wpc300_chat_';
const SESSIONS_INDEX_KEY = 'wpc300_chat_sessions';

/**
 * Generate a unique session ID
 */
export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all saved sessions metadata (for sidebar display)
 */
export function getAllSessions(chatType = 'rag') {
  try {
    const indexKey = `${SESSIONS_INDEX_KEY}_${chatType}`;
    const sessions = JSON.parse(localStorage.getItem(indexKey) || '[]');
    // Sort by last updated, most recent first
    return sessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

/**
 * Save session metadata to the index
 */
function updateSessionIndex(sessionMeta, chatType = 'rag') {
  try {
    const indexKey = `${SESSIONS_INDEX_KEY}_${chatType}`;
    const sessions = getAllSessions(chatType);
    const existingIndex = sessions.findIndex(s => s.id === sessionMeta.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionMeta;
    } else {
      sessions.unshift(sessionMeta);
    }
    
    // Keep only last 50 sessions
    const trimmedSessions = sessions.slice(0, 50);
    localStorage.setItem(indexKey, JSON.stringify(trimmedSessions));
  } catch (error) {
    console.error('Error updating session index:', error);
  }
}

/**
 * Save a chat session
 */
export function saveSession(sessionId, messages, chatType = 'rag') {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${chatType}_${sessionId}`;
    
    // Get title from first user message or default
    const firstUserMessage = messages.find(m => m.type === 'user');
    const title = firstUserMessage 
      ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
      : 'New conversation';
    
    // Save the messages
    localStorage.setItem(storageKey, JSON.stringify(messages));
    
    // Update session index
    const sessionMeta = {
      id: sessionId,
      title,
      messageCount: messages.length,
      createdAt: messages[0]?.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateSessionIndex(sessionMeta, chatType);
    
    return sessionMeta;
  } catch (error) {
    console.error('Error saving session:', error);
    return null;
  }
}

/**
 * Load a chat session
 */
export function loadSession(sessionId, chatType = 'rag') {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${chatType}_${sessionId}`;
    const messages = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return messages;
  } catch (error) {
    console.error('Error loading session:', error);
    return [];
  }
}

/**
 * Delete a chat session
 */
export function deleteSession(sessionId, chatType = 'rag') {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${chatType}_${sessionId}`;
    localStorage.removeItem(storageKey);
    
    // Remove from index
    const indexKey = `${SESSIONS_INDEX_KEY}_${chatType}`;
    const sessions = getAllSessions(chatType);
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(indexKey, JSON.stringify(filteredSessions));
    
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
}

/**
 * Get the most recent session ID or null
 */
export function getMostRecentSessionId(chatType = 'rag') {
  const sessions = getAllSessions(chatType);
  return sessions.length > 0 ? sessions[0].id : null;
}

/**
 * Clear all sessions for a chat type
 */
export function clearAllSessions(chatType = 'rag') {
  try {
    const sessions = getAllSessions(chatType);
    sessions.forEach(session => {
      const storageKey = `${STORAGE_KEY_PREFIX}${chatType}_${session.id}`;
      localStorage.removeItem(storageKey);
    });
    
    const indexKey = `${SESSIONS_INDEX_KEY}_${chatType}`;
    localStorage.removeItem(indexKey);
    
    return true;
  } catch (error) {
    console.error('Error clearing sessions:', error);
    return false;
  }
}
