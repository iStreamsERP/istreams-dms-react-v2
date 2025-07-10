// components/AnalysisView.jsx
import {
  ClipboardCheck,
  Languages,
  MessageSquare,
  ScanSearch,
} from "lucide-react";
import { useState } from "react";
import AnalysisSummary from "./AnalysisSummary";
import ChatInterface from "./ChatInterface";
import DocumentPreview from "./DocumentPreview";
import FloatingChatButton from "./FloatingChatButton";

export default function AnalysisView({
  file,
  previewUrl,
  translatedContent,
  isLoadingTranslation,
  analysisSummary,
  setIsAnalysisModalOpen,
  messages,
  isResponseLoading,
  askQuestion,
  setIsChatOpen,
}) {
  const [activeLeftTab, setActiveLeftTab] = useState("preview");
  const [activeRightTab, setActiveRightTab] = useState("summary");

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left section - Document analysis */}
        <div className="w-full h-full flex flex-col border-r border-gray-200 dark:border-slate-700">
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <TabButton 
              icon="ScanSearch"
              label="Preview"
              active={activeLeftTab === "preview"}
              onClick={() => setActiveLeftTab("preview")}
            />
            <TabButton 
              icon="Languages"
              label="Translated to English"
              active={activeLeftTab === "translation"}
              onClick={() => setActiveLeftTab("translation")}
            />
          </div>
          
          <DocumentPreview 
            file={file}
            previewUrl={previewUrl}
            activeTab={activeLeftTab}
            translatedContent={translatedContent}
            isLoadingTranslation={isLoadingTranslation}
          />
        </div>

        {/* Right section - Chat */}
        <div className="hidden w-full h-full md:flex flex-col">
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <TabButton 
              icon="ClipboardCheck"
              label="Analysis Summary"
              active={activeRightTab === "summary"}
              onClick={() => setActiveRightTab("summary")}
            />
            <TabButton 
              icon="MessageSquare"
              label="Chat"
              active={activeRightTab === "chat"}
              onClick={() => setActiveRightTab("chat")}
            />
          </div>
          
          {activeRightTab === "summary" ? (
            <AnalysisSummary 
              analysisSummary={analysisSummary}
              setIsAnalysisModalOpen={setIsAnalysisModalOpen}
            />
          ) : (
            <ChatInterface 
              messages={messages}
              isResponseLoading={isResponseLoading}
              askQuestion={askQuestion}
            />
          )}
        </div>
      </div>
      
      <FloatingChatButton 
        activeRightTab={activeRightTab}
        setActiveRightTab={setActiveRightTab}
        setIsChatOpen={setIsChatOpen}
      />
    </div>
  );
}

const TabButton = ({ icon, label, active, onClick }) => {
  const IconComponent = getIconComponent(icon);
  return (
    <button
      className={`flex-1 px-4 py-2 font-medium flex items-center justify-center gap-2 text-sm ${
        active
          ? "text-cyan-700 dark:text-cyan-300 border-b-2 border-cyan-500 dark:border-cyan-400"
          : "text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-300"
      }`}
      onClick={onClick}
    >
      <IconComponent className="w-4 h-4" />
      {label}
    </button>
  );
};

// Helper to get icon components
const getIconComponent = (iconName) => {
  const icons = {
    ScanSearch,
    Languages,
    ClipboardCheck,
    MessageSquare,
  };
  return icons[iconName];
};
