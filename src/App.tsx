import React, { useEffect } from 'react';
import { useQuizStore } from './store/quizStore';
import { AnimatePresence, motion } from 'framer-motion';
import WelcomeScreen from './components/WelcomeScreen';
import PDFUploader from './components/PDFUploader';
import TopicSelector from './components/TopicSelector';
import QuizSettings from './components/QuizSettings';
import QuizScreen from './components/QuizScreen';
import QuizResults from './components/QuizResults';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import ThemeSwitcher from './components/ui/ThemeSwitcher';

function App() {
  const { screen, theme, animationLevel } = useQuizStore();

  // Apply theme class to document
  useEffect(() => {
    // Clear existing theme classes
    document.documentElement.classList.remove('light', 'dark', 'purple', 'ocean', 'sunset', 'green');
    
    // Add current theme class
    document.documentElement.classList.add(theme);
    
    // Set color scheme for system UI
    const colorScheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.style.colorScheme = colorScheme;
    
    // Set theme color for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      const themeColors = {
        light: '#ffffff',
        dark: '#1E1E1E',
        purple: '#7c3aed',
        ocean: '#0ea5e9',
        sunset: '#f59e0b',
        green: '#10b981'
      };
      themeColorMeta.setAttribute('content', themeColors[theme]);
    }
  }, [theme]);

  // Animation settings based on user preferences
  const getTransitionDuration = () => {
    switch (animationLevel) {
      case 'minimal': return 0.2;
      case 'moderate': return 0.4;
      case 'high': return 0.6;
      default: return 0.4;
    }
  };

  // Screen transition variants
  const pageTransitions = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      duration: getTransitionDuration()
    }
  };

  // Render the appropriate screen based on the current state
  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'pdf-upload':
        return <PDFUploader />;
      case 'topic-selection':
        return <TopicSelector />;
      case 'quiz-settings':
        return <QuizSettings />;
      case 'quiz':
        return <QuizScreen />;
      case 'results':
        return <QuizResults />;
      case 'analytics':
        return <PerformanceAnalytics />;
      default:
        return <WelcomeScreen />;
    }
  };

  // Get dynamic theme-specific background colors
  const getThemeBackground = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gradient-to-br from-dark-100 to-dark-200';
      case 'purple':
        return 'bg-gradient-to-br from-purple-50 to-indigo-50';
      case 'ocean':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50';
      case 'sunset':
        return 'bg-gradient-to-br from-orange-50 to-rose-50';
      case 'green':
        return 'bg-gradient-to-br from-emerald-50 to-lime-50';
      default:
        return 'bg-gradient-to-br from-gray-50 to-white';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeBackground()} transition-colors duration-500`}>
      {/* Theme switcher */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
      
      {/* Main content with screen transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransitions}
          className="py-8"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      
      {/* Floating gradient orbs for decoration (visible only with high animation level) */}
      {animationLevel === 'high' && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-64 h-64 rounded-full bg-primary-200/30 dark:bg-primary-900/20 mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-float" />
          <div className="absolute bottom-1/3 -left-20 w-64 h-64 rounded-full bg-accent-200/30 dark:bg-accent-900/20 mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-float-delay" />
        </div>
      )}
    </div>
  );
}

export default App;