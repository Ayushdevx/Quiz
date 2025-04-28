import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question, QuizSettings, QuestionType, PDFContent } from '../types';
import { generateRandomId } from '../lib/utils';

const API_KEY = 'AIzaSyAgFlI9-tx7gm9wapsC8pLAV3RJLY0TBWU';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(API_KEY);
// Using Gemini 2.0 Flash model for faster performance on mobile devices
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Create a streaming version of the model for progressive loading on mobile
const streamingModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash',
  generationConfig: {
    maxOutputTokens: 2048,
  }
});

// Optimized function for mobile - supports progressive streaming
export async function generateQuestionsStreamingFromPdf(
  pdfContent: PDFContent, 
  settings: QuizSettings,
  onProgress?: (partialQuestions: Question[]) => void
): Promise<Question[]> {
  try {
    // Optimize content length for mobile bandwidth
    const prompt = createQuestionGenerationPrompt(pdfContent.content, settings, true);
    
    // Use streaming generation for progressive loading on mobile
    const result = await streamingModel.generateContentStream(prompt);
    
    let accumulatedText = '';
    const allQuestions: Question[] = [];

    // Process the stream in chunks - better for mobile connections
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      accumulatedText += chunkText;
      
      try {
        // Try to parse partial results for progressive loading
        const partialQuestions = parseGeneratedQuestions(accumulatedText, settings);
        if (partialQuestions.length > 0 && onProgress) {
          onProgress(partialQuestions);
        }
      } catch (e) {
        // Ignore parsing errors for partial content
      }
    }
    
    // Final parsing of complete response
    return parseGeneratedQuestions(accumulatedText, settings);
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

export async function generateQuestionsFromPdf(
  pdfContent: PDFContent, 
  settings: QuizSettings
): Promise<Question[]> {
  try {
    // Create a prompt optimized for Gemini 2.0 Flash
    const prompt = createQuestionGenerationPrompt(pdfContent.content, settings);
    
    // Generate content using Gemini 2.0 Flash
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

// Optimized function for mobile - supports streaming
export async function generateQuestionsStreamingFromTopic(
  topic: string,
  settings: QuizSettings,
  additionalDetails?: string,
  onProgress?: (partialQuestions: Question[]) => void
): Promise<Question[]> {
  try {
    const prompt = createTopicQuestionPrompt(topic, settings, additionalDetails);
    
    // Use streaming for better mobile experience
    const result = await streamingModel.generateContentStream(prompt);
    
    let accumulatedText = '';
    const allQuestions: Question[] = [];

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      accumulatedText += chunkText;
      
      try {
        const partialQuestions = parseGeneratedQuestions(accumulatedText, settings);
        if (partialQuestions.length > 0 && onProgress) {
          onProgress(partialQuestions);
        }
      } catch (e) {
        // Ignore parsing errors for partial content
      }
    }
    
    return parseGeneratedQuestions(accumulatedText, settings);
  } catch (error) {
    console.error('Error generating topic questions:', error);
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
    
    // Generate content using Gemini 2.0 Flash
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

function createQuestionGenerationPrompt(
  content: string, 
  settings: QuizSettings,
  mobileOptimized: boolean = false
): string {
  // Take a subset of the content to stay within token limits
  // For mobile, we use an even smaller content size to optimize speed
  const maxContentLength = mobileOptimized ? 8000 : 15000;
  const truncatedContent = content.slice(0, maxContentLength);
  
  return `
    Generate ${settings.numQuestions} quiz questions based on the following content.
    
    Content:
    ${truncatedContent}
    
    Quiz Settings:
    - Question types: ${settings.questionTypes.join(', ')}
    - Difficulty level: ${settings.difficulty}
    - Topic focus: ${settings.topic || 'General content'}
    
    For each question, provide:
    1. The question text (keep it concise and clear)
    2. Question type (${settings.questionTypes.join('/')})
    3. Options (for multiple-choice, provide 4 distinct options)
    4. Correct answer
    5. A brief explanation (2-3 sentences maximum)
    6. Difficulty level
    
    Format the response as a JSON array of question objects. Each object should have: 
    { "text", "type", "options", "correctAnswer", "explanation", "difficulty" }
    
    Make sure all question text and options are concise and mobile-friendly (under 150 characters).
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
    1. The question text (keep it concise and clear, mobile-friendly under 150 characters)
    2. Question type (${settings.questionTypes.join('/')})
    3. Options (for multiple-choice, provide 4 distinct options, each under 100 characters)
    4. Correct answer
    5. A brief explanation (2-3 sentences maximum)
    6. Difficulty level
    
    Format the response as a JSON array of question objects. Each object should have: 
    { "text", "type", "options", "correctAnswer", "explanation", "difficulty" }
    
    Optimize all content for mobile viewing with concise text.
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

// Additional helper for mobile optimization
export function optimizeQuestionsForMobile(questions: Question[]): Question[] {
  return questions.map(q => ({
    ...q,
    // Ensure question text isn't too long for mobile screens
    text: q.text.length > 150 ? q.text.substring(0, 147) + '...' : q.text,
    // Truncate long explanations for mobile
    explanation: q.explanation.length > 200 ? q.explanation.substring(0, 197) + '...' : q.explanation,
    // Ensure options aren't too long for mobile screens
    options: Array.isArray(q.options) ? 
      q.options.map(opt => opt.length > 100 ? opt.substring(0, 97) + '...' : opt) : 
      q.options
  }));
}