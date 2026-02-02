import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendIcon, SparkleIcon, UserIcon, LoadingIcon, PlusIcon, TrashIcon, ClockIcon, DownloadIcon, MicrophoneIcon } from '../icons/Icons';
import { sendChatMessage, checkHealth } from '../../api/client';
import { syllabusInfo } from '../../data/mockData';
import { 
  generateSessionId, 
  getAllSessions, 
  saveSession, 
  loadSession, 
  deleteSession,
  getMostRecentSessionId 
} from '../../utils/chatStorage';
import { exportChatToPDF } from '../../utils/pdfExport';

const CHAT_TYPE = 'unified';

const getWelcomeMessage = () => ({
  id: 1,
  type: 'assistant',
  content: `Hello! I'm your AI study assistant for WPC300 - Problem Solving and Actionable Analytics.

I can help you with:
• Course concepts and problem-solving frameworks
• Excel functions (VLOOKUP, INDEX-MATCH, Pivot Tables)
• Syllabus questions, deadlines, and grading policies
• Exam preparation and study tips

What would you like to know?`,
  timestamp: new Date().toISOString()
});

const RAGTab = () => {
  // Chatbot is course-wide, not module-specific
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([getWelcomeMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showQuickRef, setShowQuickRef] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesEndRef = useRef(null);

  // Check for voice support (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  // Check if backend is available on mount
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
    "Explain the Bulletproof problem-solving approach",
    "What's the grading breakdown?",
    "How do I use VLOOKUP in Excel?",
  ];

  const generateMockResponse = (question) => {
    const q = question.toLowerCase();
    
    // Syllabus-related questions
    if (q.includes('midterm') || q.includes('exam') || q.includes('final')) {
      const midterm = syllabusInfo.importantDates.find(d => d.event.includes('Midterm'));
      const final = syllabusInfo.importantDates.find(d => d.event.includes('Final Exam'));
      return `Here are the exam dates:

• Midterm Exam: ${midterm?.date || 'TBA'}
  - Covers Modules 1-3 (${syllabusInfo.gradingPolicy.midterm}% of grade)
  
• Final Exam: ${final?.date || 'TBA'}
  - Comprehensive (${syllabusInfo.gradingPolicy.finalExam}% of grade)

Make sure to review all module materials and practice problems!`;
    }
    
    if (q.includes('grading') || q.includes('grade') || q.includes('breakdown')) {
      const gp = syllabusInfo.gradingPolicy;
      return `Grading Policy for WPC300:

• Assignments: ${gp.assignments}%
• Midterm Exam: ${gp.midterm}%
• Final Exam: ${gp.finalExam}%
• Participation: ${gp.participation}%
• Final Project: ${gp.finalProject}%

Tip: Stay on top of assignments - they're the largest portion of your grade!`;
    }
    
    if (q.includes('office hours') || q.includes('professor') || q.includes('instructor')) {
      return `Instructor Information:

👨‍🏫 ${syllabusInfo.instructor}
📧 ${syllabusInfo.email}
🕐 Office Hours: ${syllabusInfo.officeHours}

Don't hesitate to reach out during office hours if you need help!`;
    }
    
    if (q.includes('late') || q.includes('policy') || q.includes('deadline')) {
      return `Course Policies:

${syllabusInfo.policies.map(p => `• ${p}`).join('\n')}

⚠️ Late submissions receive a 10% penalty per day.`;
    }
    
    // Course content questions
    if (q.includes('bulletproof') || q.includes('problem-solving') || q.includes('problem solving')) {
      return `The Bulletproof Problem-Solving approach is a seven-step framework:

1. Define the Problem - Clearly articulate what you're trying to solve
2. Disaggregate Issues - Break down into smaller components
3. Prioritize - Focus on high-impact issues (80/20 rule)
4. Build Workplan - Create structured plan with timelines
5. Conduct Analysis - Gather data and test hypotheses
6. Synthesize Findings - Draw conclusions
7. Communicate Results - Present clearly to drive action

This framework is covered in Module 1. Would you like me to elaborate on any step?`;
    }
    
    if (q.includes('vlookup')) {
      return `VLOOKUP Syntax:
=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])

Example:
=VLOOKUP("ProductX", A1:B100, 2, FALSE)

Key Tips:
• Use FALSE for exact matches (most common)
• Lookup column must be the leftmost column
• Consider INDEX-MATCH for more flexibility

This is covered in Module 2: Data Collection & Preparation.`;
    }
    
    if (q.includes('pivot') || q.includes('pivot table')) {
      return `Pivot Tables are powerful tools for summarizing data:

Key Steps:
1. Select your data range
2. Insert > PivotTable
3. Drag fields to Rows, Columns, Values areas
4. Use Filters to focus on specific data

Common Uses:
• Summarize sales by region/product
• Calculate averages, counts, sums
• Compare time periods

This is covered in Module 3: Descriptive Analytics.`;
    }
    
    return `Based on the WPC300 course materials, I can help with:

• Course concepts and problem-solving frameworks
• Excel functions and data analysis
• Syllabus, deadlines, and grading policies
• Exam preparation

What specific topic would you like me to explain?`;
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
      setProcessingStage('Connecting to AI...');
      
      const assistantMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(true);

      await sendChatMessage(
        question,
        (chunk, fullText) => {
          setStreamedText(fullText);
          setProcessingStage('');
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
              ? { ...msg, content: `Sorry, I encountered an error: ${error}. Please try again.` }
              : msg
          ));
          setIsStreaming(false);
          setIsProcessing(false);
        }
      );
    } else {
      const stages = [
        { text: 'Analyzing your question...', duration: 600 },
        { text: 'Searching course materials...', duration: 800 },
        { text: 'Generating response...', duration: 500 }
      ];

      for (const stage of stages) {
        setProcessingStage(stage.text);
        await new Promise(resolve => setTimeout(resolve, stage.duration));
      }

      const response = generateMockResponse(question);

      const assistantMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      setProcessingStage('');
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

  // Voice input handler
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      // Show demo mode if not supported
      setIsVoiceMode(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setIsVoiceMode(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInputValue(transcript);
    };

    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    setIsVoiceMode(false);
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

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 flex flex-col border-r overflow-hidden"
            style={{ 
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            {/* Header */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <motion.button
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm"
                style={{
                  background: '#8C1D40',
                  color: 'white'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusIcon className="w-4 h-4" />
                New Chat
              </motion.button>
            </div>

            {/* Sessions List */}
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
                          <p 
                            className="text-sm font-medium truncate"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {session.title}
                          </p>
                          <p 
                            className="text-xs mt-1"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
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

            {/* Footer */}
            <div className="p-3 border-t text-center" style={{ borderColor: 'var(--border-primary)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                {sessions.length} saved conversation{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toggle Buttons */}
        <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <motion.button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{ 
              background: showHistory ? 'rgba(140, 29, 64, 0.15)' : 'var(--bg-tertiary)',
              color: showHistory ? '#8C1D40' : 'var(--text-secondary)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            History
          </motion.button>
          
          <div className="flex items-center gap-2">
            {!backendAvailable && (
              <div 
                className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-2"
                style={{ 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#f59e0b'
                }}
              >
                <span>⚠️</span>
                <span>Demo mode</span>
              </div>
            )}
            
            <motion.button
              onClick={() => setShowQuickRef(!showQuickRef)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ 
                background: showQuickRef ? 'rgba(140, 29, 64, 0.15)' : 'var(--bg-tertiary)',
                color: showQuickRef ? '#8C1D40' : 'var(--text-secondary)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📅 Quick Info
            </motion.button>

            {/* Export PDF Button */}
            <motion.button
              onClick={() => exportChatToPDF(messages, 'StudySpace Chat')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ 
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
              whileHover={{ scale: 1.02, background: 'rgba(140, 29, 64, 0.15)', color: '#8C1D40' }}
              whileTap={{ scale: 0.98 }}
              title="Export chat as PDF"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              Export PDF
            </motion.button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
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
                      <SparkleIcon className="w-5 h-5 text-white" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-white" />
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
                      <LoadingIcon className="w-5 h-5 text-white" />
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
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.15
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {processingStage}
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
          style={{ 
            borderColor: 'var(--border-primary)',
            background: 'linear-gradient(to top, var(--bg-secondary), transparent)'
          }}
        >
          <div className="max-w-3xl mx-auto">
            {messages.length <= 1 && (
              <motion.div 
                className="flex flex-wrap gap-2 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setInputValue(question)}
                    className="px-4 py-2 rounded-xl text-sm transition-all"
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-secondary)'
                    }}
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
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              {/* Voice Input Button */}
              <motion.button
                onClick={handleVoiceInput}
                disabled={isProcessing || isListening}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all relative"
                style={{
                  background: isListening ? 'rgba(140, 29, 64, 0.2)' : 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
                whileHover={{ scale: 1.05, borderColor: '#8C1D40' }}
                whileTap={{ scale: 0.95 }}
                title="Voice input"
              >
                <MicrophoneIcon 
                  className="w-5 h-5"
                  style={{ color: isListening ? '#8C1D40' : 'var(--text-tertiary)' }}
                />
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ border: '2px solid #8C1D40' }}
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about course content, syllabus, deadlines, Excel..."
                className="flex-1 px-4 py-3 bg-transparent text-sm outline-none placeholder:text-gray-500"
                style={{ color: 'var(--text-primary)' }}
                disabled={isProcessing}
              />
              <motion.button
                onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                style={{
                  background: inputValue.trim() && !isProcessing ? '#8C1D40' : 'var(--bg-card)',
                  border: inputValue.trim() && !isProcessing ? 'none' : '1px solid var(--border-primary)'
                }}
                whileHover={inputValue.trim() && !isProcessing ? { scale: 1.05 } : {}}
                whileTap={inputValue.trim() && !isProcessing ? { scale: 0.95 } : {}}
              >
                <SendIcon 
                  className="w-5 h-5"
                  style={{ color: inputValue.trim() && !isProcessing ? 'white' : 'var(--text-tertiary)' }}
                />
              </motion.button>
            </div>

            <p className="text-center text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
              {backendAvailable 
                ? 'AI powered by course materials • Sessions auto-saved' 
                : 'Demo mode • Sessions auto-saved'}
              {voiceSupported && ' • Voice input available'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Reference Panel */}
      <AnimatePresence>
        {showQuickRef && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-l overflow-y-auto overflow-x-hidden"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}
          >
            <div className="p-6">
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

              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  👨‍🏫 Instructor
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{syllabusInfo.instructor}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{syllabusInfo.email}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                  🕐 {syllabusInfo.officeHours}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Input Modal */}
      <AnimatePresence>
        {isVoiceMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
            onClick={stopListening}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center p-12 rounded-3xl max-w-md mx-4"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Microphone */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                {/* Outer rings */}
                {isListening && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid rgba(140, 29, 64, 0.3)' }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid rgba(140, 29, 64, 0.5)' }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.2, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                  </>
                )}
                
                {/* Main button */}
                <motion.button
                  onClick={isListening ? stopListening : handleVoiceInput}
                  className="absolute inset-4 rounded-full flex items-center justify-center"
                  style={{ 
                    background: isListening 
                      ? 'linear-gradient(135deg, #8C1D40, #ef4444)' 
                      : 'linear-gradient(135deg, #8C1D40, #FFC627)'
                  }}
                  animate={isListening ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MicrophoneIcon className="w-12 h-12 text-white" />
                </motion.button>
              </div>

              {/* Status Text */}
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {isListening ? 'Listening...' : voiceSupported ? 'Tap to speak' : 'Voice Input Demo'}
              </h3>
              
              <p 
                className="text-sm mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isListening 
                  ? 'Speak your question clearly' 
                  : voiceSupported 
                    ? 'Ask about course content, syllabus, or deadlines'
                    : 'This feature requires API keys from the university'}
              </p>

              {/* Transcription Preview */}
              {inputValue && isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl mb-6 text-left"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
                >
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    "{inputValue}"
                  </p>
                </motion.div>
              )}

              {/* API Key Notice */}
              {!voiceSupported && (
                <motion.div
                  className="p-4 rounded-xl mb-6"
                  style={{ 
                    background: 'rgba(245, 158, 11, 0.1)', 
                    border: '1px solid rgba(245, 158, 11, 0.3)' 
                  }}
                >
                  <p className="text-sm" style={{ color: '#f59e0b' }}>
                    ⚠️ Voice recognition requires browser support or external API keys (Google Speech-to-Text / Azure Speech Services)
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                {isListening && inputValue && (
                  <motion.button
                    onClick={() => { stopListening(); handleSend(); }}
                    className="px-6 py-3 rounded-xl font-medium"
                    style={{ background: '#8C1D40', color: 'white' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Message
                  </motion.button>
                )}
                <motion.button
                  onClick={stopListening}
                  className="px-6 py-3 rounded-xl font-medium"
                  style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isListening ? 'Cancel' : 'Close'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RAGTab;
