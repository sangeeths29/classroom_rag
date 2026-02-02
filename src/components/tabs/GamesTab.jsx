import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { GameIcon, SparkleIcon, TrophyIcon, ClockIcon, StarIcon } from '../icons/Icons';

const GamesTab = () => {
  const { selectedModule } = useApp();
  const [activeGame, setActiveGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock quiz questions
  const quizQuestions = [
    {
      id: 1,
      question: 'What is the primary purpose of an activation function in neural networks?',
      options: ['Store data', 'Introduce non-linearity', 'Reduce computation', 'Visualize results'],
      correctAnswer: 1,
      category: 'Neural Networks'
    },
    {
      id: 2,
      question: 'Which algorithm is used to train neural networks by computing gradients?',
      options: ['Forward propagation', 'Backpropagation', 'Random search', 'Gradient boosting'],
      correctAnswer: 1,
      category: 'Training'
    },
    {
      id: 3,
      question: 'What is overfitting?',
      options: ['Model performs poorly on all data', 'Model memorizes training data but fails on new data', 'Model is too simple', 'Model trains too quickly'],
      correctAnswer: 1,
      category: 'Concepts'
    },
    {
      id: 4,
      question: 'Which of these is NOT an activation function?',
      options: ['ReLU', 'Sigmoid', 'Softmax', 'Gradient'],
      correctAnswer: 3,
      category: 'Neural Networks'
    },
    {
      id: 5,
      question: 'What does CNN stand for?',
      options: ['Continuous Neural Network', 'Convolutional Neural Network', 'Connected Node Network', 'Computed Neural Network'],
      correctAnswer: 1,
      category: 'Architectures'
    }
  ];

  const quizzes = quizQuestions;
  
  // Game icons as SVG components
  const GameIcons = {
    quiz: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <path d="M12 17h.01"/>
      </svg>
    ),
    match: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path d="M15 3h6v6"/>
        <path d="M9 21H3v-6"/>
        <path d="M21 3l-7 7"/>
        <path d="M3 21l7-7"/>
      </svg>
    ),
    fill: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        <path d="m15 5 4 4"/>
      </svg>
    ),
    speed: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    )
  };

  const games = [
    {
      id: 'quiz',
      name: 'Quick Quiz',
      icon: GameIcons.quiz,
      description: 'Test your knowledge with multiple choice questions',
      gradient: 'from-amber-500 to-orange-500',
      glowColor: 'rgba(245, 158, 11, 0.3)',
      questions: quizzes.length
    },
    {
      id: 'match',
      name: 'Concept Match',
      icon: GameIcons.match,
      description: 'Match terms with their definitions',
      gradient: 'from-teal-500 to-emerald-500',
      glowColor: 'rgba(20, 184, 166, 0.3)',
      questions: 10
    },
    {
      id: 'fill',
      name: 'Fill the Gap',
      icon: GameIcons.fill,
      description: 'Complete sentences with missing terms',
      gradient: 'from-violet-500 to-purple-500',
      glowColor: 'rgba(139, 92, 246, 0.3)',
      questions: 8
    },
    {
      id: 'speed',
      name: 'Speed Round',
      icon: GameIcons.speed,
      description: 'Answer as many as you can in 60 seconds',
      gradient: 'from-rose-500 to-pink-500',
      glowColor: 'rgba(244, 63, 94, 0.3)',
      questions: 20
    }
  ];

  const handleStartGame = async (game) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerating(false);
    setActiveGame(game);
    setCurrentQuestion(0);
    setScore(0);
    setGameComplete(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = (answerIndex) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === quizzes[currentQuestion]?.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameComplete(true);
    }
  };

  const handleBackToGames = () => {
    setActiveGame(null);
    setCurrentQuestion(0);
    setScore(0);
    setGameComplete(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const currentQuiz = quizzes[currentQuestion];
  const progress = ((currentQuestion + 1) / quizzes.length) * 100;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
          >
            Learning Games
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Make studying fun with interactive games for {selectedModule?.name}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!activeGame ? (
            /* Game Selection */
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {games.map((game, index) => (
                <motion.button
                  key={game.id}
                  onClick={() => handleStartGame(game)}
                  disabled={isGenerating}
                  className="relative p-6 rounded-2xl text-left group overflow-hidden"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: game.glowColor,
                    boxShadow: `0 0 40px ${game.glowColor}`
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Gradient Overlay on Hover */}
                  <div 
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${game.gradient}`}
                    style={{ opacity: 0.05 }}
                  />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${game.gradient}`}
                      >
                        {game.icon}
                      </div>
                      <span 
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {game.questions} questions
                      </span>
                    </div>
                    
                    <h3 
                      className="text-lg font-semibold mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {game.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      {game.description}
                    </p>

                    <div 
                      className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${game.gradient} text-white text-sm font-medium`}
                    >
                      <SparkleIcon className="w-4 h-4" />
                      Play Now
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : gameComplete ? (
            /* Game Complete Screen */
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-amber), var(--accent-rose))'
                }}
              >
                <TrophyIcon className="w-12 h-12 text-white" />
              </motion.div>

              <motion.h2 
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {score >= quizzes.length * 0.8 ? 'Excellent!' : score >= quizzes.length * 0.5 ? 'Good Job!' : 'Keep Practicing!'}
              </motion.h2>

              <motion.p
                className="text-lg mb-8"
                style={{ color: 'var(--text-tertiary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                You scored {score} out of {quizzes.length}
              </motion.p>

              <motion.div
                className="flex items-center justify-center gap-3 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
                  >
                    <StarIcon 
                      className="w-8 h-8"
                      style={{
                        color: i < Math.ceil((score / quizzes.length) * 5) 
                          ? 'var(--accent-amber)' 
                          : 'var(--bg-tertiary)'
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="flex items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  onClick={handleBackToGames}
                  className="px-6 py-3 rounded-xl font-medium"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Games
                </motion.button>
                <motion.button
                  onClick={() => handleStartGame(activeGame)}
                  className="px-6 py-3 rounded-xl font-medium"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-amber), var(--accent-rose))',
                    color: 'white'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Play Again
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            /* Active Game */
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-8">
                <motion.button
                  onClick={handleBackToGames}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  ← Back
                </motion.button>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5" style={{ color: 'var(--accent-amber)' }} />
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {score}
                    </span>
                  </div>
                  <div 
                    className="px-3 py-1 rounded-lg text-sm"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {currentQuestion + 1} / {quizzes.length}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div 
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--accent-amber), var(--accent-rose))' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="rounded-3xl p-8 mb-8"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <span 
                  className="px-3 py-1 rounded-lg text-xs font-medium mb-4 inline-block"
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--accent-amber)'
                  }}
                >
                  {currentQuiz?.category || 'General'}
                </span>
                <h2 
                  className="text-xl font-semibold mb-8"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {currentQuiz?.question}
                </h2>

                {/* Answers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuiz?.options?.map((option, index) => {
                    const isCorrect = index === currentQuiz.correctAnswer;
                    const isSelected = selectedAnswer === index;
                    
                    let bgStyle = 'var(--bg-tertiary)';
                    let borderStyle = 'var(--border-primary)';
                    
                    if (showResult) {
                      if (isCorrect) {
                        bgStyle = 'rgba(16, 185, 129, 0.15)';
                        borderStyle = 'rgba(16, 185, 129, 0.5)';
                      } else if (isSelected && !isCorrect) {
                        bgStyle = 'rgba(244, 63, 94, 0.15)';
                        borderStyle = 'rgba(244, 63, 94, 0.5)';
                      }
                    }

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={showResult}
                        className="p-4 rounded-xl text-left transition-all"
                        style={{
                          background: bgStyle,
                          border: `2px solid ${borderStyle}`
                        }}
                        whileHover={!showResult ? { scale: 1.02 } : {}}
                        whileTap={!showResult ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
                            style={{
                              background: showResult && isCorrect 
                                ? 'var(--accent-emerald)'
                                : showResult && isSelected && !isCorrect
                                ? 'var(--accent-rose)'
                                : 'var(--bg-card)',
                              color: showResult && (isCorrect || (isSelected && !isCorrect))
                                ? 'white'
                                : 'var(--text-secondary)'
                            }}
                          >
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {option}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Next Button */}
              {showResult && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.button
                    onClick={handleNext}
                    className="px-8 py-4 rounded-xl font-medium text-white"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-amber), var(--accent-rose))'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentQuestion < quizzes.length - 1 ? 'Next Question' : 'See Results'}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GamesTab;
