// src/components/AnimatedDropzone.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  CloudUpload, 
  FileText, 
  Loader2, 
  MessageSquare, 
  Send, 
  Upload, 
  X,
  Languages,
  ClipboardCheck
} from "lucide-react";

const AnimatedDropzone = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // Mock analysis data
  const analysisData = [
    "Document contains 5 sections with clear headings",
    "3 responsive layouts detected in CSS files",
    "JavaScript bundle size is 124KB (optimization recommended)",
    "Found 8 accessibility issues (contrast ratios)",
    "No deprecated HTML tags detected",
    "Lighthouse score: 82/100 (Performance)",
  ];

  // Mock document content
  const documentContent = `
# Project Documentation

## Overview
This project implements a modern web application using React and Tailwind CSS. The application features a drag-and-drop interface for document uploads and includes AI-powered analysis capabilities.

## Key Features
- Responsive design with mobile-first approach
- Animated transitions using Framer Motion
- Real-time document analysis
- AI-powered chat assistant
- Multi-language translation support

## Technical Details
- Built with React 18 and TypeScript
- Styled with Tailwind CSS and ShadCN components
- State management using React hooks
- File processing via custom API endpoints

## Performance Metrics
- Initial load time: 1.2s
- Bundle size: 124KB (JS), 45KB (CSS)
- Accessibility score: 92/100
- SEO optimization: fully compliant
  `;

  // Mock chat responses
  const chatResponses = [
    "The main theme color is #3B82F6 based on your CSS variables.",
    "The largest component is the hero section at 45% of the viewport height.",
    "You have 3 media queries for responsive design: mobile, tablet, and desktop.",
    "The document uses Flexbox for layout and CSS Grid for the card sections.",
    "The main JavaScript bundle is 124KB. Consider code splitting for better performance.",
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files);
    }
  };

  const simulateUpload = (files) => {
    setIsUploading(true);
    setProgress(0);
    setShowAnalysis(false);
    setIsUploadComplete(false);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setIsUploadComplete(true);
            setTimeout(() => {
              setShowAnalysis(true);
            }, 1000);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setShowAnalysis(false);
    setIsUploadComplete(false);
    setMessages([]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate AI response after delay
    setTimeout(() => {
      const randomResponse =
        chatResponses[Math.floor(Math.random() * chatResponses.length)];
      const aiMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Background pulse effect
  useEffect(() => {
    if (!isDragActive) return;

    const interval = setInterval(() => {
      if (dropAreaRef.current) {
        dropAreaRef.current.classList.add("ring-pulse");
        setTimeout(() => {
          if (dropAreaRef.current) {
            dropAreaRef.current.classList.remove("ring-pulse");
          }
        }, 1000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isDragActive]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative">
      <div className="max-w-6xl w-full transition-all duration-500">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              backgroundSize: "200% auto",
            }}
          >
            AI Document Analyzer
          </motion.h1>
          <p className="text-gray-600">Upload, Analyze & Chat with your Documents</p>
        </motion.div>

        <AnimatePresence>
          {isUploadComplete && !showAnalysis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center justify-center"
            >
              <Check className="w-5 h-5 mr-2" />
              Upload completed! Analyzing document...
            </motion.div>
          )}
        </AnimatePresence>

        {!showAnalysis ? (
          <div className="max-w-2xl mx-auto">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleChange}
              multiple
            />

            <div
              ref={dropAreaRef}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
              className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                transition-all duration-300 ease-in-out overflow-hidden
                ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50 ring-4 ring-blue-200"
                    : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
                }
              `}
            >
              {/* Background animation */}
              {isDragActive && (
                <>
                  <motion.div
                    className="absolute inset-0 bg-blue-100 opacity-30"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-blue-200 rounded-full blur-3xl opacity-40"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 0.2, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                </>
              )}

              {/* Uploading state */}
              {isUploading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-100"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                    <div className="absolute inset-4 flex items-center justify-center">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Uploading files...
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Please wait while we process your files
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div
                      className="bg-blue-600 h-2.5 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 mt-2">
                    {progress}%
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-100"
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.6, 0.8, 0.6],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                    <motion.div
                      className="absolute inset-4 flex items-center justify-center"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <CloudUpload className="w-12 h-12 text-blue-600" />
                    </motion.div>
                  </div>

                  <motion.h3
                    className="text-xl font-medium text-gray-900 mb-2"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    {isDragActive
                      ? "Drop your files here"
                      : "Drag & drop your files"}
                  </motion.h3>

                  <p className="text-gray-600 mb-4">
                    {isDragActive
                      ? "Release to upload your project"
                      : "Or browse to upload your project files"}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
                  >
                    <CloudUpload className="w-5 h-5" />
                    <span>Browse Files</span>
                  </motion.button>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center text-gray-600"
            >
              <p className="mb-1">
                Drop a folder with your project's HTML, CSS, and JS files
              </p>
              <p className="text-sm">Supports all modern web project formats</p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <h2 className="text-xl font-bold">Document Analysis</h2>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium"
              >
                <Upload className="w-5 h-5" />
                <span>New Upload</span>
              </motion.button>
            </div>
            
            <div className="flex flex-col md:flex-row">
              {/* Left section - Document analysis */}
              <div className="w-full md:w-7/12 p-6">
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    className={`px-4 py-2 font-medium flex items-center gap-2 ${
                      activeTab === "summary"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("summary")}
                  >
                    <ClipboardCheck className="w-5 h-5" />
                    Summary
                  </button>
                  <button
                    className={`px-4 py-2 font-medium flex items-center gap-2 ${
                      activeTab === "translation"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("translation")}
                  >
                    <Languages className="w-5 h-5" />
                    Translation
                  </button>
                </div>
                
                <div className="overflow-auto max-h-[500px]">
                  {activeTab === "summary" ? (
                    <div className="space-y-6">
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <ClipboardCheck className="text-blue-600" />
                          Document Summary
                        </h3>
                        <div className="space-y-4">
                          {analysisData.slice(0, 3).map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start"
                            >
                              <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                              <p className="text-gray-700">{item}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-indigo-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Recommendations
                        </h3>
                        <div className="space-y-4">
                          {analysisData.slice(3).map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + 0.3 }}
                              className="flex items-start"
                            >
                              <div className="mt-1 w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                              <p className="text-gray-700">{item}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Languages className="text-blue-600" />
                        Translated to English
                      </h3>
                      <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
                        <pre className="whitespace-pre-wrap font-sans">
                          {documentContent}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right section - Chat */}
              <div className="w-full md:w-5/12 border-l border-gray-200">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Document Assistant</h3>
                </div>
                
                <div className="h-[500px] overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <div className="mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="text-blue-600 w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">
                        Ask about your document
                      </h4>
                      <p className="text-gray-600 max-w-xs">
                        I can help you understand and improve your project. Try asking:
                      </p>
                      <div className="mt-4 text-left w-full max-w-xs">
                        <p className="text-sm text-gray-500 mb-1">
                          Example questions:
                        </p>
                        <ul className="text-sm space-y-2">
                          <li className="text-blue-600">
                            • What's the main color scheme?
                          </li>
                          <li className="text-blue-600">
                            • How can I improve performance?
                          </li>
                          <li className="text-blue-600">
                            • Show me the layout structure
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            message.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                              message.sender === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-200 text-gray-800 rounded-bl-none"
                            }`}
                          >
                            <p>{message.text}</p>
                            <div
                              className={`text-xs mt-1 ${
                                message.sender === "user"
                                  ? "text-blue-200"
                                  : "text-gray-500"
                              }`}
                            >
                              {message.timestamp}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask a question about your document..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className={`p-3 rounded-lg ${
                        inputValue.trim()
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-10 left-10 w-8 h-8 rounded-full bg-blue-200 opacity-30"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-16 w-12 h-12 rounded-full bg-purple-200 opacity-40"
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute top-1/3 right-20 w-6 h-6 rounded-full bg-indigo-200 opacity-30"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
};

export default AnimatedDropzone;