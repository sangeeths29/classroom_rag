import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SunIcon, MoonIcon, UserIcon } from '../icons/Icons';

const TopBar = () => {
  const { selectedCourse, selectedModule, theme, toggleTheme } = useApp();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
          W. P. Carey
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

        {/* User Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--bg-tertiary)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name || user.username} 
                className="w-7 h-7 rounded-lg object-cover"
              />
            ) : (
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: '#8C1D40' }}
              >
                <UserIcon className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-sm hidden sm:block" style={{ color: 'var(--text-primary)' }}>
              {user?.full_name || user?.username || 'User'}
            </span>
            <svg 
              className="w-4 h-4" 
              style={{ color: 'var(--text-tertiary)' }}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* User Info */}
                  <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user?.full_name || user?.username}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
