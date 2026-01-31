import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function DemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Load demo mode from localStorage
    const saved = localStorage.getItem('demoMode');
    if (saved === 'true') {
      setIsDemoMode(true);
    }
  }, []);

  const toggleDemoMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    localStorage.setItem('demoMode', newMode.toString());
    
    // Reload page to apply demo mode
    if (newMode) {
      window.location.reload();
    }
  };

  if (!isDemoMode) {
    return (
      <button
        onClick={toggleDemoMode}
        className="fixed bottom-4 right-4 btn-secondary flex items-center gap-2 z-40"
        title="Enable demo mode with sample data"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">Demo Mode</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="glass-card p-3 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
        <span className="text-sm font-medium text-text-primary">Demo Mode Active</span>
        <button
          onClick={toggleDemoMode}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          Disable
        </button>
      </div>
    </div>
  );
}

