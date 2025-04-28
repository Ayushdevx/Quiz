import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function isValidPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || getFileExtension(file.name).toLowerCase() === 'pdf';
}

/**
 * Detects the current device type based on screen width
 * @returns 'mobile', 'tablet', or 'desktop'
 */
export function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 640) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Checks if the device is likely a touch device
 * @returns boolean indicating if it's a touch device
 */
export function isTouchDevice(): boolean {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0));
}

/**
 * Returns the appropriate animation level based on device capabilities
 * Helps with performance on lower-end mobile devices
 */
export function getOptimalAnimationLevel(): 'minimal' | 'moderate' | 'high' {
  const isMobile = detectDeviceType() === 'mobile';
  const isLowEnd = !window.matchMedia('(min-device-memory: 4gb)').matches;
  
  if (isMobile && isLowEnd) {
    return 'minimal';
  } else if (isMobile || isLowEnd) {
    return 'moderate';
  } else {
    return 'high';
  }
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Optimizes image size for current device to improve performance and bandwidth usage
 */
export function getOptimizedImageSize(
  originalWidth: number, 
  originalHeight: number
): { width: number, height: number } {
  const deviceType = detectDeviceType();
  let scale = 1;
  
  switch (deviceType) {
    case 'mobile':
      scale = 0.5; // 50% of original size for mobile
      break;
    case 'tablet':
      scale = 0.7; // 70% for tablets
      break;
    default:
      scale = 1; // Full size for desktop
  }
  
  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale)
  };
}