import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { SunIcon, MoonIcon } from '../icons/Icons';

const TopBar = () => {
  const { selectedCourse, selectedModule, theme, toggleTheme } = useApp();

  return (
    <header 
      className="flex items-center justify-between px-6 py-4"
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-primary)'
      }}
    >
      {/* Left: Course Info */}
      <div className="flex items-center gap-4">
        <div>
          <h1 
            className="text-lg font-bold"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
          >
            {selectedCourse?.code || 'WPC300'}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Problem Solving and Actionable Analytics
          </p>
        </div>

        {/* Current Module Indicator */}
        {selectedModule && (
          <>
            <div className="w-px h-8" style={{ background: 'var(--border-primary)' }} />
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ background: '#8C1D40' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {selectedModule.name}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* W.P. Carey Badge */}
        <div 
          className="px-3 py-1.5 rounded-lg text-xs hidden sm:block"
          style={{
            background: 'rgba(140, 29, 64, 0.08)',
            color: '#8C1D40',
          }}
        >
          W. P. Carey School of Business
        </div>

        {/* ASU Badge */}
        <div 
          className="px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: 'rgba(255, 198, 39, 0.15)',
            color: '#8C1D40',
          }}
        >
          ASU
        </div>

        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--bg-tertiary)' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SunIcon className="w-5 h-5" style={{ color: '#FFC627' }} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MoonIcon className="w-5 h-5" style={{ color: '#8C1D40' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </header>
  );
};

export default TopBar;
