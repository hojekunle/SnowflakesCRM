import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layout, ArrowRight, Building2, Users, Globe } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const WorkspaceSetup = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState('');

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 blur-[100px] rounded-full -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass max-w-md w-full p-10 rounded-[32px] border border-white/10 shadow-2xl space-y-8"
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`h-1 w-8 rounded-full transition-all duration-300 ${i <= step ? 'bg-accent' : 'bg-black/10 dark:bg-white/10'}`} 
              />
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Step {step} of 3</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-medium tracking-tight">Name your workspace</h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-light">This is usually your company or team name.</p>
              </div>
              <Input 
                placeholder="Acme Inc." 
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="py-6 text-lg"
              />
              <Button onClick={handleNext} className="w-full py-7 gap-2" disabled={!workspaceName}>
                Continue
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-medium tracking-tight">Team size</h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-light">How many people will be using Snowflakes?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['1-5', '6-20', '21-50', '50+'].map(size => (
                  <button 
                    key={size}
                    onClick={handleNext}
                    className="p-4 rounded-xl border border-white/5 bg-black/5 dark:bg-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all text-sm font-medium"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6">
                <Layout size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-medium tracking-tight">All set!</h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-light">Your workspace is ready. Let's start closing deals.</p>
              </div>
              <Button onClick={handleNext} className="w-full py-7 gap-2">
                Launch Workspace
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

import { AnimatePresence } from 'motion/react';
