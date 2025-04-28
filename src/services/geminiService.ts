import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question, QuizSettings, QuestionType, PDFContent } from '../types';
import { generateRandomId } from '../lib/utils';

const API_KEY = 'AIzaSyAgFlI9-tx7gm9wapsC8pLAV3RJLY0TBWU';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function generateQuestionsFromPdf(
  pdfContent: PDFContent, 
  settings: QuizSettings
): Promise<Question[]> {
  try {
    // Create a prompt for the Gemini API
    const prompt = createQuestionGenerationPrompt(pdfContent.content, settings);
    
    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the generated questions
    return parseGeneratedQuestions(text, settings);
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

export async function generateQuestionsFromTopic(
  topic: string,
  settings: QuizSettings,
  additionalDetails?: string
): Promise<Question[]> {
  try {
    // Create a prompt for topic-based questions
    const prompt = createTopicQuestionPrompt(topic, settings, additionalDetails);
    
    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the generated questions
    return parseGeneratedQuestions(text, settings);
  } catch (error) {
    console.error('Error generating topic questions:', error);
    throw error;
  }
}

function createQuestionGenerationPrompt(content: string, settings: QuizSettings): string {
  // Take a subset of the content to stay within token limits
  const truncatedContent = content.slice(0, 15000);
  
  return `
    Generate ${settings.numQuestions} quiz questions based on the following content.
    
    Content:
    ${truncatedContent}
    
    Quiz Settings:
    - Question types: ${settings.questionTypes.join(', ')}
    - Difficulty level: ${settings.difficulty}
    - Topic focus: ${settings.topic || 'General content'}
    
    For each question, provide:
    1. The question text
    2. Question type (${settings.questionTypes.join('/')})
    3. Options (for multiple-choice)
    4. Correct answer
    5. A brief explanation
    6. Difficulty level
    
    Format the response as a JSON array of question objects. Each object should have: 
    { "text", "type", "options", "correctAnswer", "explanation", "difficulty" }
  `;
}

function createTopicQuestionPrompt(
  topic: string, 
  settings: QuizSettings,
  additionalDetails?: string
): string {
  return `
    Generate ${settings.numQuestions} quiz questions about "${topic}".
    ${additionalDetails ? `\nAdditional context: ${additionalDetails}` : ''}
    
    Quiz Settings:
    - Question types: ${settings.questionTypes.join(', ')}
    - Difficulty level: ${settings.difficulty}
    
    For each question, provide:
    1. The question text
    2. Question type (${settings.questionTypes.join('/')})
    3. Options (for multiple-choice)
    4. Correct answer
    5. A brief explanation
    6. Difficulty level
    
    Format the response as a JSON array of question objects. Each object should have: 
    { "text", "type", "options", "correctAnswer", "explanation", "difficulty" }
  `;
}

function parseGeneratedQuestions(text: string, settings: QuizSettings): Question[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const questionsJson = JSON.parse(jsonMatch[0]);
      
      // Map and validate the parsed questions
      return questionsJson.map((q: any) => ({
        id: generateRandomId(),
        text: q.text,
        type: validateQuestionType(q.type, settings.questionTypes[0]),
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty || settings.difficulty,
        topic: settings.topic
      }));
    }
    
    throw new Error('Failed to parse questions from API response');
  } catch (error) {
    console.error('Error parsing generated questions:', error);
    throw error;
  }
}

function validateQuestionType(type: string, fallback: QuestionType): QuestionType {
  const validTypes: QuestionType[] = ['multiple-choice', 'true-false', 'short-answer'];
  
  // Normalize the type string
  const normalizedType = type.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/multiple\s*choice/i, 'multiple-choice')
    .replace(/true\s*false|true\s*or\s*false/i, 'true-false')
    .replace(/short\s*answer/i, 'short-answer');
  
  // Check if the normalized type is valid
  if (validTypes.includes(normalizedType as QuestionType)) {
    return normalizedType as QuestionType;
  }
  
  return fallback;
}