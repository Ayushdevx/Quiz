import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, Clock, Lightbulb, ChevronRight, CornerDownRight, 
  Volume2, VolumeX, Flag, ThumbsUp, BookmarkIcon, Share2, MessageSquare, Bookmark
} from 'lucide-react';
import { Question } from '../types';
import Button from './ui/Button';
import { useQuizStore } from '../store/quizStore';
import confetti from 'canvas-confetti';

interface QuizQuestionProps {
  question: Question;
  onAnswer: (answer: string | string[]) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, onAnswer }) => {
  const { settings, enableSound, animationLevel, addFlashCard, addStudyNote } = useQuizStore();
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [shake, setShake] = useState(false);
  const [noteMode, setNoteMode] = useState(false);
  const [note, setNote] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer('');
    setShowExplanation(false);
    setIsSubmitted(false);
    setIsCorrect(false);
    setTimeSpent(0);
    setHintVisible(false);
    setNoteMode(false);
    setNote('');
    setFeedback(null);
    setShowShareMenu(false);
    
    // Check if this question is bookmarked
    const bookmarks = JSON.parse(localStorage.getItem('quizBookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(question.id));
    
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
    
    // In a real implementation, we would use actual sound files
    try {
      if (audioRef.current) {
        audioRef.current.src = sound === 'correct' 
          ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' 
          : 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3';
        audioRef.current.volume = 0.5;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
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

  const handleBookmark = () => {
    // Toggle bookmark status
    const bookmarks = JSON.parse(localStorage.getItem('quizBookmarks') || '[]');
    
    if (isBookmarked) {
      // Remove from bookmarks
      const updatedBookmarks = bookmarks.filter((id: string) => id !== question.id);
      localStorage.setItem('quizBookmarks', JSON.stringify(updatedBookmarks));
    } else {
      // Add to bookmarks
      bookmarks.push(question.id);
      localStorage.setItem('quizBookmarks', JSON.stringify(bookmarks));
    }
    
    setIsBookmarked(!isBookmarked);
  };
  
  const handleAddToFlashcards = () => {
    if (addFlashCard && question.text) {
      // Create flashcard from question
      addFlashCard({
        front: question.text,
        back: Array.isArray(question.correctAnswer) 
          ? question.correctAnswer.join(', ') 
          : question.correctAnswer,
        topic: settings.topic || 'General',
        lastReviewed: new Date(),
      });
      
      // Show feedback
      showToast('Added to flash cards');
    }
  };
  
  const handleSaveNote = () => {
    if (addStudyNote && note.trim()) {
      addStudyNote({
        questionId: question.id,
        note: note.trim(),
      });
      
      setNoteMode(false);
      // Show feedback
      showToast('Note saved successfully');
    }
  };

  const showToast = (message: string) => {
    // Simple implementation - in a real app, this would use a toast component
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-800 text-white rounded-md text-sm z-50 opacity-0 transition-opacity';
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
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
                className="quiz-option"
              >
                <label
                  className={`group block p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                    <div className={`relative flex items-center justify-center w-5 h-5 mr-3 border rounded-full transition-colors flex-shrink-0 ${
                      isSubmitted 
                        ? selectedAnswer === option
                          ? isCorrect
                            ? 'bg-success-500 border-success-500'
                            : 'bg-error-500 border-error-500'
                          : question.correctAnswer === option && showExplanation
                            ? 'bg-success-500 border-success-500'
                            : 'border-gray-400 dark:border-gray-500'
                        : selectedAnswer === option
                          ? 'bg-primary-500 border-primary-500'
                          : 'border-gray-400 dark:border-gray-500 group-hover:border-primary-400 dark:group-hover:border-primary-500'
                    }`}>
                      <motion.div 
                        className="quiz-option-check absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                      >
                        {!isSubmitted && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-white" />
                        )}
                      </motion.div>
                      
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
      {/* Hidden audio element for sounds */}
      <audio ref={audioRef} className="hidden" />
      
      <div className="mb-6">
        <div className="bg-white dark:bg-dark-200 rounded-xl p-6 shadow-md border border-gray-200 dark:border-dark-400">
          {/* Question difficulty badge */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                question.difficulty === 'easy' 
                  ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300' 
                  : question.difficulty === 'medium'
                    ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300'
                    : 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300'
              }`}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-dark-400 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                {question.type === 'multiple-choice' ? 'Multiple Choice' : question.type === 'true-false' ? 'True/False' : 'Short Answer'}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-300 px-2 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{timeSpent}s</span>
            </div>
          </div>
          
          <div className="flex justify-between items-start mb-5">
            <h3 className="text-lg md:text-xl font-medium text-gray-800 dark:text-white pr-4">
              {question.text}
            </h3>
            <button 
              onClick={handleBookmark} 
              className="flex-shrink-0 text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors"
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {isBookmarked ? (
                <BookmarkIcon className="w-5 h-5 fill-primary-500 text-primary-500 dark:fill-primary-400 dark:text-primary-400" />
              ) : (
                <BookmarkIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="mb-6">
            {renderQuestionInput()}
          </div>
          
          {settings.showHints && !isSubmitted && (
            <div className="mb-4">
              <button
                onClick={() => setHintVisible(!hintVisible)}
                className="text-sm flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
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
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="font-medium text-sm flex items-center gap-1.5">
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
                  
                  {/* Feedback buttons */}
                  <div className="flex items-center gap-1 text-sm">
                    <button 
                      onClick={() => setFeedback('helpful')}
                      className={`p-1 rounded-full ${
                        feedback === 'helpful' 
                          ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' 
                          : 'text-gray-400 hover:text-primary-600 dark:text-gray-500 dark:hover:text-primary-400'
                      }`}
                      aria-label="Helpful"
                      title="Helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{question.explanation}</p>
                
                {/* Action buttons for explanation */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <button 
                    onClick={handleAddToFlashcards} 
                    className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <BookmarkIcon className="w-3.5 h-3.5" /> Add to flashcards
                  </button>
                  
                  <button 
                    onClick={() => setNoteMode(!noteMode)} 
                    className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> {noteMode ? 'Cancel' : 'Add note'}
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)} 
                      className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                    
                    {/* Share menu overlay */}
                    {showShareMenu && (
                      <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-dark-200 rounded-lg shadow-lg border border-gray-100 dark:border-dark-500 z-10 min-w-[120px]">
                        <button 
                          className="block w-full text-left py-1 px-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-300 rounded"
                          onClick={() => {
                            navigator.clipboard.writeText(question.text);
                            setShowShareMenu(false);
                            showToast('Copied to clipboard');
                          }}
                        >
                          Copy text
                        </button>
                        <button 
                          className="block w-full text-left py-1 px-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-300 rounded"
                          onClick={() => {
                            const text = `Question: ${question.text}\n\nAnswer: ${
                              Array.isArray(question.correctAnswer) 
                                ? question.correctAnswer.join(', ') 
                                : question.correctAnswer
                            }`;
                            navigator.clipboard.writeText(text);
                            setShowShareMenu(false);
                            showToast('Copied to clipboard');
                          }}
                        >
                          Copy with answer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Note taking area */}
                <AnimatePresence>
                  {noteMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <textarea
                        ref={noteInputRef}
                        className="w-full p-2 border border-gray-200 dark:border-dark-500 rounded-md bg-white dark:bg-dark-300 text-sm resize-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
                        rows={3}
                        placeholder="Write your note here..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onFocus={() => noteInputRef.current?.focus()}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button 
                          onClick={() => setNoteMode(false)}
                          className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNote}
                          disabled={!note.trim()}
                          className="px-2 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sound toggle button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isSubmitted ? (
                <button 
                  onClick={() => useQuizStore.getState().toggleSound()}
                  className="p-1.5 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-300"
                >
                  {enableSound ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Question completed
                  </span>
                </div>
              )}
            </div>

            <div>
              {!isSubmitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
                  className={`bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md button-3d ${
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
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg button-3d"
                  icon={<ChevronRight className="w-5 h-5" />}
                >
                  Next Question
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizQuestion;