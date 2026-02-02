import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { courses, courseModules, documents, flashcards, quizzes, recentGenerations, activityLog, chatHistory } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Course and Module selection
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  
  const [activeTab, setActiveTab] = useState('rag');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState(chatHistory);
  const [currentCitations, setCurrentCitations] = useState([]);
  const [activities, setActivities] = useState(activityLog);
  const [generations, setGenerations] = useState(recentGenerations);
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  // Auto-select first module when course changes
  useEffect(() => {
    if (selectedCourseId) {
      const modules = courseModules[selectedCourseId] || [];
      if (modules.length > 0) {
        setSelectedModuleId(modules[0].id);
      } else {
        setSelectedModuleId(null);
      }
    }
  }, [selectedCourseId]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Derived state
  const selectedCourse = useMemo(() => 
    courses.find(c => c.id === selectedCourseId), 
    [selectedCourseId]
  );
  
  const modules = useMemo(() => 
    courseModules[selectedCourseId] || [], 
    [selectedCourseId]
  );
  
  const selectedModule = useMemo(() => 
    modules.find(m => m.id === selectedModuleId),
    [modules, selectedModuleId]
  );

  // Get documents for selected module
  const moduleDocuments = useMemo(() => 
    documents[selectedModuleId] || [],
    [selectedModuleId]
  );

  // Get flashcards for selected module
  const moduleFlashcards = useMemo(() => 
    flashcards[selectedModuleId] || [],
    [selectedModuleId]
  );

  // Get quizzes for selected module
  const moduleQuizzes = useMemo(() => 
    quizzes[selectedModuleId] || [],
    [selectedModuleId]
  );

  // Count total documents for a course
  const getCourseDocumentCount = useCallback((courseId) => {
    const courseModuleList = courseModules[courseId] || [];
    return courseModuleList.reduce((total, mod) => {
      return total + (documents[mod.id]?.length || 0);
    }, 0);
  }, []);

  const addChatMessage = useCallback((message) => {
    setChatMessages(prev => [...prev, {
      id: `chat-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...message,
    }]);
  }, []);

  const addActivity = useCallback((activity) => {
    setActivities(prev => [{
      id: `act-${Date.now()}`,
      time: 'Just now',
      ...activity,
    }, ...prev.slice(0, 19)]);
  }, []);

  const addGeneration = useCallback((generation) => {
    setGenerations(prev => [{
      id: `gen-${Date.now()}`,
      createdAt: 'Just now',
      ...generation,
    }, ...prev.slice(0, 9)]);
  }, []);

  const value = {
    // Theme
    theme,
    toggleTheme,
    
    // Courses
    courses,
    selectedCourseId,
    setSelectedCourseId,
    selectedCourse,
    getCourseDocumentCount,
    
    // Modules within course
    modules,
    courseModules,
    selectedModuleId,
    setSelectedModuleId,
    selectedModule,
    
    // Documents
    moduleDocuments,
    allDocuments: documents,
    
    // Flashcards & Quizzes
    moduleFlashcards,
    moduleQuizzes,
    
    // Navigation
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    rightPanelOpen,
    setRightPanelOpen,
    
    // Chat
    chatMessages,
    addChatMessage,
    setChatMessages,
    
    // Citations
    currentCitations,
    setCurrentCitations,
    
    // Activity & Generations
    activities,
    addActivity,
    generations,
    addGeneration,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
