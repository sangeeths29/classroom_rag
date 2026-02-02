import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  MicrophoneIcon, 
  PlayIcon, 
  PauseIcon, 
  SparkleIcon,
  DocumentIcon,
  ClockIcon,
  VolumeIcon
} from '../icons/Icons';

const PodcastTab = () => {
  const { selectedModule, moduleDocuments } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [generatedPodcasts, setGeneratedPodcasts] = useState([
    {
      id: 1,
      title: 'Introduction to Neural Networks',
      duration: '12:34',
      date: '2 days ago',
      topics: ['Perceptrons', 'Activation Functions', 'Forward Pass'],
      isPlaying: false
    },
    {
      id: 2,
      title: 'Deep Dive: Backpropagation',
      duration: '18:22',
      date: '1 week ago',
      topics: ['Chain Rule', 'Gradient Descent', 'Weight Updates'],
      isPlaying: false
    }
  ]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [podcastStyle, setPodcastStyle] = useState('educational');
  const [duration, setDuration] = useState('10');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [playProgress, setPlayProgress] = useState(0);

  const progressInterval = useRef(null);

  // Style icons
  const StyleIcons = {
    educational: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    conversational: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    storytelling: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      </svg>
    )
  };

  const styles = [
    { id: 'educational', label: 'Educational', icon: StyleIcons.educational, desc: 'Structured, clear explanations' },
    { id: 'conversational', label: 'Conversational', icon: StyleIcons.conversational, desc: 'Two hosts discussing topics' },
    { id: 'storytelling', label: 'Storytelling', icon: StyleIcons.storytelling, desc: 'Narrative-driven learning' }
  ];

  const handleGenerate = async () => {
    if (selectedDocs.length === 0) return;
    
    setIsGenerating(true);
    const stages = [
      { text: 'Analyzing documents...', duration: 1500 },
      { text: 'Extracting key concepts...', duration: 1200 },
      { text: 'Generating script...', duration: 2000 },
      { text: 'Synthesizing audio...', duration: 1800 },
      { text: 'Finalizing podcast...', duration: 1000 }
    ];

    for (const stage of stages) {
      setGenerationStage(stage.text);
      await new Promise(resolve => setTimeout(resolve, stage.duration));
    }

    const newPodcast = {
      id: Date.now(),
      title: `${selectedModule?.name} Summary`,
      duration: `${duration}:00`,
      date: 'Just now',
      topics: selectedDocs.slice(0, 3).map(d => d.name.split('.')[0]),
      isPlaying: false
    };

    setGeneratedPodcasts([newPodcast, ...generatedPodcasts]);
    setIsGenerating(false);
    setGenerationStage('');
    setSelectedDocs([]);
  };

  const togglePlay = (podcast) => {
    if (currentlyPlaying === podcast.id) {
      setCurrentlyPlaying(null);
      setPlayProgress(0);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      setCurrentlyPlaying(podcast.id);
      setPlayProgress(0);
      progressInterval.current = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            setCurrentlyPlaying(null);
            return 0;
          }
          return prev + 0.5;
        });
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

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
            AI Podcast Generator
          </h1>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Transform your study materials into engaging audio content
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Generator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Style Selection */}
            <div className="mb-6">
              <label 
                className="text-xs font-semibold uppercase tracking-wider block mb-3"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Podcast Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {styles.map((style) => (
                  <motion.button
                    key={style.id}
                    onClick={() => setPodcastStyle(style.id)}
                    className="p-4 rounded-xl text-center transition-all"
                    style={{
                      background: podcastStyle === style.id 
                        ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(139, 92, 246, 0.15))'
                        : 'var(--bg-card)',
                      border: `1px solid ${podcastStyle === style.id ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-primary)'}`
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="mb-2 flex justify-center" style={{ color: podcastStyle === style.id ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                      {style.icon}
                    </div>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {style.label}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {style.desc}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label 
                className="text-xs font-semibold uppercase tracking-wider block mb-3"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Duration
              </label>
              <div className="flex gap-2">
                {['5', '10', '15', '20'].map((d) => (
                  <motion.button
                    key={d}
                    onClick={() => setDuration(d)}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background: duration === d 
                        ? 'linear-gradient(135deg, var(--accent-rose), var(--accent-violet))'
                        : 'var(--bg-tertiary)',
                      color: duration === d ? 'white' : 'var(--text-secondary)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {d} min
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Document Selection */}
            <div className="mb-6">
              <label 
                className="text-xs font-semibold uppercase tracking-wider block mb-3"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Select Documents
              </label>
              <div 
                className="rounded-xl p-4 max-h-48 overflow-y-auto space-y-2"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                {moduleDocuments.map((doc) => {
                  const isSelected = selectedDocs.some(d => d.id === doc.id);
                  return (
                    <motion.button
                      key={doc.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDocs(selectedDocs.filter(d => d.id !== doc.id));
                        } else {
                          setSelectedDocs([...selectedDocs, doc]);
                        }
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg transition-all"
                      style={{
                        background: isSelected ? 'rgba(244, 63, 94, 0.1)' : 'transparent',
                        border: `1px solid ${isSelected ? 'rgba(244, 63, 94, 0.3)' : 'transparent'}`
                      }}
                      whileHover={{ background: isSelected ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-hover)' }}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: isSelected 
                            ? 'linear-gradient(135deg, var(--accent-rose), var(--accent-violet))'
                            : 'var(--bg-tertiary)'
                        }}
                      >
                        <DocumentIcon 
                          className="w-4 h-4"
                          style={{ color: isSelected ? 'white' : 'var(--text-tertiary)' }}
                        />
                      </div>
                      <span 
                        className="text-sm flex-1 text-left truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {doc.name}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--accent-rose)' }}
                        >
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              onClick={handleGenerate}
              disabled={selectedDocs.length === 0 || isGenerating}
              className="w-full py-4 rounded-xl font-medium flex items-center justify-center gap-3 btn-glow disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-violet))',
                color: 'white'
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <SparkleIcon className="w-5 h-5" />
                  </motion.div>
                  <span>{generationStage}</span>
                </>
              ) : (
                <>
                  <MicrophoneIcon className="w-5 h-5" />
                  <span>Generate Podcast</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Right Column - Generated Podcasts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label 
              className="text-xs font-semibold uppercase tracking-wider block mb-4"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Generated Podcasts
            </label>
            <div className="space-y-4">
              <AnimatePresence>
                {generatedPodcasts.map((podcast, index) => (
                  <motion.div
                    key={podcast.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl p-5 transition-all"
                    style={{
                      background: currentlyPlaying === podcast.id 
                        ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(139, 92, 246, 0.1))'
                        : 'var(--bg-card)',
                      border: `1px solid ${currentlyPlaying === podcast.id ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-primary)'}`,
                      boxShadow: currentlyPlaying === podcast.id ? '0 0 40px rgba(244, 63, 94, 0.1)' : 'none'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Play Button */}
                      <motion.button
                        onClick={() => togglePlay(podcast)}
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, var(--accent-rose), var(--accent-violet))'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {currentlyPlaying === podcast.id ? (
                          <PauseIcon className="w-6 h-6 text-white" />
                        ) : (
                          <PlayIcon className="w-6 h-6 text-white ml-1" />
                        )}
                        {currentlyPlaying === podcast.id && (
                          <motion.div
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                            }}
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-semibold mb-1 truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {podcast.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {podcast.duration}
                          </span>
                          <span>{podcast.date}</span>
                        </div>
                        
                        {/* Progress bar when playing */}
                        {currentlyPlaying === podcast.id && (
                          <div className="mb-3">
                            <div 
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ background: 'var(--bg-tertiary)' }}
                            >
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: 'linear-gradient(90deg, var(--accent-rose), var(--accent-violet))' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${playProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Topics */}
                        <div className="flex flex-wrap gap-2">
                          {podcast.topics.map((topic, i) => (
                            <span 
                              key={i}
                              className="px-2 py-1 rounded-md text-[10px]"
                              style={{
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Volume indicator when playing */}
                      {currentlyPlaying === podcast.id && (
                        <div className="flex items-end gap-0.5 h-6">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 rounded-full"
                              style={{ background: 'var(--accent-rose)' }}
                              animate={{
                                height: [8, 16, 24, 16, 8],
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.1
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PodcastTab;
