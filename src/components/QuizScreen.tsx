import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, Timer, Flag, Award, Zap, Settings, HelpCircle, X, Menu,
  Smartphone, Tablet, Monitor, Loader2, Wifi, WifiOff
} from 'lucide-react';
import QuizQuestion from './QuizQuestion';
import { useQuizStore } from '../store/quizStore';
import Progress from './ui/Progress';
import Button from './ui/Button';
import { formatTime, detectDeviceType } from '../lib/utils';

const QuizScreen: React.FC = () => {
  const { 
    questions, 
    currentQuestionIndex, 
    answerQuestion, 
    settings, 
    completeQuiz,
    animationLevel,
    loadingQuestions,
    setLoadingQuestions,
    nextQuestion
  } = useQuizStore();
  
  const [timer, setTimer] = useState<number | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile'|'tablet'|'desktop'>('desktop');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [orientation, setOrientation] = useState<'portrait'|'landscape'>(
    window.matchMedia("(orientation: portrait)").matches ? 'portrait' : 'landscape'
  );
  const [hasStreamingActive, setHasStreamingActive] = useState(false);
  
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Define currentQuestion
  const currentQuestion = questions[currentQuestionIndex] || {};
  
  // Detect device type and orientation for responsive layout
  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceType(detectDeviceType());
      setOrientation(window.matchMedia("(orientation: portrait)").matches ? 'portrait' : 'landscape');
    };
    
    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    
    // Track online/offline status for mobile users
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  // Set up timer if time limit is specified
  useEffect(() => {
    if (settings.timeLimit) {
      // Set timer for current question only, not the entire quiz
      setTimer(settings.timeLimit);
    } else {
      setTimer(null);
    }
  }, [settings, currentQuestionIndex]); // Reset timer when question changes
  
  // Handle timer
  useEffect(() => {
    if (timer === null) return;
    
    if (timer <= 0) {
      // Time's up for this question, move to the next question instead of ending the quiz
      nextQuestion();
      return;
    }
    
    // Show warning when less than 20% of time remains
    if (settings.timeLimit && timer <= settings.timeLimit * 0.2 && timer % 5 === 0) {
      setShowTimerWarning(true);
      setTimeout(() => setShowTimerWarning(false), 1000);
    }
    
    const interval = setInterval(() => {
      setTimer(prevTimer => (prevTimer !== null ? prevTimer - 1 : null));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer, nextQuestion, settings.timeLimit]);
  
  // Background loading check - for progressive streaming questions from Gemini 2.0 Flash
  useEffect(() => {
    // If we're on the last question and streaming is active, check if more questions are available
    if (loadingQuestions && currentQuestionIndex === questions.length - 1) {
      setHasStreamingActive(true);
    }
  }, [loadingQuestions, currentQuestionIndex, questions.length]);
  
  // Render empty state if no questions are available
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 md:p-8"
        >
          <HelpCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">No questions available.</p>
          <Button 
            variant="primary"
            className="mt-4 md:mt-6"
            onClick={() => useQuizStore.getState().setScreen('welcome')}
          >
            Return to Home
          </Button>
        </motion.div>
      </div>
    );
  }
  
  // Display loading state for progressive question loading
  if (loadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 md:p-8"
        >
          <div className="mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-primary-500 dark:text-primary-400 mx-auto" />
            </motion.div>
          </div>
          <p className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Generating your quiz...
          </p>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Using Gemini 2.0 Flash to create intelligent questions tailored to your settings
          </p>
          
          {/* Display streaming progress */}
          {questions.length > 0 && (
            <div className="mt-6 w-full max-w-md mx-auto">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Generated {questions.length} questions so far</span>
                <span className="text-primary-600 dark:text-primary-400">{questions.length}/{settings.numQuestions}</span>
              </div>
              <Progress 
                value={questions.length} 
                max={settings.numQuestions} 
                color="primary"
                showValue={false}
                size="md"
                animated={true}
              />
              
              {/* If some questions are ready, allow starting the quiz */}
              {questions.length >= Math.min(3, settings.numQuestions) && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => setLoadingQuestions(false)}
                    className="w-full md:w-auto"
                  >
                    Start with {questions.length} questions
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    More questions will continue loading as you take the quiz
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  }
  
  // Handle user answering a question
  const handleAnswer = (answer: string | string[]) => {
    answerQuestion(answer);
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // When progress changes, animate the progress bar
  useEffect(() => {
    if (animationLevel !== 'minimal' && progressRef.current) {
      progressRef.current.classList.add('progress-pulse');
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.classList.remove('progress-pulse');
        }
      }, 1000);
    }
  }, [currentQuestionIndex, animationLevel]);
  
  // Get appropriate device icon
  const DeviceIcon = deviceType === 'mobile' ? Smartphone : 
                    deviceType === 'tablet' ? Tablet : Monitor;
  
  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 pb-6 md:pb-10">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-2 left-0 right-0 mx-auto w-fit bg-error-100 dark:bg-error-900/40 border border-error-300 dark:border-error-800 z-50 rounded-full px-3 py-1 flex items-center gap-2 text-error-700 dark:text-error-300 text-sm shadow-md">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline mode</span>
        </div>
      )}
      
      {/* Quiz Header - optimized for mobile */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-dark-100/90 backdrop-blur-sm pb-3 pt-2 md:pb-4 md:pt-2">
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <div className="flex items-center gap-2 md:gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="md:hidden text-gray-600 dark:text-gray-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            
            <div className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <span className="hidden md:inline">Question</span>
              <span className="text-lg md:text-2xl font-bold text-primary-600 dark:text-primary-400">{currentQuestionIndex + 1}</span>
              <span className="hidden md:inline">of</span>
              <span className="md:text-lg">{questions.length}</span>
            </div>
            
            <div className="hidden md:flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300">
              <span className="capitalize">{currentQuestion.difficulty}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>
              <span>{currentQuestion.type.replace('-', ' ')}</span>
            </div>
          </div>
          
          {timer !== null && (
            <motion.div 
              className={`flex items-center gap-1.5 text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full ${
                timer < 30 
                  ? 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300' 
                  : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'
              }`}
              animate={showTimerWarning ? { 
                scale: [1, 1.1, 1],
                backgroundColor: ['#fee2e2', '#fecaca', '#fee2e2']
              } : {}}
              transition={{ duration: 1 }}
            >
              <Timer className={`w-3.5 h-3.5 md:w-4 md:h-4 ${timer < 30 ? 'text-error-500' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className="font-medium">{formatTime(timer)}</span>
            </motion.div>
          )}
          
          <div className="hidden md:flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className="p-2 rounded-full bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400"
              aria-label="Quiz Information"
            >
              <Info className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => completeQuiz()}
              className="p-2 rounded-full bg-gray-100 dark:bg-dark-300 text-gray-600 dark:text-gray-400"
              aria-label="End Quiz"
            >
              <Flag className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Mobile menu - improved for better touch targets */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-dark-200 rounded-lg shadow-md p-3 mb-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setIsInfoOpen(!isInfoOpen)} 
                  className="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md text-sm"
                >
                  <Info className="w-4 h-4" />
                  <span>Quiz Info</span>
                </button>
                <button 
                  onClick={() => completeQuiz()} 
                  className="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md text-sm"
                >
                  <Flag className="w-4 h-4" />
                  <span>End Quiz</span>
                </button>
                <div className="col-span-2 flex items-center gap-1.5 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md text-sm">
                  <span className="capitalize">{currentQuestion.difficulty}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                  <span>{currentQuestion.type.replace('-', ' ')}</span>
                </div>
              </div>
              
              {/* Device info for responsive feedback */}
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-dark-500 pt-2">
                <div className="flex items-center gap-1">
                  <DeviceIcon className="w-3 h-3" />
                  <span>{deviceType}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isOnline ? (
                    <Wifi className="w-3 h-3 text-success-500" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-error-500" />
                  )}
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiz info panel - made responsive */}
        <AnimatePresence>
          {isInfoOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-dark-200 rounded-lg shadow-md p-3 md:p-4 mb-3 relative"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsInfoOpen(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </motion.button>
              
              <h3 className="font-medium mb-2 pr-6">{settings.title}</h3>
              {settings.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{settings.description}</p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                  <span className="font-medium capitalize">{settings.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                {settings.topic && (
                  <div className="flex items-center gap-2 col-span-full">
                    <Award className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Topic:</span>
                    <span className="font-medium">{settings.topic}</span>
                  </div>
                )}
              </div>
              
              {/* Mobile device info */}
              {deviceType !== 'desktop' && (
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-dark-500 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <DeviceIcon className="w-3 h-3" />
                      <span>{deviceType} ({orientation})</span>
                    </div>
                    <span>Gemini 2.0 Flash</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={progressRef} className="relative">
          <Progress 
            value={currentQuestionIndex + 1} 
            max={questions.length} 
            color="primary"
            showValue={false}
            size="md"
            animated={animationLevel !== 'minimal'}
            className="progress-bar"
          />
          
          {/* Progress markers - simplified for mobile */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="relative h-full">
              {questions.slice(0, 10).map((_, index) => (
                <div 
                  key={index} 
                  className={`absolute top-1/2 w-2 h-2 rounded-full transform -translate-y-1/2 transition-all ${
                    index < currentQuestionIndex 
                      ? 'bg-primary-600 dark:bg-primary-400 scale-75' 
                      : index === currentQuestionIndex 
                        ? 'bg-primary-500 scale-100 border-2 border-white dark:border-dark-200 shadow'
                        : 'bg-gray-300 dark:bg-dark-500 scale-75'
                  } ${questions.length > 10 && deviceType === 'mobile' ? 'hidden md:block' : ''}`}
                  style={{ 
                    left: `${(index / (Math.min(questions.length - 1, 9))) * 100}%`,
                    marginLeft: '-4px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Question content */}
      <AnimatePresence mode="wait">
        <QuizQuestion 
          key={currentQuestion.id} 
          question={currentQuestion} 
          onAnswer={handleAnswer} 
        />
      </AnimatePresence>
    </div>
  );
};

export default QuizScreen;