import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { SendIcon, CalendarIcon, ClockIcon, PlusIcon, TrashIcon } from '../icons/Icons';
import { sendSyllabusQuestion, checkHealth } from '../../api/client';
import { syllabusInfo } from '../../data/mockData';
import { 
  generateSessionId, 
  getAllSessions, 
  saveSession, 
  loadSession, 
  deleteSession,
  getMostRecentSessionId 
} from '../../utils/chatStorage';

const CHAT_TYPE = 'syllabus';

const getWelcomeMessage = () => ({
  id: 1,
  type: 'assistant',
  content: "Hi! I'm your course assistant for WPC300 - Problem Solving and Actionable Analytics. Ask me about deadlines, assignments, grading policies, or anything else about the course syllabus!",
  timestamp: new Date().toISOString()
});

const SyllabusTab = () => {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([getWelcomeMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkHealth().then(setBackendAvailable);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    const loadedSessions = getAllSessions(CHAT_TYPE);
    setSessions(loadedSessions);
    
    const recentSessionId = getMostRecentSessionId(CHAT_TYPE);
    if (recentSessionId) {
      const loadedMessages = loadSession(recentSessionId, CHAT_TYPE);
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
        setCurrentSessionId(recentSessionId);
      }
    }
  }, []);

  // Auto-save session when messages change
  useEffect(() => {
    if (messages.length > 1) {
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = generateSessionId();
        setCurrentSessionId(sessionId);
      }
      saveSession(sessionId, messages, CHAT_TYPE);
      setSessions(getAllSessions(CHAT_TYPE));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedText]);

  const suggestedQuestions = [
    "When is the midterm exam?",
    "What's the grading breakdown?",
    "When are office hours?",
    "What's the late submission policy?",
  ];

  const generateMockResponse = (question) => {
    const q = question.toLowerCase();
    
    if (q.includes('midterm') || q.includes('exam')) {
      const midterm = syllabusInfo.importantDates.find(d => d.event.includes('Midterm'));
      const final = syllabusInfo.importantDates.find(d => d.event.includes('Final Exam'));
      return `Here are the exam dates:

📝 Midterm Exam: ${midterm?.date || 'TBA'}
📝 Final Exam: ${final?.date || 'TBA'}

The midterm covers Modules 1-3 (${syllabusInfo.gradingPolicy.midterm}% of grade).
The final is comprehensive (${syllabusInfo.gradingPolicy.finalExam}% of grade).`;
    }
    
    if (q.includes('grading') || q.includes('grade') || q.includes('breakdown')) {
      const gp = syllabusInfo.gradingPolicy;
      return `Grading Policy:
• Assignments: ${gp.assignments}%
• Midterm Exam: ${gp.midterm}%
• Final Exam: ${gp.finalExam}%
• Participation: ${gp.participation}%
• Final Project: ${gp.finalProject}%

Stay on top of assignments - they're the largest portion!`;
    }
    
    if (q.includes('office hours') || q.includes('professor')) {
      return `Instructor Information:
👨‍🏫 ${syllabusInfo.instructor}
📧 ${syllabusInfo.email}
🕐 Office Hours: ${syllabusInfo.officeHours}`;
    }
    
    if (q.includes('late') || q.includes('policy')) {
      return `Course Policies:
${syllabusInfo.policies.map(p => `• ${p}`).join('\n')}

⚠️ Late submissions: 10% penalty per day`;
    }
    
    return `For ${syllabusInfo.courseName}, you can ask about:
• Exam dates and grading
• Assignment deadlines
• Office hours
• Course policies

What would you like to know?`;
  };

  const startNewChat = () => {
    const newSessionId = generateSessionId();
    setCurrentSessionId(newSessionId);
    setMessages([getWelcomeMessage()]);
  };

  const loadChatSession = (sessionId) => {
    const loadedMessages = loadSession(sessionId, CHAT_TYPE);
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
      setCurrentSessionId(sessionId);
    }
  };

  const deleteChatSession = (e, sessionId) => {
    e.stopPropagation();
    deleteSession(sessionId, CHAT_TYPE);
    setSessions(getAllSessions(CHAT_TYPE));
    
    if (sessionId === currentSessionId) {
      startNewChat();
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputValue;
    setInputValue('');
    setIsProcessing(true);
    setStreamedText('');

    const assistantMessageId = Date.now() + 1;

    if (backendAvailable) {
      const assistantMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(true);

      await sendSyllabusQuestion(
        question,
        (chunk, fullText) => {
          setStreamedText(fullText);
        },
        (finalResponse) => {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: finalResponse }
              : msg
          ));
          setIsStreaming(false);
          setIsProcessing(false);
        },
        (error) => {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: `Sorry, I encountered an error: ${error}` }
              : msg
          ));
          setIsStreaming(false);
          setIsProcessing(false);
        }
      );
    } else {
      await new Promise(resolve => setTimeout(resolve, 800));

      const response = generateMockResponse(question);

      const assistantMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      setIsStreaming(true);

      for (let i = 0; i <= response.length; i++) {
        setStreamedText(response.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: response }
          : msg
      ));
      setIsStreaming(false);
    }
  };

  const getLatestAssistantMessageId = () => {
    const assistantMessages = messages.filter(m => m.type === 'assistant');
    return assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1].id : null;
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 flex flex-col border-r overflow-hidden"
            style={{ 
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <motion.button
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm"
                style={{ background: 'linear-gradient(135deg, #8C1D40, #FFC627)', color: 'white' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusIcon className="w-4 h-4" />
                New Chat
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <ClockIcon className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      No chat history yet
                    </p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <motion.button
                      key={session.id}
                      onClick={() => loadChatSession(session.id)}
                      className={`w-full text-left px-3 py-3 rounded-lg group transition-all`}
                      style={{
                        background: currentSessionId === session.id 
                          ? 'rgba(140, 29, 64, 0.15)' 
                          : 'transparent'
                      }}
                      whileHover={{ x: 2 }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {session.title}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                            {formatTime(session.updatedAt)} • {session.messageCount} messages
                          </p>
                        </div>
                        <motion.button
                          onClick={(e) => deleteChatSession(e, session.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
                          style={{ background: 'var(--bg-tertiary)' }}
                          whileHover={{ scale: 1.1, background: 'rgba(244, 63, 94, 0.2)' }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                        </motion.button>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 border-t text-center" style={{ borderColor: 'var(--border-primary)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                {sessions.length} saved conversation{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Toggle History Button */}
        <div className="flex items-center px-4 py-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <motion.button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{ 
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            {showHistory ? 'Hide History' : 'Show History'}
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div 
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8C1D40, #FFC627)' }}
              >
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
              >
                Syllabus Assistant
              </h1>
              <p style={{ color: 'var(--text-tertiary)' }}>
                Ask about deadlines, grading, policies, and more • Sessions auto-saved
              </p>
            </motion.div>

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: message.type === 'assistant'
                        ? 'linear-gradient(135deg, #8C1D40, #FFC627)'
                        : 'linear-gradient(135deg, var(--accent-teal), var(--accent-violet))'
                    }}
                  >
                    {message.type === 'assistant' ? (
                      <CalendarIcon className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white text-sm font-semibold">You</span>
                    )}
                  </div>

                  <div 
                    className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}
                    style={{ maxWidth: '80%' }}
                  >
                    <div
                      className="inline-block px-5 py-4 rounded-2xl"
                      style={{
                        background: message.type === 'user'
                          ? 'linear-gradient(135deg, rgba(140, 29, 64, 0.15), rgba(255, 198, 39, 0.15))'
                          : 'var(--bg-card)',
                        border: `1px solid ${message.type === 'user' ? 'rgba(140, 29, 64, 0.3)' : 'var(--border-primary)'}`,
                        textAlign: 'left'
                      }}
                    >
                      <div 
                        className="text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {message.type === 'assistant' && message.id === getLatestAssistantMessageId() && isStreaming
                          ? streamedText
                          : message.content}
                        {message.type === 'assistant' && message.id === getLatestAssistantMessageId() && isStreaming && (
                          <motion.span
                            className="inline-block w-2 h-5 ml-1 rounded-sm"
                            style={{ background: '#8C1D40' }}
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Processing Indicator */}
            <AnimatePresence>
              {isProcessing && !isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-4"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #8C1D40, #FFC627)' }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <ClockIcon className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                  <div 
                    className="px-5 py-4 rounded-2xl"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ background: '#8C1D40' }}
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Checking syllabus...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div 
          className="border-t px-6 py-6"
          style={{ borderColor: 'var(--border-primary)', background: 'linear-gradient(to top, var(--bg-secondary), transparent)' }}
        >
          <div className="max-w-3xl mx-auto">
            {messages.length <= 1 && (
              <motion.div className="flex flex-wrap gap-2 mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setInputValue(question)}
                    className="px-4 py-2 rounded-xl text-sm transition-all"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                    whileHover={{ scale: 1.02, borderColor: '#8C1D40' }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {question}
                  </motion.button>
                ))}
              </motion.div>
            )}

            <div 
              className="flex items-center gap-3 p-2 rounded-2xl transition-all"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about syllabus, deadlines, grading..."
                className="flex-1 px-4 py-3 bg-transparent text-sm outline-none placeholder:text-gray-500"
                style={{ color: 'var(--text-primary)' }}
                disabled={isProcessing}
              />
              <motion.button
                onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                style={{
                  background: inputValue.trim() && !isProcessing ? 'linear-gradient(135deg, #8C1D40, #FFC627)' : 'var(--bg-card)',
                  border: inputValue.trim() && !isProcessing ? 'none' : '1px solid var(--border-primary)'
                }}
                whileHover={inputValue.trim() && !isProcessing ? { scale: 1.05 } : {}}
                whileTap={inputValue.trim() && !isProcessing ? { scale: 0.95 } : {}}
              >
                <SendIcon className="w-5 h-5" style={{ color: inputValue.trim() && !isProcessing ? 'white' : 'var(--text-tertiary)' }} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference Panel */}
      <div 
        className="w-80 border-l overflow-y-auto p-6 hidden lg:block"
        style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          📅 Upcoming Deadlines
        </h3>
        
        <div className="space-y-3">
          {syllabusInfo.importantDates.slice(0, 5).map((item, index) => (
            <motion.div
              key={index}
              className="p-3 rounded-xl"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{
                    background: item.type === 'exam' ? '#ef4444' : item.type === 'assignment' ? '#8C1D40' : '#10b981'
                  }}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.event}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{item.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            📊 Grading Breakdown
          </h3>
          
          <div className="space-y-3">
            {Object.entries(syllabusInfo.gradingPolicy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full rounded-full" style={{ width: `${value}%`, background: '#8C1D40' }} />
                  </div>
                  <span className="text-sm font-medium w-8" style={{ color: 'var(--text-primary)' }}>{value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusTab;
