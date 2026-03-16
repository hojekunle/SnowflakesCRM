/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { Leads } from './pages/Leads';
import { Tasks } from './pages/Tasks';
import { Settings } from './pages/Settings';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from './store';
import { Landing } from './pages/Landing';
import { WorkspaceSetup } from './pages/WorkspaceSetup';

const queryClient = new QueryClient();

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [view, setView] = useState<'landing' | 'setup' | 'app'>('landing');
  const { theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pipeline':
        return <Pipeline />;
      case 'leads':
        return <Leads />;
      case 'tasks':
        return <Tasks />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Landing onGetStarted={() => setView('setup')} />
          </motion.div>
        )}

        {view === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WorkspaceSetup onComplete={() => setView('app')} />
          </motion.div>
        )}

        {view === 'app' && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen"
          >
            <Sidebar 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onLogout={() => setView('landing')}
            />
            
            <main className="flex-1 p-12 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </QueryClientProvider>
  );
}

