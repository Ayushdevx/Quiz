import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Timer, Flag, Award, Zap, Settings, HelpCircle, X, Menu } from 'lucide-react';
import QuizQuestion from './QuizQuestion';
import { useQuizStore } from '../store/quizStore';
import Progress from './ui/Progress';
import Button from './ui/Button';
import { formatTime } from '../lib/utils';

const QuizScreen: React.FC = () => {
  const { 
    questions, 
    currentQuestionIndex, 
    answerQuestion, 
    settings, 
    timeRemaining, 
    completeQuiz,
    animationLevel
  } = useQuizStore();
  
  const [timer, setTimer] = useState<number | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Set up timer if time limit is specified
  useEffect(() => {
    if (settings.timeLimit && timeRemaining === null) {
      // Set initial timer
      setTimer(settings.timeLimit * questions.length);
    } else if (timeRemaining !== null) {
      setTimer(timeRemaining);
    }
  }, [settings, timeRemaining, questions]);
  
  // Handle timer
  useEffect(() => {
    if (timer === null) return;
    
    if (timer <= 0) {
      // Time's up, end the quiz
      completeQuiz();
      return;
    }

    // Show warning when less than 20% of time remains
    if (settings.timeLimit && timer <= settings.timeLimit * questions.length * 0.2 && timer % 5 === 0) {
      setShowTimerWarning(true);
      setTimeout(() => setShowTimerWarning(false), 1000);
    }
    
    const interval = setInterval(() => {
      setTimer(prevTimer => (prevTimer !== null ? prevTimer - 1 : null));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer, completeQuiz, settings.timeLimit, questions.length]);
  
  // Current question to display
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-8"
        >
          <HelpCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">No questions available.</p>
          <Button 
            variant="primary"
            className="mt-6"
            onClick={() => useQuizStore.getState().setScreen('welcome')}
          >
            Return to Home
          </Button>
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
  
  return (
    <div className="max-w-4xl mx-auto px-4 pb-10">
      {/* Quiz Header */}
      <div className="sticky top-0 z-10 bg-white bg-opacity-80 dark:bg-dark-100 dark:bg-opacity-80 backdrop-blur-sm pb-4 pt-2">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-4">
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
              <span className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">{currentQuestionIndex + 1}</span>
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
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full ${
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
              <Timer className={`w-4 h-4 ${timer < 30 ? 'text-error-500' : 'text-gray-500 dark:text-gray-400'}`} />
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

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-dark-200 rounded-lg shadow-md p-3 mb-3"
            >
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setIsInfoOpen(!isInfoOpen)} 
                  className="flex items-center gap-1.5 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md text-sm"
                >
                  <Info className="w-4 h-4" />
                  <span>Quiz Info</span>
                </button>
                <button 
                  onClick={() => completeQuiz()} 
                  className="flex items-center gap-1.5 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md text-sm"
                >
                  <Flag className="w-4 h-4" />
                  <span>End Quiz</span>
                </button>
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md text-sm">
                  <span className="capitalize">{currentQuestion.difficulty}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                  <span>{currentQuestion.type.replace('-', ' ')}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiz info panel */}
        <AnimatePresence>
          {isInfoOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-dark-200 rounded-lg shadow-md p-4 mb-3 relative"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsInfoOpen(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-300 text-gray-500 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </motion.button>
              
              <h3 className="font-medium mb-2">{settings.title}</h3>
              {settings.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{settings.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                  <span className="font-medium capitalize">{settings.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                {settings.topic && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Award className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Topic:</span>
                    <span className="font-medium">{settings.topic}</span>
                  </div>
                )}
              </div>
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
          
          {/* Progress markers */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="relative h-full">
              {questions.map((_, index) => (
                <div 
                  key={index} 
                  className={`absolute top-1/2 w-2 h-2 rounded-full transform -translate-y-1/2 transition-all ${
                    index < currentQuestionIndex 
                      ? 'bg-primary-600 dark:bg-primary-400 scale-75' 
                      : index === currentQuestionIndex 
                        ? 'bg-primary-500 scale-100 border-2 border-white dark:border-dark-200 shadow'
                        : 'bg-gray-300 dark:bg-dark-500 scale-75'
                  }`}
                  style={{ 
                    left: `${(index / (questions.length - 1)) * 100}%`,
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