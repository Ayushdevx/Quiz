export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type Theme = 'light' | 'dark' | 'purple' | 'green' | 'ocean' | 'sunset';

export type AnimationLevel = 'minimal' | 'moderate' | 'high';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: DifficultyLevel;
  topic?: string;
  image?: string; // Optional image URL for questions with visual content
}

export interface QuizSettings {
  title: string;
  description?: string;
  topic?: string;
  numQuestions: number;
  difficulty: DifficultyLevel;
  timeLimit?: number; // In seconds, optional
  questionTypes: QuestionType[];
  enableSound?: boolean; // Sound effects for right/wrong answers
  studyMode?: boolean; // Study mode shows explanations immediately
  showHints?: boolean; // Option to show hints
}

export interface QuizResult {
  quizId: string;
  title: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  totalTime: number; // In seconds
  answers: Answer[];
  startTime: Date;
  endTime: Date;
  shareId?: string; // ID for sharing results
  topicId?: string; // Topic ID for categorization
}

export interface Answer {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // In seconds
  attemptCount?: number; // For study mode retries
}

export interface PDFContent {
  filename: string;
  content: string;
  pageCount: number;
  extractedTopics?: string[];
  thumbnail?: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  image: string;
  difficulty?: DifficultyLevel;
  popularityScore?: number;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  quizHistory: QuizResult[];
  achievements?: Achievement[];
  preferences: UserPreferences;
  streak?: number; // Days in a row with quiz activity
}

export interface UserPreferences {
  theme: Theme;
  animationLevel: AnimationLevel;
  enableSound: boolean;
  defaultDifficulty: DifficultyLevel;
  defaultQuestionTypes: QuestionType[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateUnlocked: Date;
}

export interface PerformanceStats {
  totalQuizzes: number;
  averageScore: number;
  quizzesByTopic: Record<string, number>;
  scoresByDifficulty: Record<DifficultyLevel, number>;
  timePerQuestion: number;
  correctByQuestionType: Record<QuestionType, number>;
  recentScores: number[];
  streak?: number;
  bestScore?: number;
  totalStudyTime?: number; // In minutes
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  timeSpent: number;
  date: Date;
  topicId: string;
}

export interface StudyNote {
  questionId: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  topic: string;
  lastReviewed?: Date;
  nextReviewDue?: Date;
  confidenceLevel?: number; // 1-5 scale for spaced repetition
}