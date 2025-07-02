import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
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
  ScanSearch,
  Send,
  SquarePen,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const UploadDocument = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  const [file, setFile] = useState(null);
  const [analysisSummary, setAnalysisSummary] = useState([]);
  const [translatedContent, setTranslatedContent] = useState("");
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false); // Renamed for clarity
  const [analysisQuestion, setAnalysisQuestion] = useState(""); // Single question for analysis
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const API_URL = "https://apps.istreams-erp.com:4491/api/OpenAI/ask-from-file";

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
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  const handleFileUpload = async (files) => {
    const selectedFile = files[0];
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setIsUploading(true);
    setIsUploadComplete(false);
    setShowAnalysis(false);
    setAnalysisSummary([]);
    setTranslatedContent("");
    setMessages([]);

    try {
      // 1. Upload file and translate immediately
      const translateFormData = new FormData();
      translateFormData.append("File", selectedFile);
      translateFormData.append(
        "Question",
        "Translate the entire document to English."
      );

      setIsLoadingTranslation(true);

      const translateRes = await axios.post(API_URL, translateFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTranslatedContent(translateRes.data);

      setIsUploading(false);
      setIsUploadComplete(true);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      setIsLoadingTranslation(false);
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  const generateAnalysisSummary = async () => {
    if (!file || !analysisQuestion.trim()) return;

    setIsGeneratingSummary(true);
    try {
      const formData = new FormData();
      formData.append("File", file);
      formData.append("Question", analysisQuestion);

      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Parse the response as array of points
      const summaryPoints = res.data
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => line.replace(/^- /, "").trim());

      setAnalysisSummary(summaryPoints);
      setIsAnalysisModalOpen(false);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const askQuestion = async (question) => {
    if (!file || !question.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: question,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const formData = new FormData();
      formData.append("File", file);
      formData.append("Question", question);

      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Add AI response to chat
      const aiMessage = {
        id: messages.length + 2,
        text: res.data,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error asking question:", error);

      // Add error message to chat
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    askQuestion(inputValue);
    setInputValue("");
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

  const handleReset = () => {
    setShowAnalysis(false);
    setIsUploadComplete(false);
    setMessages([]);
    setIsChatOpen(false);
    setFile(null);
    setAnalysisSummary([]);
    setTranslatedContent("");
  };

  // Chat Modal component for mobile
  const ChatModal = () => (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col md:hidden">
      <div className="p-3 bg-gradient-to-r from-cyan-800 to-teal-800 text-white flex items-center gap-3">
        <button
          onClick={() => setIsChatOpen(false)}
          className="flex items-center text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">Document Assistant</h3>
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
              I can help you understand, improve, and analyze your document. Try
              asking questions about its content, structure, or suggestions for
              improvements.
            </p>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className=" p-2 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-cyan-200 mb-1 sm:mb-2 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsAnalysisModalOpen(true)}
                >
                  <SquarePen />
                </Button>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {analysisSummary.length > 0 ? (
                  analysisSummary.map((item, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto w-12 h-12 text-cyan-400 mb-4" />
                    <h4 className="text-lg font-medium text-cyan-200 mb-2">
                      No Analysis Generated
                    </h4>
                    <p className="text-slate-400 mb-4">
                      Click the button below to generate analysis summary
                    </p>
                    <Button
                      onClick={() => setIsAnalysisModalOpen(true)}
                      className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500"
                    >
                      Generate Summary
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "translation":
        return (
          <div className=" p-2 sm:p-4 prose max-w-none bg-slate-800 overflow-auto max-h-[500px] text-xs sm:text-sm">
            {isLoadingTranslation ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="ml-2 text-slate-300">
                  Translating document...
                </span>
              </div>
            ) : translatedContent ? (
              <pre className="whitespace-pre-wrap font-sans text-slate-200">
                {translatedContent}
              </pre>
            ) : (
              <div className="text-slate-400 italic">
                Translation will appear here when available
              </div>
            )}
          </div>
        );

      case "preview":
        if (!previewUrl || !file) return null;

        const mimeType = file.type;

        if (mimeType.startsWith("image/")) {
          return (
            <img
              src={previewUrl}
              alt="Image Preview"
              style={{ maxWidth: "100%", maxHeight: "500px" }}
            />
          );
        }

        if (mimeType === "application/pdf") {
          return (
            <iframe
              src={previewUrl}
              width="100%"
              height="500px"
              title="PDF Preview"
            />
          );
        }

        if (mimeType.startsWith("text/")) {
          return (
            <iframe
              src={previewUrl}
              width="100%"
              height="300px"
              title="Text File Preview"
            />
          );
        }

        // Optional: Fallback for unsupported or other file types
        return (
          <div>
            <p>Preview not supported for this file type.</p>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              Download File
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-[92vh] w-full">
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
            Upload Your Document
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
          />

          <div
            ref={dropAreaRef}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative rounded-full w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out overflow-hidden"
            style={{
              background: isDragActive
                ? "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(20,184,166,0.3) 100%), radial-gradient(circle at 30% 30%, rgba(6,182,212,0.5) 0%, rgba(8,145,178,0.3) 20%, transparent 60%), #0f172a"
                : "radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(20,184,166,0.2) 100%), radial-gradient(circle at 30% 30%, rgba(6,182,212,0.4) 0%, rgba(8,145,178,0.2) 20%, transparent 60%), #0f172a",
            }}
          >
            {isUploading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center w-full h-full"
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 mb-3 sm:mb-4">
                  <div className="absolute inset-2 sm:inset-3 md:inset-4 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-cyan-400 animate-spin" />
                  </div>
                </div>

                <h3 className="text-sm sm:text-base md:text-lg font-medium text-cyan-100 mb-1 sm:mb-2">
                  Analyzing document...
                </h3>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center w-full h-full p-6 sm:p-8 md:p-10"
              >
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
              Smart AI assistance for managing and analyzing your documents{" "}
            </p>
            <p className="text-xs opacity-75">
              Auto-tagging • Context-aware search • Document insights
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col  h-full">
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left section - Document analysis */}
            <div className="w-full md:w-1/2 h-full border-b md:border-b-0 md:border-r border-slate-700 flex flex-col">
              <div className="flex border-b border-slate-700">
                <button
                  className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    activeTab === "summary"
                      ? "text-cyan-300 border-b-2 border-cyan-400 "
                      : "text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveTab("summary")}
                >
                  <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analysis Summary
                </button>
                <button
                  className={`flex-1 px-3 py-1 sm:px-4 sm:py-2 font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    activeTab === "preview"
                      ? "text-cyan-300 border-b-2 border-cyan-400 bg-slate-800"
                      : "text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveTab("preview")}
                >
                  <ScanSearch className="w-4 h-4 sm:w-5 sm:h-5" />
                  Preview
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
                  Translated to English
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-800 to-slate-900">
                {renderTabContent()}
              </div>
            </div>

            {/* Right section - Chat */}
            <div className="hidden md:flex w-full md:w-1/2 flex-col bg-gradient-to-b from-slate-900 to-slate-800">
              <div className="px-4 py-1.5 bg-gradient-to-r from-cyan-800 to-teal-800 text-white flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <h3 className="text-base sm:text-sm font-semibold">
                    Document Assistant
                  </h3>
                </div>

                <Button variant="ghost" onClick={handleReset}>
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>New Document</span>
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-slate-800/50 to-slate-900/50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 sm:p-4">
                    <div className="mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-cyan-900/30 rounded-full flex items-center justify-center border border-cyan-700/50">
                      <MessageSquare className="text-cyan-400 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-medium text-cyan-200 mb-1 sm:mb-2">
                      How can I help you?
                    </h4>
                    <p className="text-cyan-100 max-w-md text-xs sm:text-sm">
                      Ask about your document, I can analyze its content,
                      structure, or suggestions for your questions.
                    </p>
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

      {/* Analysis Summary Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="sm:max-w-xl bg-slate-800 border-slate-700 text-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="text-cyan-400" />
              <span>Generate Analysis Summary</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter your question to generate the analysis summary
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={analysisQuestion}
              onChange={(e) => setAnalysisQuestion(e.target.value)}
              placeholder="What would you like to know about this document? (e.g., Summarize key points, analyze structure, etc.)"
              className="min-h-[150px] bg-slate-900 border-slate-700 text-slate-200"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAnalysisModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={generateAnalysisSummary}
                disabled={isGeneratingSummary || !analysisQuestion.trim()}
                className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500"
              >
                {isGeneratingSummary ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Summary"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
