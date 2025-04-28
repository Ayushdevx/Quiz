import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Question, 
  QuizSettings, 
  QuizResult, 
  Answer, 
  PDFContent, 
  PerformanceStats,
  Topic,
  Theme,
  UserPreferences,
  AnimationLevel,
  LeaderboardEntry,
  FlashCard,
  StudyNote
} from '../types';
import { generateRandomId, calculatePercentage, getOptimalAnimationLevel } from '../lib/utils';

interface QuizState {
  // Theme and preferences
  theme: Theme;
  animationLevel: AnimationLevel;
  enableSound: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  toggleSound: () => void;
  
  // Quiz setup
  settings: QuizSettings;
  questions: Question[];
  currentQuestionIndex: number;
  quizStarted: boolean;
  quizCompleted: boolean;
  timeRemaining: number | null;
  studyMode: boolean;
  toggleStudyMode: () => void;
  
  // PDF handling
  pdfContent: PDFContent | null;
  isPdfLoading: boolean;
  
  // Quiz results
  currentResult: QuizResult | null;
  quizHistory: QuizResult[];
  flashCards: FlashCard[];
  studyNotes: StudyNote[];
  
  // Topics
  availableTopics: Topic[];
  selectedTopic: string | null;
  additionalDetails: string;
  
  // User & Social
  username: string;
  avatar: string | null;
  streak: number;
  achievements: { id: string; name: string; icon: string; unlocked: boolean }[];
  leaderboard: LeaderboardEntry[];
  
  // Progressive loading state for mobile
  loadingQuestions: boolean;
  setLoadingQuestions: (loading: boolean) => void;
  
  // UI state
  isLoading: boolean;
  screen: 'welcome' | 'topic-selection' | 'pdf-upload' | 'quiz-settings' | 'quiz' | 'results' | 'analytics' | 'profile' | 'leaderboard' | 'study' | 'settings' | 'achievements';
  
  // Actions
  setSettings: (settings: Partial<QuizSettings>) => void;
  setQuestions: (questions: Question[]) => void;
  addQuestion: (question: Question) => void;
  startQuiz: () => void;
  answerQuestion: (answer: string | string[], timeSpent?: number) => void;
  nextQuestion: () => void;
  completeQuiz: () => void;
  setPdfContent: (content: PDFContent | null) => void;
  setPdfLoading: (loading: boolean) => void;
  setScreen: (screen: QuizState['screen']) => void;
  resetQuiz: () => void;
  setSelectedTopic: (topic: string | null) => void;
  setAdditionalDetails: (details: string) => void;
  setUsername: (name: string) => void;
  setAvatar: (url: string | null) => void;
  addFlashCard: (flashCard: Omit<FlashCard, 'id'>) => void;
  addStudyNote: (note: Omit<StudyNote, 'createdAt' | 'updatedAt'>) => void;
  shareResult: (quizId: string) => string;
  
  // Analytics
  getPerformanceStats: () => PerformanceStats;
}

const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  title: 'New Quiz',
  numQuestions: 5,
  difficulty: 'medium',
  questionTypes: ['multiple-choice', 'true-false'],
  enableSound: true,
  studyMode: false,
  showHints: false
};

const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'science',
    name: 'Science',
    description: 'Questions about physics, chemistry, biology, and more',
    image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'medium',
    popularityScore: 85
  },
  {
    id: 'history',
    name: 'History',
    description: 'Test your knowledge of historical events and figures',
    image: 'https://images.pexels.com/photos/2402926/pexels-photo-2402926.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'medium',
    popularityScore: 75
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Questions about computers, software, and tech innovations',
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'hard',
    popularityScore: 90
  },
  {
    id: 'literature',
    name: 'Literature',
    description: 'Questions about books, authors, and literary works',
    image: 'https://images.pexels.com/photos/904620/pexels-photo-904620.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'medium',
    popularityScore: 65
  },
  {
    id: 'geography',
    name: 'Geography',
    description: 'Test your knowledge of countries, capitals, and landmarks',
    image: 'https://images.pexels.com/photos/269724/pexels-photo-269724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'easy',
    popularityScore: 70
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Challenge yourself with math problems and concepts',
    image: 'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'hard',
    popularityScore: 60
  },
  {
    id: 'arts',
    name: 'Arts & Culture',
    description: 'Explore paintings, music, theater, and cultural heritage',
    image: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'medium',
    popularityScore: 55
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Test your knowledge about athletes, teams, and sporting events',
    image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    difficulty: 'easy',
    popularityScore: 80
  }
];

const DEFAULT_ACHIEVEMENTS = [
  { id: 'first_quiz', name: 'First Steps', icon: 'award', unlocked: false },
  { id: 'perfect_score', name: 'Perfect Score', icon: 'trophy', unlocked: false },
  { id: 'streak_3', name: '3-Day Streak', icon: 'zap', unlocked: false },
  { id: 'streak_7', name: 'Weekly Warrior', icon: 'flame', unlocked: false },
  { id: 'quiz_10', name: 'Quiz Enthusiast', icon: 'medal', unlocked: false },
  { id: 'all_topics', name: 'Knowledge Master', icon: 'brain', unlocked: false }
];

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      // Theme and preferences
      theme: 'light' as Theme,
      animationLevel: getOptimalAnimationLevel(),
      enableSound: true,
      
      setTheme: (theme: Theme) => set({ theme }),
      
      toggleTheme: () => set(state => {
        // Cycle through themes
        const themes: Theme[] = ['light', 'dark', 'purple', 'ocean', 'sunset', 'green'];
        const currentIndex = themes.indexOf(state.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        return { theme: themes[nextIndex] };
      }),
      
      setAnimationLevel: (level: AnimationLevel) => set({ animationLevel: level }),
      
      toggleSound: () => set(state => ({ enableSound: !state.enableSound })),
      
      // Initial state
      settings: DEFAULT_QUIZ_SETTINGS,
      questions: [],
      currentQuestionIndex: 0,
      quizStarted: false,
      quizCompleted: false,
      timeRemaining: null,
      studyMode: false,
      toggleStudyMode: () => set(state => ({ 
        studyMode: !state.studyMode,
        settings: { ...state.settings, studyMode: !state.settings.studyMode }
      })),
      
      // Progressive loading state for streaming questions
      loadingQuestions: false,
      setLoadingQuestions: (loading) => set({ loadingQuestions: loading }),
      
      pdfContent: null,
      isPdfLoading: false,
      
      currentResult: null,
      quizHistory: [],
      flashCards: [],
      studyNotes: [],
      
      availableTopics: DEFAULT_TOPICS,
      selectedTopic: null,
      additionalDetails: '',
      
      // User & Social
      username: 'Guest User',
      avatar: null,
      streak: 0,
      achievements: DEFAULT_ACHIEVEMENTS,
      leaderboard: [],
      
      isLoading: false,
      screen: 'welcome',
      
      // Actions
      setSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      setQuestions: (questions) => set({ questions }),
      
      // Add a single question - used for streaming API responses
      addQuestion: (question) => set((state) => ({
        questions: [...state.questions, question]
      })),
      
      startQuiz: () => {
        const { settings } = get();
        
        set({
          quizStarted: true,
          currentQuestionIndex: 0,
          quizCompleted: false,
          timeRemaining: settings.timeLimit || null,
          currentResult: {
            quizId: generateRandomId(),
            title: settings.title,
            totalQuestions: get().questions.length,
            correctAnswers: 0,
            incorrectAnswers: 0,
            skippedQuestions: 0,
            totalTime: 0,
            answers: [],
            startTime: new Date(),
            endTime: new Date(),
            topicId: get().selectedTopic || undefined
          },
          screen: 'quiz'
        });
      },
      
      answerQuestion: (answer, timeSpent = 0) => {
        const { currentQuestionIndex, questions, currentResult, settings } = get();
        
        if (!currentResult || currentQuestionIndex >= questions.length) {
          return;
        }
        
        const question = questions[currentQuestionIndex];
        const isCorrect = Array.isArray(question.correctAnswer)
          ? Array.isArray(answer) && 
            question.correctAnswer.length === answer.length && 
            question.correctAnswer.every(a => answer.includes(a))
          : answer === question.correctAnswer;
        
        const answerObj: Answer = {
          questionId: question.id,
          userAnswer: answer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          timeSpent,
          attemptCount: 1
        };
        
        set({
          currentResult: {
            ...currentResult,
            answers: [...currentResult.answers, answerObj],
            correctAnswers: currentResult.correctAnswers + (isCorrect ? 1 : 0),
            incorrectAnswers: currentResult.incorrectAnswers + (isCorrect ? 0 : 1)
          }
        });
        
        // Check achievements
        const { achievements } = get();
        if (isCorrect) {
          // Achievement logic can be added here
        }
      },
      
      nextQuestion: () => {
        const { currentQuestionIndex, questions, loadingQuestions } = get();
        const nextIndex = currentQuestionIndex + 1;
        
        // If we're streaming questions and we've reached the end of currently loaded questions
        if (loadingQuestions && nextIndex >= questions.length) {
          // Stay on the current index until more questions load
          return;
        }
        
        if (nextIndex >= questions.length) {
          get().completeQuiz();
        } else {
          set({ currentQuestionIndex: nextIndex });
        }
      },
      
      completeQuiz: () => {
        const { currentResult, quizHistory, achievements, loadingQuestions } = get();
        
        // If we're still loading questions, stop loading
        if (loadingQuestions) {
          set({ loadingQuestions: false });
        }
        
        if (!currentResult) {
          return;
        }
        
        const updatedResult = {
          ...currentResult,
          endTime: new Date(),
          totalTime: (new Date().getTime() - currentResult.startTime.getTime()) / 1000
        };
        
        // Calculate if it's a perfect score
        const isPerfectScore = updatedResult.correctAnswers === updatedResult.totalQuestions;
        
        // Check for achievements
        let updatedAchievements = [...achievements];
        
        // First quiz achievement
        if (quizHistory.length === 0) {
          updatedAchievements = updatedAchievements.map(a => 
            a.id === 'first_quiz' ? { ...a, unlocked: true } : a
          );
        }
        
        // Perfect score achievement
        if (isPerfectScore) {
          updatedAchievements = updatedAchievements.map(a => 
            a.id === 'perfect_score' ? { ...a, unlocked: true } : a
          );
        }
        
        // Quiz count achievement
        if (quizHistory.length === 9) {  // This will be the 10th quiz
          updatedAchievements = updatedAchievements.map(a => 
            a.id === 'quiz_10' ? { ...a, unlocked: true } : a
          );
        }
        
        // Update streak logic
        const today = new Date().toDateString();
        const lastQuizDate = quizHistory.length > 0 
          ? new Date(quizHistory[quizHistory.length - 1].endTime).toDateString() 
          : '';
        
        let streak = get().streak;
        if (lastQuizDate !== today) {
          if (new Date(lastQuizDate).getTime() + 86400000 >= new Date(today).getTime()) {
            // Increment streak if the last quiz was yesterday
            streak += 1;
          } else {
            // Reset streak if there was a gap
            streak = 1;
          }
        }
        
        // Check streak achievements
        if (streak === 3) {
          updatedAchievements = updatedAchievements.map(a => 
            a.id === 'streak_3' ? { ...a, unlocked: true } : a
          );
        }
        
        if (streak === 7) {
          updatedAchievements = updatedAchievements.map(a => 
            a.id === 'streak_7' ? { ...a, unlocked: true } : a
          );
        }
        
        // Update leaderboard for the topic if it exists
        let updatedLeaderboard = [...get().leaderboard];
        if (updatedResult.topicId) {
          const score = calculatePercentage(updatedResult.correctAnswers, updatedResult.totalQuestions);
          
          updatedLeaderboard.push({
            userId: 'current-user',
            username: get().username,
            avatar: get().avatar || undefined,
            score,
            timeSpent: updatedResult.totalTime,
            date: new Date(),
            topicId: updatedResult.topicId
          });
          
          // Sort leaderboard by score (descending) and time (ascending)
          updatedLeaderboard = updatedLeaderboard
            .sort((a, b) => b.score === a.score ? a.timeSpent - b.timeSpent : b.score - a.score)
            .slice(0, 100); // Keep only top 100
        }
        
        set({
          quizCompleted: true,
          currentResult: updatedResult,
          quizHistory: [...quizHistory, updatedResult],
          achievements: updatedAchievements,
          streak,
          leaderboard: updatedLeaderboard,
          screen: 'results'
        });
      },
      
      setPdfContent: (content) => set({ pdfContent: content }),
      
      setPdfLoading: (loading) => set({ isPdfLoading: loading }),
      
      setScreen: (screen) => set({ screen }),
      
      resetQuiz: () => set({
        quizStarted: false,
        quizCompleted: false,
        currentQuestionIndex: 0,
        questions: [],
        currentResult: null,
        timeRemaining: null,
        pdfContent: null,
        additionalDetails: ''
      }),
      
      setSelectedTopic: (topic) => set({ selectedTopic: topic }),
      
      setAdditionalDetails: (details) => set({ additionalDetails: details }),
      
      setUsername: (name) => set({ username: name }),
      
      setAvatar: (url) => set({ avatar: url }),
      
      addFlashCard: (flashCard) => set(state => ({ 
        flashCards: [...state.flashCards, { id: generateRandomId(), ...flashCard }] 
      })),
      
      addStudyNote: (note) => set(state => ({
        studyNotes: [...state.studyNotes, { 
          ...note, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        }]
      })),
      
      shareResult: (quizId) => {
        const result = get().quizHistory.find(r => r.quizId === quizId);
        if (!result) return '';
        
        // In a real app, this would generate a shareable link
        const shareId = generateRandomId();
        return `https://quizgenius.com/share/${shareId}`;
      },
      
      getPerformanceStats: () => {
        const { quizHistory, flashCards, studyNotes } = get();
        
        if (quizHistory.length === 0) {
          return {
            totalQuizzes: 0,
            averageScore: 0,
            quizzesByTopic: {},
            scoresByDifficulty: { easy: 0, medium: 0, hard: 0 },
            timePerQuestion: 0,
            correctByQuestionType: { 'multiple-choice': 0, 'true-false': 0, 'short-answer': 0 },
            recentScores: [],
            streak: get().streak,
            totalStudyTime: 0
          };
        }
        
        const totalCorrect = quizHistory.reduce((sum, quiz) => sum + quiz.correctAnswers, 0);
        const totalQuestions = quizHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
        const averageScore = calculatePercentage(totalCorrect, totalQuestions);
        const totalTime = quizHistory.reduce((sum, quiz) => sum + quiz.totalTime, 0);
        
        // Get the best score
        const bestScore = Math.max(...quizHistory.map(quiz => 
          calculatePercentage(quiz.correctAnswers, quiz.totalQuestions)
        ));
        
        // Group quizzes by topic
        const quizzesByTopic: Record<string, number> = {};
        quizHistory.forEach(quiz => {
          if (quiz.topicId) {
            quizzesByTopic[quiz.topicId] = (quizzesByTopic[quiz.topicId] || 0) + 1;
          }
        });
        
        // Recent scores
        const recentScores = quizHistory
          .slice(-5)
          .map(quiz => calculatePercentage(quiz.correctAnswers, quiz.totalQuestions));
        
        // Estimated study time (simple approximation)
        const totalStudyTime = Math.round((totalTime / 60) + (flashCards.length * 2) + (studyNotes.length * 3));
        
        return {
          totalQuizzes: quizHistory.length,
          averageScore,
          quizzesByTopic,
          scoresByDifficulty: { easy: 0, medium: 0, hard: 0 }, // These would be calculated from quiz data
          timePerQuestion: totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0,
          correctByQuestionType: { 'multiple-choice': 0, 'true-false': 0, 'short-answer': 0 }, // Would be calculated
          recentScores,
          streak: get().streak,
          bestScore,
          totalStudyTime
        };
      }
    }),
    {
      name: 'quiz-store',
      partialize: (state) => ({
        theme: state.theme,
        animationLevel: state.animationLevel,
        enableSound: state.enableSound,
        quizHistory: state.quizHistory,
        flashCards: state.flashCards,
        studyNotes: state.studyNotes,
        username: state.username,
        avatar: state.avatar,
        streak: state.streak,
        achievements: state.achievements
      })
    }
  )
);