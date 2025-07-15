// UploadDocumentPage.jsx
import { useTheme } from "@/components/theme-provider";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

// Import components
import AnalysisModal from "@/components/AnalysisModal";
import AnalysisView from "@/components/AnalysisView";
import ChatModal from "@/components/ChatModal";
import PageHeader from "@/components/PageHeader";
import UploadArea from "@/components/UploadArea";
import { stripMarkdownCodeBlock } from "@/utils/stripMarkdownCodeBlock";

export const UploadDocumentPage = () => {
  const { uploadRef } = useOutletContext();
  const { theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isResponseLoading, setIsResponseLoading] = useState(false);

  const API_URL =
    "https://apps.istreams-erp.com:4493/api/SmartAsk/ask-from-file";

  const handleFileUpload = async (files) => {
    setErrorMessage(null);
    const selectedFile = files[0];
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setIsUploading(true);
    setIsUploadComplete(false);
    setShowAnalysis(false);
    setDocumentAnalysis(null);
    setMessages([]);

    try {
      const formData = new FormData();
      formData.append("File", selectedFile);
      formData.append(
        "Question",
        `Analyze the uploaded document and return the result in JSON format with the following structure:
        {
        "documentType": "[Choose standard document type]",
        "translatedResponse": "[Translate the document into english]",
        }
        Do not add any other text or explanation — only return the JSON object.`
      );

      setIsLoadingTranslation(true);
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const cleanJson = stripMarkdownCodeBlock(response.data);

      setDocumentAnalysis(cleanJson);
      setIsUploadComplete(true);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Error uploading file:", error.response.data);
      setErrorMessage(error.response.data);
    } finally {
      setIsUploading(false);
      setIsLoadingTranslation(false);
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
    console.log(question);
    
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

  const handleReset = () => {
    setErrorMessage(null);
    setShowAnalysis(false);
    setIsUploadComplete(false);
    setMessages([]);
    setIsChatOpen(false);
    setFile(null);
    setDocumentAnalysis(null);
  };

  useEffect(() => {
    if (uploadRef) {
      uploadRef.current = { reset: handleReset };
    }
  }, [uploadRef]);

  return (
    <div className="h-[92vh] w-full bg-white dark:bg-slate-900">
      <PageHeader showAnalysis={showAnalysis} />

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
        <UploadArea
          theme={theme}
          isUploading={isUploading}
          handleFileUpload={handleFileUpload}
          errorMessage={errorMessage}
        />
      ) : (
        <AnalysisView
          file={file}
          previewUrl={previewUrl}
          documentAnalysis={documentAnalysis}
          isLoadingTranslation={isLoadingTranslation}
          messages={messages}
          isResponseLoading={isResponseLoading}
          askQuestion={askQuestion}
          setIsChatOpen={setIsChatOpen}
        />
      )}

      <ChatModal
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        messages={messages}
        isResponseLoading={isResponseLoading}
        askQuestion={askQuestion}
      />
    </div>
  );
};
