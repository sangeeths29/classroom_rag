import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Icon } from '../icons/Icons';

const tabs = [
  { id: 'rag', label: 'RAG Assistant', icon: 'sparkles', color: '#14b8a6' },
  { id: 'flashcards', label: 'Flashcards', icon: 'layers', color: '#8b5cf6' },
  { id: 'podcast', label: 'Podcast', icon: 'headphones', color: '#f43f5e' },
  { id: 'games', label: 'Games', icon: 'gamepad', color: '#f59e0b' },
];

export function TabNavigation() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="flex gap-2 p-2 bg-slate-800/20 rounded-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-xl"
              style={{ backgroundColor: `${tab.color}15` }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            />
          )}
          <span className="relative">
            <Icon name={tab.icon} size={18} style={{ color: activeTab === tab.id ? tab.color : 'currentColor' }} />
          </span>
          <span className="relative">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
