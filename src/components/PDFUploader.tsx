import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, AlertCircle, ArrowLeft, File, Loader2,
  Smartphone, Wifi, Lightning, FileBadge2
} from 'lucide-react';
import Button from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { parsePdfFile } from '../services/pdfService';
import { useQuizStore } from '../store/quizStore';
import { isValidPdfFile, formatFileSize, detectDeviceType, isTouchDevice } from '../lib/utils';
import { generateQuestionsStreamingFromPdf } from '../services/geminiService';

const PDFUploader: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileDetails, setFileDetails] = useState<{name: string, size: number, pages?: number} | null>(null);
  const [deviceType, setDeviceType] = useState<'mobile'|'tablet'|'desktop'>('desktop');
  const [isOptimized, setIsOptimized] = useState(true);
  
  const { 
    setPdfContent, 
    setPdfLoading, 
    setScreen, 
    isPdfLoading,
    settings,
    addQuestion,
    setQuestions,
    setLoadingQuestions
  } = useQuizStore();
  
  useEffect(() => {
    setDeviceType(detectDeviceType());
  }, []);
  
  useEffect(() => {
    if (isPdfLoading) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      return () => {
        clearInterval(interval);
        setUploadProgress(0);
      };
    } else {
      setUploadProgress(0);
    }
  }, [isPdfLoading]);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    if (!isValidPdfFile(file)) {
      setError('Please upload a valid PDF file');
      return;
    }
    
    // Mobile device file size check - for better performance
    if (detectDeviceType() === 'mobile' && file.size > 10 * 1024 * 1024) { // 10MB for mobile
      setError('For mobile devices, please use PDFs smaller than 10MB for better performance');
      return;
    }
    
    try {
      setPdfLoading(true);
      setError(null);
      setFileDetails({
        name: file.name,
        size: file.size
      });
      
      const content = await parsePdfFile(file);
      setPdfContent(content);
      
      // Update file details with page count if available
      if (content.pages) {
        setFileDetails(prev => prev ? {...prev, pages: content.pages} : null);
      }
      
      setUploadProgress(100);
      
      // For mobile devices, directly start generating questions with streaming
      if (detectDeviceType() !== 'desktop' && isOptimized) {
        // Navigate to quiz settings but start generating questions in the background
        setTimeout(() => {
          setScreen('quiz-settings');
          
          // Clear any existing questions
          setQuestions([]);
          
          // Set loading state for streaming questions
          setLoadingQuestions(true);
          
          // Start generating questions with streaming for progressive loading
          generateQuestionsStreamingFromPdf(content, settings, (partialQuestions) => {
            // This callback will be called whenever we have some questions ready
            partialQuestions.forEach(q => addQuestion(q));
          }).catch(err => {
            console.error("Error streaming questions:", err);
            setLoadingQuestions(false);
            // In case of error, we'll at least have some questions already loaded
          });
        }, 800);
      } else {
        // For desktop, just go to quiz settings and let user configure
        setTimeout(() => {
          setScreen('quiz-settings');
        }, 800);
      }
      
    } catch (err) {
      console.error('Error parsing PDF:', err);
      setError('Failed to parse PDF file. Please try another file.');
    } finally {
      setPdfLoading(false);
    }
  }, [setPdfContent, setPdfLoading, setScreen, settings, addQuestion, setQuestions, setLoadingQuestions, isOptimized]);
  
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isPdfLoading,
    maxSize: deviceType === 'mobile' ? 10 * 1024 * 1024 : 50 * 1024 * 1024, // 10MB for mobile, 50MB otherwise
  });
  
  let dropzoneClassName = "border-2 border-dashed rounded-lg p-4 md:p-8 text-center cursor-pointer transition-colors";
  
  if (isDragAccept) {
    dropzoneClassName += " border-success-500 bg-success-50 dark:bg-success-900/10";
  } else if (isDragReject) {
    dropzoneClassName += " border-error-500 bg-error-50 dark:bg-error-900/10";
  } else if (isDragActive) {
    dropzoneClassName += " border-primary-500 bg-primary-50 dark:bg-primary-900/10";
  } else {
    dropzoneClassName += " border-gray-300 dark:border-dark-400 hover:border-primary-400 dark:hover:border-primary-600";
  }
  
  const containerVariants = {
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
  
  return (
    <div className="max-w-2xl mx-auto p-3 md:p-4">
      <div className="mb-4 md:mb-6">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
          onClick={() => setScreen('welcome')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </motion.button>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-white/90 dark:bg-dark-200/90 backdrop-blur-sm border border-gray-200 dark:border-dark-300 overflow-hidden">
          <CardHeader className="text-center border-b border-gray-100 dark:border-dark-300 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 pb-4 md:pb-6">
            <motion.div 
              className="mb-2"
              animate={{ 
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: 0,
                repeatDelay: 3
              }}
            >
              <FileText className="w-10 h-10 md:w-12 md:h-12 text-primary-500 dark:text-primary-400 mx-auto" />
            </motion.div>
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Upload PDF Document</CardTitle>
            
            {deviceType !== 'desktop' && (
              <div className="mt-1 flex items-center justify-center gap-2 text-xs">
                <Smartphone className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Optimized for {deviceType}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              {!isPdfLoading ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    {...getRootProps()}
                    className={dropzoneClassName}
                    whileHover={!isTouchDevice() ? { scale: 1.01, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" } : {}}
                    whileTap={{ scale: 0.99 }}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                      {isDragActive ? (
                        <>
                          <motion.div
                            animate={{ 
                              y: [0, -10, 0],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ 
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "loop" 
                            }}
                          >
                            <Upload className="w-12 h-12 md:w-14 md:h-14 text-primary-500 dark:text-primary-400" />
                          </motion.div>
                          <p className="text-base md:text-lg font-medium text-primary-600 dark:text-primary-300">
                            Drop the PDF here...
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="relative">
                            <File className="w-12 h-12 md:w-14 md:h-14 text-primary-500 dark:text-primary-400" />
                            <motion.div
                              className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center"
                              animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "loop" 
                              }}
                            >
                              <Upload className="w-3 h-3 md:w-4 md:h-4 text-primary-600 dark:text-primary-300" />
                            </motion.div>
                          </div>
                          <div>
                            <p className="text-base md:text-lg font-medium mb-1.5 md:mb-2 text-gray-700 dark:text-gray-200">
                              {deviceType === 'mobile' ? 'Tap to select PDF' : 'Drag & drop a PDF file here, or click to select'}
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                              {deviceType === 'mobile' 
                                ? 'Select a PDF to generate questions using Gemini 2.0 Flash' 
                                : 'Upload a PDF document to generate quiz questions based on its content. Works great with academic papers, textbooks, and articles.'
                              }
                            </p>
                          </div>
                          
                          <div className="mt-1 md:mt-2 flex flex-wrap justify-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">PDF Documents</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-dark-400 dark:text-gray-300">
                              Max {deviceType === 'mobile' ? '10MB' : '50MB'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                  
                  {deviceType !== 'desktop' && (
                    <div className="flex items-center justify-between mt-3 px-1">
                      <label className="flex items-center gap-1.5 text-sm">
                        <input 
                          type="checkbox"
                          checked={isOptimized}
                          onChange={() => setIsOptimized(!isOptimized)}
                          className="rounded text-primary-500 focus:ring-primary-500"
                        />
                        <div className="flex items-center gap-1">
                          <Lightning className="w-3.5 h-3.5 text-primary-500" />
                          <span className="text-gray-700 dark:text-gray-300">Gemini 2.0 Flash</span>
                        </div>
                      </label>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1">
                        <Wifi className="w-3 h-3" />
                        <span>Streaming enabled</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-3 md:mt-4">
                    PDF contents are processed securely with Gemini 2.0 Flash for faster quiz generation
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="py-6 md:py-10"
                >
                  <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-primary-500" />
                    </motion.div>
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-gray-800 dark:text-gray-200">Processing PDF document...</h3>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analyzing content with Gemini 2.0 Flash
                      </p>
                    </div>
                    
                    <div className="w-full max-w-md mt-1 md:mt-2">
                      <div className="h-2 w-full bg-gray-200 dark:bg-dark-400 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                          initial={{ width: "0%" }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-500 dark:text-gray-400">Analyzing</span>
                        <span className="text-primary-600 dark:text-primary-400">{Math.round(uploadProgress)}%</span>
                      </div>
                    </div>
                    
                    {/* File details */}
                    {fileDetails && (
                      <div className="mt-3 w-full max-w-xs bg-gray-50 dark:bg-dark-300/50 rounded-md p-2.5 flex items-center gap-2.5">
                        <FileBadge2 className="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {fileDetails.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatFileSize(fileDetails.size)}</span>
                            {fileDetails.pages && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                <span>{fileDetails.pages} pages</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="mt-4 md:mt-6 p-3 md:p-3.5 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-md flex items-start gap-2 md:gap-2.5 text-error-700 dark:text-error-300"
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                >
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm md:text-base font-medium">{error}</p>
                    <p className="text-xs md:text-sm mt-1 text-error-600 dark:text-error-400">
                      {deviceType === 'mobile' 
                        ? 'Try using a smaller PDF for better performance on mobile devices'
                        : 'Make sure your file is in PDF format and is less than 50MB'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-4 md:mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setScreen('welcome')}
                disabled={isPdfLoading}
                className="shadow-sm text-sm md:text-base"
                icon={<ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              >
                Back
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setScreen('topic-selection')}
                disabled={isPdfLoading}
                className="shadow-sm bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm md:text-base"
              >
                Choose a Topic Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PDFUploader;