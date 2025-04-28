// filepath: d:\quiz\project\src\components\ui\ThemeSwitcher.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Palette, Settings, ChevronDown, Check, 
  ZoomIn, Eye, Volume2, Sparkles, Monitor, Layout, 
  LayoutGrid, SlidersHorizontal, Zap, X, Maximize
} from 'lucide-react';
import { useQuizStore } from '../../store/quizStore';
import { Theme, AnimationLevel } from '../../types';

const ThemeSwitcher: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    animationLevel, 
    setAnimationLevel, 
    enableSound, 
    toggleSound 
  } = useQuizStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'interface' | 'accessibility'>('theme');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const toggleOpen = () => setIsOpen(!isOpen);

  // Check if we're in fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };
  
  // Apply font size to document
  useEffect(() => {
    const rootElement = document.documentElement;
    rootElement.classList.remove('text-normal', 'text-large', 'text-larger');
    rootElement.classList.add(`text-${fontSize}`);
    
    // Apply high contrast if needed
    if (highContrast) {
      rootElement.classList.add('high-contrast');
    } else {
      rootElement.classList.remove('high-contrast');
    }
    
    // Apply reduce motion if needed
    if (reduceMotion) {
      rootElement.classList.add('reduce-motion');
    } else {
      rootElement.classList.remove('reduce-motion');
    }
  }, [fontSize, highContrast, reduceMotion]);
  
  const themeOptions: { id: Theme; name: string; icon: JSX.Element; preview: JSX.Element }[] = [
    { 
      id: 'light', 
      name: 'Light', 
      icon: <Sun className="w-4 h-4" />,
      preview: (
        <div className="w-full h-full bg-white rounded-md overflow-hidden">
          <div className="h-1/3 bg-primary-500" />
          <div className="p-1">
            <div className="w-3/4 h-1 bg-gray-300 rounded-full mb-1" />
            <div className="w-1/2 h-1 bg-gray-200 rounded-full" />
          </div>
        </div>
      )
    },
    { 
      id: 'dark', 
      name: 'Dark', 
      icon: <Moon className="w-4 h-4" />,
      preview: (
        <div className="w-full h-full bg-dark-200 rounded-md overflow-hidden">
          <div className="h-1/3 bg-primary-700" />
          <div className="p-1">
            <div className="w-3/4 h-1 bg-dark-400 rounded-full mb-1" />
            <div className="w-1/2 h-1 bg-dark-500 rounded-full" />
          </div>
        </div>
      )
    },
    { 
      id: 'purple', 
      name: 'Purple', 
      icon: <div className="w-4 h-4 rounded-full bg-accent-500" />,
      preview: (
        <div className="w-full h-full bg-purple-50 rounded-md overflow-hidden">
          <div className="h-1/3 bg-accent-500" />
          <div className="p-1">
            <div className="w-3/4 h-1 bg-purple-300 rounded-full mb-1" />
            <div className="w-1/2 h-1 bg-purple-200 rounded-full" />
          </div>
        </div>
      )
    },
    { 
      id: 'ocean', 
      name: 'Ocean', 
      icon: <div className="w-4 h-4 rounded-full bg-tertiary-500" />,
      preview: (
        <div className="w-full h-full bg-blue-50 rounded-md overflow-hidden">
          <div className="h-1/3 bg-tertiary-500" />
          <div className="p-1">
            <div className="w-3/4 h-1 bg-blue-300 rounded-full mb-1" />
            <div className="w-1/2 h-1 bg-blue-200 rounded-full" />
          </div>
        </div>
      )
    },
    { 
      id: 'sunset', 
      name: 'Sunset', 
      icon: <div className="w-4 h-4 rounded-full bg-warning-500" />,
      preview: (
        <div className="w-full h-full bg-orange-50 rounded-md overflow-hidden">
          <div className="h-1/3 bg-warning-500" />
          <div className="p-1">
            <div className="w-3/4 h-1 bg-orange-300 rounded-full mb-1" />
            <div className="w-1/2 h-1 bg-orange-200 rounded-full" />
          </div>
        </div>
      )
    },
    { 
      id: 'green', 
      name: 'Green', 
      icon: <div className="w-4 h-4 rounded-full bg-success-500" />, 
      preview: (
        <div className="w-full h-full bg-green-50 rounded-md overflow-hidden">
          <div className="h-1/3 bg-success-500" />
          <div className="p-1">
            <div className="w-3/4 h-1 bg-green-300 rounded-full mb-1" />
            <div className="w-1/2 h-1 bg-green-200 rounded-full" />
          </div>
        </div>
      )
    }
  ];
  
  const animationOptions: { id: AnimationLevel; name: string; icon: JSX.Element }[] = [
    { id: 'minimal', name: 'Minimal', icon: <ZoomIn className="w-3 h-3" /> },
    { id: 'moderate', name: 'Moderate', icon: <Sparkles className="w-3 h-3" /> },
    { id: 'high', name: 'High', icon: <Zap className="w-3 h-3" /> }
  ];
  
  const themeColors = {
    light: 'bg-white/90 text-gray-800 border-gray-200 backdrop-blur-sm',
    dark: 'bg-dark-200/90 text-white border-dark-400 backdrop-blur-sm',
    purple: 'bg-purple-50/90 text-purple-800 border-purple-200 dark:bg-purple-900/80 dark:text-purple-100 dark:border-purple-800/50 backdrop-blur-sm',
    ocean: 'bg-blue-50/90 text-blue-800 border-blue-200 dark:bg-blue-900/80 dark:text-blue-100 dark:border-blue-800/50 backdrop-blur-sm',
    sunset: 'bg-orange-50/90 text-orange-800 border-orange-200 dark:bg-orange-900/80 dark:text-orange-100 dark:border-orange-800/50 backdrop-blur-sm',
    green: 'bg-green-50/90 text-green-800 border-green-200 dark:bg-green-900/80 dark:text-green-100 dark:border-green-800/50 backdrop-blur-sm'
  };

  // Animation variants for tab content
  const tabContentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };
  
  // Render the content based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case 'theme':
        return (
          <motion.div
            key="theme-tab"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabContentVariants}
          >
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(option => (
                <motion.button
                  key={option.id}
                  whileHover={{ y: -2, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme(option.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border overflow-hidden ${
                    theme === option.id
                      ? 'border-primary-500 ring-1 ring-primary-500 ring-opacity-50'
                      : 'border-gray-200 dark:border-dark-400 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <div className="relative w-full h-12 mb-1.5">
                    {option.preview}
                    {theme === option.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
                      >
                        <div className="bg-white rounded-full p-0.5">
                          <Check className="w-3 h-3 text-primary-500" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    theme === option.id
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.name}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-500">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Animation Level
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {animationOptions.map(option => (
                  <motion.button
                    key={option.id}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAnimationLevel(option.id)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg ${
                      animationLevel === option.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      animationLevel === option.id
                        ? 'bg-primary-100 dark:bg-primary-800/50 text-primary-600 dark:text-primary-400'
                        : 'bg-gray-100 dark:bg-dark-400 text-gray-500 dark:text-gray-400'
                    }`}>
                      {option.icon}
                    </div>
                    <span className="text-xs font-medium">{option.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      
      case 'interface':
        return (
          <motion.div
            key="interface-tab"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabContentVariants}
            className="space-y-4"
          >
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Layout
              </h3>
              <button 
                onClick={toggleFullscreen}
                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <Maximize className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Fullscreen Mode</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Better focus while taking quizzes</p>
                  </div>
                </div>
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isFullscreen ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-400'
                }`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    isFullscreen ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </button>
              
              <button 
                onClick={() => {
                  const layout = localStorage.getItem('quizLayout') || 'default';
                  localStorage.setItem('quizLayout', layout === 'default' ? 'compact' : 'default');
                }}
                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Compact Layout</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">More content with less scrolling</p>
                  </div>
                </div>
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-dark-400`}>
                  <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-1" />
                </div>
              </button>
            </div>
            
            <div className="pt-2 border-t border-gray-100 dark:border-dark-500">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Preferences
              </h3>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Sound Effects</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={enableSound} 
                    onChange={toggleSound}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 ${
                    enableSound ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-400'
                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Auto-save Progress</span>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500">
                  <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-6" />
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Show Timer</span>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500">
                  <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-6" />
                </div>
              </div>
            </div>
          </motion.div>
        );
        
      case 'accessibility':
        return (
          <motion.div
            key="accessibility-tab"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabContentVariants}
            className="space-y-4"
          >
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Text Size
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Normal', sizeClass: 'text-sm' },
                  { id: 'large', label: 'Large', sizeClass: 'text-base' },
                  { id: 'larger', label: 'Larger', sizeClass: 'text-lg' }
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => setFontSize(option.id as any)}
                    className={`py-2 px-3 rounded-lg ${
                      fontSize === option.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                        : 'border border-gray-200 dark:border-dark-400'
                    } flex flex-col items-center justify-center`}
                  >
                    <span className={`${option.sizeClass} font-medium ${
                      fontSize === option.id
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-dark-500">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Visual
              </h3>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium">High Contrast</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={highContrast} 
                    onChange={() => setHighContrast(!highContrast)}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 ${
                    highContrast ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-400'
                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium">Screen Reader Support</span>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-500">
                  <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-6" />
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium">Reduce Motion</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={reduceMotion} 
                    onChange={() => setReduceMotion(!reduceMotion)}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 ${
                    reduceMotion ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-400'
                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          </motion.div>
        );
    }
  };
  
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-md border ${
          themeColors[theme]
        } transition-colors duration-200`}
        aria-label="Customize appearance"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">Customize</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.2, 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
              className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-40 ${
                theme === 'dark' 
                  ? 'bg-dark-200 text-white border-dark-400 shadow-dark-900/50' 
                  : 'bg-white text-gray-800 border-gray-200'
              } overflow-hidden`}
              role="dialog"
              aria-modal="true"
              aria-label="Appearance settings"
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary-500" />
                  <h2 className="font-semibold text-lg">Appearance</h2>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-400 text-gray-500 dark:text-gray-400"
                  aria-label="Close settings"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              
              {/* Tab navigation */}
              <div className="flex bg-gray-50 dark:bg-dark-300 px-4 py-1 gap-1 border-b border-gray-200 dark:border-dark-400">
                <button
                  onClick={() => setActiveTab('theme')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative ${
                    activeTab === 'theme' 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Theme
                  {activeTab === 'theme' && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" 
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('interface')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative ${
                    activeTab === 'interface' 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Interface
                  {activeTab === 'interface' && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" 
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('accessibility')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative ${
                    activeTab === 'accessibility' 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Accessibility
                  {activeTab === 'accessibility' && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" 
                    />
                  )}
                </button>
              </div>
              
              {/* Content area */}
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {renderTabContent()}
                </AnimatePresence>
              </div>
              
              {/* Footer */}
              <div className="flex justify-between items-center p-3 border-t border-gray-100 dark:border-dark-500 bg-gray-50/50 dark:bg-dark-300/50">
                <button
                  onClick={() => {
                    setTheme('light');
                    setAnimationLevel('moderate');
                    setFontSize('normal');
                    setHighContrast(false);
                    setReduceMotion(false);
                    if (enableSound) toggleSound();
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;