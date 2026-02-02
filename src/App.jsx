import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import VerticalTabNav from './components/tabs/VerticalTabNav';
import RAGTab from './components/tabs/RAGTab';
import FlashcardsTab from './components/tabs/FlashcardsTab';
import PodcastTab from './components/tabs/PodcastTab';
import GamesTab from './components/tabs/GamesTab';

const MainContent = () => {
  const { activeTab } = useApp();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rag':
        return <RAGTab />;
      case 'flashcards':
        return <FlashcardsTab />;
      case 'podcast':
        return <PodcastTab />;
      case 'games':
        return <GamesTab />;
      default:
        return <RAGTab />;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="orb orb-teal"
          style={{
            width: '600px',
            height: '600px',
            top: '10%',
            right: '20%',
            opacity: 0.15
          }}
        />
        <div 
          className="orb orb-violet"
          style={{
            width: '500px',
            height: '500px',
            bottom: '10%',
            left: '30%',
            opacity: 0.12
          }}
        />
        <div 
          className="orb orb-rose"
          style={{
            width: '400px',
            height: '400px',
            top: '50%',
            right: '50%',
            opacity: 0.08
          }}
        />
      </div>

      {/* Vertical Tab Navigation */}
      <VerticalTabNav />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {renderTabContent()}
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <div className="h-screen flex flex-col mesh-gradient noise-overlay relative">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
