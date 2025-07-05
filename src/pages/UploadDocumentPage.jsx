import { useTheme } from "@/components/theme-provider";
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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

export const UploadDocumentPage = () => {
  const { uploadRef } = useOutletContext();
  const { theme } = useTheme();
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState("preview");
  const [activeRightTab, setActiveRightTab] = useState("summary");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  const [file, setFile] = useState(null);
  const [analysisSummary, setAnalysisSummary] = useState([]);
  const [translatedContent, setTranslatedContent] = useState("");
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisQuestion, setAnalysisQuestion] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isResponseLoading, setIsResponseLoading] = useState(false);

  // Add new state variables at the top of the component
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Add this function to handle zoom
  const handleImageZoom = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newZoom = Math.min(Math.max(0.5, imageZoom + delta), 3);
    setImageZoom(newZoom);
  };

  // Add this function to handle drag start
  const handleDragStart = (e) => {
    setIsDraggingImage(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  // Add this function to handle dragging
  const handleDragging = (e) => {
    if (!isDraggingImage) return;

    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  // Add this function to handle drag end
  const handleDragEnd = () => {
    setIsDraggingImage(false);
  };

  // Add this function to reset zoom
  const resetImageZoom = () => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

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
      const translateFormData = new FormData();
      translateFormData.append("File", selectedFile);
      translateFormData.append(
        "Question",
        "If the document is not in English, translate it. If it is already in English, just reply: 'The document is in English. No translation needed"
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
      setErrorMessage(error.message);
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
    setIsResponseLoading(true);
    try {
      const formData = new FormData();
      formData.append("File", file);
      formData.append("Question", question);

      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
    } finally {
      setIsResponseLoading(false);
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

  // Expose the reset method to the parent using ref
  useEffect(() => {
    if (uploadRef) {
      uploadRef.current = {
        reset: handleReset,
      };
    }
  }, [uploadRef]);

  // Extract summary content for reuse
  const renderSummaryContent = () => (
    <div className="p-2 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold text-cyan-700 dark:text-cyan-200 mb-1 sm:mb-2 flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => setIsAnalysisModalOpen(true)}
          className="text-cyan-600 dark:text-cyan-300"
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
              className="flex items-start bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm text-xs sm:text-sm border border-gray-200 dark:border-slate-700"
            >
              <div className="mt-1 w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full mr-2 sm:mr-3"></div>
              <p className="text-gray-800 dark:text-slate-200">{item}</p>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto w-12 h-12 text-cyan-500 dark:text-cyan-400 mb-4" />
            <h4 className="text-lg font-medium text-cyan-700 dark:text-cyan-200 mb-2">
              No Analysis Generated
            </h4>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              Click the button below to generate analysis summary
            </p>
            <Button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white"
            >
              Generate Summary
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeftTabContent = () => {
    switch (activeLeftTab) {
      case "preview":
        if (!previewUrl || !file) return null;

        const mimeType = file.type;

        if (mimeType.startsWith("image/")) {
          return (
            <div
              className="w-full h-full overflow-hidden relative cursor-move"
              onWheel={handleImageZoom}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragging}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetImageZoom();
                  }}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  Reset Zoom
                </Button>
                <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md text-xs flex items-center">
                  Zoom: {Math.round(imageZoom * 100)}%
                </div>
              </div>

              <img
                src={previewUrl}
                alt="Image Preview"
                className="w-full h-full object-contain mx-auto"
                style={{
                  transform: `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  transformOrigin: "center center",
                  transition: isDraggingImage ? "none" : "transform 0.1s ease",
                  cursor: isDraggingImage ? "grabbing" : "grab",
                }}
              />
            </div>
          );
        }

        if (mimeType === "application/pdf") {
          return (
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title="PDF Preview"
            />
          );
        }

        if (mimeType.startsWith("text/")) {
          return (
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title="Text File Preview"
            />
          );
        }

        return (
          <div className="p-4 text-center">
            <p className="text-gray-700 dark:text-slate-300 mb-2">
              Preview not supported for this file type.
            </p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Download File
            </a>
          </div>
        );

      case "translation":
        return (
          <div className="p-2 sm:p-4 h-full prose max-w-none bg-white dark:bg-gradient-to-b  dark:from-slate-900  dark:to-slate-800 overflow-auto text-xs sm:text-sm">
            {isLoadingTranslation ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-cyan-500 dark:text-cyan-400 animate-spin" />
                <span className="ml-2 text-gray-700 dark:text-slate-300">
                  Translating document...
                </span>
              </div>
            ) : translatedContent ? (
              <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-slate-200">
                {translatedContent}
              </pre>
            ) : (
              <div className="text-gray-500 dark:text-slate-400 italic text-center py-8">
                Translation will appear here when available
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderRightTabContent = () => {
    switch (activeRightTab) {
      case "summary":
        return renderSummaryContent();

      case "chat":
        return (
          <div className="flex w-full h-[95%] flex-col bg-white dark:bg-gradient-to-b  dark:from-slate-900  dark:to-slate-800">
            <div className="flex-1 h-full overflow-y-auto p-3 sm:p-4 bg-gray-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-800">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-3 sm:p-4">
                  <div className="mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center border border-cyan-300 dark:border-cyan-700/50">
                    <MessageSquare className="text-cyan-500 dark:text-cyan-400 w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-medium text-cyan-700 dark:text-cyan-200 mb-1 sm:mb-2">
                    How can I help you?
                  </h4>
                  <p className="text-cyan-600 dark:text-cyan-100 max-w-md text-xs sm:text-sm">
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
                            : "bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-bl-none shadow-sm border border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        {message.sender === "ai" &&
                        isResponseLoading &&
                        messages[messages.length - 1].id === message.id ? (
                          <Loader2 className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-spin" />
                        ) : (
                          <p>{message.text}</p>
                        )}
                        <div
                          className={`text-xs mt-1 ${
                            message.sender === "user"
                              ? "text-cyan-200"
                              : "text-gray-500 dark:text-slate-400"
                          }`}
                        >
                          {message.timestamp}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {isResponseLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-xs sm:max-w-md px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-800 text-gray-200 dark:text-slate-400 rounded-bl-none shadow-sm border border-gray-200 dark:border-slate-700 flex items-center gap-1">
                        <span className="animate-bounce [animation-delay:0s]">
                          .
                        </span>
                        <span className="animate-bounce [animation-delay:0.2s]">
                          .
                        </span>
                        <span className="animate-bounce [animation-delay:0.4s]">
                          .
                        </span>
                        <span className="animate-bounce [animation-delay:0.6s]">
                          .
                        </span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex gap-1 sm:gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your document..."
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={`p-2 sm:p-3 rounded-lg ${
                    inputValue.trim()
                      ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white"
                      : "bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-500"
                  }`}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-[92vh] w-full bg-white dark:bg-slate-900">
      {!showAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4 sm:mb-6 md:mb-8 pt-4"
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
          <p className="text-sm sm:text-base text-cyan-700 dark:text-cyan-100">
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
            className="mb-4 sm:mb-6 p-3 sm:p-4 bg-teal-100 dark:bg-teal-800 border border-teal-300 dark:border-teal-600 rounded-lg text-teal-800 dark:text-teal-100 flex items-center justify-center text-sm sm:text-base"
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
              background:
                theme === "dark"
                  ? isDragActive
                    ? "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(20,184,166,0.3) 100%), radial-gradient(circle at 30% 30%, rgba(6,182,212,0.5) 0%, rgba(8,145,178,0.3) 20%, transparent 60%), #0f172a"
                    : "radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(20,184,166,0.2) 100%), radial-gradient(circle at 30% 30%, rgba(6,182,212,0.4) 0%, rgba(8,145,178,0.2) 20%, transparent 60%), #0f172a"
                  : isDragActive
                  ? "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(20,184,166,0.25) 100%), radial-gradient(circle at 30% 30%, rgba(6,182,212,0.3) 0%, rgba(8,145,178,0.15) 20%, transparent 60%), #f8fafc"
                  : "radial-gradient(circle, rgba(56,189,248,0.08) 0%, rgba(20,184,166,0.15) 100%), radial-gradient(circle at 30% 30%, rgba(6,182,212,0.2) 0%, rgba(8,145,178,0.1) 20%, transparent 60%), #ffffff",
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
                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-cyan-500 dark:text-cyan-400 animate-spin" />
                  </div>
                </div>

                <h3 className="text-sm sm:text-base md:text-lg font-medium text-cyan-700 dark:text-cyan-100 mb-1 sm:mb-2">
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
                  <div className="absolute inset-0 rounded-full bg-cyan-200/50 dark:bg-cyan-500/10 backdrop-blur-sm"></div>
                  <div className="absolute inset-2 sm:inset-3 md:inset-4 flex items-center justify-center">
                    <CloudUpload className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-cyan-500 dark:text-cyan-300" />
                  </div>
                </motion.div>

                <motion.h3
                  className="text-base sm:text-lg md:text-xl font-medium text-cyan-700 dark:text-cyan-100 mb-1 sm:mb-2 text-center"
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

          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 sm:mt-6 md:mt-8 text-center text-cyan-700 dark:text-cyan-200 max-w-md"
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
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y divide-gray-200 dark:divide-gray-800 md:divide-y-0">
            {/* Left section - Document analysis */}
            <div className="w-full h-full flex flex-col">
              <div className="flex border-b border-gray-200 dark:border-slate-700">
                <button
                  className={`flex-1 px-3 py-1 sm:px-4 sm:py-2 font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    activeLeftTab === "preview"
                      ? "text-cyan-700 dark:text-cyan-300 border-b-2 border-cyan-500 dark:border-cyan-400 bg-white dark:bg-slate-800"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveLeftTab("preview")}
                >
                  <ScanSearch className="w-4 h-4 sm:w-5 sm:h-5" />
                  Preview
                </button>
                <button
                  className={`flex-1 px-3 py-1 sm:px-4 sm:py-2 font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    activeLeftTab === "translation"
                      ? "text-cyan-700 dark:text-cyan-300 border-b-2 border-cyan-500 dark:border-cyan-400 bg-white dark:bg-slate-800"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveLeftTab("translation")}
                >
                  <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
                  Translated to English
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900">
                {renderLeftTabContent()}
              </div>
            </div>

            {/* Right section - Chat */}
            <div className="hidden w-full h-full md:flex flex-col">
              {/* Tab bar - only on desktop */}
              <div className="hidden md:flex border-b border-gray-200 dark:border-slate-700">
                <button
                  className={`flex-1 px-3 py-1 sm:px-4 sm:py-2 font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    activeRightTab === "summary"
                      ? "text-cyan-700 dark:text-cyan-300 border-b-2 border-cyan-500 dark:border-cyan-400 bg-white dark:bg-slate-800"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveRightTab("summary")}
                >
                  <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analysis Summary
                </button>
                <button
                  className={`flex-1 px-3 py-1 sm:px-4 sm:py-2 font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    activeRightTab === "chat"
                      ? "text-cyan-700 dark:text-cyan-300 border-b-2 border-cyan-500 dark:border-cyan-400 bg-white dark:bg-slate-800"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setActiveRightTab("chat")}
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  Chat
                </button>
              </div>

              <div className="hidden md:block h-full">
                {renderRightTabContent()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button (Mobile Only) */}
      {showAnalysis && (
        <>
          {/* Floating Chat Icon (Non-Mobile) */}
          {activeRightTab !== "chat" && (
            <div className="hidden md:block fixed bottom-6 right-6 z-40">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveRightTab("chat")}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 shadow-lg flex items-center justify-center text-white"
              >
                <MessageSquare className="w-6 h-6" />
                <span className="sr-only">Open Chat</span>
              </motion.button>
            </div>
          )}

          {/* Existing Mobile Floating Button */}
          <div className="md:hidden fixed bottom-6 right-9 z-40">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsChatOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-600 to-teal-600 shadow-lg flex items-center justify-center text-white"
            >
              <MessageSquare className="w-6 h-6" />
            </motion.button>
          </div>
        </>
      )}

      {/* Chat Modal (Mobile Only) */}
      {isChatOpen && (
        <ChatModal
          activeRightTab={activeRightTab}
          setActiveRightTab={setActiveRightTab}
          renderRightTabContent={renderRightTabContent}
          setIsChatOpen={setIsChatOpen}
        />
      )}

      {/* Analysis Summary Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-200">
              <ClipboardCheck className="text-cyan-500 dark:text-cyan-400" />
              <span>Generate Analysis Summary</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-slate-400">
              Enter your question to generate the analysis summary
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={analysisQuestion}
              onChange={(e) => setAnalysisQuestion(e.target.value)}
              placeholder="What would you like to know about this document? (e.g., Summarize key points, analyze structure, etc.)"
              className="min-h-[150px] bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-200"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAnalysisModalOpen(false)}
                className="border-gray-300 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={generateAnalysisSummary}
                disabled={isGeneratingSummary || !analysisQuestion.trim()}
                className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white"
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

const ChatModal = ({
  activeRightTab,
  setActiveRightTab,
  renderRightTabContent,
  setIsChatOpen,
}) => (
  <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col md:hidden">
    <div className="p-1 bg-gradient-to-r from-cyan-600 to-teal-600 text-white flex items-center gap-1">
      <button
        onClick={() => setIsChatOpen(false)}
        className="flex items-center text-white"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <h3 className="text-sm font-semibold">Document Assistant</h3>
    </div>

    {/* Left section - Document analysis */}
    <div className="w-full md:w-1/2 h-full flex flex-col">
      {/* Tab bar - only on desktop */}
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        <button
          className={`flex-1 px-3 py-1 sm:px-4 sm:py-2 font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
            activeRightTab === "summary"
              ? "text-cyan-700 dark:text-cyan-300 border-b-2 border-cyan-500 dark:border-cyan-400 bg-white dark:bg-slate-800"
              : "text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          }`}
          onClick={() => setActiveRightTab("summary")}
        >
          <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          Analysis Summary
        </button>
        <button
          className={`flex-1 px-3 py-1 sm:px-4 sm:py-2 font-medium flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
            activeRightTab === "chat"
              ? "text-cyan-700 dark:text-cyan-300 border-b-2 border-cyan-500 dark:border-cyan-400 bg-white dark:bg-slate-800"
              : "text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
          }`}
          onClick={() => setActiveRightTab("chat")}
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          Chat
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900">
        {renderRightTabContent()}
      </div>
    </div>
  </div>
);
