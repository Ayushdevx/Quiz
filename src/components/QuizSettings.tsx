import React from 'react';
import { Sliders, BookOpen, Timer, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { useQuizStore } from '../store/quizStore';
import { QuizSettings as QuizSettingsType, QuestionType, DifficultyLevel } from '../types';
import { generateQuestionsFromPdf, generateQuestionsFromTopic } from '../services/geminiService';

const QuizSettings: React.FC = () => {
  const { 
    settings, 
    setSettings, 
    pdfContent, 
    selectedTopic,
    availableTopics,
    setQuestions,
    startQuiz,
    setScreen
  } = useQuizStore();
  
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleStartQuiz = async () => {
    setIsLoading(true);
    
    try {
      let questions;
      
      if (pdfContent) {
        // Generate questions from PDF content
        questions = await generateQuestionsFromPdf(pdfContent, settings);
      } else if (selectedTopic) {
        // Get topic name from the selected topic ID
        const topicName = availableTopics.find(t => t.id === selectedTopic)?.name || selectedTopic;
        
        // Generate questions from the selected topic
        questions = await generateQuestionsFromTopic(topicName, settings);
      } else {
        // Fallback to a default topic if neither PDF nor topic is selected
        questions = await generateQuestionsFromTopic('General Knowledge', settings);
      }
      
      // Set the generated questions
      setQuestions(questions);
      
      // Start the quiz
      startQuiz();
    } catch (error) {
      console.error('Error generating questions:', error);
      // Handle error (could add error state and display)
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine the title based on the source
  const getTitle = () => {
    if (pdfContent) {
      return `Quiz from "${pdfContent.filename}"`;
    } else if (selectedTopic) {
      const topic = availableTopics.find(t => t.id === selectedTopic);
      return `Quiz on ${topic?.name || selectedTopic}`;
    }
    return 'New Quiz';
  };
  
  // Update the title when the source changes
  React.useEffect(() => {
    setSettings({ title: getTitle() });
  }, [pdfContent, selectedTopic]);
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                className="input"
                value={settings.title}
                onChange={(e) => setSettings({ title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={settings.numQuestions}
                  onChange={(e) => setSettings({ numQuestions: parseInt(e.target.value, 10) })}
                  className="flex-1"
                />
                <span className="w-10 text-center">{settings.numQuestions}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`py-2 px-4 rounded-md border ${
                      settings.difficulty === level
                        ? 'bg-primary-100 border-primary-500 text-primary-800'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSettings({ difficulty: level })}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Types
              </label>
              <div className="space-y-2">
                {(['multiple-choice', 'true-false', 'short-answer'] as QuestionType[]).map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.questionTypes.includes(type)}
                      onChange={(e) => {
                        const types = e.target.checked
                          ? [...settings.questionTypes, type]
                          : settings.questionTypes.filter(t => t !== type);
                        
                        // Ensure at least one type is selected
                        if (types.length > 0) {
                          setSettings({ questionTypes: types });
                        }
                      }}
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                    <span className="ml-2 text-sm">
                      {type === 'multiple-choice' ? 'Multiple Choice' : 
                       type === 'true-false' ? 'True/False' : 'Short Answer'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settings.timeLimit || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    setSettings({ timeLimit: value });
                  }}
                  placeholder="No time limit"
                  className="input w-24"
                />
                <span className="text-sm text-gray-600">seconds per question</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setScreen(pdfContent ? 'pdf-upload' : 'topic-selection')}
              icon={<BookOpen className="w-4 h-4" />}
            >
              Back
            </Button>
            
            <Button
              variant="primary"
              onClick={handleStartQuiz}
              isLoading={isLoading}
              icon={isLoading ? undefined : <BarChart className="w-4 h-4" />}
            >
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizSettings;