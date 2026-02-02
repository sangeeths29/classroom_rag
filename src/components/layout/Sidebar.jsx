import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { SparkleIcon } from '../icons/Icons';

const Sidebar = () => {
  const { 
    courses, 
    courseModules,
    selectedModuleId, 
    setSelectedModuleId
  } = useApp();

  const course = courses[0];
  const modules = courseModules[course?.id] || [];

  return (
    <aside 
      className="w-72 flex flex-col"
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)'
      }}
    >
      {/* Logo/Brand */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#8C1D40' }}
          >
            <SparkleIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 
              className="text-lg font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              StudySpace
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              AI Learning Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="flex-1 overflow-y-auto p-5">
        <h3 
          className="text-[10px] font-semibold uppercase tracking-wider mb-4 px-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Course Modules
        </h3>
        
        <div className="space-y-2">
          {modules.map((mod, index) => {
            const isSelected = selectedModuleId === mod.id;
            
            return (
              <motion.button
                key={mod.id}
                onClick={() => setSelectedModuleId(mod.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left"
                style={{
                  background: isSelected ? 'rgba(140, 29, 64, 0.1)' : 'transparent',
                }}
                whileHover={{ 
                  background: isSelected ? 'rgba(140, 29, 64, 0.1)' : 'var(--bg-hover)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Module Number */}
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                  style={{
                    background: isSelected ? '#8C1D40' : 'var(--bg-tertiary)',
                    color: isSelected ? 'white' : 'var(--text-tertiary)'
                  }}
                >
                  {index + 1}
                </div>

                {/* Module Info */}
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm truncate"
                    style={{ 
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 500 : 400
                    }}
                  >
                    {mod.name}
                  </p>
                  <p 
                    className="text-[10px] mt-0.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Week {mod.weeks}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div 
        className="px-6 py-4 border-t"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
            style={{ background: '#8C1D40', color: 'white' }}
          >
            A
          </div>
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            Arizona State University
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
