import * as pdfjs from 'pdfjs-dist';
import { PDFContent } from '../types';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function parsePdfFile(file: File): Promise<PDFContent> {
  try {
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Get the total number of pages
    const pageCount = pdf.numPages;
    
    // Extract text content from each page
    let fullText = '';
    
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    return {
      filename: file.name,
      content: fullText,
      pageCount
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

export function extractTopicsFromPdf(pdfContent: PDFContent): string[] {
  // This is a simplified implementation
  // In a real application, this would use NLP or more sophisticated techniques
  
  const content = pdfContent.content;
  const lines = content.split('\n');
  
  // Look for potential headings or topic markers
  const potentialTopics = lines
    .filter(line => 
      // Filter for lines that might be headings
      line.trim().length > 0 && 
      line.trim().length < 100 &&
      !line.endsWith('.') &&
      (line.trim() === line.trim().toUpperCase() || 
       /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(line.trim()))
    )
    .map(line => line.trim());
  
  // Remove duplicates
  return [...new Set(potentialTopics)].slice(0, 10);
}

export function getPdfSummary(pdfContent: PDFContent): string {
  // Extract first 300 characters as a simple summary
  return pdfContent.content.slice(0, 300).trim() + '...';
}

// Function to extract data that might be useful for generating questions
export function extractKeyPoints(pdfContent: PDFContent): string[] {
  const content = pdfContent.content;
  const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 20);
  
  // Look for sentences that might contain key information
  const keyPoints = sentences
    .filter(sentence => 
      sentence.includes(':') || 
      sentence.includes(' is ') || 
      sentence.includes(' are ') ||
      sentence.includes(' was ') ||
      sentence.includes(' were ') ||
      /\d+/.test(sentence) || // Contains numbers
      sentence.includes(' definition ') ||
      sentence.includes(' defined as ')
    )
    .map(sentence => sentence.trim());
  
  // Return unique key points, limited to 20
  return [...new Set(keyPoints)].slice(0, 20);
}