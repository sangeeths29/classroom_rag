import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { SparkleIcon, RefreshIcon, CheckIcon, CloseIcon, ArrowLeftIcon, ArrowRightIcon } from '../icons/Icons';

const FlashcardsTab = () => {
  const { moduleFlashcards, selectedModule } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [knownCards, setKnownCards] = useState(new Set());
  const [unknownCards, setUnknownCards] = useState(new Set());

  const flashcards = moduleFlashcards;
  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleKnow = () => {
    setKnownCards(prev => new Set([...prev, currentCard.id]));
    handleNext();
  };

  const handleDontKnow = () => {
    setUnknownCards(prev => new Set([...prev, currentCard.id]));
    handleNext();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              Flashcards
            </h1>
            <p style={{ color: 'var(--text-tertiary)' }}>
              {selectedModule?.name || 'Module'} • {flashcards.length} cards
            </p>
          </div>

          <motion.button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm btn-glow"
            style={{
              background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-rose))',
              color: 'white'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshIcon className="w-4 h-4" />
              </motion.div>
            ) : (
              <SparkleIcon className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate More'}</span>
          </motion.button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          className="grid grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {[
            { label: 'Total', value: flashcards.length, gradient: 'from-teal-500 to-emerald-500' },
            { label: 'Known', value: knownCards.size, gradient: 'from-emerald-500 to-green-500' },
            { label: 'Review', value: unknownCards.size, gradient: 'from-amber-500 to-orange-500' },
            { label: 'Left', value: flashcards.length - currentIndex - 1, gradient: 'from-violet-500 to-purple-500' }
          ].map((stat, i) => (
            <div 
              key={stat.label}
              className="p-4 rounded-xl text-center"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <p 
                className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
              >
                {stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Progress
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--accent-teal)' }}>
              {currentIndex + 1} / {flashcards.length}
            </span>
          </div>
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <motion.div 
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-violet))' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Flashcard */}
        {flashcards.length > 0 && currentCard ? (
          <motion.div 
            className="flashcard-container mb-8"
            style={{ height: '320px' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div
              className={`flashcard-inner cursor-pointer ${isFlipped ? 'flipped' : ''}`}
              onClick={handleFlip}
            >
              {/* Front */}
              <div 
                className="flashcard-face rounded-3xl p-8 flex flex-col"
                style={{
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-primary)',
                  boxShadow: '0 10px 40px var(--shadow-color)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span 
                    className="px-3 py-1 rounded-lg text-xs font-medium"
                    style={{
                      background: 'rgba(20, 184, 166, 0.15)',
                      color: 'var(--accent-teal)'
                    }}
                  >
                    {currentCard?.difficulty || 'Concept'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Card {currentIndex + 1}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                  <p 
                    className="text-lg font-medium text-center leading-relaxed"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {currentCard?.front}
                  </p>
                </div>
                <div className="text-center">
                  <span 
                    className="text-xs inline-flex items-center gap-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <span className="px-2 py-1 rounded-md" style={{ background: 'var(--bg-tertiary)' }}>Click</span>
                    to reveal answer
                  </span>
                </div>
              </div>

              {/* Back */}
              <div 
                className="flashcard-face flashcard-back rounded-3xl p-8 flex flex-col"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08), rgba(139, 92, 246, 0.08)), var(--bg-card-solid)',
                  border: '1px solid var(--accent-teal)',
                  boxShadow: '0 10px 40px var(--shadow-color), var(--shadow-glow-teal)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span 
                    className="px-3 py-1 rounded-lg text-xs font-medium"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-violet))',
                      color: 'white'
                    }}
                  >
                    Answer
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {currentCard?.difficulty || 'Medium'}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto">
                  <p 
                    className="text-base text-center leading-relaxed"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {currentCard?.back}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div 
            className="mb-8 rounded-3xl p-12 text-center"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <p style={{ color: 'var(--text-tertiary)' }}>No flashcards available for this module yet.</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>Click "Generate More" to create flashcards from your documents.</p>
          </div>
        )}

        {/* Action Buttons */}
        <motion.div 
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeftIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </motion.button>

          <motion.button
            onClick={handleDontKnow}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm"
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)'
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(244, 63, 94, 0.2)' }}
            whileTap={{ scale: 0.95 }}
          >
            <CloseIcon className="w-4 h-4" />
            <span>Review Later</span>
          </motion.button>

          <motion.button
            onClick={handleKnow}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm"
            style={{
              background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-emerald))',
              color: 'white'
            }}
            whileHover={{ scale: 1.05, boxShadow: 'var(--shadow-glow-teal)' }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckIcon className="w-4 h-4" />
            <span>Got It!</span>
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowRightIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </motion.button>
        </motion.div>

        {/* Keyboard Shortcuts */}
        <motion.div 
          className="mt-8 flex items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { key: '←', action: 'Previous' },
            { key: 'Space', action: 'Flip' },
            { key: '→', action: 'Next' }
          ].map((shortcut) => (
            <div key={shortcut.key} className="flex items-center gap-2">
              <span 
                className="px-2 py-1 rounded-md text-xs font-mono"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)'
                }}
              >
                {shortcut.key}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {shortcut.action}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FlashcardsTab;
