import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, TagIcon, TrendingUp, BarChart2, Filter } from 'lucide-react';
import { useQuizStore } from '../store/quizStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { Topic } from '../types';

const TopicSelector: React.FC = () => {
  const { availableTopics, setSelectedTopic, setScreen } = useQuizStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'difficulty' | 'popular'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  const filteredTopics = availableTopics.filter(topic => {
    // Apply search filter
    const matchesSearch = 
      searchQuery === '' || 
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply difficulty filter  
    const matchesDifficulty = 
      activeFilter !== 'difficulty' || 
      !selectedDifficulty || 
      topic.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });
  
  // Sort topics based on active filter
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (activeFilter === 'popular') {
      return (b.popularityScore || 0) - (a.popularityScore || 0);
    }
    return 0;
  });
  
  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setScreen('quiz-settings');
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
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
  
  const difficultyColors = {
    easy: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
    medium: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
    hard: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300'
  };
  
  const getDifficultyLabel = (difficulty?: string) => {
    if (!difficulty) return null;
    
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColors[difficulty as keyof typeof difficultyColors]}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
          onClick={() => setScreen('welcome')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </motion.button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800 dark:text-white">
            Choose a Topic
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our diverse collection of quiz topics or search for specific interests
          </p>
        </div>
        
        <Card className="bg-white/90 dark:bg-dark-200/90 backdrop-blur-sm border border-gray-200 dark:border-dark-300 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search topics by name or description..."
                  className="input pl-10 w-full bg-white dark:bg-dark-300 border-gray-200 dark:border-dark-400 focus:border-primary-400 dark:focus:border-primary-500 focus:ring-primary-300 dark:focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={activeFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  icon={<Filter className="w-4 h-4" />}
                >
                  All
                </Button>
                <Button
                  variant={activeFilter === 'popular' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('popular')}
                  icon={<TrendingUp className="w-4 h-4" />}
                >
                  Popular
                </Button>
                <Button
                  variant={activeFilter === 'difficulty' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('difficulty')}
                  icon={<BarChart2 className="w-4 h-4" />}
                >
                  Difficulty
                </Button>
              </div>
            </div>
            
            {/* Difficulty filter options */}
            <AnimatePresence>
              {activeFilter === 'difficulty' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="flex gap-2 flex-wrap">
                    {['easy', 'medium', 'hard'].map(difficulty => (
                      <button
                        key={difficulty}
                        className={`py-1 px-3 rounded-full text-sm ${
                          selectedDifficulty === difficulty
                            ? difficultyColors[difficulty as keyof typeof difficultyColors]
                            : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setSelectedDifficulty(
                          selectedDifficulty === difficulty ? null : difficulty
                        )}
                      >
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {sortedTopics.map((topic) => (
          <motion.div
            key={topic.id}
            variants={cardVariants}
            whileHover={{ 
              y: -8,
              transition: { duration: 0.2 }
            }}
            onClick={() => handleTopicSelect(topic.id)}
            className="cursor-pointer flex"
          >
            <Card className="overflow-hidden h-full w-full bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm border border-gray-200 dark:border-dark-400 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
              <div 
                className="h-36 bg-center bg-cover relative"
                style={{ backgroundImage: `url(${topic.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
                  {getDifficultyLabel(topic.difficulty)}
                  {topic.popularityScore && topic.popularityScore > 75 && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Popular
                    </span>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-white">
                      {topic.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {topic.description}
                    </p>
                  </div>
                  <TagIcon className="w-5 h-5 text-primary-500 flex-shrink-0 ml-2 mt-1" />
                </div>
                
                <motion.div 
                  className="mt-4 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600"
                  >
                    Select Topic
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      {sortedTopics.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center p-12 bg-white/50 dark:bg-dark-200/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-dark-400"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-300 mb-4">
            <Search className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">No topics found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try different search terms or filters
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
              setSelectedDifficulty(null);
            }}
          >
            Reset Filters
          </Button>
        </motion.div>
      )}
      
      <div className="mt-8 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setScreen('welcome')}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="shadow-sm"
        >
          Back
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => setScreen('pdf-upload')}
          className="shadow-sm bg-gradient-to-r from-accent-500 to-accent-600 text-white"
        >
          Upload PDF Instead
        </Button>
      </div>
    </div>
  );
};

export default TopicSelector;