import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, AlertCircle, ArrowLeft, File, Loader2 } from 'lucide-react';
import Button from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { parsePdfFile } from '../services/pdfService';
import { useQuizStore } from '../store/quizStore';
import { isValidPdfFile } from '../lib/utils';

const PDFUploader: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { setPdfContent, setPdfLoading, setScreen, isPdfLoading } = useQuizStore();
  
  React.useEffect(() => {
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
    
    try {
      setPdfLoading(true);
      setError(null);
      
      const content = await parsePdfFile(file);
      setPdfContent(content);
      
      setUploadProgress(100);
      
      setTimeout(() => {
        setScreen('quiz-settings');
      }, 800);
    } catch (err) {
      console.error('Error parsing PDF:', err);
      setError('Failed to parse PDF file. Please try another file.');
    } finally {
      setPdfLoading(false);
    }
  }, [setPdfContent, setPdfLoading, setScreen]);
  
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isPdfLoading
  });
  
  let dropzoneClassName = "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors";
  
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
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
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
          <CardHeader className="text-center border-b border-gray-100 dark:border-dark-300 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
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
              <FileText className="w-12 h-12 text-primary-500 dark:text-primary-400 mx-auto" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Upload PDF Document</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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
                    whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-4">
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
                            <Upload className="w-14 h-14 text-primary-500 dark:text-primary-400" />
                          </motion.div>
                          <p className="text-lg font-medium text-primary-600 dark:text-primary-300">
                            Drop the PDF here...
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="relative">
                            <File className="w-14 h-14 text-primary-500 dark:text-primary-400" />
                            <motion.div
                              className="absolute -top-2 -right-2 w-6 h-6 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center"
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
                              <Upload className="w-4 h-4 text-primary-600 dark:text-primary-300" />
                            </motion.div>
                          </div>
                          <div>
                            <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                              Drag & drop a PDF file here, or click to select
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                              Upload a PDF document to generate quiz questions based on its content. Works great with academic papers, textbooks, and articles.
                            </p>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap justify-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">PDF Documents</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-dark-400 dark:text-gray-300">Max 50MB</span>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                  
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    PDF contents are processed securely and used only to generate questions.
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="py-10"
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-12 h-12 text-primary-500" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Processing PDF document...</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analyzing content and generating questions
                      </p>
                    </div>
                    
                    <div className="w-full max-w-md mt-2">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="mt-6 p-3.5 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-md flex items-start gap-2.5 text-error-700 dark:text-error-300"
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{error}</p>
                    <p className="text-sm mt-1 text-error-600 dark:text-error-400">
                      Make sure your file is in PDF format and is less than 50MB.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setScreen('welcome')}
                disabled={isPdfLoading}
                className="shadow-sm"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setScreen('topic-selection')}
                disabled={isPdfLoading}
                className="shadow-sm bg-gradient-to-r from-accent-500 to-accent-600 text-white"
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