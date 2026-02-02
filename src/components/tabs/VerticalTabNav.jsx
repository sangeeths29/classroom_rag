import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { SparkleIcon, CardsIcon, MicrophoneIcon, GameIcon } from '../icons/Icons';

const VerticalTabNav = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs = [
    { id: 'rag', icon: SparkleIcon, label: 'AI Assistant', color: '#8C1D40' },
    { id: 'flashcards', icon: CardsIcon, label: 'Flashcards', color: '#8b5cf6' },
    { id: 'podcast', icon: MicrophoneIcon, label: 'Podcast', color: '#f43f5e' },
    { id: 'games', icon: GameIcon, label: 'Games', color: '#f59e0b' }
  ];

  return (
    <nav 
      className="flex flex-col items-center py-6 px-3 gap-3"
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)'
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative group w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: isActive ? tab.color : 'transparent'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Hover background */}
            {!isActive && (
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--bg-tertiary)' }}
              />
            )}
            
            {/* Active glow */}
            {isActive && (
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: tab.color,
                  filter: 'blur(10px)',
                  opacity: 0.3
                }}
              />
            )}

            {/* Icon */}
            <Icon 
              className="w-5 h-5 relative z-10"
              style={{ color: isActive ? 'white' : 'var(--text-tertiary)' }}
            />

            {/* Tooltip */}
            <div 
              className="absolute left-full ml-3 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {tab.label}
              </span>
            </div>
          </motion.button>
        );
      })}
    </nav>
  );
};

export default VerticalTabNav;
