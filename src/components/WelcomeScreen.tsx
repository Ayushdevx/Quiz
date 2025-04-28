import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, BookOpen, Brain, Trophy, Users, Clock, Sparkles, Lightbulb } from 'lucide-react';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { useQuizStore } from '../store/quizStore';

const FeatureBadge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
    {label}
  </span>
);

const WelcomeScreen: React.FC = () => {
  const { setScreen, achievements, streak, quizHistory } = useQuizStore();
  const hasHistory = quizHistory.length > 0;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  const floatingAnimation = {
    y: [-10, 10],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  };

  const rotateAnimation = {
    rotate: [-5, 5],
    transition: {
      rotate: {
        duration: 2.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  };
  
  return (
    <div className="relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-200 dark:bg-primary-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-20 -right-40 w-80 h-80 bg-accent-200 dark:bg-accent-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-tertiary-200 dark:bg-tertiary-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-50 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <div className="inline-block relative">
            <motion.div animate={floatingAnimation}>
              <motion.div
                className="relative z-10 flex items-center justify-center p-3 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl shadow-lg"
              >
                <Brain className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
            
            <div className="absolute top-0 -z-10 w-full h-full bg-primary-200 dark:bg-primary-900/50 rounded-2xl blur-xl opacity-70 transform scale-110" />
          </div>
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mt-6 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-500"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            QuizGenius
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Create interactive quizzes from PDFs or choose from various topics with AI-powered questions
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <FeatureBadge label="AI-Generated" color="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300" />
            <FeatureBadge label="PDF Support" color="bg-tertiary-100 text-tertiary-700 dark:bg-tertiary-900/50 dark:text-tertiary-300" />
            <FeatureBadge label="Study Mode" color="bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-300" />
            <FeatureBadge label="Analytics" color="bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-300" />
          </motion.div>
        </motion.div>

        {/* User Stats (visible only if they have history) */}
        {hasHistory && (
          <motion.div 
            className="max-w-md mx-auto mb-10 bg-white/70 dark:bg-dark-200/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-dark-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-primary-400 to-accent-500 p-3 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Welcome back!</h3>
                <div className="flex flex-wrap gap-3 mt-1">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{streak} day streak</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{achievements.filter(a => a.unlocked).length} achievements</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{quizHistory.length} quizzes completed</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main options */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <motion.div 
              className="h-full"
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="h-full bg-white/70 dark:bg-dark-200/70 backdrop-blur-sm border-2 border-primary-100 dark:border-primary-900 hover:border-primary-300 dark:hover:border-primary-700 transition-all">
                <CardContent className="p-6 space-y-6">
                  <motion.div animate={rotateAnimation} className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg mb-4">
                    <FileUp className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Upload PDF</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Generate quiz questions from your PDF documents. Our AI will analyze the content and create targeted questions to test your knowledge.
                    </p>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400"></span>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">Works with academic papers, articles, and textbooks</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400"></span>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">Extract key concepts and generate relevant questions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400"></span>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">Create flashcards for future study sessions</span>
                      </li>
                    </ul>
                  </div>
                  
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20"
                    icon={<FileUp className="w-5 h-5" />}
                    onClick={() => setScreen('pdf-upload')}
                  >
                    Upload PDF
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <motion.div 
              className="h-full"
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="h-full bg-white/70 dark:bg-dark-200/70 backdrop-blur-sm border-2 border-accent-100 dark:border-accent-900 hover:border-accent-300 dark:hover:border-accent-700 transition-all">
                <CardContent className="p-6 space-y-6">
                  <motion.div animate={rotateAnimation} className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl shadow-lg mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Choose Topic</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Browse our diverse collection of topics and let our AI generate custom quizzes to challenge your knowledge in various domains.
                    </p>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mr-3 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-accent-500 dark:bg-accent-400"></span>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">8+ categories with thousands of questions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mr-3 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-accent-500 dark:bg-accent-400"></span>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">Personalized difficulty levels for every skill level</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mr-3 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-accent-500 dark:bg-accent-400"></span>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">Compare your scores with others on the leaderboard</span>
                      </li>
                    </ul>
                  </div>
                  
                  <Button
                    variant="secondary"
                    className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/20"
                    icon={<BookOpen className="w-5 h-5" />}
                    onClick={() => setScreen('topic-selection')}
                  >
                    Browse Topics
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
        >
          {hasHistory && (
            <>
              <Button
                variant="outline"
                className="border-2 shadow-sm"
                onClick={() => setScreen('analytics')}
                icon={<Users className="w-4 h-4" />}
              >
                Leaderboards
              </Button>
              
              <Button
                variant="outline"
                className="border-2 shadow-sm"
                onClick={() => setScreen('analytics')}
                icon={<Trophy className="w-4 h-4" />}
              >
                My Progress
              </Button>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm"
        >
          <p>
            Powered by AI • Adaptive Learning • Interactive Quizzes • Detailed Analytics
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;