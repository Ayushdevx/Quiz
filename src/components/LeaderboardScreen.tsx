import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Filter, Search, ChevronDown, ChevronUp, Medal, Star } from 'lucide-react';
import { useQuizStore } from '../store/quizStore';
import Button from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const LeaderboardScreen: React.FC = () => {
  const { leaderboard, setScreen } = useQuizStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'score' | 'date' | 'difficulty'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Get unique categories from leaderboard
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    leaderboard.forEach(entry => {
      if (entry.category) {
        uniqueCategories.add(entry.category);
      }
    });
    return ['all', ...Array.from(uniqueCategories)];
  }, [leaderboard]);

  // Filter and sort leaderboard entries
  const filteredLeaderboard = useMemo(() => {
    return leaderboard
      .filter(entry => {
        // Filter by search term
        const matchesSearch = 
          entry.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
          entry.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by difficulty
        const matchesDifficulty = filterDifficulty === 'all' || entry.difficulty === filterDifficulty;
        
        // Filter by category
        const matchesCategory = filterCategory === 'all' || entry.category === filterCategory;
        
        return matchesSearch && matchesDifficulty && matchesCategory;
      })
      .sort((a, b) => {
        if (sortField === 'score') {
          return sortDirection === 'desc' ? b.score - a.score : a.score - b.score;
        } else if (sortField === 'date') {
          return sortDirection === 'desc' 
            ? new Date(b.date).getTime() - new Date(a.date).getTime() 
            : new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'difficulty') {
          const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
          return sortDirection === 'desc' 
            ? difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
            : difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }
        return 0;
      });
  }, [leaderboard, searchTerm, sortField, sortDirection, filterDifficulty, filterCategory]);

  // Handle sort toggle
  const toggleSort = (field: 'score' | 'date' | 'difficulty') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get medal emoji based on position
  const getMedal = (index: number) => {
    if (index === 0) return <Medal className="text-yellow-500 h-5 w-5" />;
    if (index === 1) return <Medal className="text-gray-400 h-5 w-5" />;
    if (index === 2) return <Medal className="text-amber-700 h-5 w-5" />;
    return <span className="text-gray-500 font-mono">{index + 1}</span>;
  };

  // Generate CSS class for difficulty badge
  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setScreen('welcome')}
                icon={<ArrowLeft className="w-4 h-4" />}
                size="sm"
              >
                Back to Home
              </Button>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Leaderboard
              </CardTitle>
              <div className="w-24"></div> {/* For balance in the header */}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Filters and Search */}
            <div className="mb-6 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[240px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search users or categories..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    className="appearance-none pl-3 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent"
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value as any)}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select
                    className="appearance-none pl-3 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Filter className="h-3 w-3 mr-1" />
                  <span>{filteredLeaderboard.length} results</span>
                </div>
              </div>
            </div>
            
            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                    <th className="pr-4 py-2 font-medium">Rank</th>
                    <th className="px-4 py-2 font-medium">User</th>
                    <th className="px-4 py-2 font-medium">Category</th>
                    <th 
                      className="px-4 py-2 font-medium cursor-pointer select-none"
                      onClick={() => toggleSort('difficulty')}
                    >
                      <div className="flex items-center">
                        <span>Difficulty</span>
                        {sortField === 'difficulty' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="ml-1 h-3 w-3" /> : 
                            <ChevronDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-2 font-medium cursor-pointer select-none"
                      onClick={() => toggleSort('score')}
                    >
                      <div className="flex items-center">
                        <span>Score</span>
                        {sortField === 'score' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="ml-1 h-3 w-3" /> : 
                            <ChevronDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-2 font-medium cursor-pointer select-none"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center">
                        <span>Date</span>
                        {sortField === 'date' && (
                          sortDirection === 'asc' ? 
                            <ChevronUp className="ml-1 h-3 w-3" /> : 
                            <ChevronDown className="ml-1 h-3 w-3" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                
                <tbody>
                  {filteredLeaderboard.length > 0 ? (
                    filteredLeaderboard.map((entry, index) => (
                      <motion.tr
                        key={entry.id}
                        className={`bg-white dark:bg-dark-100/50 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-dark-200/50 rounded-lg overflow-hidden ${
                          index < 3 ? 'shadow-md' : ''
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <td className="pr-4 py-3 pl-4 rounded-l-lg">
                          <div className="flex items-center justify-center">
                            {getMedal(index)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-medium mr-3">
                              {entry.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{entry.username}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{entry.questions} questions</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 rounded bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 text-sm">
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-sm ${getDifficultyClass(entry.difficulty)}`}>
                            {entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {index < 3 && <Star className="h-4 w-4 text-yellow-500 mr-1" />}
                            <span className={`font-medium ${index < 3 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                              {entry.score}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 rounded-r-lg text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(entry.date)}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No leaderboard entries found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Bottom Info */}
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Complete quizzes to appear on the leaderboard. Higher scores and more difficult quizzes earn more ranking points.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LeaderboardScreen;