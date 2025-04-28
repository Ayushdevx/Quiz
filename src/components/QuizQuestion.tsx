import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Lightbulb, ChevronRight, CornerDownRight } from 'lucide-react';
import { Question } from '../types';
import Button from './ui/Button';
import { useQuizStore } from '../store/quizStore';
import confetti from 'canvas-confetti';

interface QuizQuestionProps {
  question: Question;
  onAnswer: (answer: string | string[]) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, onAnswer }) => {
  const { settings, enableSound, animationLevel } = useQuizStore();
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [shake, setShake] = useState(false);
  
  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer('');
    setShowExplanation(false);
    setIsSubmitted(false);
    setIsCorrect(false);
    setTimeSpent(0);
    setHintVisible(false);
    
    // Start timer for this question
    const startTime = new Date().getTime();
    
    // Update time spent every second
    const timerInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      setTimeSpent(elapsedSeconds);
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [question.id]);
  
  const playSound = (sound: 'correct' | 'incorrect') => {
    if (!enableSound) return;
    
    // In a real app, actual sounds would be imported and played here
    console.log(`Playing ${sound} sound`);
  };
  
  const handleSubmit = () => {
    if (!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    // Check if the answer is correct
    const correct = Array.isArray(question.correctAnswer)
      ? Array.isArray(selectedAnswer) && 
        question.correctAnswer.length === selectedAnswer.length && 
        question.correctAnswer.every(a => selectedAnswer.includes(a))
      : selectedAnswer === question.correctAnswer;
    
    setIsCorrect(correct);
    setIsSubmitted(true);
    setShowExplanation(true);
    
    // Play appropriate sound
    if (correct) {
      playSound('correct');
      
      // Show confetti for correct answers with high animation level
      if (animationLevel === 'high') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#60a5fa', '#a78bfa', '#34d399'],
          zIndex: 1000,
        });
      }
    } else {
      playSound('incorrect');
    }
    
    // Send the answer to the parent component with time spent
    onAnswer(selectedAnswer);
  };
  
  const getHint = () => {
    if (!question.explanation) return "No hint available for this question.";
    
    // Generate a simple hint based on the explanation
    const words = question.explanation.split(' ');
    if (words.length <= 5) return "Think about the key concepts in the question.";
    
    // Extract first part of the explanation as a hint
    return words.slice(0, Math.min(8, Math.floor(words.length / 2))).join(' ') + '...';
  };
  
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: isSubmitted ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitted ? 1 : 0.99 }}
                animate={
                  isSubmitted && 
                  ((selectedAnswer === option && isCorrect) || 
                   (question.correctAnswer === option && !isCorrect))
                    ? { 
                        y: [0, -5, 0],
                        transition: { 
                          duration: 0.5,
                          times: [0, 0.5, 1],
                          ease: "easeInOut" 
                        }
                      }
                    : {}
                }
              >
                <label
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSubmitted
                      ? selectedAnswer === option
                        ? isCorrect
                          ? 'bg-success-50 border-success-500 text-success-900 dark:bg-success-900/20 dark:border-success-500 dark:text-success-200'
                          : 'bg-error-50 border-error-500 text-error-900 dark:bg-error-900/20 dark:border-error-500 dark:text-error-200'
                        : question.correctAnswer === option && showExplanation
                        ? 'bg-success-50 border-success-500 text-success-900 dark:bg-success-900/20 dark:border-success-500 dark:text-success-200'
                        : 'bg-white dark:bg-dark-300 border-gray-300 dark:border-dark-500 opacity-50'
                      : selectedAnswer === option
                      ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20 dark:border-primary-500/70'
                      : 'bg-white dark:bg-dark-300 border-gray-300 dark:border-dark-500 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-dark-400'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-5 h-5 mr-3 border rounded-full transition-colors flex-shrink-0 ${
                      isSubmitted 
                        ? selectedAnswer === option
                          ? isCorrect
                            ? 'bg-success-500 border-success-500'
                            : 'bg-error-500 border-error-500'
                          : question.correctAnswer === option && showExplanation
                            ? 'bg-success-500 border-success-500'
                            : 'border-gray-400'
                        : selectedAnswer === option
                          ? 'bg-primary-500 border-primary-500'
                          : 'border-gray-400'
                    }`}>
                      {(isSubmitted && selectedAnswer === option && isCorrect) || 
                       (isSubmitted && question.correctAnswer === option && showExplanation) ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (isSubmitted && selectedAnswer === option && !isCorrect) ? (
                        <XCircle className="w-4 h-4 text-white" />
                      ) : null}
                    </div>
                    <span className={`flex-1 ${
                      isSubmitted && question.correctAnswer === option && showExplanation
                        ? 'font-medium'
                        : ''
                    }`}>{option}</span>
                    
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={() => setSelectedAnswer(option)}
                      className="sr-only"
                      disabled={isSubmitted}
                    />
                  </div>
                </label>
              </motion.div>
            ))}
          </div>
        );
        
      case 'true-false':
        return (
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {['True', 'False'].map((option) => (
              <motion.div
                key={option}
                className="flex-1"
                whileHover={{ scale: isSubmitted ? 1 : 1.03 }}
                whileTap={{ scale: isSubmitted ? 1 : 0.97 }}
                animate={
                  isSubmitted && 
                  ((selectedAnswer === option && isCorrect) || 
                   (question.correctAnswer === option && !isCorrect))
                    ? { 
                        y: [0, -5, 0],
                        transition: { 
                          duration: 0.5,
                          times: [0, 0.5, 1],
                          ease: "easeInOut" 
                        }
                      }
                    : {}
                }
              >
                <label
                  className={`flex flex-col items-center justify-center p-5 border-2 rounded-xl text-center cursor-pointer transition-all h-full ${
                    isSubmitted
                      ? selectedAnswer === option
                        ? isCorrect
                          ? 'bg-success-50 border-success-500 text-success-900 dark:bg-success-900/20 dark:border-success-500 dark:text-success-200'
                          : 'bg-error-50 border-error-500 text-error-900 dark:bg-error-900/20 dark:border-error-500 dark:text-error-200'
                        : question.correctAnswer === option && showExplanation
                        ? 'bg-success-50 border-success-500 text-success-900 dark:bg-success-900/20 dark:border-success-500 dark:text-success-200'
                        : 'bg-white dark:bg-dark-300 border-gray-300 dark:border-dark-500 opacity-50'
                      : selectedAnswer === option
                      ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/20 dark:border-primary-500/70'
                      : 'bg-white dark:bg-dark-300 border-gray-300 dark:border-dark-500 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-dark-400'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 mb-2 rounded-full transition-colors ${
                      isSubmitted 
                        ? selectedAnswer === option
                          ? isCorrect
                            ? 'bg-success-500'
                            : 'bg-error-500'
                          : question.correctAnswer === option && showExplanation
                            ? 'bg-success-500'
                            : 'bg-gray-200 dark:bg-dark-500'
                        : selectedAnswer === option
                          ? 'bg-primary-500'
                          : 'bg-gray-200 dark:bg-dark-500'
                    }`}>
                    {(isSubmitted && selectedAnswer === option && isCorrect) || 
                     (isSubmitted && question.correctAnswer === option && showExplanation) ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (isSubmitted && selectedAnswer === option && !isCorrect) ? (
                      <XCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className={`text-sm font-medium ${
                        selectedAnswer === option ? 'text-white' : 'text-gray-600 dark:text-gray-200'
                      }`}>
                        {option === 'True' ? 'T' : 'F'}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-lg">{option}</span>
                  
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => setSelectedAnswer(option)}
                    className="sr-only"
                    disabled={isSubmitted}
                  />
                </label>
              </motion.div>
            ))}
          </div>
        );
        
      case 'short-answer':
        return (
          <div>
            <motion.div animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}>
              <div className="relative">
                <input
                  type="text"
                  className={`input w-full pr-10 ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-success-500 bg-success-50 dark:bg-success-900/10 dark:border-success-400'
                        : 'border-error-500 bg-error-50 dark:bg-error-900/10 dark:border-error-400'
                      : 'bg-white dark:bg-dark-300 border-gray-300 dark:border-dark-500 focus:border-primary-500 dark:focus:border-primary-400'
                  }`}
                  placeholder="Type your answer here..."
                  value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isSubmitted}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSubmitted && selectedAnswer) {
                      handleSubmit();
                    }
                  }}
                />
                {isSubmitted && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-success-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-error-500" />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
            
            {isSubmitted && !isCorrect && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 flex items-start gap-1"
              >
                <CornerDownRight className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Correct answer:
                  </span>
                  <span className="text-sm ml-1 font-medium text-gray-900 dark:text-gray-100">
                    {question.correctAnswer}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        type: "tween",
        ease: "easeInOut",
        duration: 0.3
      }
    }
  };
  
  return (
    <motion.div 
      className="max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="mb-6">
        <div className="bg-white dark:bg-dark-200 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-400">
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-lg md:text-xl font-medium text-gray-800 dark:text-white pr-4">
              {question.text}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
              <Clock className="w-4 h-4" />
              <span>{timeSpent}s</span>
            </div>
          </div>
          
          <div className="mb-6">
            {renderQuestionInput()}
          </div>
          
          {settings.showHints && !isSubmitted && (
            <div className="mb-4">
              <button
                onClick={() => setHintVisible(!hintVisible)}
                className="text-sm flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
              >
                <Lightbulb className="w-4 h-4" />
                <span>{hintVisible ? 'Hide hint' : 'Show hint'}</span>
              </button>
              
              <AnimatePresence>
                {hintVisible && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 text-sm rounded-lg"
                  >
                    <span className="font-medium">Hint:</span> {getHint()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <AnimatePresence>
            {showExplanation && question.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg mb-4 ${
                  isCorrect 
                    ? 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800' 
                    : 'bg-gray-50 dark:bg-dark-300/50 border border-gray-200 dark:border-dark-600'
                }`}
              >
                <h4 className="font-medium text-sm mb-1.5 flex items-center gap-1.5">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-success-500" />
                      <span className="text-success-700 dark:text-success-300">
                        Correct! Explanation:
                      </span>
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-4 h-4 text-primary-500" />
                      <span className="text-primary-700 dark:text-primary-300">
                        Explanation:
                      </span>
                    </>
                  )}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex justify-between">
            {!isSubmitted ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
                className={`bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md ${
                  !selectedAnswer ? 'opacity-60' : 'hover:shadow-lg'
                }`}
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  // Move to the next question
                  setSelectedAnswer('');
                  setShowExplanation(false);
                  setIsSubmitted(false);
                  setIsCorrect(false);
                  
                  // Go to the next question
                  useQuizStore.getState().nextQuestion();
                }}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg"
                icon={<ChevronRight className="w-5 h-5" />}
              >
                Next Question
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizQuestion;