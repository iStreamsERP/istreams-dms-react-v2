// src/components/AnimatedDropzone.tsx
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ClipboardCheck,
  CloudUpload,
  FileText,
  Languages,
  Loader2,
  MessageSquare,
  Send,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const UploadDocument = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
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
    "The main theme color is #0ea5e9 based on your CSS variables.",
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
    setIsChatOpen(false);
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

  // Chat Modal component for mobile
  const ChatModal = () => (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col md:hidden">
      {/* Modal Header */}
      <div className="p-3 bg-gradient-to-r from-cyan-800 to-teal-800 text-white flex items-center gap-3">
        <button
          onClick={() => setIsChatOpen(false)}
          className="flex items-center text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">Document Assistant</h3>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-slate-800/50 to-slate-900/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-3 sm:p-4">
            <div className="mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-cyan-900/30 rounded-full flex items-center justify-center border border-cyan-700/50">
              <MessageSquare className="text-cyan-400 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h4 className="text-lg sm:text-xl font-medium text-cyan-200 mb-1 sm:mb-2">
              Ask about your document
            </h4>
            <p className="text-cyan-100 max-w-md text-xs sm:text-sm">
              I can help you understand, improve, and analyze your document. Try
              asking questions about its content, structure, or suggestions for
              improvements.
            </p>
            <div className="mt-4 sm:mt-6 text-left w-full max-w-md">
              <p className="text-xs sm:text-sm font-medium text-cyan-300 mb-2 sm:mb-3">
                Example questions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-slate-800 p-2 sm:p-3 rounded-lg shadow-sm border border-slate-700 text-xs sm:text-sm">
                  <p className="text-cyan-400">
                    • What's the main color scheme?
                  </p>
                </div>
                <div className="bg-slate-800 p-2 sm:p-3 rounded-lg shadow-sm border border-slate-700 text-xs sm:text-sm">
                  <p className="text-cyan-400">
                    • How can I improve performance?
                  </p>
                </div>
                <div className="bg-slate-800 p-2 sm:p-3 rounded-lg shadow-sm border border-slate-700 text-xs sm:text-sm">
                  <p className="text-cyan-400">
                    • Show me the layout structure
                  </p>
                </div>
                <div className="bg-slate-800 p-2 sm:p-3 rounded-lg shadow-sm border border-slate-700 text-xs sm:text-sm">
                  <p className="text-cyan-400">• Summarize the key features</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-md px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 rounded-bl-none shadow-sm border border-slate-700"
                  }`}
                >
                  <p>{message.text}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-cyan-200"
                        : "text-slate-400"
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

      {/* Input Area */}
      <div className="p-3 border-t border-slate-700 bg-slate-800">
        <div className="flex gap-1 sm:gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document..."
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm bg-slate-900 text-slate-200"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`p-2 sm:p-3 rounded-lg ${
              inputValue.trim()
                ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white"
                : "bg-slate-700 text-slate-500"
            }`}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 relative">
      {!showAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4 sm:mb-6 md:mb-8"
        >
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400 mb-2"
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
            DocuInsight AI
          </motion.h1>
          <p className="text-sm sm:text-base text-cyan-100">
            Upload, Analyze & Chat with your Documents
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {isUploadComplete && !showAnalysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 bg-teal-800 border border-teal-600 rounded-lg text-teal-100 flex items-center justify-center text-sm sm:text-base"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Upload completed! Analyzing document...
          </motion.div>
        )}
      </AnimatePresence>

      {!showAnalysis ? (
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            multiple
          />

          {/* Vibrant Radial Upload Area */}
          <div
            ref={dropAreaRef}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className="relative rounded-full w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out overflow-hidden"
            style={{
              background: isDragActive
                ? "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(20,184,166,0.3) 100%), radial-gradient(circle at 30% 30%, rgba(6,182,212,0.5) 0%, rgba(8,145,178,0.3) 20%, transparent 60%), #0f172a"
                : "radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(20,184,166,0.2) 100%), radial-gradient(circle at 30% 30%, rgba(6,182,212,0.4) 0%, rgba(8,145,178,0.2) 20%, transparent 60%), #0f172a",
            }}
          >
            {/* Animated gradient rings */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "radial-gradient(circle, rgba(103,232,249,0.3) 0%, transparent 70%)",
              }}
            />

            {/* Pulsing glow effect */}
            {isDragActive && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  opacity: [0, 0.4, 0],
                  scale: [1, 1.2, 1.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
                style={{
                  background:
                    "radial-gradient(circle, rgba(103,232,249,0.6) 0%, transparent 70%)",
                }}
              />
            )}

            {/* Uploading state */}
            {isUploading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center w-full h-full"
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 mb-3 sm:mb-4">
                  {/* Progress track */}
                  <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-slate-700 opacity-50"></div>

                  {/* Progress indicator */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-3 sm:border-4 border-cyan-400 border-t-transparent border-r-transparent"
                    style={{
                      rotate: `${progress * 3.6}deg`,
                      transformOrigin: "center",
                    }}
                  />

                  <div className="absolute inset-2 sm:inset-3 md:inset-4 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-cyan-400 animate-spin" />
                  </div>
                </div>

                <h3 className="text-sm sm:text-base md:text-lg font-medium text-cyan-100 mb-1 sm:mb-2">
                  Uploading files...
                </h3>
                <span className="text-xl sm:text-2xl font-bold text-cyan-300">
                  {progress}%
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center w-full h-full p-6 sm:p-8 md:p-10"
              >
                {/* Floating cloud icon */}
                <motion.div
                  className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4 sm:mb-6"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-cyan-500/10 backdrop-blur-sm"></div>
                  <div className="absolute inset-2 sm:inset-3 md:inset-4 flex items-center justify-center">
                    <CloudUpload className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-cyan-300" />
                  </div>

                  {/* Floating particles */}
                  <motion.div
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-cyan-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.2,
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 bg-teal-400 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: 0.4,
                    }}
                  />
                  <motion.div
                    className="absolute top-0 right-2 sm:right-4 w-2 h-2 sm:w-3 sm:h-3 bg-cyan-300 rounded-full"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 0.6,
                    }}
                  />
                </motion.div>

                <motion.h3
                  className="text-base sm:text-lg md:text-xl font-medium text-cyan-100 mb-1 sm:mb-2 text-center"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  {isDragActive ? "Drop to analyze" : "Drag & drop files"}
                </motion.h3>

                <p className="text-xs sm:text-sm text-cyan-200 mb-2 sm:mb-3 md:mb-4 text-center">
                  {isDragActive
                    ? "Release to upload your project"
                    : "Supports HTML, CSS, JS, and docs"}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-full font-medium text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:from-cyan-500 hover:to-teal-500"
                >
                  <CloudUpload className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span>Browse Files</span>
                </motion.button>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 sm:mt-6 md:mt-8 text-center text-cyan-200 max-w-md"
          >
            <p className="mb-1 text-xs sm:text-sm">
              AI-powered analysis for your documents and code
            </p>
            <p className="text-xs opacity-75">
              Instant insights • Code suggestions • Chat assistant
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="fixed inset-0 flex flex-col bg-slate-900">
          {/* Header */}
          <div className="p-3 bg-gradient-to-r from-cyan-800 to-teal-800 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold">
                Document Analysis
              </h2>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-cyan-600 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-cyan-500"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New Upload</span>
            </motion.button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left section - Document analysis */}
            <div className="w-full md:w-1/2 h-full border-b md:border-b-0 md:border-r border-slate-700 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-slate-700">
                <button
                  className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    activeTab === "summary"
                      ? "text-cyan-300 border-b-2 border-cyan-400 bg-slate-800"
                      : "text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveTab("summary")}
                >
                  <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Summary
                </button>
                <button
                  className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    activeTab === "translation"
                      ? "text-cyan-300 border-b-2 border-cyan-400 bg-slate-800"
                      : "text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveTab("translation")}
                >
                  <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
                  Translation
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 bg-gradient-to-br from-slate-800 to-slate-900">
                {activeTab === "summary" ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-r from-cyan-900/50 to-teal-900/50 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-700">
                      <h3 className="text-base sm:text-lg font-semibold text-cyan-200 mb-3 sm:mb-4 flex items-center gap-2">
                        <ClipboardCheck className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
                        Document Summary
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        {analysisData.slice(0, 3).map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm text-xs sm:text-sm border border-slate-700"
                          >
                            <div className="mt-1 w-2 h-2 bg-cyan-400 rounded-full mr-2 sm:mr-3"></div>
                            <p className="text-slate-200">{item}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-cyan-900/50 to-teal-900/50 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-700">
                    <h3 className="text-base sm:text-lg font-semibold text-cyan-200 mb-3 sm:mb-4 flex items-center gap-2">
                      <Languages className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
                      Translated to English
                    </h3>
                    <div className="prose max-w-none bg-slate-800 p-4 sm:p-6 rounded-lg shadow-sm overflow-auto max-h-[500px] text-xs sm:text-sm border border-slate-700">
                      <pre className="whitespace-pre-wrap font-sans text-slate-200">
                        {documentContent}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right section - Chat (hidden on mobile) */}
            <div className="hidden md:flex w-full md:w-1/2 flex-col bg-gradient-to-b from-slate-900 to-slate-800">
              <div className="p-3 bg-gradient-to-r from-cyan-800 to-teal-800 text-white flex items-center gap-2 sm:gap-3">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                <h3 className="text-base sm:text-lg font-semibold">
                  Document Assistant
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-slate-800/50 to-slate-900/50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 sm:p-4">
                    <div className="mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-cyan-900/30 rounded-full flex items-center justify-center border border-cyan-700/50">
                      <MessageSquare className="text-cyan-400 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-medium text-cyan-200 mb-1 sm:mb-2">
                      Ask about your document
                    </h4>
                    <p className="text-cyan-100 max-w-md text-xs sm:text-sm">
                      I can help you understand, improve, and analyze your
                      document. Try asking questions about its content,
                      structure, or suggestions for improvements.
                    </p>
                    <div className="mt-4 sm:mt-6 text-left w-full max-w-md">
                      <p className="text-xs sm:text-sm font-medium text-cyan-300 mb-2 sm:mb-3">
                        Example questions:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div className="bg-slate-800 p-2 sm:p-3 rounded-lg shadow-sm border border-slate-700 text-xs sm:text-sm">
                          <p className="text-cyan-400">
                            • What's the main color scheme?
                          </p>
                        </div>
                        <div className="bg-slate-800 p-2 sm:p-3 rounded-lg shadow-sm border border-slate-700 text-xs sm:text-sm">
                          <p className="text-cyan-400">
                            • How can I improve performance?
                          </p>
                        </div>
                        <div className="bg-slate-800 p-2 sm:p-3 rounded-lg shadow-sm border border-slate-700 text-xs sm:text-sm">
                          <p className="text-cyan-400">
                            • Show me the layout structure
                          </p>
                        </div>
                        <div className="bg-slate-800 p-2 sm:p-3 rounded-lg shadow-sm border border-slate-700 text-xs sm:text-sm">
                          <p className="text-cyan-400">
                            • Summarize the key features
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
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
                          className={`max-w-xs sm:max-w-md px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-br-none"
                              : "bg-slate-800 text-slate-200 rounded-bl-none shadow-sm border border-slate-700"
                          }`}
                        >
                          <p>{message.text}</p>
                          <div
                            className={`text-xs mt-1 ${
                              message.sender === "user"
                                ? "text-cyan-200"
                                : "text-slate-400"
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

              <div className="p-3 sm:p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex gap-1 sm:gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about your document..."
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm bg-slate-900 text-slate-200"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className={`p-2 sm:p-3 rounded-lg ${
                      inputValue.trim()
                        ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white"
                        : "bg-slate-700 text-slate-500"
                    }`}
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button (Mobile Only) */}
      {showAnalysis && (
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 shadow-lg flex items-center justify-center text-white"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        </div>
      )}

      {/* Chat Modal (Mobile Only) */}
      {isChatOpen && <ChatModal />}

      {/* Floating elements */}
      {!showAnalysis && (
        <>
          <motion.div
            className="absolute top-10 left-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cyan-500/20"
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
            className="absolute bottom-20 right-16 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-teal-500/20"
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
            className="absolute top-1/3 right-20 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-cyan-400/30"
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
        </>
      )}
    </div>
  );
};
