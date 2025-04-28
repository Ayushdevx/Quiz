// filepath: d:\quiz\project\src\components\ui\ThemeSwitcher.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Palette, Settings, ChevronDown, Check } from 'lucide-react';
import { useQuizStore } from '../../store/quizStore';
import { Theme, AnimationLevel } from '../../types';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, animationLevel, setAnimationLevel, enableSound, toggleSound } = useQuizStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOpen = () => setIsOpen(!isOpen);
  
  const themeOptions: { id: Theme; name: string; icon: JSX.Element }[] = [
    { id: 'light', name: 'Light', icon: <Sun className="w-4 h-4" /> },
    { id: 'dark', name: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { id: 'purple', name: 'Purple', icon: <div className="w-4 h-4 rounded-full bg-accent-500" /> },
    { id: 'ocean', name: 'Ocean', icon: <div className="w-4 h-4 rounded-full bg-tertiary-500" /> },
    { id: 'sunset', name: 'Sunset', icon: <div className="w-4 h-4 rounded-full bg-warning-500" /> },
    { id: 'green', name: 'Green', icon: <div className="w-4 h-4 rounded-full bg-success-500" /> }
  ];
  
  const animationOptions: { id: AnimationLevel; name: string }[] = [
    { id: 'minimal', name: 'Minimal' },
    { id: 'moderate', name: 'Moderate' },
    { id: 'high', name: 'High' }
  ];
  
  const themeColors = {
    light: 'bg-white text-gray-800 border-gray-200',
    dark: 'bg-dark-200 text-white border-dark-400',
    purple: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-100 dark:border-purple-800/50',
    ocean: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-800/50',
    sunset: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-100 dark:border-orange-800/50',
    green: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-100 dark:border-green-800/50'
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
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute right-0 mt-2 w-64 p-4 rounded-xl shadow-lg border z-40 ${
                theme === 'dark' 
                  ? 'bg-dark-200 text-white border-dark-400' 
                  : 'bg-white text-gray-800 border-gray-200'
              }`}
            >
              <div className="mb-4">
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Theme
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map(option => (
                    <motion.button
                      key={option.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTheme(option.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border ${
                        theme === option.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-dark-400 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <div className="relative mb-1">
                        {option.icon}
                        {theme === option.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-3 h-3 bg-primary-500 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-2 h-2 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <span className="text-xs font-medium">
                        {option.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Animation
                </h3>
                <div className="flex gap-2">
                  {animationOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setAnimationLevel(option.id)}
                      className={`py-1 px-3 rounded-full text-xs font-medium ${
                        animationLevel === option.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sound Effects</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={enableSound} 
                    onChange={toggleSound}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 ${
                    enableSound ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-400'
                  } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-400">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Close
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