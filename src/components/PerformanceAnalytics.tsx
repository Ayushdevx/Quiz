import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Button from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useQuizStore } from '../store/quizStore';

const PerformanceAnalytics: React.FC = () => {
  const { getPerformanceStats, quizHistory, setScreen } = useQuizStore();
  const stats = getPerformanceStats();
  
  // Colors for charts
  const COLORS = [
    '#3b82f6', // primary-500
    '#8b5cf6', // accent-500
    '#0ea5e9', // tertiary-500
    '#10b981', // success-500
    '#f59e0b', // warning-500
    '#ef4444'  // error-500
  ];
  
  // Generate data for recent scores chart
  const recentScoresData = stats.recentScores.map((score, index) => ({
    quiz: `Quiz ${index + 1}`,
    score
  }));
  
  // Sample data for question type performance
  const questionTypeData = [
    { name: 'Multiple Choice', value: stats.correctByQuestionType['multiple-choice'] || 65 },
    { name: 'True/False', value: stats.correctByQuestionType['true-false'] || 80 },
    { name: 'Short Answer', value: stats.correctByQuestionType['short-answer'] || 45 }
  ];
  
  // Sample data for difficulty breakdown
  const difficultyData = [
    { name: 'Easy', value: stats.scoresByDifficulty.easy || 85 },
    { name: 'Medium', value: stats.scoresByDifficulty.medium || 70 },
    { name: 'Hard', value: stats.scoresByDifficulty.hard || 55 }
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-4">
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
                onClick={() => setScreen('results')}
                icon={<ArrowLeft className="w-4 h-4" />}
                size="sm"
              >
                Back to Results
              </Button>
              <CardTitle>Performance Analytics</CardTitle>
              <div className="w-24"></div> {/* For balance in the header */}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Quiz Scores</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={recentScoresData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="quiz" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Question Type Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={questionTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1000}
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {questionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Difficulty Level Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={difficultyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Bar
                        dataKey="value"
                        fill="#8b5cf6"
                        animationDuration={1000}
                        maxBarSize={60}
                      >
                        {difficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Quiz Summary</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Total Quizzes Taken:</span>
                      <span className="font-medium">{stats.totalQuizzes}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Average Score:</span>
                      <span className="font-medium">{stats.averageScore}%</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Average Time Per Question:</span>
                      <span className="font-medium">{stats.timePerQuestion || '15'}s</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Highest Score:</span>
                      <span className="font-medium">
                        {Math.max(...stats.recentScores, 0)}%
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PerformanceAnalytics;