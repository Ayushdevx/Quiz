import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Trophy, RotateCcw, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import Button from './ui/Button';
import { useQuizStore } from '../store/quizStore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { calculatePercentage } from '../lib/utils';

const QuizResults: React.FC = () => {
  const { currentResult, resetQuiz, setScreen } = useQuizStore();
  const confettiTriggered = useRef(false);
  
  // Check if we have a result to display
  if (!currentResult) {
    return (
      <div className="text-center p-8">
        <p>No quiz results available.</p>
      </div>
    );
  }
  
  const score = calculatePercentage(currentResult.correctAnswers, currentResult.totalQuestions);
  const isHighScore = score >= 70; // Consider 70% or above a high score
  
  // Calculate labels for the score
  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent!';
    if (score >= 70) return 'Great job!';
    if (score >= 50) return 'Good effort!';
    return 'Keep practicing!';
  };
  
  // Trigger confetti for high scores
  useEffect(() => {
    if (isHighScore && !confettiTriggered.current) {
      confettiTriggered.current = true;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    return () => {
      confettiTriggered.current = false;
    };
  }, [isHighScore]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Quiz Results</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary-50 mb-4"
              >
                <div className="text-center">
                  <span className="block text-3xl font-bold text-primary-600">{score}%</span>
                  <span className="block text-sm text-primary-800">Score</span>
                </div>
              </motion.div>
              
              <h3 className="text-xl font-medium text-gray-800 mb-1">
                {getScoreLabel()}
              </h3>
              <p className="text-gray-600">
                You got {currentResult.correctAnswers} out of {currentResult.totalQuestions} questions correct
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <motion.div
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5 text-accent-500" />
                  <h4 className="font-medium">Performance</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Correct:</span>
                    <span className="font-medium text-success-600">{currentResult.correctAnswers}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Incorrect:</span>
                    <span className="font-medium text-error-600">{currentResult.incorrectAnswers}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Skipped:</span>
                    <span className="font-medium">{currentResult.skippedQuestions}</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-tertiary-500" />
                  <h4 className="font-medium">Time</h4>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Total Time:</span>
                    <span className="font-medium">
                      {Math.floor(currentResult.totalTime / 60)}m {Math.round(currentResult.totalTime % 60)}s
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Avg. per Question:</span>
                    <span className="font-medium">
                      {Math.round(currentResult.totalTime / currentResult.totalQuestions)}s
                    </span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                resetQuiz();
                setScreen('welcome');
              }}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Start New Quiz
            </Button>
            
            <Button
              variant="primary"
              onClick={() => setScreen('analytics')}
              icon={<BarChart className="w-4 h-4" />}
            >
              View Full Analysis
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default QuizResults;