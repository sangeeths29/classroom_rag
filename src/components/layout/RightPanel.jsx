import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CloseIcon, DocumentIcon, ClockIcon, SettingsIcon } from '../icons/Icons';

const RightPanel = () => {
  const { setRightPanelOpen, currentCitations, activities } = useApp();
  const [activeSection, setActiveSection] = useState('citations');

  const tabs = [
    { id: 'citations', label: 'Sources' },
    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 340, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col overflow-hidden glass"
      style={{
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-primary)'
      }}
    >
      {/* Header with Tabs */}
      <div 
        className="px-4 pt-4 pb-2 border-b"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}
          >
            Context Panel
          </h2>
          <motion.button
            onClick={() => setRightPanelOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <CloseIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          </motion.button>
        </div>

        {/* Tab Navigation */}
        <div 
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all relative`}
              style={{
                color: activeSection === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)'
              }}
            >
              {activeSection === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(139, 92, 246, 0.2))',
                    border: '1px solid rgba(20, 184, 166, 0.3)'
                  }}
                  transition={{ type: 'spring', duration: 0.3 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeSection === 'citations' && (
            <motion.div
              key="citations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {currentCitations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(139, 92, 246, 0.1))'
                    }}
                  >
                    <DocumentIcon className="w-7 h-7" style={{ color: 'var(--accent-teal)' }} />
                  </div>
                  <p 
                    className="text-sm font-medium mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    No sources yet
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Ask a question to see source citations
                  </p>
                </div>
              ) : (
                currentCitations.map((citation, index) => (
                  <motion.div
                    key={citation.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl cursor-pointer group transition-all"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)'
                    }}
                    whileHover={{
                      borderColor: 'var(--border-glow)',
                      boxShadow: 'var(--shadow-glow-teal)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05))'
                        }}
                      >
                        <DocumentIcon className="w-4 h-4" style={{ color: 'var(--accent-teal)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p 
                          className="text-sm font-medium truncate group-hover:text-teal-400 transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {citation.document}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                          Page {citation.page} • {citation.relevance}% match
                        </p>
                      </div>
                    </div>
                    <p 
                      className="text-xs mt-3 line-clamp-2 leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      "{citation.excerpt}"
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: i < Math.ceil(citation.relevance / 20) 
                                ? 'var(--accent-teal)' 
                                : 'var(--bg-tertiary)'
                            }}
                          />
                        ))}
                      </div>
                      <span 
                        className="text-[10px] px-2 py-1 rounded-md"
                        style={{
                          background: 'rgba(20, 184, 166, 0.1)',
                          color: 'var(--accent-teal)'
                        }}
                      >
                        View source
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeSection === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: activity.type === 'query' 
                        ? 'rgba(20, 184, 166, 0.15)'
                        : activity.type === 'generation'
                        ? 'rgba(139, 92, 246, 0.15)'
                        : 'rgba(244, 63, 94, 0.15)'
                    }}
                  >
                    <ClockIcon 
                      className="w-4 h-4"
                      style={{
                        color: activity.type === 'query' 
                          ? 'var(--accent-teal)'
                          : activity.type === 'generation'
                          ? 'var(--accent-violet)'
                          : 'var(--accent-rose)'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p 
                        className="text-xs font-medium capitalize"
                        style={{
                          color: activity.type === 'query' 
                            ? 'var(--accent-teal)'
                            : activity.type === 'generation'
                            ? 'var(--accent-violet)'
                            : 'var(--accent-rose)'
                        }}
                      >
                        {activity.type}
                      </p>
                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                        {activity.time}
                      </span>
                    </div>
                    <p 
                      className="text-sm mt-1 truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {activity.action}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeSection === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Model Selection */}
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <label 
                  className="text-xs font-semibold uppercase tracking-wider block mb-3"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  AI Model
                </label>
                <select 
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none input-glow transition-all"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <option>GPT-4o (Recommended)</option>
                  <option>GPT-4 Turbo</option>
                  <option>Claude 3 Opus</option>
                </select>
              </div>

              {/* Temperature Slider */}
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <label 
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Creativity
                  </label>
                  <span 
                    className="text-sm font-mono"
                    style={{ color: 'var(--accent-teal)' }}
                  >
                    0.7
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full accent-teal-500"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Precise</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Creative</span>
                </div>
              </div>

              {/* Context Settings */}
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <label 
                  className="text-xs font-semibold uppercase tracking-wider block mb-3"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Context Sources
                </label>
                <div className="space-y-2">
                  {['Module Documents', 'Previous Chats', 'External Links'].map((item, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          defaultChecked={i < 2}
                          className="sr-only peer"
                        />
                        <div 
                          className="w-5 h-5 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-teal-500 peer-checked:to-emerald-500 transition-all"
                          style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)'
                          }}
                        />
                        <svg 
                          className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span 
                        className="text-sm group-hover:text-teal-400 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default RightPanel;
